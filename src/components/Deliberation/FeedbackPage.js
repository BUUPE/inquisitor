import React, { Component } from "react";

import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

import { withAuthorization } from "upe-react-components";

import { Container } from "../../styles/global";
import { isAdmin } from "../../util/conditions";

class FeedbackPage extends Component {
  state = {
    showModal: false,
    currentApplicationId: null,
    currentFeedback: "",
    currentName: "",
  };

  render() {
    const { applications, settings } = this.props;
    const {
      showModal,
      currentApplicationId,
      currentFeedback,
      currentName,
    } = this.state;

    const ApplicantStatus = ({
      deliberation: { votes, feedback },
      name,
      id,
    }) => {
      const allVotes = Object.values(votes);
      const positiveVotes = allVotes.filter((vote) => !!vote).length;
      const negativeVotes = allVotes.filter((vote) => !vote).length;
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
            <>
              {accepted ? (
                <td>N/A</td>
              ) : (
                <td
                  onClick={() =>
                    this.setState({
                      showModal: true,
                      currentApplicationId: id,
                      currentFeedback: feedback,
                      currentName: name,
                    })
                  }
                  style={{ cursor: "pointer" }}
                >
                  {feedback === "" ? "Add" : "Edit"} Feedback
                </td>
              )}
            </>
          )}
        </tr>
      );
    };

    return (
      <Container flexdirection="column">
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
            {applications.map((application) => (
              <ApplicantStatus key={application.id} {...application} />
            ))}
          </tbody>
        </Table>

        {!settings.deliberationsOpen && (
          <Button variant="danger" onClick={this.props.sendResults}>
            Send Results
          </Button>
        )}

        <Modal
          show={showModal}
          onHide={() => this.setState({ showModal: false })}
        >
          <Modal.Header closeButton>
            <Modal.Title>{currentName}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="exampleForm.ControlTextarea1">
                <Form.Label>Feedback</Form.Label>
                <Form.Control
                  as="textarea"
                  rows="3"
                  value={currentFeedback}
                  onChange={(e) =>
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
              onClick={() =>
                this.props.saveFeedback(currentApplicationId, currentFeedback)
              }
            >
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    );
  }
}

export default withAuthorization(isAdmin)(FeedbackPage);
