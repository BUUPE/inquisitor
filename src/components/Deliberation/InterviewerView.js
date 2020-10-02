import React, { Component } from "react";
import { compose } from "recompose";
import styled from "styled-components";

import Col from "react-bootstrap/Col";

import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";

import { isMember, isRecruitmentTeam, isAdmin} from "../../util/conditions";
import Loader from "../Loader";
import Error from "../Error";
import AdminSettings from "./AdminSettings";
import ApplicationDisplay from "./ApplicationDisplay";
import { Container, FullSizeContainer } from "../../styles/global";

// TODO: use this to constrcut a Sidebar base in global styles
const SidebarBase = styled.ul`
  text-align: center;
  width: 100%;
  height: 100%;
  padding: 15px;
  background: ${(props) => props.theme.palette.darkShades};
  list-style: none;

  h1 {
    color: white;
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
  color: ${(props) =>
    props.selected ? props.theme.palette.mainBrand : "white"};
  font-weight: bold;
  padding-top: 10px;
  padding-bottom: 10px;
  cursor: pointer;

  &:hover {
    color: ${(props) => props.theme.palette.mainBrand };
    text-decoration: underline;
  }
`;

const DetailsDisplay = () => (
  <div>
    <h1> Welcome to Deliberations! </h1>
      <p>
        {" "}
        Please read the instructions bellow carefully before proceeding
        to deliberate on all the candidates.{" "}
      </p>

      <h3> How to Vote </h3>
      <p>
        {" "}
        In order to vote, select one of the candidates from the sidebar,
        and proceed to review their application, in it, you'll be able
        to see not only their general application, but also the details
        of their interview.{" "}
      </p>
      <p>
        {" "}
        After reviewing their application, you'll find two buttons at
        the bottom, approve & deny, you only get 1 vote per candidate,
        although you will be able to switch your vote until the
        deliberations close.{" "}
      </p>

      <h3> Final Details </h3>
      <p>
        {" "}
        You will not be able to see anyone else's votes of the final
        results until the EBoard announces them.{" "}
      </p>
  </div>
);

class InterviewerView extends Component {
  _initFirebase = false;
  state = {
    applications: null,
    currentApplication: "details",
    settings: null,
    loading: true,
    error: null,
    display: null,
  };
  static contextType = AuthUserContext;
  unsubSettings = null;
  unsubApplications = null;

  componentDidMount() {
    if (this.props.firebase && !this._initFirebase) this.loadData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.firebase && !this._initFirebase) this.loadData();
  }

  componentWillUnmount() {
    if (typeof this.unsubSettings === "function") this.unsubSettings();
    if (typeof this.unsubApplications === "function") this.unsubApplications();
  }

  loadData = async () => {
    this._initFirebase = true;

    const initialApplication = "details";
    const cachedApplication = JSON.parse(window.localStorage.getItem("currentApplicationDeliberation"));
    const currentApplication = cachedApplication || initialApplication;

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

    const applications = await new Promise((resolve, reject) => {
      let resolveOnce = (doc) => {
        resolveOnce = () => null;
        resolve(doc);
      };
      this.unsubSettings = this.props.firebase
        .interviewedApplicants()
        .onSnapshot((querySnapshot) => {
          const applications = querySnapshot.docs.map((doc) => {
            const application = doc.data();
            return {
              id: doc.id,
              ...application,
              name: application.responses.find(r => r.id === 1).value
            };
          });
          this.setState({ applications });
          resolveOnce(applications);
        }, reject);
    });
    this.setState({
      settings,
    applications,
    questions,
levelConfig,
currentApplication,
loading: false
});
  };

  setCurrentApplication = (currentApplication) => {
    window.localStorage.setItem("currentApplicationDeliberation", JSON.stringify(currentApplication));
    this.setState({currentApplication});
  }

  render() {
    const {
      loading,
      error,
      applications,
      currentApplication,
      questions,
levelConfig,
     } = this.state;

    if (error) return <Error message={error} />
    if (loading) return <Loader />;

    const {
      deliberationsOpen,
    } = this.state.settings;

    const authUser = this.context;

    if (!deliberationsOpen && !isAdmin(authUser))
      return (
        <Container flexdirection="column">
          <h1>Deliberations are closed!</h1>
        </Container>
      );

    let Content;
    if (currentApplication === "details") Content = () => <DetailsDisplay />;
    else if (currentApplication === "admin") Content = () => <AdminSettings round={1} />;
    else Content = () => <ApplicationDisplay questions={questions} levelConfig={levelConfig} {...currentApplication} />;

    const Sidebar = () => (
      <Col className="flex-column" md={3} style={{padding: 0}}>
        <SidebarBase>
          <h1>Applications</h1>
          <SidebarItem onClick={() => this.setCurrentApplication("details")}>
            Voting Instructions
          </SidebarItem>
          {isAdmin(authUser) && (
            <SidebarItem onClick={() => this.setCurrentApplication("admin")}>
              Admin Settings
            </SidebarItem>
          )}
          <hr />
          {applications.map((application) => (
            <SidebarItem key={application.id} onClick={() => this.setCurrentApplication(application)}>
              {application.name}
            </SidebarItem>
          ))}
        </SidebarBase>
      </Col>
    );

    return (
      <FullSizeContainer fluid flexdirection="row">
        <Sidebar />
        <Col md={9} style={{padding: 15}}>
          <Content />
        </Col>
      </FullSizeContainer>
    );
  }
}

export default compose(
  withAuthorization(isMember),
  withFirebase
)(InterviewerView);
