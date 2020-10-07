import React, { useState } from "react";
import styled from "styled-components";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import { Container } from "../../styles/global";

const StyledP = styled.p`
  white-space: pre-wrap;
`;

const QuestionDisplay = ({
  id,
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
          <h4>Description</h4>
          {hasIMG && <img src={image} alt={name} />}
          <StyledP>{description}</StyledP>
        </Col>
        <Col style={{ padding: 0 }}>
          <h4>Answer</h4>
          <StyledP>{answer}</StyledP>
        </Col>
      </>
    );
  };

  let Content = () => null;
  if (id !== "resume" && id !== "finalNotes") {
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

        <Button
          style={{ marginBottom: 20 }}
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "▲ Hide" : "▼ Show"} Details
        </Button>
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
