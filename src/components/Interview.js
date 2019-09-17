import React, { useContext, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Tab from 'react-bootstrap/Tab';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';

import { Link } from 'react-router-dom';
import { withFirebase } from './Firebase';
import { AuthUserContext } from './Session';
import { 
  isInterviewOpen,
  getInterviewData, 
  joinInterview,
  emitProblemChange,
  subscribeToProblemChange,
  closeInterview
} from '../util/api';
import * as ROUTES from '../constants/routes';

import Intermediate from '../config/questions.intermediate';
import Advanced from '../config/questions.advanced';
import QuestionNotes from './QuestionNotes';
import Loader from './Loader';

const Interview = ({ match, firebase }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formFields, setFormFields] = useState({});
  const [inRoom, setInRoom] = useState(false);
  const [intervieweeOn, setIntervieweeOn] = useState(null);
  const [closed, setClosed] = useState(false);

  const authUser = useContext(AuthUserContext);
  const interviewId = match.params.id;

  useEffect(() => {
    isInterviewOpen(firebase, interviewId).then(isOpen => {
      if (!isOpen) {
      setLoading(false);
        setError({ message: "The interview you're trying to join is either closed or doesn't exist!" });
      } else {
        joinInterview(interviewId, 
          () => setInRoom(true), 
          () => { if (authUser) setIntervieweeOn('problem-1') },
          () => setClosed(true));
        getInterviewData(firebase, interviewId).then(data => {
          setLoading(false);
          setFormFields(data);
        });
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  useEffect(() => {
    if (authUser) {
      subscribeToProblemChange(intervieweeSelectedProblem);
      setIntervieweeOn('problem-1');
    }
  }, [authUser]);

  const notifyChange = key => {
    if (!authUser && inRoom) {
      emitProblemChange(interviewId, key);
    }
  }

  const intervieweeSelectedProblem = problemKey => {
    setIntervieweeOn(problemKey);
  }

  const submitInterview = () => {
    setLoading(true);
    closeInterview(firebase, interviewId).then(() => {
      setLoading(false);
      setClosed(true);
    });
  }
    
  const {
    intervieweeName,
    level
  } = formFields;

  const questions = level === "Intermediate" ? Intermediate : Advanced;

  return (
    <div className="interview-wrapper">
      {loading && <Loader />}

      {(!loading && !error && !closed) &&
        <Container>
          <h1>UPE Technical Interview</h1>
          {(!authUser && intervieweeName) && <h3>Welcome, {intervieweeName.split(" ")[0]}!</h3>}
          {authUser && <h3>Welcome, interviewer!</h3>}
          <hr/>
          <Tab.Container defaultActiveKey="problem-1" onSelect={notifyChange}>
            <Row>
              <Col sm={3}>
                <Nav variant="pills" className="flex-column">
                  {questions.map((question, i) => (
                    <Nav.Item key={`problem-${i+1}-link`}>
                      <Nav.Link 
                        eventKey={`problem-${i+1}`}
                        className={(intervieweeOn === `problem-${i+1}` && authUser) ? 'interviewee-on' : ''}
                      >
                        Problem {i+1}
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
                  {questions.map((question, i) => (
                    <Tab.Pane key={`problem-${i+1}-body`} eventKey={`problem-${i+1}`}>
                      <h3>{question.title}</h3>
                      <p>{question.description}</p>
                      <hr/>
                      {authUser && <p>{question.answer}</p>}
                      {authUser && <QuestionNotes interviewId={interviewId} problemNum={i+1} />}
                    </Tab.Pane>
                  ))}
                  {authUser && (
                    <Tab.Pane eventKey="submit">
                      <h3>Submit Interview</h3>
                      <p>
                        Pressing submit on this page will end the interview. <strong>Make sure to save notes/scores for all questions first.</strong>&nbsp;
                        Submitting will permanently close <strong>Interview {match.params.id}</strong> with <strong>{intervieweeName}</strong>,
                        and this action cannot be undone. <strong>ONLY PRESS SUBMIT WHEN THE INTERVIEW IS COMPLETE!</strong>
                      </p>
                      <Button onClick={submitInterview}>Submit</Button>
                    </Tab.Pane>
                  )}
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        </Container>
      }

      {(!loading && error) &&
        <div className="error-wrapper">
          <p className="error-msg">{error.message}</p>
          <Link to={ROUTES.JOIN}>Try another room</Link>
        </div>
      }

      {(!loading && closed) &&
        <div className="closed-wrapper">
          <h1>This interview is now closed.</h1>
          <Link to={ROUTES.LANDING}>Go to Home</Link>
        </div>
      }
    </div>
  );
}

export default withFirebase(Interview);
