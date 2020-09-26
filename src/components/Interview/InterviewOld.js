import React, { useContext, useEffect, useState } from "react";

import Tab from "react-bootstrap/Tab";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { AuthUserContext } from "upe-react-components";

import QuestionDisplay from "./QuestionDisplay";
import Error from "../Error";

import { isRecruitmentTeam } from "../../util/conditions";

const Interview = ({ currentApplication, questions, settings }) => {
  const initialTabKey = -1;

  const [closed, setClosed] = useState(false);
  const [inRoom, setInRoom] = useState(false);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState(null);
  const [tabKey, setTabKey] = useState(
    window.localStorage.getItem("current-tab-key") || initialTabKey
  );

  const authUser = useContext(AuthUserContext);

  useEffect(() => {
    window.onbeforeunload = function(e) {
      e = e || window.event;

      // For IE and Firefox prior to version 4
      if (e) {
        e.returnValue = "Any string";
      }

      // For Safari
      return "Any string";
    };
  });

  if (error) return <Error message={error} />;

  const notifyChange = key => {
    // if interviewee save to firebase
    setTabKey(key);
  };

  const submitInterview = event => {
    event.persist();
    event.preventDefault();
    const form = event.currentTarget;

    // get all form inputs, make sure none are empty, then pass data along to function
  };

  const intervieweeName = currentApplication.responses.find(
    response => response.id === 1
  ).value;

  const {
    interview: { level, intervieweeOn },
  } = currentApplication;

  let {
    interview: { notes, scores },
  } = currentApplication;

  if (!notes)
    notes = questions.reduce(
      (map, question) => {
        map[question.id] = "";
        return map;
      },
      {
        resume: "",
        finalNotes: "",
      }
    );

  if (!scores)
    scores = questions.reduce(
      (map, question) => {
        map[question.id] = 0;
        return map;
      },
      {
        resume: 0,
        finalNotes: 0,
      }
    );

  // TODO: explain why -2
  const ButtonGroup = () => (
    <div>
      <Button disabled={tabKey === -1} onClick={() => setTabKey(tabKey - 1)}>
        Previous
      </Button>
      <Button
        disabled={tabKey === questions.length - 2}
        onClick={() => setTabKey(tabKey + 1)}
      >
        Next
      </Button>
    </div>
  );

  return (
    <Tab.Container activeKey={tabKey} onSelect={notifyChange}>
      <Row>
        <Col sm={3}>
          <Nav variant="pills" className="flex-column">
            <Nav.Item>
              <Nav.Link
                eventKey="overview"
                className={
                  intervieweeOn === `overview` && authUser
                    ? "interviewee-on"
                    : ""
                }
              >
                Overview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="resume"
                className={
                  intervieweeOn === `resume` && authUser ? "interviewee-on" : ""
                }
              >
                Resume Review
              </Nav.Link>
            </Nav.Item>
            {questions.map((question, i) => (
              <Nav.Item key={`problem-${i + 1}-link`}>
                <Nav.Link
                  eventKey={`problem-${i + 1}`}
                  className={
                    intervieweeOn === `problem-${i + 1}` && authUser
                      ? "interviewee-on"
                      : ""
                  }
                >
                  Problem {i + 1}
                </Nav.Link>
              </Nav.Item>
            ))}
            {authUser && (
              <Nav.Item>
                <Nav.Link eventKey="submit">Submit</Nav.Link>
              </Nav.Item>
            )}
          </Nav>
        </Col>
        <Col sm={9}>
          <Tab.Content>
            {questions.map(question => (
              <QuestionDisplay
                question={question}
                note={notes[question.id]}
                score={scores[question.id]}
                isInterviewer={isRecruitmentTeam(authUser)}
                ButtonGroup={ButtonGroup}
              />
            ))}

            {/*authUser && (
              <Tab.Pane eventKey="submit">
                <h3>Submit Interview</h3>
                <p>
                  Pressing submit on this page will end the interview.{" "}
                  <strong>
                    Make sure to save notes/scores for all sections first.
                  </strong>
                  &nbsp; Submitting will permanently close{" "}
                  <strong>Interview {currentApplication.id}</strong> with{" "}
                  <strong>{intervieweeName}</strong>, and this action cannot be
                  undone.{" "}
                  <strong>
                    ONLY PRESS SUBMIT WHEN THE INTERVIEW IS COMPLETE!
                  </strong>
                </p>

                <Form
                  noValidate
                  validated={validated}
                  onSubmit={submitInterview}
                >
                  <Form.Group>
                    <Form.Label>
                      <strong>General Comments</strong>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows="10"
                      placeholder="Enter comments here..."
                      required
                    />
                  </Form.Group>

                  <datalist id="tickmarks">
                    <option value="1" label="1" />
                    <option value="1.5" />
                    <option value="2" label="2" />
                    <option value="2.5" />
                    <option value="3" label="3" />
                    <option value="3.5" />
                    <option value="4" label="4" />
                    <option value="4.5" />
                    <option value="5" label="5" />
                  </datalist>

                  <Form.Group>
                    <Form.Label>
                      <strong>Overall Score:</strong> {scores.finalNotes}
                    </Form.Label>
                    <Form.Control
                      type="range"
                      min="1"
                      max="5"
                      step="0.5"
                      list="tickmarks"
                      required
                    />
                  </Form.Group>

                  <Button type="submit">Submit</Button>
                </Form>
              </Tab.Pane>
            )*/}
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

export default Interview;
