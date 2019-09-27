import React, { useContext, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Tab from 'react-bootstrap/Tab';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
//import Stopwatch from './Stopwatch';

import { Link } from 'react-router-dom';
import { withFirebase } from './Firebase';
import { AuthUserContext } from './Session';
import { 
  isInterviewOpen,
  getInterviewData, 
  getInterviewNotes,
  joinInterview,
  emitProblemChange,
  subscribeToProblemChange,
  closeInterview,
  saveComments
} from '../util/api';
import * as ROUTES from '../constants/routes';

import CONFIG from '../config';
import QuestionNotes from './QuestionNotes';
import Loader from './Loader';

const Interview = ({ match, firebase }) => {
  const initialTabKey = 'overview';

  const [loading, setLoading] = useState(true);
  const [closed, setClosed] = useState(false);
  const [inRoom, setInRoom] = useState(false);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState(null);
  const [intervieweeOn, setIntervieweeOn] = useState(null);
  const [formFields, setFormFields] = useState({ intervieweeName: 'Interviewee', level: 'Intermediate' });
  const [generalComments, setGeneralComments] = useState('');
  const [tabKey, setTabKey] = useState(window.localStorage.getItem('current-tab-key') || initialTabKey);
  const [savedNotes, setSavedNotes] = useState({});

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
          () => { if (authUser) setIntervieweeOn(initialTabKey) },
          () => setClosed(true));
        getInterviewData(firebase, interviewId).then(data => {
          setLoading(false);
          setFormFields(data);
        });
        getInterviewNotes(firebase, interviewId).then(data => setSavedNotes(data || {}));
      }
    }, [match]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  useEffect(() => {
    if (authUser) {
      subscribeToProblemChange(intervieweeSelectedProblem);
      setIntervieweeOn(initialTabKey);
    }
  }, [authUser]);

  const notifyChange = key => {
    if (!authUser && inRoom) {
      emitProblemChange(interviewId, key);
    }
    setTabKey(key);
    window.localStorage.setItem('current-tab-key', key);
  }

  const intervieweeSelectedProblem = problemKey => {
    console.log('user picked', problemKey)
    setIntervieweeOn(problemKey);
  }

  const submitInterview = event => {
    event.preventDefault();

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
    } else {
      setValidated(false);
      setLoading(true);

      saveComments(firebase, { interviewId, dataKey: 'general-comments', notes: generalComments }).then(() => {
        closeInterview(firebase, interviewId).then(() => {
          setLoading(false);
          setClosed(true);
          window.localStorage.removeItem('current-tab-key');
        });
      });
    }
  }
    
  const {
    intervieweeName,
    level
  } = formFields;

  let questions = CONFIG[level].questions;
  let overview = CONFIG[level].overview;

  return (
    <div className="interview-wrapper">
      {loading && <Loader />}

      {(!loading && !error && !closed) &&
        <Container>
          <h1>UPE Technical Interview</h1>
          {(!authUser && intervieweeName) && <h3>Welcome, {intervieweeName.split(" ")[0]}!</h3>}
          {authUser && <h3>Welcome, interviewer!</h3>}
          {/*authUser && <Stopwatch />*/}
          <hr/>
          <Tab.Container activeKey={tabKey} onSelect={notifyChange}>
            <Row>
              <Col sm={3}>
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link 
                      eventKey="overview"
                      className={(intervieweeOn === `overview` && authUser) ? 'interviewee-on' : ''}
                    >
                      Overview
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      eventKey="resume"
                      className={(intervieweeOn === `resume` && authUser) ? 'interviewee-on' : ''}
                    >
                      Resume Review
                    </Nav.Link>
                  </Nav.Item>
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
                  <Tab.Pane eventKey="overview">
                    <h3>Overview</h3>
                    <p>{overview}</p>
                    <hr/>
                    <div className="switch-question-button-group">
                      <Button onClick={() => notifyChange('resume')}>Next</Button>
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="resume">
                    <h3>Resume Review</h3>
                    <p>
                      Go over the resume with them.
                    </p>
                    {authUser && <QuestionNotes interviewId={interviewId} commentsOnly={true} dataKey="resume" savedNotes={savedNotes['resume']} />}
                    <hr/>
                    <div className="switch-question-button-group">
                      <Button onClick={() => notifyChange('overview')}>Previous</Button>
                      <Button onClick={() => notifyChange('problem-1')}>Next</Button>
                    </div>
                  </Tab.Pane>
                  {questions.map((question, i) => (
                    <Tab.Pane key={`problem-${i+1}-body`} eventKey={`problem-${i+1}`}>
                      <h3>{question.title}</h3>
                      <p>{question.description}</p>
                      {question.img && <img className="question-img" src={question.img} alt={`Problem ${i+1}`} />}
                      <hr/>
                      {authUser && <p>{question.answer}</p>}
                      {authUser && <QuestionNotes interviewId={interviewId} problemNum={i+1} savedNotes={savedNotes[`problem-${i+1}`]} />}
                      {authUser && <hr/>}
                      <div className="switch-question-button-group">
                        {(i > 0) && <Button onClick={() => notifyChange(`problem-${i}`)}>Previous</Button>}
                        {(i === 0) && <Button onClick={() => notifyChange('resume')}>Previous</Button>}
                        {(i < questions.length - 1) && <Button onClick={() => notifyChange(`problem-${i+2}`)}>Next</Button>}
                      </div>
                    </Tab.Pane>
                  ))}
                  {authUser && (
                    <Tab.Pane eventKey="submit">
                      <h3>Submit Interview</h3>
                      <p>
                        Pressing submit on this page will end the interview. <strong>Make sure to save notes/scores for all sections first.</strong>&nbsp;
                        Submitting will permanently close <strong>Interview {match.params.id}</strong> with <strong>{intervieweeName}</strong>,
                        and this action cannot be undone. <strong>ONLY PRESS SUBMIT WHEN THE INTERVIEW IS COMPLETE!</strong>
                      </p>

                      <Form noValidate validated={validated} onSubmit={submitInterview}>
                        <Form.Group>
                          <Form.Label><strong>General Comments</strong></Form.Label>
                          <Form.Control 
                            as="textarea" 
                            rows="10" 
                            placeholder="Enter comments here..."
                            value={generalComments}
                            onChange={event => setGeneralComments(event.target.value)}
                            required
                          />
                        </Form.Group>

                        <Button type="submit">Submit</Button>
                      </Form>

                      
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
          <div>
            {(!authUser && intervieweeName) &&
              <p>Thanks for interviewing, {intervieweeName.split(" ")[0]}!</p>
            }
            <Link to={ROUTES.LANDING}>Go to Home</Link>
          </div>
            
          
        </div>
      }
    </div>
  );
}

export default withFirebase(Interview);
