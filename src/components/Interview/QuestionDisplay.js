import React from "react";
import styled from "styled-components";

import Tab from "react-bootstrap/Tab";

import QuestionNotes from "./QuestionNotes";

import { StyledButton } from "../../styles/global";

const StyledP = styled.p`
  white-space: pre-wrap;
  font-family: Georgia;
`;

const StyledH3 = styled.h3`
  font-family: Georgia;
  padding-bottom: 1%;
  font-weight: bold;
`;

const OverviewDisplay = ({ question, isInterviewer }) => (
  <>
    <StyledH3>Overview</StyledH3>
    <StyledP>{question.overview}</StyledP>
    <hr style={{ marginTop: "3%", marginBottom: "3%" }} />

    {isInterviewer && (
      <>
        <StyledP>{question.interviewerNotes}</StyledP>
        <hr style={{ marginTop: "3%", marginBottom: "3%" }} />
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
    <StyledH3>Resume Review</StyledH3>
    <embed
      src={question.url}
      width="100%"
      height="750"
      type="application/pdf"
      style={{ margin: "25px 0" }}
    />
    <hr style={{ marginTop: "3%", marginBottom: "3%" }} />

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
      <StyledH3>{question.title}</StyledH3>
      <StyledP>{question.text}</StyledP>
      <hr style={{ marginTop: "3%", marginBottom: "3%" }} />

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
          <StyledH3>{question.name}</StyledH3>
          {question.image && <img src={question.image} alt={question.name} />}
          <StyledP>{question.description}</StyledP>
          <hr style={{ marginTop: "3%", marginBottom: "3%" }} />

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
        <StyledButton
          paddingTop={"0.5%"}
          paddingRight={"2%"}
          paddingBottom={"0.5%"}
          paddingLeft={"2%"}
          disabled={tabKey === -1}
          onClick={() => setTabKey(`${tabKey - 1}`)}
        >
          Previous
        </StyledButton>
        <StyledButton
          paddingTop={"0.5%"}
          paddingRight={"2%"}
          paddingBottom={"0.5%"}
          paddingLeft={"2%"}
          disabled={tabKey === finalQuestionId}
          onClick={() => setTabKey(`${tabKey + 1}`)}
        >
          Next
        </StyledButton>
      </div>
    </Tab.Pane>
  );
};

export default QuestionDisplay;
