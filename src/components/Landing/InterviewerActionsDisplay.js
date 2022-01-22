import React, { useContext } from "react";
import { navigate } from "gatsby";

import Row from "react-bootstrap/Row";

import ActionCard from "../Landing/ActionCard";

import { AuthUserContext } from "upe-react-components";
import { withSettings } from "../API/SettingsContext";

import { Wrapper, Title } from "../../styles/global";

const InterviewerActionsDisplay = (props) => {
  const authUser = useContext(AuthUserContext);

  const navigateTo = (page) => {
    navigate(page);
  };

  // Check if it's interview Day
  const date = new Date();
  let isDay = false;
  props.settings.timeslotDays.forEach((day) => {
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
          {(!!authUser.roles.admin || !!authUser.roles.eboard) && (
            <ActionCard
              title={"Admin Panel"}
              text={"Click the link below to access the Admin Panel"}
              onclick={() => navigateTo("/admin/")}
            />
          )}
          {!!authUser.roles.recruitmentteam &&
            !!props.settings.timeslotsOpen && (
              <ActionCard
                title={"Select Timeslots"}
                text={"Click the link below to select your Interview Timeslots"}
                onclick={() => navigateTo("/timeslots/")}
              />
            )}
          {!!authUser.roles.recruitmentteam && !!isDay && (
            <ActionCard
              title={"Enter Interviews"}
              text={"Click the link below to enter your Interview Rooms"}
              onclick={() => navigateTo("/room/")}
            />
          )}
          {!!props.settings.deliberationsOpen && (
            <ActionCard
              title={"Access Deliberations"}
              text={"Click the link below to vote on New Member Deliberations"}
              onclick={() => navigateTo("/deliberation/")}
            />
          )}
          {!!authUser && (
            <ActionCard
              title={"Log Out"}
              text={"Click the link below to Logout"}
              onclick={() => navigateTo("/logout/")}
            />
          )}
        </Row>
      </Wrapper>
    </>
  );
};

export default withSettings(InterviewerActionsDisplay);
