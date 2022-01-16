import React, { Component } from "react";

import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

import { withAuthorization } from "upe-react-components";

import { isAdmin } from "../../util/conditions";
import { BackIcon } from "../TextDisplay";
import { Wrapper, Title, StyledButton } from "../../styles/global";

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

    const provisionalMemberApplications = applications.filter((app) =>
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
      uid,
    }) => (
      <tr>
        <td>{name}</td>
        <td
          style={{
            color: contribution ? "green" : "red",
            fontStyle: contribution ? "none" : "italic",
            fontWeight: contribution ? "bold" : "none",
          }}
        >
          {contribution ? "Complete" : "Not Complete"}
        </td>
        <td
          style={{
            color: meetings ? "green" : "red",
            fontStyle: meetings ? "none" : "italic",
            fontWeight: meetings ? "bold" : "none",
          }}
        >
          {meetings ? "Complete" : "Not Complete"}
        </td>
        {!settings.deliberationsOpen && (
          <td
            onClick={() =>
              this.setState({
                showModal: true,
                currentApplicationId: uid,
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

    return (
      <>
        <BackIcon />
        <Title>
          <h1> Second Round Status </h1>
        </Title>
        <Wrapper>
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
              {provisionalMemberApplications.map((application) => (
                <ApplicantStatus key={application.uid} {...application} />
              ))}
            </tbody>
          </Table>

          {!settings.deliberationsOpen && (
            <StyledButton
              paddingTop={"0.5%"}
              paddingRight={"2%"}
              paddingBottom={"0.5%"}
              paddingLeft={"2%"}
              onClick={this.props.readyRoundTwo}
            >
              Open Round Two
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
                <Form.Group>
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
                    id="contributionToggle"
                    onChange={(e) =>
                      this.setState({
                        currentContributionStatus: e.target.checked,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
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
                    id="meetingToggle"
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
              <StyledButton
                paddingTop={"0.5%"}
                paddingRight={"2%"}
                paddingBottom={"0.5%"}
                paddingLeft={"2%"}
                onClick={() => this.setState({ showModal: false })}
              >
                Cancel
              </StyledButton>
              <StyledButton
                paddingTop={"0.5%"}
                paddingRight={"2%"}
                paddingBottom={"0.5%"}
                paddingLeft={"2%"}
                onClick={() =>
                  this.props.saveSecondRoundStatus(
                    currentApplicationId,
                    currentMeetingStatus,
                    currentContributionStatus
                  )
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

export default withAuthorization(isAdmin)(SecondRound);
