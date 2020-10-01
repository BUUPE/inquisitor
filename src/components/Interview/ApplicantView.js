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
import Logo from "../Logo";
import Error from "../Error";
import { isApplicant } from "../../util/conditions";
import { Container, Centered } from "../../styles/global";

const StyledP = styled.p`
  white-space: pre-wrap;
`;

class ApplicantView extends Component {
  _initFirebase = false;
  state = {
    error: null,
    loading: true,
    questions: [],
    currentApplication: { interview: {} },
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

  shouldComponentUpdate(nextProps, nextState) {
    const interview = this.state?.currentApplication?.interview;
    const nextInterview = nextState?.currentApplication?.interview;
    if (this.state?.loading !== nextState?.loading) return true;
    if (
      interview.interviewed === nextInterview.interviewed &&
      interview.level === nextInterview.level
    )
      return false;
    return true;
  }

  loadData = async () => {
    this._initFirebase = true;
    const authUser = this.context;

    const questions = await this.props.firebase
      .questions()
      .get()
      .then((querySnapshot) =>
        querySnapshot.docs.map((doc) => {
          const { name, image, description } = doc.data();
          return {
            name,
            image,
            description,
            id: doc.id,
          };
        })
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
    this.setState({
      questions,
      levelConfig,
      settings,
      currentApplication,
      loading: false,
    });
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
      error,
      loading,
      currentApplication,
      levelConfig,
      questions,
    } = this.state;

    if (loading) return <Loader />;

    const Content = () => {
      if (error) return <Error message={error} />;

      if (currentApplication?.interview?.interviewed) {
        window.localStorage.removeItem("currentApplication");
        window.localStorage.removeItem("current-tab-key");
        return (
          <Centered style={{ maxWidth: 500, margin: "0 auto" }}>
            <Logo size="medium" />
            <h1>Congratulations!</h1>
            <StyledP>{settings.interviewFinalNotesApplicantText}</StyledP>
          </Centered>
        );
      } else if (!currentApplication.interview.hasOwnProperty("level")) {
        return (
          <Centered style={{ maxWidth: 500, margin: "0 auto" }}>
            <Logo size="medium" />
            <h1>Welcome!</h1>
            <StyledP>{settings.interviewWelcomeText}</StyledP>
            <p>
              Join the Zoom <a href={settings.zoomlink}>here</a>!
            </p>
          </Centered>
        );
      } else {
        const questionMap = {};
        levelConfig[currentApplication.interview.level].forEach((question) => {
          questionMap[question.id] = question.order;
        });

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
          ])
          .sort((a, b) => (a.order > b.order ? 1 : -1));

        return (
          <InterviewRoom
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
