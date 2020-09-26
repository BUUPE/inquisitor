import React from "react";

import Tab from "react-bootstrap/Tab";
import Button from "react-bootstrap/Button";

import QuestionNotes from "./QuestionNotes";

const OverviewDisplay = ({ question, isInterviewer }) => (
  <>
    <h3>Overview</h3>
    <p style={{ whiteSpace: "pre-wrap" }}>{question.overview}</p>
    <hr />

    {isInterviewer && (
      <>
        <p style={{ whiteSpace: "pre-wrap" }}>{question.interviewerNotes}</p>
        <hr />
      </>
    )}
  </>
);

const ResumeDisplay = ({ question, note, score, isInterviewer }) => (
  <>
    <h3>Resume Review</h3>
    <p>LOAD RESUME HERE</p>

    {isInterviewer && (
      <>
        <p>{"RESUME NOTES HERE STORE THEM SOMEWHERE"}</p>
        <hr />
        <QuestionNotes question={question} note={note} score={score} />
      </>
    )}
  </>
);

const FinalNotesDisplay = () => {
  return <h1>final notes</h1>;
};

// key={`${question.id}-body`}
const QuestionDisplay = ({
  question,
  note,
  score,
  isInterviewer,
  ButtonGroup,
}) => {
  let Content = null;
  if (question.id === "overview") {
    Content = () => (
      <OverviewDisplay question={question} isInterviewer={isInterviewer} />
    );
  } else if (question.id === "resume") {
    Content = () => (
      <ResumeDisplay
        question={question}
        note={note}
        score={score}
        isInterviewer={isInterviewer}
      />
    );
  } else if (question.id === "finalNotes") {
    Content = () => <FinalNotesDisplay />;
  } else {
    Content = () => (
      <>
        <h3>{question.name}</h3>
        {question.image && <img src={question.image} alt={question.name} />}
        <p>{question.description}</p>
        <hr />

        {isInterviewer && (
          <QuestionNotes question={question} note={note} score={score} />
        )}
      </>
    );
  }

  return (
    <Tab.Pane eventKey={question.order}>
      <Content />
      <ButtonGroup />
    </Tab.Pane>
  );
};

export default QuestionDisplay;
