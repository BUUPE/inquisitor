import React, { Component } from "react";
import { navigate } from "gatsby";
import { compose } from "recompose";

import Row from "react-bootstrap/Row";

import ActionCard from "../Landing/ActionCard";
import Loader from "../Loader";

import { AuthUserContext, withFirebase } from "upe-react-components";
import { withSettings } from "../API/SettingsContext";

import { Wrapper, Title } from "../../styles/global";

class ApplicantActionsDisplay extends Component {
  _initFirebase = false;
  state = {
    loading: true,
    application: null,
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

    this.props.firebase
      .application(!!this.context ? this.context.uid : "1")
      .get()
      .then((snapshot) => {
        if (!snapshot.exists)
          this.setState({ application: null, loading: false });
        else this.setState({ application: snapshot.data(), loading: false });
      })
      .catch(() => console.log("No application"));
  };

  navigateTo = (page) => {
    navigate(page);
  };

  render() {
    const { loading, application } = this.state;

    // Data Loading
    if (loading) return <Loader />;

    // Check if it's interview Day
    const date = new Date();
    let isDay = false;
    this.props.settings.timeslotDays.forEach((day) => {
      const transformedDay = day.toDate();
      isDay |=
        transformedDay.getDay() === date.getDay() &&
        transformedDay.getMonth() === date.getMonth() &&
        transformedDay.getYear() === date.getYear();
    });

    return (
      <>
        <Title>
          <h1> Actions </h1>
        </Title>
        <Wrapper
          paddingRight={"15%"}
          paddingLeft={"15%"}
          paddingTop={"80px"}
          paddingBottom={"100px"}
        >
          <Row
            lg={2}
            md={2}
            sm={1}
            xl={2}
            xs={1}
            style={{ alignItems: "center", justifyContent: "center" }}
          >
            {!!!this.context && (
              <ActionCard
                title={"Log In"}
                text={"Click the link below to Login and get started!"}
                onclick={() => this.navigateTo("/login/")}
              />
            )}
            {!!!this.context?.roles.applicant &&
              this.props.settings.applicationsOpen && (
                <ActionCard
                  title={"New Application"}
                  text={
                    "Click the link below to start a new Application to UPE!"
                  }
                  onclick={() => this.navigateTo("/apply/")}
                />
              )}
            {!!this.context?.roles.applicant &&
              this.props.settings.applicationsOpen && (
                <ActionCard
                  title={"Edit Application"}
                  text={"Click the link below to edit your Application to UPE!"}
                  onclick={() => this.navigateTo("/apply/")}
                />
              )}
            {!!this.context?.roles.applicant &&
              this.props.settings.timeslotsOpenForApplicants && (
                <ActionCard
                  title={"Select Timeslots"}
                  text={
                    "Click the link below to select your Interview Timeslots"
                  }
                  onclick={() => this.navigateTo("/timeslots/")}
                />
              )}
            {!!this.context?.roles.applicant && !!isDay && (
              <ActionCard
                title={"Enter Interview"}
                text={"Click the link below to enter your Interview Room"}
                onclick={() => this.navigateTo("/room/")}
              />
            )}
            {!!this.context?.roles.applicant &&
              !!application &&
              application.interview.interviewed && (
                <ActionCard
                  title={"View Deliberation"}
                  text={
                    "Click the link below to view your Deliberation Results"
                  }
                  onclick={() => this.navigateTo("/deliberation/")}
                />
              )}
            {!!this.context &&
              !!!this.context.roles.applicant &&
              !this.props.settings.applicationsOpen && (
                <ActionCard
                  title={"Interest Form"}
                  text={"Click the link below to sign up for our Newsletter!"}
                  onclick={() => this.navigateTo("/interest-form/")}
                />
              )}
            <ActionCard
              title={"Contact Us"}
              text={"Click the link below to Contact Us"}
              onclick={(e) => {
                window.location = "mailto:upe@bu.edu";
                e.preventDefault();
              }}
            />
            {!!this.context && (
              <ActionCard
                title={"Log Out"}
                text={"Click the link below to Logout"}
                onclick={() => this.navigateTo("/logout/")}
              />
            )}
          </Row>
        </Wrapper>
      </>
    );
  }
}
export default compose(withSettings, withFirebase)(ApplicantActionsDisplay);
