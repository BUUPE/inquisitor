import React, { Component } from "react";

import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

import { withAuthorization } from "upe-react-components";

import { Container } from "../../styles/global";
import { isAdmin } from "../../util/conditions";

class SecondRound extends Component {
  state = {
    showModal: false,
    currentApplicationId: null,
    currentMeetingStatus: false,
    currentContributionStatus: false,
    currentName: "",
  };

  render() {
    const { applications, settings } = this.props;

    const filteredApplications = applications.filter((app) =>
      app.hasOwnProperty("provisional")
    );

    const {
      showModal,
      currentApplicationId,
      currentContributionStatus,
      currentMeetingStatus,
      currentName,
    } = this.state;

    const ApplicantStatus = ({
      provisional: { contribution, meetings },
      name,
      id,
    }) => {
      return (
        <tr>
          <td>{name}</td>
          <td>{contribution ? "Complete" : "Not Complete"}</td>
          <td>{meetings ? "Complete" : "Not Complete"}</td>
          {!settings.deliberationsOpen && (
            <td
              onClick={() =>
                this.setState({
                  showModal: true,
                  currentApplicationId: id,
                  currentContributionStatus: contribution,
                  currentMeetingStatus: meetings,
                  currentName: name,
                })
              }
              style={{ cursor: "pointer" }}
            >
              Edit Status
            </td>
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
              <th>Contribution Status</th>
              <th>Meetings Status</th>
              {!settings.deliberationsOpen && <th>Edit</th>}
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((application) => (
              <ApplicantStatus key={application.id} {...application} />
            ))}
          </tbody>
        </Table>

        {!settings.deliberationsOpen && (
          <Button variant="danger" onClick={this.props.readyRoundTwo}>
            Open Round Two
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
              <Form.Group controlId="contribution">
                <Form.Label>Contribution</Form.Label>
                <Form.Check
                  custom
                  checked={currentContributionStatus}
                  type="switch"
                  label={
                    <span>
                      Applicant has{" "}
                      {currentContributionStatus
                        ? "completed"
                        : "not completed"}{" "}
                      their contribution
                    </span>
                  }
                  id="contributionSwitch"
                  onChange={(e) =>
                    this.setState({
                      currentContributionStatus: e.target.checked,
                    })
                  }
                />
              </Form.Group>
              <Form.Group controlId="meetings">
                <Form.Label>Meetings</Form.Label>
                <Form.Check
                  custom
                  checked={currentMeetingStatus}
                  type="switch"
                  label={
                    <span>
                      Applicant has{" "}
                      {currentMeetingStatus ? "completed" : "not completed"}{" "}
                      their meetings
                    </span>
                  }
                  id="meetingSwitch"
                  onChange={(e) =>
                    this.setState({
                      currentMeetingStatus: e.target.checked,
                    })
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
                this.props.saveSecondRoundStatus(
                  currentApplicationId,
                  currentMeetingStatus,
                  currentContributionStatus
                )
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

export default withAuthorization(isAdmin)(SecondRound);
