import React, { Component } from "react";
import { compose } from "recompose";
import update from "immutability-helper";

import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";
import { withSettings } from "../API/SettingsContext";

import InterviewRoom from "./InterviewRoom";

import Loader from "../Loader";
import Logo from "../Logo";
import { BackIcon } from "../TextDisplay";
import { isApplicant } from "../../util/conditions";
import { Container } from "../../styles/global";

import { Wrapper, Title, Text } from "../../styles/global";

class ApplicantView extends Component {
  _initFirebase = false;
  state = {
    loading: true,
    questions: [],
    currentApplication: { interview: {} },
    levelConfig: {},
    textSettings: {},
  };
  unsubTextSettings = null;
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
            uid: doc.id,
          };
        })
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

    const currentApplication = await new Promise((resolve, reject) => {
      let resolveOnce = (doc) => {
        resolveOnce = () => null;
        resolve(doc);
      };
      this.unsubCurrentApplication = this.props.firebase
        .application(authUser.uid)
        .onSnapshot((doc) => {
          if (!doc.exists) console.log("Failed to load currentApplication!");
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
      textSettings,
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
      textSettings,
      loading,
      currentApplication,
      levelConfig,
      questions,
    } = this.state;

    if (loading) return <Loader />;

    const Content = () => {
      if (currentApplication?.interview?.interviewed) {
        window.localStorage.removeItem("currentApplication");
        window.localStorage.removeItem("current-tab-key");
        return (
          <Text>
            <Logo size="large" />
            <p> {textSettings.interviewFinalNotesApplicantText} </p>
          </Text>
        );
      } else if (!currentApplication.interview.hasOwnProperty("level")) {
        return (
          <Text>
            <Logo size="large" />
            <p style={{ marginTop: "5%" }}>
              {" "}
              {textSettings.interviewWelcomeText}{" "}
            </p>
            {this.props.settings.remoteInterview && (
              <p>
                {" "}
                Join the Zoom <a href={this.props.settings.zoomlink}>
                  here
                </a>!{" "}
              </p>
            )}
          </Text>
        );
      } else {
        const questionMap = {};
        levelConfig[currentApplication.interview.level].forEach((question) => {
          questionMap[question.uid] = question.order;
        });

        const filteredQuestions = questions
          .filter((question) => questionMap.hasOwnProperty(question.uid))
          .map((question) => ({
            ...question,
            order: questionMap[question.uid] + 1,
          }))
          .concat([
            {
              uid: "overview",
              order: -1,
              overview: textSettings.interviewOverviewText,
              interviewerNotes: textSettings.interviewInterviewerNotesText,
            },
            {
              uid: "resume",
              order: 0,
              url: currentApplication.responses.find((r) => r.uid === "resume")
                .value,
              notes: textSettings.interviewResumeNotesText,
            },
          ])
          .sort((a, b) => (a.order > b.order ? 1 : -1));

        return (
          <>
            <InterviewRoom
              questions={filteredQuestions}
              isApplicant={true}
              saveApplication={this.setIntervieweeOn}
            />
          </>
        );
      }
    };

    return (
      <>
        <BackIcon />
        <Title>
          <h1>Interview Room</h1>
        </Title>
        <Wrapper
          paddingRight={"15%"}
          paddingLeft={"15%"}
          paddingTop={"80px"}
          paddingBottom={"100px"}
        >
          <Container fluid flexdirection="column">
            <Content />
          </Container>
        </Wrapper>
      </>
    );
  }
}

export default compose(
  withSettings,
  withAuthorization(isApplicant),
  withFirebase
)(ApplicantView);
