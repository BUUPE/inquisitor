import React, { useContext, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Tab from 'react-bootstrap/Tab';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';

import { AuthUserContext } from './Session';
import { joinInterview } from '../util/api';

import Intermediate from '../config/questions.intermediate';
import Advanced from '../config/questions.advanced';
import QuestionNotes from './QuestionNotes';

const Interview = ({ match, formFields }) => {
  const authUser = useContext(AuthUserContext);
  useEffect(() => {
    // check if id is valid in firebase first, otherwise show error
    // make sure only one authed user and one unauthed user is inside the room
    // add a way to show interviewer which problem the interviewee is on
    joinInterview(match.params.id)
  });
    
  const {
    intervieweeName,
    level
  } = formFields;

  const questions = level === "Intermediate" ? Intermediate : Advanced;

  return (
    <Container>
      <h1>UPE Technical Interview</h1>
      <hr/>
      <Tab.Container defaultActiveKey="problem-1">
        <Row>
          <Col sm={3}>
            <Nav variant="pills" className="flex-column">
              {questions.map((question, i) => (
                <Nav.Item key={`problem-${i+1}-link`}>
                  <Nav.Link eventKey={`problem-${i+1}`}>Problem {i+1}</Nav.Link>
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
              {questions.map((question, i) => (
                <Tab.Pane key={`problem-${i+1}-body`} eventKey={`problem-${i+1}`}>
                  <h3>{question.title}</h3>
                  <p>{question.description}</p>
                  <hr/>
                  {authUser && <p>{question.answer}</p>}
                  {authUser && <QuestionNotes problemNum={i+1} />}
                </Tab.Pane>
              ))}
              {authUser && (
                <Tab.Pane eventKey="submit">
                  <h3>Submit Interview</h3>
                  <p>
                    Pressing submit on this page will save the current notes and score for all problems, and then end the interview. 
                    Doing so will permanently close <strong>Interview {match.params.id}</strong> with <strong>{intervieweeName}</strong>, and this action cannot be undone. <strong>ONLY PRESS SUBMIT WHEN THE INTERVIEW IS COMPLETE!</strong>
                  </p>
                  <Button>Submit</Button>
                </Tab.Pane>
              )}
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
}

export default Interview;
