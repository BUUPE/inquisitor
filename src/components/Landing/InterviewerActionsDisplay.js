import React, { Component } from "react";
import styled from "styled-components";
import { navigate } from "gatsby";

import Row from "react-bootstrap/Row";

import ActionCard from "../Landing/ActionCard";
import Loader from "../Loader";

import { AuthUserContext, withFirebase } from "upe-react-components";

const Title = styled.div`
  padding-left: 5%;
  h1 {
    font-family: Georgia;
    font-size: 50px;
    font-style: italic;
  }
  h1:after {
    content: "";
    display: block;
    width: 4%;
    padding-top: 3px;
    border-bottom: 2px solid #f21131;
  }
`;

const Cards = styled.div`
  padding-top: 80px;
  padding-bottom: 100px;
  padding-left: 15%;
  padding-right: 15%;
`;

class InterviewerActionsDisplay extends Component {
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

  navigateTo = (page) => {
    navigate(page);
  };

  render() {
    const { loading, generalSettings } = this.state;

    // Data Loading
    if (loading) return <Loader />;

    // Check if it's interview Day
    const date = new Date();
    let isDay = false;
    generalSettings.timeslotDays.forEach((day) => {
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
        <Cards>
          <Row
            lg={2}
            md={2}
            sm={1}
            xl={2}
            xs={1}
            style={{ alignItems: "center", justifyContent: "center" }}
          >
            {(!!this.context.roles.admin || !!this.context.roles.eboard) && (
              <ActionCard
                title={"Admin Panel"}
                text={"Click the link below to access the Admin Panel"}
                onclick={() => this.navigateTo("/admin/")}
              />
            )}
            {!!this.context.roles.recruitmentteam &&
              !!generalSettings.timeslotsOpen && (
                <ActionCard
                  title={"Select Timeslots"}
                  text={
                    "Click the link below to select your Interview Timeslots"
                  }
                  onclick={() => this.navigateTo("/timeslots/")}
                />
              )}
            {!!this.context.roles.recruitmentteam && !!isDay && (
              <ActionCard
                title={"Enter Interviews"}
                text={"Click the link below to enter your Interview Rooms"}
                onclick={() => this.navigateTo("/room/")}
              />
            )}
            {!!generalSettings.deliberationsOpen && (
              <ActionCard
                title={"Access Deliberations"}
                text={
                  "Click the link below to vote on New Member Deliberations"
                }
                onclick={() => this.navigateTo("/deliberation/")}
              />
            )}
            {!!this.context && (
              <ActionCard
                title={"Log Out"}
                text={"Click the link below to Logout"}
                onclick={() => this.navigateTo("/logout/")}
              />
            )}
          </Row>
        </Cards>
      </>
    );
  }
}
export default withFirebase(InterviewerActionsDisplay);
