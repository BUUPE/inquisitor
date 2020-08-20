import React, { Component } from "react";
import { compose } from "recompose";
import swal from "@sweetalert/with-react";
import styled from "styled-components";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Toast from "react-bootstrap/Toast";

import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";

import { isRecruitmentTeam } from "../../util/conditions";
import Loader from "../Loader";
import AdminSettings from "./AdminSettings";
import ApplicationDisplay from "./ApplicationDisplay";
import { Container } from "../../styles/global";

const StyledCol = styled(Col)`
  text-align: center;
  width: 10px;
  padding: 15px;
  background: ${(props) => props.theme.palette.darkShades};

  h1 {
    color: white;
    font-weight: bold;
    padding-top: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid grey;
    font-size: 27px;
  }

  li {
    color: white;
    font-weight: bold;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  hr {
    border-bottom: 1px solid grey;
  }
`;

const StyledContainer = styled(Container)`
  padding-left: 0;
  margin-top: 0;
`;

class InterviewerView extends Component {
  constructor(props) {
    super(props);

    this.updatePage = this.updatePage.bind(this);
  }

  _initFirebase = false;
  state = {
    applicationList: null,
    settings: null,
    loading: true,
    error: null,
    display: null,
  };
  static contextType = AuthUserContext;
  unsub = null;

  componentDidMount() {
    if (this.props.firebase && !this._initFirebase) this.loadSettings();
  }

  componentDidUpdate(prevProps) {
    if (this.props.firebase && !this._initFirebase) this.loadSettings();
  }

  componentWillUnmount() {
    if (typeof this.unsub === "function") this.unsub();
  }

  updatePage = () => {
    this.loadSettings();
  };

  loadSettings = async () => {
    this._initFirebase = true;
    const doc = await this.props.firebase.generalSettings().get();

    if (!doc.exists) this.setState({ error: "Failed to load timeslots!" });
    else {
      const settings = doc.data();
      this.setState({ settings }, () => {
        console.log("Settings loaded");
      });
    }

    this.props.firebase
      .interviewedApplicants()
      .get()
      .then((querySnapshot) => {
        const applicationList = querySnapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() };
        });
        this.setState({ applicationList, loading: false }, () => {
          console.log("Applicantions Loaded");
        });
      });
  };

  setCurrentDisplay = (uid) => {
    const { settings } = this.state;

    if (uid === "details") {
      const display = (
        <Container>
          <Row>
            <Col>
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
            </Col>
          </Row>
        </Container>
      );

      this.setState({ display });
      return null;
    }

    if (uid === "admin") {
      const display = (
        <>
          <Container>
            <Row>
              <Col>
                <h1> Deliberations Admin Panel </h1>
              </Col>
            </Row>
          </Container>
          <br />
          <AdminSettings updatePage={this.updatePage} />
        </>
      );

      this.setState({ display });
      return null;
    }

    const display = <ApplicationDisplay data={uid} />;
    this.setState({ display });
  };

  render() {
    const { loading, error, showToast, display, applicationList } = this.state;

    if (loading) return <Loader />;
    if (error)
      return (
        <Container flexdirection="column">
          <h1>{error}</h1>
        </Container>
      );

    const {
      deliberationOpen,
      deliberationsComplete,
      votingComplete,
    } = this.state.settings;

    const authUser = this.context;

    if (!deliberationOpen)
      return (
        <Container flexdirection="column">
          <h1>Deliberations are closed!</h1>
        </Container>
      );

    if (authUser.roles.applicant && !deliberationsComplete)
      return (
        <Container flexdirection="column">
          <h1>Deliberations are not yet complete.</h1>
        </Container>
      );

    if (deliberationsComplete)
      return (
        <Container flexdirection="column">
          <h1>Deliberations are complete</h1>
        </Container>
      );

    const adminStatus = authUser.roles.admin || authUser.roles.eboard;

    const AppListItem = ({ data }) => (
      <li onClick={() => this.setCurrentDisplay(data.id)}>
        {data.applicant.name}
      </li>
    );

    const sidebar = (
      <StyledCol className="flex-column" md={3}>
        <h1> Applicantions </h1>
        <li onClick={() => this.setCurrentDisplay("details")}>
          Voting Instructions
        </li>
        {adminStatus ? (
          <li onClick={() => this.setCurrentDisplay("admin")}>
            Admin Settings
          </li>
        ) : (
          <> </>
        )}
        <hr />
        {applicationList.map((application) => (
          <AppListItem key={application.id} data={application} />
        ))}
      </StyledCol>
    );

    const sidebarTwo = (
      <StyledCol className="flex-column" md={3}>
        <h1> Applicantions </h1>
        <li onClick={() => this.setCurrentDisplay("details")}>
          Voting Instructions
        </li>
        {adminStatus ? (
          <li onClick={() => this.setCurrentDisplay("admin")}>
            Admin Settings
          </li>
        ) : (
          <> </>
        )}
        <hr />
      </StyledCol>
    );

    const complete = (
      <Container>
        <Row>
          <Col>
            <h1> Voting Complete! </h1>
          </Col>
        </Row>
      </Container>
    );

    if (votingComplete) {
      return (
        <StyledContainer fluid flexdirection="row">
          {sidebarTwo}
          <Col md={9}>{display ? display : complete}</Col>
        </StyledContainer>
      );
    }

    return (
      <StyledContainer fluid flexdirection="row">
        {sidebar}
        <Col md={9}>{display ? display : <> </>}</Col>
      </StyledContainer>
    );
  }
}

export default compose(
  withAuthorization(isRecruitmentTeam),
  withFirebase
)(InterviewerView);
