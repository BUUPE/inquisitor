import React, { Fragment, Component } from "react";
import styled from "styled-components";
import { compose } from "recompose";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import {
  withFirebase,
  withAuthorization,
  AuthUserContext,
} from "upe-react-components";
import cloneDeep from "lodash.clonedeep";

import { isAdmin } from "../../util/conditions";
import AdminLayout from "./AdminLayout";
import Loader from "../Loader";
import { BackIcon } from "../TextDisplay";
import { formatTime } from "../../util/helper";

import { Title, Text, StyledButton } from "../../styles/global";

const InterviewList = styled.ul`
  font-family: Georgia;
  border: 1px solid black;
`;

const StyledLi = styled.li`
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ResponseDiv = styled.div`
  width: ${(props) => (props.width ? props.width : "50%")};
  flex-grow: 1;
  padding-left: 3%;
`;

const StyledP = styled.p`
  color: ${(props) => (props.green ? "#008000" : "#f21131")} !important;
  font-weight: bold !important;
  font-size: 30px !important;
  padding-bottom: 2% !important;
  font-style: italic !important;
`;

class ManageInterviews extends Component {
  _initFirebase = false;
  state = {
    loading: true,
    levelConfig: {},
    timeslots: [],
    currentInterview: null,
    currentApplication: null,
  };
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
    if (typeof this.unsubTimeslots === "function") this.unsubTimeslots();
    if (typeof this.unsubCurrentApplication === "function")
      this.unsubCurrentApplication();
  }

  loadData = async () => {
    this._initFirebase = true;

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

    const timeslots = await new Promise((resolve, reject) => {
      let resolveOnce = (doc) => {
        resolveOnce = () => null;
        resolve(doc);
      };
      this.unsubTimeslots = this.props.firebase
        .timeslots()
        .onSnapshot((querySnapshot) => {
          const timeslots = querySnapshot.docs.map((doc) => {
            return {
              ...doc.data(),
              time: new Date(doc.data().time), // make sure to convert timestamp objects to Date objects
              uid: doc.id,
            };
          });

          this.setState({ timeslots });
          resolveOnce(timeslots);
        }, reject);
    });

    this.setState({
      levelConfig,
      timeslots,
      loading: false,
    });
  };

  markNoShow = async () => {
    const { currentInterview } = this.state;
    if (!currentInterview) return;

    this.setState({ loading: true });

    await this.props.firebase
      .timeslot(currentInterview.uid)
      .delete()
      .then(() => {
        this.setState({
          currentInterview: null,
          currentApplication: null,
          loading: false,
        });
      })
      .catch((error) => {
        console.log("Failed to delete Timeslot");
        this.setState({ loading: false });
      });
  };

  closeInterview = async () => {
    const { currentApplication, levelConfig } = this.state;
    if (!currentApplication) return;

    const updatedApplication = cloneDeep(currentApplication);
    const defaultInterviewers = [
      {
        name: "Victor Vicente (AUTOMATIC FILL)",
        uid: "588f0b8d-e7bf-4810-bf08-c8dea8b5e0db",
      },
      {
        name: "Linsy Wang (AUTOMATIC FILL)",
        uid: "382f77bd-6e13-4d40-9c17-526d43cb3cea",
      },
    ];

    const interviewers = !!updatedApplication.interview.interviewers
      ? Object.entries(updatedApplication.interview.interviewers)
      : [];

    // Nothing needs to be done
    if (updatedApplication.interview.interviewed || interviewers.length === 2)
      return;

    // Missing 1 interviewer
    if (interviewers.length === 1) {
      let interviewer = defaultInterviewers[0];
      if (interviewers[0][0] === interviewer.uid)
        interviewer = defaultInterviewers[1];

      const level = levelConfig[`${updatedApplication.interview.level}`];

      updatedApplication.interview.notes[`${interviewer.uid}`] = {};
      updatedApplication.interview.scores[`${interviewer.uid}`] = {};

      updatedApplication.interview.notes[`${interviewer.uid}`].finalNotes =
        "NA";
      updatedApplication.interview.scores[`${interviewer.uid}`].finalNotes = 0;
      updatedApplication.interview.notes[`${interviewer.uid}`].resume = "NA";
      updatedApplication.interview.scores[`${interviewer.uid}`].resume = 0;
      updatedApplication.interview.notes[`${interviewer.uid}`].overview = "";
      updatedApplication.interview.scores[`${interviewer.uid}`].overview = 0;

      level.forEach((question) => {
        updatedApplication.interview.notes[`${interviewer.uid}`][
          `${question.uid}`
        ] = "NA";
        updatedApplication.interview.scores[`${interviewer.uid}`][
          `${question.uid}`
        ] = 0;
      });

      updatedApplication.interview.interviewed = true;
      updatedApplication.interview.interviewers[`${interviewer.uid}`] =
        interviewer.name;

      // Missing both interviewers
    } else if (interviewers.length === 0) {
      const level = Object.entries(levelConfig)[0];

      updatedApplication.interview.notes = {};
      updatedApplication.interview.scores = {};
      updatedApplication.interview.interviewers = {};

      defaultInterviewers.forEach((interviewer) => {
        updatedApplication.interview.notes[`${interviewer.uid}`] = {};
        updatedApplication.interview.scores[`${interviewer.uid}`] = {};

        updatedApplication.interview.notes[`${interviewer.uid}`].finalNotes =
          "NA";
        updatedApplication.interview.scores[
          `${interviewer.uid}`
        ].finalNotes = 0;
        updatedApplication.interview.notes[`${interviewer.uid}`].resume = "NA";
        updatedApplication.interview.scores[`${interviewer.uid}`].resume = 0;
        updatedApplication.interview.notes[`${interviewer.uid}`].overview = "";
        updatedApplication.interview.scores[`${interviewer.uid}`].overview = 0;

        level[1].forEach((question) => {
          updatedApplication.interview.notes[`${interviewer.uid}`][
            `${question.uid}`
          ] = "NA";
          updatedApplication.interview.scores[`${interviewer.uid}`][
            `${question.uid}`
          ] = 0;
        });
      });

      updatedApplication.interview.startedAt = Date.now();
      updatedApplication.interview.interviewed = true;
      updatedApplication.interview.level = level[0];
      updatedApplication.interview.interviewers[
        "588f0b8d-e7bf-4810-bf08-c8dea8b5e0db"
      ] = "Vitor Vicente";
      updatedApplication.interview.interviewers[
        "382f77bd-6e13-4d40-9c17-526d43cb3cea"
      ] = "Linsy Wang";
    }

    delete updatedApplication.uid;

    await this.props.firebase
      .application(currentApplication.uid)
      .set(updatedApplication)
      .then(() => {
        this.fetchApplication(currentApplication.uid);
      })
      .catch((error) => console.log("Failed to save Application"));
  };

  fetchApplication = (uid) => {
    if (!uid) return;

    if (typeof this.unsubCurrentApplication === "function")
      this.unsubCurrentApplication();
    this.unsubCurrentApplication = this.props.firebase
      .application(uid)
      .onSnapshot((doc) => {
        if (!doc.exists) return console.log("Application not found!");
        const fetchedApplication = { ...doc.data(), uid: doc.id };
        this.setState({ currentApplication: fetchedApplication });
      });
  };

  render() {
    const { loading, currentInterview, timeslots, currentApplication } =
      this.state;
    const hasTimeslots = timeslots.filter((t) => !!t.applicant).length !== 0;

    if (loading) return <Loader />;

    const InterviewListItem = ({ data }) => (
      <StyledLi
        onClick={() => {
          this.setState({ currentInterview: data });
          this.fetchApplication(data.applicant.uid);
        }}
      >
        {data.applicant.name}
      </StyledLi>
    );

    const CurrentInterview = () => {
      if (!currentInterview || !currentApplication)
        return (
          <h3 style={{ paddingLeft: "3%" }}>
            {" "}
            {hasTimeslots
              ? "Please select an Interview!"
              : "No available Interviews!"}{" "}
          </h3>
        );
      const interviewers = Object.entries(currentInterview.interviewers);
      const interviewed = currentApplication.interview.interviewed;

      return (
        <Fragment>
          <ResponseDiv width={"100%"}>
            <h2> Details </h2>
          </ResponseDiv>
          <ResponseDiv width={"50%"}>
            <h3> Applicant </h3>
            <p> {currentInterview.applicant.name} </p>
          </ResponseDiv>
          <ResponseDiv width={"50%"}>
            <h3> Interviewers </h3>
            <p>
              {" "}
              {interviewers[0][1]}{" "}
              {interviewers.length === 2 ? ` | ${interviewers[1][1]}` : " | NA"}{" "}
            </p>
          </ResponseDiv>
          <ResponseDiv width={"50%"}>
            <h3> Time </h3>
            <p>
              {" "}
              {formatTime(currentInterview.time)}{" "}
              {currentInterview.time.toDateString()}{" "}
            </p>
          </ResponseDiv>
          <ResponseDiv width={"50%"}>
            <h3> Level </h3>
            <p>
              {" "}
              {!!currentApplication.interview.level
                ? currentApplication.interview.level
                : "NA"}{" "}
            </p>
          </ResponseDiv>
          <ResponseDiv width={"100%"}>
            <h2> Status </h2>
            <StyledP green={!!interviewed}>
              {interviewed !== undefined && interviewed
                ? "Interviewed"
                : currentApplication.interview.level
                ? "Interview Not Complete"
                : "Not Interviewed"}
            </StyledP>
          </ResponseDiv>
          <ResponseDiv width={"100%"}>
            <h2> Actions </h2>
          </ResponseDiv>
          <ResponseDiv width={"50%"}>
            <StyledButton
              paddingTop={"0.5%"}
              paddingRight={"3%"}
              paddingBottom={"0.5%"}
              paddingLeft={"3%"}
              onClick={() => this.markNoShow()}
              disabled={interviewed || !!currentApplication.interview.level}
            >
              Mark No Show
            </StyledButton>
          </ResponseDiv>
          <ResponseDiv width={"50%"}>
            <StyledButton
              paddingTop={"0.5%"}
              paddingRight={"3%"}
              paddingBottom={"0.5%"}
              paddingLeft={"3%"}
              onClick={() => this.closeInterview()}
              disabled={interviewed}
            >
              Close Interview
            </StyledButton>
          </ResponseDiv>
        </Fragment>
      );
    };

    return (
      <AdminLayout>
        <BackIcon />
        <Title>
          <h1> Manage Interviews </h1>
        </Title>
        <Text
          paddingTop={"20px"}
          paddingLeft={"7%"}
          paddingRight={"7%"}
          pFontSize={"15px"}
          pTextAlign={"left"}
          pMaxWidth={"100%"}
          position={"left"}
          h2MarginTop={"2%"}
        >
          <Row style={{ height: "100%" }}>
            {hasTimeslots && (
              <Col style={{ flexGrow: 0, flexBasis: 200 }}>
                <InterviewList>
                  {timeslots
                    .filter((t) => !!t.applicant) // Filter no applicant slots out
                    .sort((a, b) =>
                      a.applicant.name > b.applicant.name ? 1 : -1
                    )
                    .map((interview) => (
                      <InterviewListItem key={interview.uid} data={interview} />
                    ))}
                </InterviewList>
              </Col>
            )}
            <Col>
              <Row>
                <CurrentInterview />
              </Row>
            </Col>
          </Row>
        </Text>
      </AdminLayout>
    );
  }
}

export default compose(
  withAuthorization((authUser) => isAdmin(authUser)),
  withFirebase
)(ManageInterviews);
