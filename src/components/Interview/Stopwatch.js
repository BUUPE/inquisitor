import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { withSettings } from "../API/SettingsContext";

const Wrapper = styled.div`
  font-family: Georgia;
  font-size: 2rem;
  display: flex;
  top: 10px;
  right: 10px;
  z-index: 9;
  opacity: 0.75;
`;

const TimeDisplay = styled.p`
  padding: 5px;
  color: ${(props) => (props.overtime ? "red" : "black")} !important;
  border: ${(props) => (props.overtime ? "2px solid red" : "none")} !important;
  text-decoration: ${(props) =>
    props.overtime ? "underline" : "none"} !important;
`;

const formatTimeSegment = (segment) => segment.toString().padStart(2, 0);

const msToHMS = (ms) => {
  let seconds = Math.round(ms / 1000);
  let hours = parseInt(seconds / 3600);
  seconds = seconds % 3600;
  let minutes = parseInt(seconds / 60);
  seconds = seconds % 60;
  return `${formatTimeSegment(hours)}:${formatTimeSegment(
    minutes
  )}:${formatTimeSegment(seconds)}`;
};

const getMinutes = (ms) => {
  let seconds = Math.round(ms / 1000);
  let minutes = parseInt(seconds / 60);
  return minutes;
};

const Stopwatch = ({ startTime, limit, settings }) => {
  const [time, setTime] = useState(Date.now() - startTime);

  let actualLimit = limit;
  if (!!!limit) actualLimit = settings.timeslotLength;

  useEffect(() => {
    const timer = setInterval(() => setTime(Date.now() - startTime), 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  return (
    <Wrapper style={{ paddingLeft: "7%" }}>
      <TimeDisplay overtime={getMinutes(time) >= actualLimit}>
        Time Elapsed: {msToHMS(time)}
      </TimeDisplay>
    </Wrapper>
  );
};

export default withSettings(Stopwatch);
