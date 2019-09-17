import React, { useState } from 'react';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Toast from 'react-bootstrap/Toast';

import { withFirebase } from './Firebase';
import { saveQuestionNotes, saveComments } from '../util/api';

const QuestionNotes = ({ interviewId, problemNum, commentsOnly, dataKey, firebase }) => {
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
      setValidated(false);
      if (!commentsOnly) {
        saveQuestionNotes(firebase, { interviewId, problemNum, notes, score }).then(() => setShowToast(true));
      } else {
        saveComments(firebase, { interviewId, dataKey, notes }).then(() => setShowToast(true));
      }
    }
  };

  const onNotesChange = event => setNotes(event.target.value);
  const onScoreChange = event => setScore(event.target.value);

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      {!commentsOnly &&
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
                value={s}
                onChange={onScoreChange}
                required
              />
            ))}
          </Col>
        </div>
      }

      {commentsOnly &&
        <Form.Group controlId="formBasicEmail">
          <Form.Label><strong>Comments</strong></Form.Label>
          <Form.Control 
            as="textarea" 
            rows="10" 
            placeholder="Enter comments here..." 
            name={dataKey}
            value={notes}
            onChange={onNotesChange}
            required
          />
        </Form.Group>
      }
      
      <Button type="submit">Save</Button>

      <Toast 
        onClose={() => setShowToast(false)} 
        show={showToast} 
        delay={3000}
        autohide
      >
        <Toast.Body>
          {commentsOnly &&
            <strong>Comments saved!</strong>
          }

          {!commentsOnly &&
            <strong>Question notes saved!</strong>
          }
        </Toast.Body>
      </Toast>
    </Form>
  );
}

export default withFirebase(QuestionNotes);