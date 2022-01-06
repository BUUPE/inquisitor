import React, { Component } from "react";
import styled from "styled-components";

import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

import { withAuthorization } from "upe-react-components";

import { isAdmin } from "../../util/conditions";
import { BackIcon } from "../TextDisplay";

const Wrapper = styled.div`
  padding-top: 3%;
  padding-left: 7%;
  padding-right: 7%;
  font-family: Georgia;
`;

const StyledButton = styled(Button)`
  text-decoration: none;
  color: #ffffff;
  background-color: #f21131;
  border: none;
  font-size: 25px;
  font-weight: bold;
  padding: 0.5% 2% 0.5% 2%;
  &:disabled {
    text-decoration: none;
    color: #ffffff;
    background-color: #f88898;
    border: none;
  }
  &:hover {
    text-decoration: none;
    color: #ffffff;
    background-color: #600613;
    border: none;
  }
`;

const Title = styled.div`
  padding-left: 5%;
  h1 {
    font-family: Georgia;
    font-size: 50px;
    font-style: italic;
  }
  h1:after {
    content: "";
    display: block;
    width: 4%;
    padding-top: 3px;
    border-bottom: 2px solid #f21131;
  }
`;

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
          <td
            style={{
              color: accepted ? "green" : "red",
              fontStyle: accepted ? "none" : "italic",
              fontWeight: accepted ? "bold" : "none",
            }}
          >
            {accepted ? "Accepted" : "Not Accepted"}
          </td>
          {!settings.deliberationsOpen && (
            <>
              {accepted ? (
                <td style={{ fontStyle: "italic" }}>N/A</td>
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
                  style={{
                    cursor: "pointer",
                    fontWeight: "bold",
                    color: feedback === "" ? "#f21131" : "black",
                  }}
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
      <>
        <BackIcon />
        <Title>
          <h1> Applicant Feedback </h1>
        </Title>
        <Wrapper>
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
            <StyledButton
              style={{ marginTop: "1%" }}
              onClick={this.props.sendResults}
            >
              Send Results
            </StyledButton>
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
              <StyledButton onClick={() => this.setState({ showModal: false })}>
                Cancel
              </StyledButton>
              <StyledButton
                onClick={() =>
                  this.props.saveFeedback(currentApplicationId, currentFeedback)
                }
              >
                Save
              </StyledButton>
            </Modal.Footer>
          </Modal>
        </Wrapper>
      </>
    );
  }
}

export default withAuthorization(isAdmin)(FeedbackPage);
