import React, { Component } from "react";

import { AuthUserContext, withFirebase } from "upe-react-components";

import SEO from "../components/SEO";
import Loader from "../components/Loader";
import TextDisplay from "../components/TextDisplay";
import ApplicantActionsDisplay from "../components/Landing/ApplicantActionsDisplay";
import InterviewerActionsDisplay from "../components/Landing/InterviewerActionsDisplay";

class IndexPage extends Component {
  _initFirebase = false;
  state = {
    loading: true,
    generalSettings: null,
  };
  static contextType = AuthUserContext;

  componentDidMount() {
    if (this.props.firebase && !this._initFirebase) this.loadData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.firebase && !this._initFirebase) this.loadData();
    if (typeof window !== "undefined") {
      import("bs-custom-file-input").then((bsCustomFileInput) => {
        bsCustomFileInput.init();
      });
    }
  }

  loadData = async () => {
    this._initFirebase = true;
    const loadGeneralSettings = this.props.firebase
      .generalSettings()
      .get()
      .then((snapshot) => snapshot.data())
      .catch(() =>
        this.setState({
          loading: false,
        })
      );

    Promise.all([loadGeneralSettings]).then((values) =>
      this.setState({
        loading: false,
        generalSettings: values[0],
      })
    );
  };

  render() {
    const { loading, generalSettings } = this.state;

    // Data Loading
    if (loading) return <Loader />;

    // Not Logged In
    if (!!!this.context)
      return (
        <>
          <TextDisplay
            name={"Welcome to Inquisitor!"}
            text={
              "It seems that you are not logged in, if you'd like to continue into Inquisitor, please Login below with your BU account."
            }
          />
          <ApplicantActionsDisplay />
        </>
      );

    // Declare Display Text Variable
    let text =
      "Your application is currently underway, please check below for all the available actions you can take at this time.";

    // UPE Member
    if (!!this.context.roles.upemember) {
      if (!!this.context.roles.recruitmentteam)
        text =
          "Thank you for helping us run this Semester's Recruitment Season! Below you can find all the available actions you can take at this time.";
      else
        text =
          "Thank you, as always, for helping us make the final deliberations on the New Members this Semester! Below you can find all the available actions you can take at this time.";

      return (
        <>
          <TextDisplay
            name={`Welcome ${this.context.name.split(" ")[0]}!`}
            text={text}
          />
          <InterviewerActionsDisplay />
        </>
      );
    }

    // Denylisted
    if (!!this.context.roles.denyListed)
      text =
        "Unfortunately you are not eligible to apply to Upsilon PI Epsilon. If you think this is a mistake, or want further information on the situation, please contact our EBoard at upe@bu.edu.";
    // Not Applicant
    else if (!!!this.context.roles.applicant) {
      // && Apps Closed
      if (!generalSettings.applicationsOpen)
        text =
          "Applications are currently closed, if you'd like to be notified once they are open please sign up for our Newsletter below.";
      // && Apps Open
      else
        text =
          "It seems like you have yet to apply, before continuing you should do so below.";
    }

    return (
      <>
        <SEO title="Landing" route="/" />
        <TextDisplay
          name={`Welcome ${this.context.name.split(" ")[0]}!`}
          text={text}
        />
        <ApplicantActionsDisplay />
      </>
    );
  }
}

export default withFirebase(IndexPage);
