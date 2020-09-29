import React, { Component } from "react";
import { compose } from "recompose";
import styled from "styled-components";
import update from "immutability-helper";

import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";

import InterviewRoom from "./InterviewRoom";

import Loader from "../Loader";
import Error from "../Error";
import { isApplicant } from "../../util/conditions";
import { Container } from "../../styles/global";

class ApplicantView extends Component {
  _initFirebase = false;
  state = {
    error: null,
    loading: true,
    timeslot: null,
    questions: [],
    currentApplication: null,
    levelConfig: {},
  };
  unsubSettings = null;
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
    if (typeof this.unsubCurrentApplication === "function")
      this.unsubCurrentApplication();
  }

  loadData = async () => {
    this._initFirebase = true;
    const authUser = this.context;

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

    await this.props.firebase
      .timeslots()
      .where("applicant.id", "==", authUser.uid)
      .get()
      .then((querySnapshot) => {
        const doc = querySnapshot.docs[0];
        if (!doc.exists)
          return this.setState({ error: "User timeslot not found!" });
        const timeslot = doc.data();
        this.setState({ timeslot });
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

    const currentApplication = await new Promise((resolve, reject) => {
      let resolveOnce = (doc) => {
        resolveOnce = () => null;
        resolve(doc);
      };
      this.unsubSettings = this.props.firebase
        .application(authUser.uid)
        .onSnapshot((doc) => {
          if (!doc.exists)
            this.setState({ error: "Failed to load currentApplication!" });
          else {
            const currentApplication = doc.data();
            this.setState({ currentApplication });
            resolveOnce(currentApplication);
          }
        }, reject);
    });
    this.setState({ currentApplication, loading: false });
  };

  setIntervieweeOn = async (key) => {
    const interview = update(this.state.currentApplication.interview || {}, {
      $merge: {
        intervieweeOn: key,
      },
    });
    await this.props.firebase
      .application(this.context.uid)
      .update({ interview });
  };

  render() {
    const {
      settings,
      timeslot,
      error,
      loading,
      currentApplication,
      levelConfig,
      questions,
    } = this.state;

    if (loading) return <Loader />;

    const Content = () => {
      if (error) return <Error message={error} />;

      if (!currentApplication.interview.hasOwnProperty("level")) {
        return <h1>Not yet started!</h1>;
      } else {
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
            //{ id: "finalNotes", order: lastOrder + 2, title: "Submit Interview", text: settings.interviewFinalNotesInterviewerText }, // TODO: explain why + 2 in comment
          ])
          .sort((a, b) => (a.order > b.order ? 1 : -1));

        return (
          <InterviewRoom
            currentApplication={currentApplication}
            questions={filteredQuestions}
            isApplicant={true}
            saveApplication={this.setIntervieweeOn}
          />
        );
      }
    };

    return (
      <Container fluid flexdirection="column">
        <Content />
      </Container>
    );
  }
}

export default compose(
  withAuthorization(isApplicant),
  withFirebase
)(ApplicantView);
