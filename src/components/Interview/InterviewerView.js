import React, { Component } from "react";
import isEqual from "lodash.isequal";
import { compose } from "recompose";
import styled from "styled-components";
import update from "immutability-helper";

import Col from "react-bootstrap/Col";

import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";
import { withSettings } from "../API/SettingsContext";

import LevelSelector from "./LevelSelector";
import InterviewRoom from "./InterviewRoom";
import Stopwatch from "./Stopwatch";

import Loader from "../Loader";
import { isRecruitmentTeam } from "../../util/conditions";
import { formatTime } from "../../util/helper";
import { FullSizeContainer, Title } from "../../styles/global";
import TextDisplay, { BackIcon } from "../TextDisplay";

const Sidebar = styled.ul`
  font-family: Georgia;
  max-width: 300px;
  padding: 15px;
  background: #333333;
  margin-left: 1%;
  margin-right: 1%;
  list-style-type: none;
  border-radius: 25px;
  h1 {
    color: white;
    text-align: center;
    font-style: italic;
    border-bottom: 1px solid grey;
  }
`;

const StyledLi = styled.li`
  cursor: pointer;
  color: #f21131;
  font-weight: bold;
  padding-top: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid grey;

  &:hover {
    color: #f21131;
    text-decoration: underline;
  }
`;

class InterviewerView extends Component {
  _initFirebase = false;
  state = {
    loading: true,
    timeslots: [],
    questions: [],
    currentApplication: null,
    levelConfig: {},
    textSettings: {},
  };
  unsubTextSettings = null;
  unsubTimeslots = null;
  unsubCurrentApplication = null;

  static contextType = AuthUserContext;

  componentDidMount() {
    if (this.props.firebase && !this._initFirebase) this.loadData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.firebase && !this._initFirebase) this.loadData();
  }

  componentWillUnmount() {
    if (typeof this.unsubTextSettings === "function") this.unsubTextSettings();
    if (typeof this.unsubTimeslots === "function") this.unsubTimeslots();
    if (typeof this.unsubCurrentApplication === "function")
      this.unsubCurrentApplication();
  }

  loadData = async () => {
    this._initFirebase = true;
    const authUser = this.context;

    const currentApplication = JSON.parse(
      localStorage.getItem("currentApplication")
    );
    if (currentApplication !== null)
      this.fetchApplication(currentApplication.id);

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
          console.log("LevelConfig does not exist!");
          return {};
        }
        return doc.data();
      });

    const textSettings = await new Promise((resolve, reject) => {
      let resolveOnce = (doc) => {
        resolveOnce = () => null;
        resolve(doc);
      };
      this.unsubTextSettings = this.props.firebase
        .textSettings()
        .onSnapshot((doc) => {
          if (!doc.exists) console.log("Failed to load textSettings!");
          else {
            const textSettings = doc.data();
            this.setState({ textSettings });
            resolveOnce(textSettings);
          }
        }, reject);
    });

    const timeslots = await new Promise((resolve, reject) => {
      let resolveOnce = (doc) => {
        resolveOnce = () => null;
        resolve(doc);
      };
      this.unsubTimeslots = this.props.firebase
        .timeslots()
        .onSnapshot((querySnapshot) => {
          const timeslots = querySnapshot.docs
            .map((doc) => {
              return {
                ...doc.data(),
                time: new Date(doc.data().time), // make sure to convert timestamp objects to Date objects
                id: doc.id,
              };
            })
            .filter((ts) => ts.interviewers.hasOwnProperty(authUser.uid));

          this.setState({ timeslots });
          resolveOnce(timeslots);
        }, reject);
    });

    this.setState({
      questions,
      levelConfig,
      textSettings,
      timeslots,
      loading: false,
    });
  };

  fetchApplication = (id) => {
    if (!id) return;

    if (typeof this.unsubCurrentApplication === "function")
      this.unsubCurrentApplication();
    this.unsubCurrentApplication = this.props.firebase
      .application(id)
      .onSnapshot((doc) => {
        if (!doc.exists) return console.log("Application not found!");
        const fetchedApplication = { ...doc.data(), id: doc.id };

        if (
          !this.state.currentApplication ||
          this.state.currentApplication.id !== fetchedApplication.id ||
          !isEqual(
            this.state.currentApplication?.interview?.notes?.[this.context.uid],
            fetchedApplication?.interview?.notes?.[this.context.uid]
          ) ||
          !isEqual(
            this.state.currentApplication?.interview?.scores?.[
              this.context.uid
            ],
            fetchedApplication?.interview?.scores?.[this.context.uid]
          )
        ) {
          this.setState({ currentApplication: fetchedApplication });
          localStorage.setItem(
            "currentApplication",
            JSON.stringify(fetchedApplication)
          ); // this may lead to issues if the data is very old
          window.onbeforeunload = null; // reset this when they go to a new person
        }
      });
  };

  saveLevel = async (level) => {
    await this.props.firebase
      .application(this.state.currentApplication.id)
      .update({
        interview: {
          ...this.state.currentApplication.interview,
          level,
          startedAt: Date.now(),
        },
      });
  };

  saveApplication = async (interview) => {
    try {
      await this.props.firebase.firestore.runTransaction(
        async (transaction) => {
          const ref = this.props.firebase.application(
            this.state.currentApplication.id
          );
          const doc = await transaction.get(ref);
          // eslint-disable-next-line no-unused-vars
          const application = { ...doc.data() };
          const updateObject = {};
          updateObject[`interview.notes.${this.context.uid}`] =
            interview.notes[this.context.uid];
          updateObject[`interview.scores.${this.context.uid}`] =
            interview.scores[this.context.uid];
          transaction.update(ref, updateObject);
        }
      );
    } catch (e) {
      console.error("Transaction failure!", e);
    }
  };

  submitApplication = async () => {
    try {
      await this.props.firebase.firestore.runTransaction(
        async (transaction) => {
          const ref = this.props.firebase.application(
            this.state.currentApplication.id
          );
          const doc = await transaction.get(ref);
          // eslint-disable-next-line no-unused-vars
          const application = { ...doc.data() };
          let interviewers = update(application.interview.interviewers || {}, {
            $merge: {
              [this.context.uid]: this.context.name,
            },
          });

          let interview;
          if (Object.keys(interviewers).length === 2) {
            interview = update(application.interview, {
              $merge: {
                interviewed: true,
                interviewers,
              },
            });
          } else {
            interview = update(application.interview, {
              $merge: {
                interviewers,
              },
            });
          }

          transaction.update(ref, { interview });
        }
      );
      window.onbeforeunload = null;
      window.localStorage.removeItem("currentApplication");
      window.localStorage.removeItem("current-tab-key");
    } catch (e) {
      console.error("Transaction failure!", e);
    }
  };

  render() {
    const {
      textSettings,
      timeslots,
      loading,
      currentApplication,
      levelConfig,
      questions,
    } = this.state;

    if (loading) return <Loader />;

    const Content = ({ questions }) => {
      if (currentApplication) {
        if (!currentApplication.interview.hasOwnProperty("level"))
          return (
            <LevelSelector
              levels={Object.keys(levelConfig)}
              saveLevel={this.saveLevel}
            />
          );

        const questionMap = {};
        levelConfig[currentApplication.interview.level].forEach((question) => {
          questionMap[question.id] = question.order;
        });
        const lastOrder = Math.max(...Object.values(questionMap));

        const filteredQuestions = questions
          .filter((question) => questionMap.hasOwnProperty(question.id))
          .map((question) => ({
            ...question,
            order: questionMap[question.id] + 1,
          }))
          .concat([
            {
              id: "overview",
              order: -1,
              overview: textSettings.interviewOverviewText,
              interviewerNotes: textSettings.interviewInterviewerNotesText,
            },
            {
              id: "resume",
              order: 0,
              url: currentApplication.responses.find((r) => r.id === 6).value,
              notes: textSettings.interviewResumeNotesText,
            },
            {
              id: "finalNotes",
              order: lastOrder + 2,
              title: "Submit Interview",
              text: textSettings.interviewFinalNotesInterviewerText,
            }, // TODO: explain why + 2 in comment
          ])
          .sort((a, b) => (a.order > b.order ? 1 : -1));

        return (
          <>
            <BackIcon />
            <Title>
              <h1>Interview Room</h1>
            </Title>
            {!currentApplication.interview.interviewed && (
              <Stopwatch
                startTime={currentApplication.interview.startedAt}
                limit={
                  timeslots.find(
                    (ts) =>
                      ts.applicant?.uid === currentApplication?.id ||
                      ts.applicant?.id === currentApplication?.id
                  ).timeslotLength
                }
              />
            )}
            <InterviewRoom
              style={{ marginLeft: "7%" }}
              currentApplication={currentApplication}
              questions={filteredQuestions}
              saveApplication={this.saveApplication}
              submitApplication={this.submitApplication}
            />
          </>
        );
      }

      return (
        <TextDisplay
          name={"Interview Room"}
          text={"Please select an interview timeslot."}
          displayBack={true}
        />
      );
    };

    // TODO: remove the uid || id and stick to uid
    return (
      <FullSizeContainer fluid flexdirection="row">
        <Sidebar>
          <h1>Interviews</h1>
          {timeslots
            .sort((a, b) => {
              if (a.time.getTime() === b.time.getTime())
                return a.applicant.name > b.applicant.name ? 1 : -1;
              else return a.time > b.time ? 1 : -1;
            })
            .map((timeslot) => {
              return (
                <StyledLi
                  key={timeslot.id}
                  selected={
                    timeslot.applicant?.id === currentApplication?.id ||
                    timeslot.applicant?.uid === currentApplication?.id
                  }
                  onClick={() =>
                    this.fetchApplication(
                      timeslot.applicant?.id || timeslot.applicant?.uid
                    )
                  }
                >
                  <strong>{timeslot.applicant?.name || "No applicant"}</strong>
                  <br />
                  {formatTime(timeslot.time)} {timeslot.time.toDateString()}
                </StyledLi>
              );
            })}
        </Sidebar>
        <Col style={{ padding: 25 }}>
          <Content
            questions={questions}
            settings={this.props.settings}
            textSettings={textSettings}
          />
        </Col>
      </FullSizeContainer>
    );
  }
}

export default compose(
  withSettings,
  withAuthorization(isRecruitmentTeam),
  withFirebase
)(InterviewerView);
