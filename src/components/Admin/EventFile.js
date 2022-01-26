import React, { Fragment } from "react";
import { StyledButton } from "../../styles/global";
import styled from "styled-components";

const ResponseDiv = styled.div`
  width: ${(props) => (props.width ? props.width : "50%")};
  flex-grow: 1;
  padding-left: 3%;
`;

const EventFile = ({
  currentEvent,
  currentEventWebsite,
  toggleEventStatus,
  toggleEditEvent,
  toggleQRModal,
  deleteEvent,
}) => {
  const formattedStartHour =
    parseInt(currentEventWebsite.startHour) < 10
      ? "0".concat("", currentEventWebsite.startHour)
      : currentEventWebsite.startHour;
  const formattedEndHour =
    parseInt(currentEventWebsite.endHour) < 10
      ? "0".concat("", currentEventWebsite.endHour)
      : currentEventWebsite.endHour;
  const formattedStartMinute =
    parseInt(currentEventWebsite.startMinute) < 10
      ? "0".concat("", currentEventWebsite.startMinute)
      : currentEventWebsite.startMinute;
  const formattedEndMinute =
    parseInt(currentEventWebsite.endMinute) < 10
      ? "0".concat("", currentEventWebsite.endMinute)
      : currentEventWebsite.endMinute;

  return (
    <Fragment>
      <ResponseDiv width={"100%"}>
        <h2> Details </h2>
      </ResponseDiv>
      <ResponseDiv width={"33%"}>
        <h3> Title </h3>
        <p> {currentEvent.title} </p>
      </ResponseDiv>
      <ResponseDiv width={"33%"}>
        <h3> Time </h3>
        {currentEventWebsite.allDay && (
          <p>
            {" "}
            All Day - {currentEventWebsite.startMonth}/
            {currentEventWebsite.startDay}/{currentEventWebsite.startYear}{" "}
          </p>
        )}
        {!currentEventWebsite.allDay && (
          <p>
            {formattedStartHour}:{formattedStartMinute} -{" "}
            {currentEventWebsite.startMonth}/{currentEventWebsite.startDay}/
            {currentEventWebsite.startYear} to {formattedEndHour}:
            {formattedEndMinute} - {currentEventWebsite.endMonth}/
            {currentEventWebsite.endDay}/{currentEventWebsite.endYear}
          </p>
        )}
      </ResponseDiv>
      <ResponseDiv width={"33%"}>
        <h3> Status </h3>
        <p> {currentEvent.open ? "Open" : "Closed"} </p>
      </ResponseDiv>
      <ResponseDiv width={"100%"}>
        <h2> Attendance </h2>
      </ResponseDiv>
      <ResponseDiv width={"50%"}>
        <h3> UPE Attendance </h3>
        {Object.entries(currentEvent.upeAttendance).map((user) => (
          <p key={user[0]}> {user[1]} </p>
        ))}
      </ResponseDiv>
      <ResponseDiv width={"50%"}>
        <h3> Other Attendance </h3>
        {Object.entries(currentEvent.attendance).map((user) => (
          <p key={user[0]}> {user[1]} </p>
        ))}
      </ResponseDiv>
      <ResponseDiv width={"100%"}>
        <h2> Actions </h2>
      </ResponseDiv>
      <br />
      <ResponseDiv width={"25%"}>
        <StyledButton
          paddingTop={"0.5%"}
          paddingRight={"3%"}
          paddingBottom={"0.5%"}
          paddingLeft={"3%"}
          onClick={() => toggleEventStatus()}
        >
          {currentEvent.open ? "Close" : "Open"}
        </StyledButton>
      </ResponseDiv>
      <ResponseDiv width={"25%"}>
        <StyledButton
          paddingTop={"0.5%"}
          paddingRight={"3%"}
          paddingBottom={"0.5%"}
          paddingLeft={"3%"}
          onClick={() => toggleEditEvent()}
        >
          Edit
        </StyledButton>
      </ResponseDiv>
      <ResponseDiv width={"25%"}>
        <StyledButton
          paddingTop={"0.5%"}
          paddingRight={"3%"}
          paddingBottom={"0.5%"}
          paddingLeft={"3%"}
          onClick={() => toggleQRModal()}
        >
          Get QR Code
        </StyledButton>
      </ResponseDiv>
      <ResponseDiv width={"25%"}>
        <StyledButton
          paddingTop={"0.5%"}
          paddingRight={"3%"}
          paddingBottom={"0.5%"}
          paddingLeft={"3%"}
          onClick={() => deleteEvent()}
        >
          Delete
        </StyledButton>
      </ResponseDiv>
    </Fragment>
  );
};

export default EventFile;
