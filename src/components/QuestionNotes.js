import React, { useState } from 'react';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const QuestionNotes = ({ problemNum }) => {
  const [validated, setValidated] = useState(false);

  const handleSubmit = event => {
    event.preventDefault();

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    }

    setValidated(true);
  };

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
              required
            />
          </Form.Group>
        </Col>
        <Col sm={3}>
          <strong>Score</strong>

          {[1,2,3,4,5].map(score => (
            <Form.Check 
              type="radio"
              key={`problem-${problemNum}-score-${score}`}
              name={`problem-${problemNum}-score`}
              label={score}
              required
            />
          ))}
        </Col>
      </div>
      
      <Button type="submit">Save</Button>
    </Form>
  );
}

export default QuestionNotes;