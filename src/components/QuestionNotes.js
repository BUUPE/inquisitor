import React, { useState } from 'react';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Toast from 'react-bootstrap/Toast';

import { withFirebase } from './Firebase';
import { saveQuestionNotes } from '../util/api';

const QuestionNotes = ({ interviewId, problemNum, firebase }) => {
  const [validated, setValidated] = useState(false);
  const [notes, setNotes] = useState('');
  const [score, setScore] = useState(1);
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = event => {
    event.preventDefault();

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
    } else {
      saveQuestionNotes(firebase, { interviewId, problemNum, notes, score }).then(() => {
        setShowToast(true);
        setValidated(false);
      });
    }
  };

  const onNotesChange = event => setNotes(event.target.value);
  const onScoreChange = event => setScore(event.target.value)

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <div className="note-wrapper">
        <Col sm={9}>
          <Form.Group controlId="formBasicEmail">
            <Form.Label><strong>Notes</strong></Form.Label>
            <Form.Control 
              as="textarea" 
              rows="10" 
              placeholder="Enter notes here..." 
              name={`problem-${problemNum}-notes`}
              value={notes}
              onChange={onNotesChange}
              required
            />
          </Form.Group>
        </Col>
        <Col sm={3}>
          <strong>Score</strong>

          {[1,2,3,4,5].map(s => (
            <Form.Check 
              type="radio"
              key={`problem-${problemNum}-score-${s}`}
              name={`problem-${problemNum}-score`}
              label={s}
              value={score}
              onChange={onScoreChange}
              required
            />
          ))}
        </Col>
      </div>
      
      <Button type="submit">Save</Button>

      <Toast 
        onClose={() => setShowToast(false)} 
        show={showToast} 
        delay={3000}
        autohide
      >
        <Toast.Body><strong>Question notes saved!</strong></Toast.Body>
      </Toast>
    </Form>
  );
}

export default withFirebase(QuestionNotes);