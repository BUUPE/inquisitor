import React, { Component, Fragment } from "react";
import styled from "styled-components";

import Loader from "../Loader";
import FeedbackForm from "./FeedbackForm";
import QuestionDisplay from "./QuestionDisplay";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import {
  withAuthorization,
} from "upe-react-components";
import { isAdmin } from "../../util/conditions";
import { asyncForEach } from "../../util/helper";

const StyledContainer = styled(Container)`
  text-align: center;
`;

class AdminSettings extends Component {
  state = {
    settings: {},
    applicationList: [],
    applicationList2: [],
  };

  finishVoting = async () => {
    this.setState({ loading: true });

    const { settings, applicationList } = this.state;

    const dataOne = {
      votingComplete: true,
    };

    this.props.firebase.generalSettings().set(dataOne, { merge: true });

    await asyncForEach(applicationList, async (application, index) => {
      const dataTwo = {
        deliberation: {
          applicantAccepted: false,
          acceptedUPE:
            application.deliberation.count.accept /
              (application.deliberation.count.accept +
                application.deliberation.count.deny) >=
            0.75,
          complete:
            application.deliberation.count.accept /
              (application.deliberation.count.accept +
                application.deliberation.count.deny) >=
            0.75,
          voted: true,
          feedback: "",
          submittedForm: false,
        },
      };

      this.props.firebase
        .application(application.id)
        .set(dataTwo, { merge: true });
    });

    this.loadData();
  };

  finishDeliberation = async () => {
    this.setState({ loading: true });

    const { settings, applicationList } = this.state;

    await asyncForEach(applicationList, async (application, index) => {
      if (application.deliberation.acceptedUPE) {
        var email = "";
        var name = application.applicant.name.split(" ")[0];

        application.responses.forEach((item, i) => {
          if (item.name === "Email") email = item.value;
        });

        const sendEmail = this.props.firebase.sendAcceptedEmail({
          email,
          name,
        });

        await Promise.all([sendEmail])
          .then(() => {
            console.log(
              "Finished processing deliberation of applicant: ",
              name
            );
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        var email = "";
        var name = application.applicant.name.split(" ")[0];
        var feedback = application.deliberation.feedback;

        application.responses.forEach((item, i) => {
          if (item.name === "Email") email = item.value;
        });

        const sendEmail = this.props.firebase.sendDeniedEmail({
          email,
          name,
          feedback,
        });

        const updatedData = {
          roles: {
            applicant: false,
          },
        };

        const removeRoles = this.props.firebase.editUser(
          application.applicant.uid,
          updatedData
        );

        await Promise.all([sendEmail, removeRoles])
          .then(() => {
            console.log(
              "Finished processing deliberation of applicant: ",
              name
            );
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });

    const dataOne = {
      deliberationsComplete: true,
    };

    this.props.firebase.generalSettings().set(dataOne, { merge: true });
    this.props.updatePage();
    this.setState({ loading: false });
  };

  render() {
    const {
      settings,
      applicationList,
      applicationList2,
    } = this.state;

    const ApplicantStatus = ({ data }) => {
      return (
        <Container>
          <br />
          <hr />
          <Row>
            <Col>
              <h3> {data.applicant.name} </h3>
            </Col>
          </Row>
          <br />
          <Row>
            <Col>
              <h4> Positive Votes </h4>
              <p> {data.deliberation.count.accept} </p>
            </Col>
            <Col>
              <h4> Negative Votes </h4>
              <p> {data.deliberation.count.deny} </p>
            </Col>
          </Row>
          <Row>
            <Col>
              <h4> Status </h4>
              <p>
                {data.deliberation.count.accept /
                  (data.deliberation.count.accept +
                    data.deliberation.count.deny) >=
                0.75
                  ? "Accepted"
                  : "Not Accepted"}
              </p>
            </Col>
          </Row>
        </Container>
      );
    };

    const applications = (
      <Container>
        <Row>
          <Col>
            {applicationList.map((application) => (
              <ApplicantStatus key={application.id} data={application} />
            ))}
            <Container>
              <Row>
                <Col>
                  <hr />
                </Col>
              </Row>
            </Container>
          </Col>
        </Row>
      </Container>
    );

    const applicationStatus = (
      <>
        <Container>
          <Row>
            <Col>
              <h2> Current Status </h2>
            </Col>
          </Row>
          <Row>{applications}</Row>
        </Container>
        <br />
        <Container>
          <Row>
            <Col>
              <Button onClick={this.finishVoting}>Finish Voting</Button>
            </Col>
          </Row>
        </Container>
      </>
    );

    const feedbackFormList = (
      <Container>
        <Row>
          <Col>
            {applicationList2.map((application) => (
              <Fragment key={application.id}>
                {application.deliberation.complete ? null : (
                  <FeedbackForm
                    data={application.id}
                    dataGet={this.loadData}
                    round={1}
                  />
                )}
              </Fragment>
            ))}
          </Col>
        </Row>
      </Container>
    );

    const feedbackForms = (
      <>
        <Container>
          <Row>
            <Col>
              <h2> Feedback Forms </h2>
            </Col>
          </Row>
          <Row>
            {applicationList2.length !== 0 ? (
              feedbackFormList
            ) : (
              <StyledContainer>
                <h3> All forms filled </h3>
              </StyledContainer>
            )}
          </Row>

          <br />
          <br />

          <Row>
            <Button onClick={this.finishDeliberation}>
              Finish Deliberation
            </Button>
          </Row>
        </Container>
      </>
    );

    return <>{settings.votingComplete ? feedbackForms : applicationStatus}</>;
  }
}

export default withAuthorization(isAdmin)(AdminSettings);
