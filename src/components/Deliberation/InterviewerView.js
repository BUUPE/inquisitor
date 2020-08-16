import React, { Component } from "react";
import { compose } from "recompose";
import swal from "@sweetalert/with-react";

import Button from "react-bootstrap/Button";
import Toast from "react-bootstrap/Toast";

import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";

import { isRecruitmentTeam } from "../../util/conditions";
import Loader from "../Loader";
import { Container } from "../../styles/global";

import ScrollableRow from "./ScrollableRow";
import ScheduleColumn from "./ScheduleColumn";

class InterviewerView extends Component {
  _initFirebase = false;
  state = {
    settings: null,
    loading: true,
    error: null,
    showToast: false,
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

  loadSettings = async () => {
    this._initFirebase = true;
    const doc = await this.props.firebase.generalSettings().get();

    if (!doc.exists) this.setState({ error: "Failed to load timeslots!" });
    else {
      const settings = doc.data();
      this.setState({ settings, loading: false }, () => {
        console.log("Settings loaded");
      });
    }
  };

  render() {
    const { loading, error, showToast } = this.state;

    if (loading) return <Loader />;
    if (error)
      return (
        <Container flexdirection="column">
          <h1>{error}</h1>
        </Container>
      );

    const { deliberationOpen, deliberationsComplete } = this.state.settings;

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

    return (
      <Container flexdirection="column">
        <div>
          <h1>Deliberations</h1>
          <Toast
            onClose={() => this.setState({ showToast: false })}
            show={showToast}
            delay={3000}
            autohide
            style={{
              width: "fit-content",
              height: "fit-content",
              marginLeft: 25,
            }}
          >
            <Toast.Header>
              <strong className="mr-auto">Selections Saved!</strong>
            </Toast.Header>
          </Toast>
        </div>
      </Container>
    );
  }
}

export default compose(
  withAuthorization(isRecruitmentTeam),
  withFirebase
)(InterviewerView);
