import React, { useState } from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";

const LevelSelector = ({ levels, saveLevel }) => {
  const [level, setLevel] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    saveLevel(level);
  };

  const handleChange = (e) => setLevel(e.target.value);

  // TODO: show zoom link here zomewhere, as well as a little hover button for it
  return (
    <Form onSubmit={handleSubmit}>
      <h1>Select Level</h1>

      <Form.Group as={Col} md="4" controlId="interviewLevel">
        <Form.Control as="select" name="level" onChange={handleChange} required>
          <option value="">--</option>
          {levels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      <Button variant="primary" type="submit" disabled={level === ""}>
        Begin
      </Button>
    </Form>
  );
};

export default LevelSelector;
