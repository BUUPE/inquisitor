import React, { useState } from "react";
import styled from "styled-components";

import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Toast from "react-bootstrap/Toast";
import RangeSlider from "react-bootstrap-range-slider";

const StyledP = styled.p`
  white-space: pre-wrap;
  font-family: Georgia;
`;

const StyledButton = styled(Button)`
  text-decoration: none;
  color: #ffffff;
  background-color: #f21131;
  border: none;
  font-size: 25px;
  font-weight: bold;
  padding: 0.5% 2% 0.5% 2%;
  &:disabled {
    text-decoration: none;
    color: #ffffff;
    background-color: #f88898;
    border: none;
  }
  &:hover,
  &:focus,
  &:active,
  &:visited {
    text-decoration: none;
    color: #ffffff;
    background-color: #600613;
    border: none;
  }
`;

const QuestionNotes = ({
  question,
  note: propNote,
  score: propScore,
  saveApplication,
  submitApplication,
}) => {
  const [note, setNote] = useState(propNote);
  const [score, setScore] = useState(propScore);
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await saveApplication({
      note,
      score,
      id: question.id,
    });
    await submitApplication();
  };

  const handleSave = () =>
    saveApplication({
      note,
      score,
      id: question.id,
    });

  return (
    <>
      <StyledP>{question.answer}</StyledP>
      <Form onSubmit={handleSubmit}>
        <div className="note-wrapper">
          <Col sm={9}>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>
                <strong style={{ fontFamily: "Georgia" }}>Notes</strong>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows="10"
                placeholder="Enter notes here..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={handleSave}
                required
              />
            </Form.Group>
          </Col>
          <Col sm={3}>
            <strong style={{ fontFamily: "Georgia" }}>Score</strong>

            <RangeSlider
              variant={"danger"}
              value={score}
              onChange={(e) => setScore(parseFloat(e.target.value))}
              onAfterChange={handleSave}
              step={0.5}
              max={5}
              min={0}
            />
          </Col>
        </div>

        {submitApplication && (
          <StyledButton
            style={{ marginTop: "2%", marginBottom: "2%" }}
            type="submit"
          >
            Submit
          </StyledButton>
        )}

        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
        >
          <Toast.Body>
            <strong style={{ fontFamily: "Georgia" }}>Saved!</strong>
          </Toast.Body>
        </Toast>
      </Form>
      <hr style={{ marginTop: "3%", marginBottom: "3%" }} />
    </>
  );
};

export default QuestionNotes;
