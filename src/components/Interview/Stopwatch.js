import React, { useState, useEffect } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  font-size: 2rem;
  display: flex;
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 9;
  opacity: 0.75;
`;

const TimeDisplay = styled.p`
  padding: 5px;
  color: ${(props) => (props.overtime ? "red" : "black")};
  border: ${(props) => (props.overtime ? "2px solid red" : "none")};
  text-decoration: ${(props) => (props.overtime ? "underline" : "none")};
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
  seconds = seconds % 3600;
  let minutes = parseInt(seconds / 60);
  return minutes;
};

const Stopwatch = () => {
  const [time, setTime] = useState(window.performance.now());
  const limit = 1;

  useEffect(() => {
    const timer = setInterval(() => setTime(window.performance.now()), 1000);
    return () => clearInterval(timer);
  }, [time]);

  return (
    <Wrapper>
      <TimeDisplay overtime={getMinutes(time) >= limit}>
        Time Elapsed: {msToHMS(time)}
      </TimeDisplay>
    </Wrapper>
  );
};

export default Stopwatch;
