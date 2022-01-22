import React, { useState } from "react";
import styled from "styled-components";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";

import { BackIcon } from "../TextDisplay";

const Title = styled.div`
  padding-left: 5%;
  h1 {
    font-family: Georgia;
    font-size: 50px;
    font-style: italic;
  }
  h1:after {
    content: "";
    display: block;
    width: 4%;
    padding-top: 3px;
    border-bottom: 2px solid #f21131;
  }
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

const LevelSelector = ({ levels, saveLevel }) => {
  const [level, setLevel] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    saveLevel(level).then(() => window.location.reload(false));
  };

  const handleChange = (e) => setLevel(e.target.value);

  return (
    <Form onSubmit={handleSubmit}>
      <BackIcon />
      <Title>
        <h1>Interview Room</h1>
      </Title>

      <Form.Group
        style={{ paddingTop: "2%", paddingBottom: "1%", paddingLeft: "7%" }}
        as={Col}
        md="4"
        controlId="interviewLevel"
      >
        <Form.Control as="select" name="level" onChange={handleChange} required>
          <option value="">--</option>
          {levels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      <StyledButton
        style={{ marginLeft: "5%" }}
        type="submit"
        disabled={level === ""}
      >
        Begin
      </StyledButton>
    </Form>
  );
};

export default LevelSelector;
