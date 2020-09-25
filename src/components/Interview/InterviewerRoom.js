import React, {useState, useEffect, useContext} from "react";
import cloneDeep from "lodash.clonedeep";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";

import {
  AuthUserContext,
  withFirebase,
} from "upe-react-components";

const LevelSelector = ({levels, saveLevel}) => {
  const [level, setLevel] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    saveLevel(level)
  }

  const handleChange = (e) => setLevel(e.target.value);

  return (
    <Form onSubmit={handleSubmit}>
        <h1>Begin an Interview</h1>

        <Form.Group as={Col} md="4" controlId="interviewLevel">
          <Form.Label>Select Level</Form.Label>
          <Form.Control
            as="select"
            name="level"
            onChange={handleChange}
            required
          >
            <option value="">--Select a Level--</option>
            {levels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </Form.Control>
        </Form.Group>

        <Button variant="primary" type="submit" disabled={level === ""}>
          Begin
        </Button>
      </Form>
  )
}

const InterviewerRoom = ({currentApplication, levelConfig, firebase}) => {
  const [localApplication, setLocalApplication] = useState(cloneDeep(currentApplication));
  const [error, setError] = useState(null);

  const authUser = useContext(AuthUserContext);

  const saveLevel = (level) => {
    console.log("you picked", level)
  }

  if (!localApplication.interview.hasOwnProperty("level")) return <LevelSelector levels={Object.keys(levelConfig)} saveLevel={saveLevel} />

  return (
    <h1>time to rock and roll</h1>
  );
}

export default withFirebase(InterviewerRoom);
