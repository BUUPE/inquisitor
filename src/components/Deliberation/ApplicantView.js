import React, { Component } from "react";
import { compose } from "recompose";
import { Link } from "gatsby";
import Button from "react-bootstrap/Button";
import { Centered } from "../../styles/global";
import { isApplicant } from "../../util/conditions";
import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";

import { Container } from "../../styles/global";
import Loader from "../Loader";

class ApplicantView extends Component {
  _initFirebase = false;
  state = {
    settings: null,
    loading: true,
    error: null,
    accepted: false,
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

  accept = () => {
    const data = {
      inquisitor: {
        deliberation: {
          applicantAccepted: true,
        },
      },
    };

    this.props.firebase
      .editUser(this.context.uid, data)
      .then(() => {
        console.log("Successfully updated Data");
        this.setState({ accepted: true });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  render() {
    const { loading, error, accepted } = this.state;

    if (loading) return <Loader />;
    if (error)
      return (
        <Container flexdirection="column">
          <h1>{error}</h1>
        </Container>
      );

    const { deliberationOpen, deliberationsComplete } = this.state.settings;

    const authUser = this.context;

    if (!authUser.inquisitor.applied)
      return (
        <Centered>
          <h1>You have not yet applied this semester.</h1>
          <Link to="/apply">
            <Button>Apply!</Button>
          </Link>
        </Centered>
      );

    if (!deliberationOpen)
      return (
        <Container flexdirection="column">
          <h1>Deliberations are closed!</h1>
        </Container>
      );

    if (!deliberationsComplete || !authUser.inquisitor.deliberation.complete)
      return (
        <Container flexdirection="column">
          <h1>Deliberations are not yet complete!</h1>
        </Container>
      );

    if (authUser.inquisitor.deliberation.accepted)
      return (
        <>
          <Container flexdirection="column">
            <div>
              <h1>Your Deliberation</h1>
            </div>
            <br />
            <div>
              <h2>You have been accepted into UPE!</h2>
              <br />
              {!accepted ? (
                <>
                  <p>
                    We are pleased to announce that you have been accepted to
                    the latest class of UPE's chapter at BU. If you'd like to
                    accept this, and proceed to start your onboarding period,
                    please click the button bellow to continue
                  </p>
                  <Button onClick={() => this.accept()}>Accept</Button>
                </>
              ) : (
                <p>
                  You will be contacted shortly regarding future steps to take
                  in relation to the onboarding period!
                </p>
              )}
            </div>
          </Container>
        </>
      );

    return (
      <Container flexdirection="column">
        <div>
          <h1>Your Deliberation</h1>
        </div>
        <br />
        <div>
          <h2>
            {" "}
            We regret to inform you that you have not been accepted into UPE
            this semester{" "}
          </h2>
          <br />
          <p>
            {" "}
            Despite this decision, we encourage you to apply again next semester
            if you so feel inclined.
          </p>
          <p>
            {" "}
            As a part of our decision process, we always provide feedback to
            applicants who are not accepted, bellow you can find the feedback
            written by our recruitment team in regards to your applicantion and
            interview.
          </p>
          <br />
          <h2>Feedback</h2>
          {authUser.inquisitor.deliberation.feedback}
        </div>
      </Container>
    );
  }
}

export default compose(
  withAuthorization(isApplicant),
  withFirebase
)(ApplicantView);
