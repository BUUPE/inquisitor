import React, { Component } from "react";
import { compose } from "recompose";
import { Link } from "gatsby";
import Button from "react-bootstrap/Button";
import DataForm from "./DataForm";
import { Centered } from "../../styles/global";
import { isAppOrMem } from "../../util/conditions";
import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";

import { Container } from "../../styles/global";
import Loader from "../Loader";
import SecondDeliberationInterviewer from "./SecondDeliberationInterviewer";

class ApplicantView extends Component {
  _initFirebase = false;
  state = {
    settings: null,
    loading: true,
    error: null,
    accepted: false,
    application: null,
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
      this.setState({ settings }, () => {
        console.log("Settings loaded");
      });
    }

    if (!!this.context.inquisitor.application) {
      const appDoc = await this.props.firebase
        .application(this.context.inquisitor.application)
        .get();

      if (!appDoc.exists)
        this.setState({ error: "Failed to load application" });
      else {
        const application = appDoc.data();
        this.setState({ application, loading: false }, () => {
          console.log("Application Loaded");
        });
      }
    }
  };

  accept = () => {
    const data = {
      deliberation: {
        applicantAccepted: true,
      },
    };

    this.props.firebase
      .application(this.context.inquisitor.application)
      .set(data, { merge: true })
      .then(() => {
        console.log("Successfully updated Data");
        this.setState({ accepted: true });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  acceptTwo = () => {
    const data = {
      deliberation: {
        secondRound: {
          applicantAccepted: true,
        },
      },
    };

    const dataTwo = {
      roles: {
        provisionalMember: false,
        applicant: false,
        upemember: true,
      },
    };

    this.props.firebase
      .application(this.context.inquisitor.application)
      .set(data, { merge: true })
      .then(() => {
        this.props.firebase
          .editUser(this.context.uid, dataTwo)
          .then(() => {
            console.log("Successfully updated Data");
            this.setState({ accepted: true });
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  render() {
    const { loading, error, accepted, application } = this.state;

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
      secondDeliberationRound,
    } = this.state.settings;

    const authUser = this.context;

    if (secondDeliberationRound && deliberationsComplete) {
      if (authUser.roles.applicant) {
        if (!application.deliberation.secondRound.complete)
          return (
            <Container flexdirection="column">
              <h1>Deliberations are not yet complete!</h1>
            </Container>
          );
        if (!application.deliberation.secondRound.acceptedUPE)
          return (
            <Container flexdirection="column">
              <h1>You have been emailed your results.</h1>
            </Container>
          );

        if (application.deliberation.secondRound.applicantAccepted || accepted)
          return (
            <Container flexdirection="column">
              <div>
                <h1>Next Steps</h1>
                <p>
                  Now that the onboarding period is complete, you will soon be
                  contacted by our E-Board with specifics about this semester's
                  induction.
                </p>
                <br />
                <h2>WARNING</h2>
                <p>
                  Upon reloading this page you will lose access to it, do not
                  worry about it, it's by design as you are no longer an
                  applicant!
                </p>
              </div>
            </Container>
          );

        return (
          <Container flexdirection="column">
            <div>
              <h1>Your Deliberation</h1>
            </div>
            <br />
            <div>
              <h2>You have been officially accepted into UPE!</h2>
              <br />
              <p>
                We are pleased to announce that you have made it passed the
                provisional period, and have been officially accepted into UPE.
                In order for us to complete this process, we require that you
                confirm your acceptance by clicking bellow.
              </p>
              <Button onClick={() => this.acceptTwo()}>Accept</Button>
            </div>
          </Container>
        );
      } else if (authUser.roles.upemember) {
        return <SecondDeliberationInterviewer />;
      }
    }

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

    if (!application.deliberation.complete)
      return (
        <Container flexdirection="column">
          <h1>Deliberations are not yet complete!</h1>
        </Container>
      );

    if (!application.deliberation.acceptedUPE)
      return (
        <Container flexdirection="column">
          <h1>You have been emailed your results.</h1>
        </Container>
      );

    if (application.deliberation.applicantAccepted || accepted)
      return (
        <Container flexdirection="column">
          <div>
            <h1>Next Steps</h1>
            <p>
              Now that you've accepted to join UPE, you will continue on with
              the onboarding period, during this time, and has mentioned during
              the Info Sessions, you will be required to attend chapter, meet
              current members, and contribute in some way to UPE. Further
              details about this will be given to you shortly by our Recruitment
              Team.
            </p>
            <p>
              For the time being however, we ask that you fill out the form
              bellow, so that once onboarding is over, we can induct you and add
              you to our database & website.
            </p>
          </div>
          <br />
          <DataForm />
        </Container>
      );

    return (
      <Container flexdirection="column">
        <div>
          <h1>Your Deliberation</h1>
        </div>
        <br />
        <div>
          <h2>You have been accepted into UPE!</h2>
          <br />
          <p>
            We are pleased to announce that you have been accepted to the latest
            class of UPE's chapter at BU. If you'd like to accept this, and
            proceed to start your onboarding period, please click the button
            bellow to continue
          </p>
          <Button onClick={() => this.accept()}>Accept</Button>
        </div>
      </Container>
    );
  }
}

export default compose(
  withAuthorization(isAppOrMem),
  withFirebase
)(ApplicantView);
