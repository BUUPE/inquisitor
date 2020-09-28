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

const ResumeDisplay = ({
  question,
  note,
  score,
  isInterviewer,
  saveApplication,
}) => (
  <>
    <h3>Resume Review</h3>
    <p>LOAD RESUME HERE</p>

    {isInterviewer && (
      <>
        <p>{"RESUME NOTES HERE STORE THEM SOMEWHERE"}</p>
        <hr />
        <QuestionNotes
          question={question}
          note={note}
          score={score}
          saveApplication={saveApplication}
        />
      </>
    )}
  </>
);

const FinalNotesDisplay = ({
  question,
  note,
  score,
  isInterviewer,
  saveApplication,
  submitApplication,
}) => {
  if (isInterviewer) {
    return (
      <>
        <h3>Submit Interview</h3>
        <p>PUT TEXT HERE</p>
        <hr />
        <QuestionNotes
          question={question}
          note={note}
          score={score}
          saveApplication={saveApplication}
          submitApplication={submitApplication}
        />
      </>
    );
  } else {
    return (
      <>
        <h3>You did it!</h3>
        <p style={{ whiteSpace: "pre-wrap" }}>PUT TEXT HERE</p>
        <hr />
      </>
    );
  }
};

const QuestionDisplay = ({
  question,
  note,
  score,
  isInterviewer,
  tabKey,
  setTabKey,
  finalQuestionId,
  saveApplication,
  submitApplication,
}) => {
  let Content = null;
  // TODO: Add code style rule in wiki to use switch when conditions > 2
  switch (question.id) {
    case "overview":
      Content = () => (
        <OverviewDisplay question={question} isInterviewer={isInterviewer} />
      );
      break;
    case "resume":
      Content = () => (
        <ResumeDisplay
          question={question}
          note={note}
          score={score}
          isInterviewer={isInterviewer}
          saveApplication={saveApplication}
        />
      );
      break;
    case "finalNotes":
      Content = () => (
        <FinalNotesDisplay
          question={question}
          note={note}
          score={score}
          isInterviewer={isInterviewer}
          saveApplication={saveApplication}
          submitApplication={submitApplication}
        />
      );
      break;
    default:
      Content = () => (
        <>
          <h3>{question.name}</h3>
          {question.image && <img src={question.image} alt={question.name} />}
          <p>{question.description}</p>
          <hr />

          {isInterviewer && (
            <QuestionNotes
              question={question}
              note={note}
              score={score}
              saveApplication={saveApplication}
            />
          )}
        </>
      );
      break;
  }

  return (
    <Tab.Pane eventKey={`${question.order}`}>
      <Content />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          disabled={tabKey === -1}
          onClick={() => setTabKey(`${tabKey - 1}`)}
        >
          Previous
        </Button>
        <Button
          disabled={tabKey === finalQuestionId}
          onClick={() => setTabKey(`${tabKey + 1}`)}
        >
          Next
        </Button>
      </div>
    </Tab.Pane>
  );
};

export default QuestionDisplay;
