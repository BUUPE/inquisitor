import React, { Component } from "react";
import { compose } from "recompose";
import styled from "styled-components";

import Col from "react-bootstrap/Col";

import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";

import InterviewerRoom from "./InterviewerRoom";

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

    this.unsubSettings = this.props.firebase
      .generalSettings()
      .onSnapshot((doc) => {
        if (!doc.exists) this.setState({ error: "Failed to load timeslots!" });
        else {
          const settings = doc.data();
          this.setState({ settings }, () => {
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

                this.setState({
                  timeslots,
                  loading: false,
                });
              }, console.error);
          });
        }
      });
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

      if (currentApplication)
        return (
          <InterviewerRoom
            currentApplication={currentApplication}
            levelConfig={levelConfig}
            questions={questions}
            settings={settings}
          />
        );

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
