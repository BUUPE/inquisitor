import React, { useState } from "react";
import cloneDeep from "lodash.clonedeep";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";

import { withFirebase } from "upe-react-components";

import InterviewOld from "./InterviewOld";

const LevelSelector = ({ levels, saveLevel }) => {
  const [level, setLevel] = useState("");

  const handleSubmit = e => {
    e.preventDefault();
    saveLevel(level);
  };

  const handleChange = e => setLevel(e.target.value);

  // TODO: show zoom link here zomewhere, as well as a little hover button for it
  return (
    <Form onSubmit={handleSubmit}>
      <h1>Select Level</h1>

      <Form.Group as={Col} md="4" controlId="interviewLevel">
        <Form.Control as="select" name="level" onChange={handleChange} required>
          <option value="">--</option>
          {levels.map(level => (
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

const InterviewerRoom = ({
  firebase,
  currentApplication,
  levelConfig,
  questions,
  settings,
}) => {
  const [localApplication, setLocalApplication] = useState(
    cloneDeep(currentApplication)
  );

  const saveLevel = async level => {
    await firebase.application(currentApplication.id).update({
      interview: {
        ...currentApplication.interview,
        level,
      },
    });
  };

  if (!localApplication.interview.hasOwnProperty("level"))
    return (
      <LevelSelector levels={Object.keys(levelConfig)} saveLevel={saveLevel} />
    );

  const questionMap = {};
  levelConfig[localApplication.interview.level].forEach(question => {
    questionMap[question.id] = question.order;
  });
  const lastOrder = Math.max(Object.values(questionMap));

  const filteredQuestions = questions
    .filter(question => questionMap.hasOwnProperty(question.id))
    .map(question => ({ ...question, order: questionMap[question.id] + 1 }))
    .concat([
      { id: "overview", order: -1, overview: settings.interviewOverviewText, interviewerNotes: settings.interviewInterviewerNotesText},
      { id: "resume", order: 0 },
      { id: "finalNotes", order: lastOrder + 2 }, // TODO: explain why + 2 in comment
    ])
    .sort((a, b) => (a.order > b.order ? 1 : -1));



  return (
    <InterviewOld
      currentApplication={currentApplication}
      questions={filteredQuestions}
      settings={settings}
    />
  );
};

export default withFirebase(InterviewerRoom);
