import React, { Component, Fragment } from "react";
import styled from "styled-components";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

import { withAuthorization } from "upe-react-components";

import Loader from "../Loader";
import FeedbackForm from "./FeedbackForm";
import QuestionDisplay from "./QuestionDisplay";

import { isAdmin } from "../../util/conditions";
import { asyncForEach } from "../../util/helper";

const StyledContainer = styled(Container)`
  text-align: center;
`;

class AdminSettings extends Component {
  state = {
    showModal: false,
    currentApplicationId: null,
    currentFeedback: "",
  };
  finishVoting = async () => {
    const { applications } = this.props;
    await this.props.firebase
      .generalSettings()
      .update({ deliberationsOpen: false });

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
          .catch(err => {
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
          .catch(err => {
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
    const { applications, settings  } = this.props;
    const {showModal, currentFeedback} = this.state;
    settings.deliberationsOpen = false;

    const ApplicantStatus = ({ deliberation, name, id }) => {
      const allVotes = Object.values(deliberation.votes);
      const positiveVotes = allVotes.filter(vote => !!vote).length;
      const negativeVotes = allVotes.filter(vote => !vote).length;
      const accepted = positiveVotes / allVotes.length >= 0.75;
      return (
        <tr>
          <td>{name}</td>
          <td>
            +{positiveVotes}
            /-
            {negativeVotes}
          </td>
          <td style={{ color: accepted ? "green" : "red" }}>
            {accepted ? "Accepted" : "Not Accepted"}
          </td>
          {!settings.deliberationsOpen && (
            <td
              onClick={() =>
                this.setState({
                  showModal: true,
                  currentApplicationId: id,
                  currentFeedback: deliberation.feedback,
                })
              }
              style={{ cursor: "pointer" }}
            >
              Add Feedback
            </td>
          )}
        </tr>
      );
    };

    const feedbackFormList = (
      <Container>
        <Row>
          <Col>
            {applications.map(application => (
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
            {applications.length !== 0 ? (
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
      <>
        <Table bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Votes</th>
              <th>Status</th>
              {!settings.deliberationsOpen && <th>Feedback</th>}
            </tr>
          </thead>
          <tbody>
            {applications.map(application => (
              <ApplicantStatus key={application.id} {...application} />
            ))}
          </tbody>
        </Table>

        <Row>
          <Col>
            <Button>Finish Voting</Button>
          </Col>
        </Row>

        <Modal
          show={showModal}
          onHide={() => this.setState({ showModal: false })}
        >
          <Modal.Header closeButton>
            <Modal.Title>Add Feedback</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="exampleForm.ControlTextarea1">
                <Form.Label>Example textarea</Form.Label>
                <Form.Control
                  as="textarea"
                  rows="3"
                  value={currentFeedback}
                  onChange={e =>
                    this.setState({ currentFeedback: e.target.value })
                  }
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => this.setState({ showModal: false })}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => this.setState({ showModal: false })}
            >
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default withAuthorization(isAdmin)(AdminSettings);
