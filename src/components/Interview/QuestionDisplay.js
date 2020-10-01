import React from "react";
import styled from "styled-components";

import Tab from "react-bootstrap/Tab";
import Button from "react-bootstrap/Button";

import QuestionNotes from "./QuestionNotes";

const StyledP = styled.p`
  white-space: pre-wrap;
`;

const OverviewDisplay = ({ question, isInterviewer }) => (
  <>
    <h3>Overview</h3>
    <StyledP>{question.overview}</StyledP>
    <hr />

    {isInterviewer && (
      <>
        <StyledP>{question.interviewerNotes}</StyledP>
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
    <embed
      src={question.url}
      width="100%"
      height="750"
      type="application/pdf"
      style={{ margin: "25px 0" }}
    />
    <hr />
    {isInterviewer && (
      <>
        <StyledP>{question.notes}</StyledP>
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
  return (
    <>
      <h3>{question.title}</h3>
      <StyledP>{question.text}</StyledP>
      <hr />
      {isInterviewer && (
        <QuestionNotes
          question={question}
          note={note}
          score={score}
          saveApplication={saveApplication}
          submitApplication={submitApplication}
        />
      )}
    </>
  );
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
          <StyledP>{question.description}</StyledP>
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
