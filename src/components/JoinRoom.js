import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import { withRouter } from 'react-router-dom';
import { withFirebase } from './Firebase';
import { compose } from 'recompose';
import { isInterviewOpen } from '../util/api';
import * as ROUTES from '../constants/routes';

const JoinRoomBase = ({ history, firebase }) => {
  const [validated, setValidated] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = event => {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      isInterviewOpen(firebase, roomCode).then(isOpen => {
        if (isOpen) {
          history.push(ROUTES.INTERVIEW.replace(':id', roomCode));
        } else {
          setError({ message: "The room code you entered is invalid or closed, please try again!" });
        }
      });
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

        {error && <p className="error-msg">{error.message}</p>}
      </Form>
    </div>
  );
}

const JoinRoom = compose(
  withRouter,
  withFirebase
)(JoinRoomBase);

export default JoinRoom;