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
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";
import { asyncForEach } from "../../util/helper";

const StyledContainer = styled(Container)`
  text-align: center;
`;

class AdminSettingsTwo extends Component {
  constructor(props) {
    super(props);
  }
  _initFirebase = false;
  state = {
    settings: null,
    applicationList: null,
    applicationList2: null,
    loading: true,
    error: null,
  };
  static contextType = AuthUserContext;
  unsub = null;

  componentDidMount() {
    if (this.props.firebase && !this._initFirebase) this.loadData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.firebase && !this._initFirebase) this.loadData();
  }

  componentWillUnmount() {
    if (typeof this.unsub === "function") this.unsub();
  }

  loadData = async () => {
    this._initFirebase = true;

    const doc = await this.props.firebase.generalSettings().get();

    if (!doc.exists) this.setState({ error: "Failed to load timeslots!" });
    else {
      const settings = doc.data();
      this.setState({ settings }, () => {
        console.log("Settings loaded");
      });
    }

    this.props.firebase
      .secondRoundApplicants()
      .get()
      .then((querySnapshot) => {
        const applicationList = querySnapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() };
        });
        this.setState({ applicationList }, () => {
          console.log("Applicantions Loaded");
        });
      });

    this.props.firebase
      .deliberatedApplicantsTwo()
      .get()
      .then((querySnapshot) => {
        const applicationList2 = querySnapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() };
        });
        this.setState({ applicationList2, loading: false }, () => {
          console.log("Deliberated Applications Loaded");
        });
      });
  };

  finishVoting = async () => {
    this.setState({ loading: true });

    const { settings, applicationList } = this.state;
    const authUser = this.context;

    const dataOne = {
      secondVotingComplete: true,
    };

    this.props.firebase.generalSettings().set(dataOne, { merge: true });

    await asyncForEach(applicationList, async (application, index) => {
      const dataTwo = {
        deliberation: {
          secondRound: {
            applicantAccepted: false,
            acceptedUPE:
              application.deliberation.secondRound.count.accept /
                (application.deliberation.secondRound.count.accept +
                  application.deliberation.secondRound.count.deny) >=
              0.75,
            complete:
              application.deliberation.secondRound.count.accept /
                (application.deliberation.secondRound.count.accept +
                  application.deliberation.secondRound.count.deny) >=
              0.75,
            voted: true,
            feedback: "",
          },
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
    const authUser = this.context;

    await asyncForEach(applicationList, async (application, index) => {
      if (application.deliberation.acceptedUPE) {
        var email = "";
        var name = application.applicant.name.split(" ")[0];

        application.responses.forEach((item, i) => {
          if (item.name === "Email") email = item.value;
        });

        const sendEmail = this.props.firebase.sendFinalAcceptedEmail({
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

        const sendEmail = this.props.firebase.sendFinalDeniedEmail({
          email,
          name,
          feedback,
        });

        const updatedData = {
          roles: {
            applicant: false,
            provisionalMember: false,
            nonmember: true,
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
  };

  render() {
    const {
      loading,
      error,
      settings,
      applicationList,
      applicationList2,
    } = this.state;

    if (loading) return <Loader />;
    if (error)
      return (
        <Container flexdirection="column">
          <h1>{error}</h1>
        </Container>
      );

    const authUser = this.context;

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
              <p> {data.deliberation.secondRound.count.accept} </p>
            </Col>
            <Col>
              <h4> Negative Votes </h4>
              <p> {data.deliberation.secondRound.count.deny} </p>
            </Col>
          </Row>
          <Row>
            <Col>
              <h4> Status </h4>
              <p>
                {data.deliberation.secondRound.count.accept /
                  (data.deliberation.secondRound.count.accept +
                    data.deliberation.secondRound.count.deny) >=
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
                {application.deliberation.secondRound.complete ? null : (
                  <FeedbackForm
                    data={application.id}
                    dataGet={this.loadData}
                    round={2}
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

    return (
      <>{settings.secondVotingComplete ? feedbackForms : applicationStatus}</>
    );
  }
}

export default withFirebase(AdminSettingsTwo);
