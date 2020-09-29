import React, { Component } from "react";
import { compose } from "recompose";
import styled from "styled-components";
import update from "immutability-helper";

import Col from "react-bootstrap/Col";

import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";

import LevelSelector from "./LevelSelector";
import InterviewRoom from "./InterviewRoom";
import Stopwatch from "./Stopwatch";

import Loader from "../Loader";
import { isRecruitmentTeam } from "../../util/conditions";
import { formatTime } from "../../util/helper";
import { FullSizeContainer } from "../../styles/global";

const Sidebar = styled.ul`
  min-width: 200px;
  padding: 15px;
  background: ${(props) => props.theme.palette.darkShades};
  margin: 0;
  list-style-type: none;

  h1 {
    color: white;
    text-align: center;
    border-bottom: 1px solid grey;
  }
`;

const StyledLi = styled.li`
  cursor: pointer;
  color: ${(props) =>
    props.selected ? props.theme.palette.mainBrand : "white"};
  font-weight: bold;
  padding-top: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid grey;
`;

class InterviewerView extends Component {
  _initFirebase = false;
  state = {
    error: null,
    loading: true,
    timeslots: [],
    questions: [],
    currentApplication: null,
    levelConfig: {},
  };
  unsubSettings = null;
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
    if (typeof this.unsubSettings === "function") this.unsubSettings();
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

    await this.props.firebase
      .questions()
      .get()
      .then((querySnapshot) => {
        const questions = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        this.setState({ questions });
      });

    await this.props.firebase
      .levelConfig()
      .get()
      .then((doc) => {
        if (!doc.exists)
          return this.setState({ error: "LevelConfig does not exist!" });
        this.setState({ levelConfig: doc.data() });
      });

    const settings = await new Promise((resolve, reject) => {
      let resolveOnce = (doc) => {
        resolveOnce = () => null;
        resolve(doc);
      };
      this.unsubSettings = this.props.firebase
        .generalSettings()
        .onSnapshot((doc) => {
          if (!doc.exists) this.setState({ error: "Failed to load settings!" });
          else {
            const settings = doc.data();
            this.setState({ settings });
            resolveOnce(settings);
          }
        }, reject);
    });
    this.setState({ settings });

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
                time: doc.data().time.toDate(), // make sure to convert timestamp objects to Date objects
                id: doc.id,
              };
            })
            .filter((ts) => ts.interviewers.hasOwnProperty(authUser.uid));

          this.setState({ timeslots });
          resolveOnce(timeslots);
        }, reject);
    });
    this.setState({ timeslots, loading: false });
  };

  fetchApplication = (id) => {
    if (!id) return;

    if (typeof this.unsubCurrentApplication === "function")
      this.unsubCurrentApplication();
    this.unsubCurrentApplication = this.props.firebase
      .application(id)
      .onSnapshot((doc) => {
        if (!doc.exists)
          return this.setState({ error: "Application not found!" });
        const currentApplication = { ...doc.data(), id: doc.id };
        this.setState({ currentApplication });
        localStorage.setItem(
          "currentApplication",
          JSON.stringify(currentApplication)
        ); // this may lead to issues if the data is very old
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
          transaction.update(ref, { interview });
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
                interviewed: true,
              },
            });
          }

          transaction.update(ref, { interview });
        }
      );
    } catch (e) {
      console.error("Transaction failure!", e);
    }
  };

  render() {
    const {
      settings,
      timeslots,
      error,
      loading,
      currentApplication,
      levelConfig,
      questions,
    } = this.state;

    if (loading) return <Loader />;

    const Content = ({ questions }) => {
      if (error) return <h1>{error}</h1>;

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
        const lastOrder = Math.max(Object.values(questionMap));

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
              overview: settings.interviewOverviewText,
              interviewerNotes: settings.interviewInterviewerNotesText,
            },
            {
              id: "resume",
              order: 0,
              url: currentApplication.responses.find((r) => r.id === 6).value,
              notes: settings.interviewResumeNotesText,
            },
            {
              id: "finalNotes",
              order: lastOrder + 2,
              title: "Submit Interview",
              text: settings.interviewFinalNotesInterviewerText,
            }, // TODO: explain why + 2 in comment
          ])
          .sort((a, b) => (a.order > b.order ? 1 : -1));

        return (
          <>
            {!currentApplication.interview.interviewed && (
              <Stopwatch
                startTime={currentApplication.interview.startedAt}
                limit={
                  timeslots.find(
                    (ts) => ts.applicant?.id === currentApplication?.id
                  ).timeslotLength
                }
              />
            )}
            <InterviewRoom
              currentApplication={currentApplication}
              questions={filteredQuestions}
              saveApplication={this.saveApplication}
              submitApplication={this.submitApplication}
            />
          </>
        );
      }

      return <h1>Please select an interview timeslot.</h1>;
    };

    return (
      <FullSizeContainer fluid flexdirection="row">
        <Sidebar>
          <h1>Interviews</h1>
          {timeslots.map((timeslot) => {
            return (
              <StyledLi
                key={timeslot.id}
                selected={timeslot.applicant?.id === currentApplication?.id}
                onClick={() => this.fetchApplication(timeslot.applicant?.id)}
              >
                <strong>{timeslot.applicant?.name || "No applicant"}</strong> (
                {formatTime(timeslot.time)})
              </StyledLi>
            );
          })}
        </Sidebar>
        <Col style={{ padding: 25 }}>
          <Content questions={questions} settings={settings} />
        </Col>
      </FullSizeContainer>
    );
  }
}

export default compose(
  withAuthorization(isRecruitmentTeam),
  withFirebase
)(InterviewerView);
