import React, { Component } from "react";
import { compose } from "recompose";
import swal from "@sweetalert/with-react";
import styled from "styled-components";
import cloneDeep from "lodash.clonedeep";
import update from "immutability-helper";

import Col from "react-bootstrap/Col";

import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";
import { withSettings } from "../API/SettingsContext";

import { isMember, isAdmin } from "../../util/conditions";
import Loader from "../Loader";
import Error from "../Error";
import SecondRound from "./SecondRound";
import FeedbackPage from "./FeedbackPage";
import ApplicationDisplay from "./ApplicationDisplay";
import { FullSizeContainer, Title, Text } from "../../styles/global";
import TextDisplay, { BackIcon } from "../TextDisplay";

const SidebarBase = styled.ul`
  font-family: Georgia;
  text-align: center;
  max-width: 300px;
  padding: 15px;
  background: #333333;
  list-style: none;
  margin-left: 1%;
  margin-right: 1%;
  border-radius: 25px;

  h1 {
    color: white;
    font-style: italic;
    font-weight: bold;
    padding-top: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid grey;
    font-size: 27px;
  }

  hr {
    border-bottom: 1px solid grey;
  }
`;

const SidebarItem = styled.li`
  color: ${(props) => (props.selected ? "#f21131" : "white")};
  font-weight: bold;
  padding-top: 10px;
  padding-bottom: 10px;
  cursor: pointer;

  &:hover {
    color: #f21131;
    text-decoration: underline;
  }
`;

const DetailsDisplay = () => (
  <div>
    <BackIcon />
    <Title>
      <h1> Welcome to Deliberations! </h1>
    </Title>
    <Text
      paddingLeft={"7%"}
      paddingRight={"7%"}
      pFontSize={"15px"}
      pTextAlign={"left"}
      pMaxWidth={"50%"}
      position={"left"}
    >
      <p>
        {" "}
        Please read the instructions bellow carefully before proceeding to
        deliberate on all the candidates.{" "}
      </p>

      <h3> How to Vote </h3>
      <p>
        {" "}
        In order to vote, select one of the candidates from the sidebar, and
        proceed to review their application, in it, you'll be able to see not
        only their general application, but also the details of their interview.{" "}
      </p>
      <p>
        {" "}
        After reviewing their application, you'll find two buttons at the
        bottom, approve & deny, you only get 1 vote per candidate, although you
        will be able to switch your vote until the deliberations close.{" "}
      </p>

      <h3> Final Details </h3>
      <p>
        {" "}
        You will not be able to see anyone else's votes of the final results
        until the EBoard announces them.{" "}
      </p>
    </Text>
  </div>
);

class InterviewerView extends Component {
  _initFirebase = false;
  state = {
    applications: [],
    currentApplicationID: "details",
    currentApplication: null,
    loading: true,
    error: null,
    display: null,
  };
  static contextType = AuthUserContext;
  unsubApplications = null;

  componentDidMount() {
    if (this.props.firebase && !this._initFirebase) this.loadData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.firebase && !this._initFirebase) this.loadData();
  }

  componentWillUnmount() {
    if (typeof this.unsubApplications === "function") this.unsubApplications();
  }

  loadData = async () => {
    this._initFirebase = true;

    const initialApplication = "details";
    const cachedApplicationID = window.localStorage.getItem(
      "currentApplicationDeliberation"
    );

    const currentApplicationID = cachedApplicationID || initialApplication;

    const questions = await this.props.firebase
      .questions()
      .get()
      .then((querySnapshot) =>
        querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      );

    const levelConfig = await this.props.firebase
      .levelConfig()
      .get()
      .then((doc) => {
        if (!doc.exists) {
          this.setState({ error: "LevelConfig does not exist!" });
          return {};
        }
        return doc.data();
      });

    const applications = await new Promise((resolve, reject) => {
      let resolveOnce = (doc) => {
        resolveOnce = () => null;
        resolve(doc);
      };
      this.unsubApplications = this.props.firebase
        .interviewedApplicants()
        .onSnapshot((querySnapshot) => {
          const applications = querySnapshot.docs.map((doc) => {
            const application = doc.data();
            return {
              id: doc.id,
              ...application,
              name: application.responses.find((r) => r.id === 1).value,
            };
          });
          this.setState({ applications });
          resolveOnce(applications);

          if (
            currentApplicationID !== null &&
            currentApplicationID !== undefined
          ) {
            const fallBack =
              currentApplicationID === "admin" ||
              currentApplicationID === "secondRound"
                ? currentApplicationID
                : "details";
            this.setCurrentApplication(
              applications.find((a) => a.id === currentApplicationID) ||
                fallBack
            );
          }
        }, reject);
    });

    this.setState({
      applications,
      questions,
      levelConfig,
      currentApplicationID,
      loading: false,
    });
  };

  setCurrentApplication = (currentApplication) => {
    const currentApplicationID =
      typeof currentApplication === "object" && currentApplication !== null
        ? currentApplication.id
        : currentApplication;
    window.localStorage.setItem(
      "currentApplicationDeliberation",
      currentApplicationID
    );
    this.setState({ currentApplication, currentApplicationID });
  };

  voteApplicant = (decision) => {
    const { currentApplication } = this.state;
    const updatedApplication = cloneDeep(currentApplication);
    delete updatedApplication.id;
    updatedApplication.deliberation.votes[this.context.uid] = decision;

    this.props.firebase
      .application(currentApplication.id)
      .update(updatedApplication)
      .then(() =>
        swal(
          "You voted!",
          `You chose to ${decision ? "accept" : "deny"}. Nice.`,
          "success"
        )
      )
      .catch((err) => console.error(err));
  };

  saveFeedback = async (applicationId, feedback) =>
    await this.props.firebase.application(applicationId).update({
      "deliberation.feedback": feedback,
    });

  saveSecondRoundStatus = async (
    applicationId,
    currentMeetingStatus,
    currentContributionStatus
  ) =>
    await this.props.firebase.application(applicationId).update({
      "provisional.meetings": currentMeetingStatus,
      "provisional.contribution": currentContributionStatus,
    });

  readyRoundTwo = () =>
    swal({
      title: "Hold up!",
      text:
        "If you press Yes, you're going to open the second round of deliberation, which will commit significant changes to the database! Are you sure?",
      icon: "warning",
      buttons: {
        cancel: {
          text: "No",
          value: false,
          visible: true,
        },
        confirm: {
          text: "Yes",
          value: true,
          visible: true,
        },
      },
    }).then((confirm) => {
      if (confirm) {
        const batch = this.props.firebase.firestore.batch();
        this.state.applications.forEach((application) => {
          const ref = this.props.firebase.application(application.id);
          batch.update(ref, {
            "deliberation.accepted": false,
            "deliberation.confirmed": false,
            "deliberation.feedback": "",
          });
        });
        batch.commit();
      }
    });

  sendResults = () =>
    swal({
      title: "Hold up!",
      text:
        "If you press Yes, you're going to send emails to all the applicants with their results. If you haven't filled out feedback for everyone, this will be bad!",
      icon: "warning",
      buttons: {
        cancel: {
          text: "No",
          value: false,
          visible: true,
        },
        confirm: {
          text: "Yes",
          value: true,
          visible: true,
        },
      },
    }).then((confirm) => {
      if (confirm) {
        const everyoneHasFeedback = this.state.applications
          .map(({ deliberation: { feedback, votes } }) => {
            const allVotes = Object.values(votes);
            const positiveVotes = allVotes.filter((vote) => !!vote).length;
            const accepted = positiveVotes / allVotes.length >= 0.75;
            return accepted || feedback !== "";
          })
          .reduce((prev, cur) => prev && cur);

        if (everyoneHasFeedback) {
          // Update everyone's accepted status
          // Get a new write batch
          const batch = this.props.firebase.firestore.batch();
          const appsWithResult = this.state.applications.map((application) => {
            const {
              id,
              deliberation: { votes },
            } = application;
            const allVotes = Object.values(votes);
            const positiveVotes = allVotes.filter((vote) => !!vote).length;
            const accepted = positiveVotes / allVotes.length >= 0.75;
            if (accepted) {
              const updateData = {
                "deliberation.accepted": true,
                "deliberation.votes": {},
              };

              if (this.props.settings.useTwoRoundDeliberations) {
                updateData.provisional = {
                  meetings: false,
                  contribution: false,
                };
              }

              const ref = this.props.firebase.application(id);
              batch.update(ref, updateData);
            }

            const newApp = update(application, {
              deliberation: { accepted: { $set: accepted } },
            });

            return newApp;
          });

          // Commit the batch
          batch.commit().then(() => {
            /* eslint-disable no-unused-vars */
            const accepted = appsWithResult.filter(
              (app) => app.deliberation.accepted
            );
            const denied = appsWithResult.filter(
              (app) => !app.deliberation.accepted
            );
            /* eslint-enable no-unused-vars */
            // TODO: send emails here
          });
        } else {
          swal(
            "Nope",
            "Make sure everyone who was denied has feedback!",
            "error"
          );
        }
      }
    });

  render() {
    const {
      loading,
      error,
      applications,
      currentApplication,
      currentApplicationID,
      questions,
      levelConfig,
    } = this.state;

    if (error) return <Error message={error} />;
    if (loading) return <Loader />;

    const { deliberationsOpen } = this.props.settings;

    const authUser = this.context;

    if (!deliberationsOpen && !isAdmin(authUser))
      return (
        <TextDisplay
          name={"Deliberations Menu"}
          text={"Deliberations are currently closed!"}
          displayBack={true}
        />
      );

    let Content;
    if (currentApplicationID === "details") Content = () => <DetailsDisplay />;
    else if (currentApplicationID === "admin") {
      Content = () => (
        <FeedbackPage
          settings={this.props.settings}
          applications={applications}
          saveFeedback={this.saveFeedback}
          sendResults={this.sendResults}
        />
      );
    } else if (currentApplicationID === "secondRound") {
      Content = () => (
        <SecondRound
          settings={this.props.settings}
          applications={applications}
          saveSecondRoundStatus={this.saveSecondRoundStatus}
          readyRoundTwo={this.readyRoundTwo}
        />
      );
    } else if (typeof currentApplication === "object") {
      Content = () => (
        <ApplicationDisplay
          questions={questions}
          levelConfig={levelConfig}
          voteApplicant={this.voteApplicant}
          vote={currentApplication.deliberation.votes[authUser.uid]}
          {...currentApplication}
        />
      );
    } else Content = () => <DetailsDisplay />;

    const Sidebar = () => (
      <SidebarBase>
        <h1>Applications</h1>
        <SidebarItem
          selected={currentApplication === "details"}
          onClick={() => this.setCurrentApplication("details")}
        >
          Voting Instructions
        </SidebarItem>
        {isAdmin(authUser) && (
          <SidebarItem
            selected={currentApplication === "admin"}
            onClick={() => this.setCurrentApplication("admin")}
          >
            Add Feedback
          </SidebarItem>
        )}
        {isAdmin(authUser) && (
          <SidebarItem
            selected={currentApplication === "secondRound"}
            onClick={() => this.setCurrentApplication("secondRound")}
          >
            Second Round Status
          </SidebarItem>
        )}
        <hr />
        {applications
          .sort((a, b) => (a.name > b.name ? 1 : -1))
          .map((application) => (
            <SidebarItem
              selected={currentApplication.id === application.id}
              key={application.id}
              onClick={() => this.setCurrentApplication(application)}
            >
              {application.name}
            </SidebarItem>
          ))}
      </SidebarBase>
    );

    return (
      <FullSizeContainer fluid flexdirection="row">
        <Sidebar />
        <Col style={{ padding: 25 }}>
          <Content />
        </Col>
      </FullSizeContainer>
    );
  }
}

export default compose(
  withSettings,
  withAuthorization(isMember),
  withFirebase
)(InterviewerView);
