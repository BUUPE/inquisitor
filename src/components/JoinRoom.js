import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { withRouter } from 'react-router-dom';
import * as ROUTES from '../constants/routes';

const JoinRoom = ({ history }) => {
  const [validated, setValidated] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  const handleSubmit = event => {
    event.preventDefault();

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      history.push(ROUTES.INTERVIEW.replace(':id', roomCode));
    }

    setValidated(true);
  };

  const onChange = event => setRoomCode(event.target.value);

  return (
    <div className="join-form-wrapper">
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <h1>Join a Room</h1>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Room Code</Form.Label>
          <Form.Control
            placeholder="123ABC" 
            value={roomCode}
            onChange={onChange}
            pattern="[A-Z0-9]{6}"
            required
          />
          <Form.Control.Feedback type="invalid">
            Make sure the roomcode is alphanumeric, uppercase, and exactly 6 characters.
          </Form.Control.Feedback>
        </Form.Group>
        
        <Button type="submit">Join</Button>
      </Form>
    </div>
  );
}

export default withRouter(JoinRoom);