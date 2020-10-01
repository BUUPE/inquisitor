import React, { useState } from "react";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Toast from "react-bootstrap/Toast";
import RangeSlider from "react-bootstrap-range-slider";

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
      <p>{question.answer}</p>
      <Form onSubmit={handleSubmit}>
        <div className="note-wrapper">
          <Col sm={9}>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>
                <strong>Notes</strong>
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
            <strong>Score</strong>

            <RangeSlider
              value={score}
              onChange={(e) => setScore(parseFloat(e.target.value))}
              onAfterChange={handleSave}
              step={0.5}
              max={5}
              min={0}
            />
          </Col>
        </div>

        {submitApplication && <Button type="submit">Submit</Button>}

        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
        >
          <Toast.Body>
            <strong>Saved!</strong>
          </Toast.Body>
        </Toast>
      </Form>
      <hr />
    </>
  );
};

export default QuestionNotes;
