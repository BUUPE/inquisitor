import React, { useState } from "react";
import styled from "styled-components";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import { Container } from "../../styles/global";

const StyledP = styled.p`
  white-space: pre-wrap;
`;

const StyledButton = styled(Button)`
  text-decoration: none;
  color: #ffffff;
  background-color: #f21131;
  border: none;
  font-size: 20px;
  font-weight: bold;
  padding: 0.5% 25% 0.5% 25%;
  margin-top: 1%;
  &:hover,
  &:focus,
  &:active,
  &:visited,
  &:disabled {
    text-decoration: none;
    color: #ffffff;
    background-color: #600613;
    border: none;
  }
`;

const QuestionDisplay = ({
  uid,
  name,
  description,
  answer,
  image,
  scores,
  interviewers,
  level,
  classYear,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const InterviewersData = () => {
    return (
      <Row>
        {Object.entries(interviewers).map(([uid, { score, note }], i) => (
          <Col key={uid}>
            <h4>Interviewer {i + 1}</h4>
            <h5>Score</h5>
            <p>{score}</p>
            <h5>Notes</h5>
            <StyledP>{note}</StyledP>
          </Col>
        ))}
      </Row>
    );
  };

  const QuestionDetails = () => {
    const hasIMG = image !== "";
    return (
      <>
        <Col style={{ padding: 0 }}>
          <h5>Description</h5>
          {hasIMG && <img src={image} alt={name} />}
          <StyledP>{description}</StyledP>
        </Col>
        <Col style={{ padding: 0 }}>
          <h5>Answer</h5>
          <StyledP>{answer}</StyledP>
        </Col>
      </>
    );
  };

  let Content = () => null;
  if (uid !== "resume" && uid !== "finalNotes") {
    Content = () => (
      <>
        <Row>
          <Col>
            <h4>General Average</h4>
            <p>{scores?.general || "N/A"}</p>
          </Col>
          <Col>
            <h4>Class Average</h4>
            <p>{scores?.[classYear] || "N/A"}</p>
          </Col>
          <Col>
            <h4>Level Average</h4>
            <p>{scores?.[level] || "N/A"}</p>
          </Col>
        </Row>

        <StyledButton
          paddingTop={"0.5%"}
          paddingBottom={"0.5%"}
          style={{ marginBottom: 20 }}
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "▲ Hide" : "▼ Show"} Details
        </StyledButton>
        {showDetails && <QuestionDetails />}
      </>
    );
  }

  return (
    <Container flexdirection="column">
      <h3>{name}</h3>
      <InterviewersData />
      <Content />
    </Container>
  );
};

export default QuestionDisplay;
