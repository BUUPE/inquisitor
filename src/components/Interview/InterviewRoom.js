import React, { useContext, useEffect, useState } from "react";
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
  color: ${(props) => (props.intervieweeon ? "red" : "blue")};
`;

const InterviewRoom = ({
  currentApplication,
  questions,
  settings,
  saveApplication,
  submitApplication,
}) => {
  const initialTabKey = -1;
  const cachedTabKey = parseInt(window.localStorage.getItem("current-tab-key"));

  const [closed, setClosed] = useState(false);
  const [inRoom, setInRoom] = useState(false);
  const [tabKey, setTabKey] = useState(
    Number.isNaN(cachedTabKey) ? initialTabKey : cachedTabKey
  );

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

    return (
      <Nav.Item>
        <StyledLink
          eventKey={`${question.order}`}
          intervieweeon={intervieweeOn}
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
        <Col sm={3}>
          <Nav variant="pills" className="flex-column">
            {questions.map((question) => (
              <NavItem key={question.id} question={question} />
            ))}
          </Nav>
        </Col>
        <Col sm={9}>
          <Tab.Content>
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
        </Col>
      </Row>
    </Tab.Container>
  );
};

/*interviewees only
      {closed && (
        <div className="closed-wrapper">
          <h1>This interview is now closed.</h1>
          <div>
            {!authUser && intervieweeName && (
              <p>Thanks for interviewing, {intervieweeName.split(" ")[0]}!</p>
            )}
          </div>
        </div>
      )}
    */

export default InterviewRoom;
