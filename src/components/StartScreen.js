import React, { useState } from "react";
import crypto from "crypto";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";

import { isIdAvailable, initializeInterview } from "../util/api";
import { withRouter } from "react-router-dom";
import { withFirebase } from "./Firebase";
import { withAuthorization } from "./Session";
import { compose } from "recompose";
import * as ROUTES from "../constants/routes";

const StartScreenBase = ({ history, firebase }) => {
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);
  const [formFields, setFormFields] = useState({
    intervieweeName: "",
    interviewerName: "",
    gradYear: "",
    level: "",
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      const interviewId = crypto.randomBytes(3).toString("hex").toUpperCase();
      isIdAvailable(firebase, interviewId).then((available) => {
        if (available) {
          window.localStorage.removeItem("current-tab-key");
          initializeInterview(firebase, interviewId, {
            ...formFields,
            open: true,
          }).then(() =>
            history.push(ROUTES.INTERVIEW.replace(":id", interviewId))
          );
        } else {
          setError({
            message: "Something went wrong! Please try submitting again.",
          });
        }
      });
    }

    setValidated(true);
  };

  const onChange = (event) => {
    const newFormFields = { ...formFields };
    newFormFields[event.target.name] = event.target.value;
    setFormFields({ ...newFormFields });
  };

  const year = new Date().getFullYear();
  const years = [];
  for (let i = year; i <= year + 7; i++) {
    years.push(i);
  }

  return (
    <div className="start-screen-wrapper">
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <h1>Begin an Interview</h1>

        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>Interviewee</InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            type="text"
            placeholder="Enter name"
            name="intervieweeName"
            onChange={onChange}
            value={formFields.intervieweeName}
            required
          />
        </InputGroup>

        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>Interviewer(s)</InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            as="textarea"
            rows="2"
            placeholder="Enter name(s)"
            name="interviewerName"
            onChange={onChange}
            value={formFields.interviewerName}
            required
          />
        </InputGroup>

        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>Grad Year</InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            as="select"
            name="gradYear"
            onChange={onChange}
            value={formFields.gradYear}
            required
          >
            <option value="">--Select a Year--</option>
            {years.map((year) => (
              <option key={year}>{year}</option>
            ))}
          </Form.Control>
        </InputGroup>

        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>Level</InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            as="select"
            name="level"
            onChange={onChange}
            value={formFields.level}
            required
          >
            <option value="">--Select a Level--</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </Form.Control>
        </InputGroup>

        <Button variant="primary" type="submit">
          Begin
        </Button>

        {error && <p className="error-msg">{error.message}</p>}
      </Form>
    </div>
  );
};

const condition = (authUser) => !!authUser;
const StartScreen = compose(
  withAuthorization(condition),
  withRouter,
  withFirebase
)(StartScreenBase);

export default StartScreen;
