import React, { useContext, useEffect, useState, Fragment } from "react";
import styled from "styled-components";
import update from "immutability-helper";

import Tab from "react-bootstrap/Tab";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";

import { AuthUserContext } from "upe-react-components";

import QuestionDisplay from "./QuestionDisplay";

import { isRecruitmentTeam } from "../../util/conditions";

const StyledLink = styled(Nav.Link)`
  font-size: 1.5rem;

  &[aria-selected= "true" ] {
    font-weight: bold;
  }

  &::before {
    content: "${(props) => (props.intervieweeon === 1 ? "👁️ " : "")}";
  }
`;

const InterviewRoom = ({
  currentApplication,
  questions,
  isApplicant,
  saveApplication,
  submitApplication,
}) => {
  const initialTabKey = "-1";
  const cachedTabKey = window.localStorage.getItem("current-tab-key");

  const [closed, setClosed] = useState(false);
  const [inRoom, setInRoom] = useState(false);
  const [tabKey, setTabKey] = useState(cachedTabKey || initialTabKey);

  const authUser = useContext(AuthUserContext);

  useEffect(() => {
    window.onbeforeunload = function (e) {
      e = e || window.event;

      // For IE and Firefox prior to version 4
      if (e) {
        e.returnValue = "Any string";
      }

      // For Safari
      return "Any string";
    };
  });

  const handleChangTab = (key) => {
    window.localStorage.setItem("current-tab-key", key);
    setTabKey(key);
    if (isApplicant) saveApplication(key);
  };

  const {
    interview: { intervieweeOn, notes: allNotes, scores: allScores },
  } = currentApplication;

  const notes =
    allNotes?.[authUser.uid] ||
    questions.reduce(
      (map, question) => {
        map[question.id] = "";
        return map;
      },
      {
        resume: "",
        finalNotes: "",
      }
    );

  const scores =
    allScores?.[authUser.uid] ||
    questions.reduce(
      (map, question) => {
        map[question.id] = 0;
        return map;
      },
      {
        resume: 0,
        finalNotes: 0,
      }
    );

  const mergeNotesAndScores = async ({ note, score, id }) => {
    const newNotes = update(notes, {
      [id]: { $set: note },
    });
    const newScores = update(scores, {
      [id]: { $set: score },
    });
    const mergedNotes = update(allNotes || {}, {
      $merge: {
        [authUser.uid]: newNotes,
      },
    });
    const mergedScores = update(allScores || {}, {
      $merge: {
        [authUser.uid]: newScores,
      },
    });
    const interviewData = update(currentApplication.interview, {
      $merge: {
        notes: mergedNotes,
        scores: mergedScores,
      },
    });
    await saveApplication(interviewData);
  };

  const NavItem = ({ question }) => {
    let linkText = `Problem ${question.order}`;
    // eslint-disable-next-line default-case
    switch (question.id) {
      case "overview":
        linkText = "Overview";
        break;
      case "resume":
        linkText = "Resume";
        break;
      case "finalNotes":
        linkText = "Submit";
        break;
    }

    const eventKey = `${question.order}`;
    return (
      <Nav.Item>
        <StyledLink
          eventKey={eventKey}
          intervieweeon={!isApplicant && intervieweeOn === eventKey ? 1 : 0}
        >
          {linkText}
        </StyledLink>
      </Nav.Item>
    );
  };

  // TODO: explain why -2 for finalQuestionId
  return (
    <Tab.Container activeKey={tabKey} onSelect={handleChangTab}>
      <Row>
        <Nav
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "space-around",
          }}
          activeKey={tabKey}
        >
          {questions.map((question) => (
            <Fragment key={question.id}>
              <NavItem question={question} />
              {question.order < questions.length - 2 && (
                <span style={{ fontSize: "2rem" }}>></span>
              )}
            </Fragment>
          ))}
        </Nav>
        <hr style={{ width: "100%" }} />
      </Row>
      <Row style={{ marginTop: 25, padding: 25 }}>
        <Tab.Content style={{ width: "100%" }}>
          {questions.map((question) => (
            <QuestionDisplay
              key={question.id}
              question={question}
              note={notes[question.id]}
              score={scores[question.id]}
              isInterviewer={isRecruitmentTeam(authUser)}
              saveApplication={mergeNotesAndScores}
              submitApplication={submitApplication}
              tabKey={parseInt(tabKey)}
              setTabKey={handleChangTab}
              finalQuestionId={questions.length - 2}
            />
          ))}
        </Tab.Content>
      </Row>
    </Tab.Container>
  );
};

export default InterviewRoom;
