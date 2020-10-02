import React, { useState } from "react";
import styled from "styled-components";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

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
        <>
          {Object.entries(interviewers).map(
            ([uid, {score, note}], i) => (
              <Col key={uid}>
                <h4>Interviewer {i + 1}</h4>
                <h5>Score</h5>
                <p>{score}</p>
                <h5>Notes</h5>
                <StyledP>{note}</StyledP>
              </Col>
            )
          )}
        </>
      );
    };

    const QuestionDetails = () => {
      const hasIMG = image !== "";
      return (
        <>
          <Row>
            <Col>
              <h3>Details</h3>
            </Col>
          </Row>
          <Row>
            <Col md={3}>
              <h4>Answer</h4>
              <StyledP>{answer}</StyledP>
            </Col>
            <Col md={9}>
              <h4>Description</h4>
              {hasIMG && <img src={image} alt={name} />}
              <StyledP>{description}</StyledP>
            </Col>
          </Row>
        </>
      );
    };

    let Content = () => null;
    if (id !== "resume" && id !== "finalNotes") {
      Content = () => (
        <Col>
            <h4>General Average</h4>
            <p>{scores.general}</p>
            <h4>Class Average</h4>
            <p>{scores[classYear]}</p>
            <h4>Level Average</h4>
            <p>{scores[level]}</p>
          {showDetails && <QuestionDetails />}
          <Button onClick={() => setShowDetails(!showDetails)}>{showDetails ? "Hide" : "Show"} Details</Button>
          </Col>
      );
    }

    return (
      <Container flexdirection="column">
        <h3>{name}</h3>
        <InterviewersData />
        <Content />
      </Container>
    );
}

export default QuestionDisplay;
