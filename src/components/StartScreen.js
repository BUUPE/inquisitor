import React, { Component } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';

class StartScreen extends Component {

  render() {
    return (
      <div className="start-screen-wrapper">
        <Form>
          <h1>UPE Technical Interview</h1>

          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text id="interviewee">Interviewee</InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control type="text" placeholder="Enter name" />
          </InputGroup>

          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text id="interviewer">Interviewer</InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control type="text" placeholder="Enter name" />
          </InputGroup>

          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text id="interviewer">Grad Year</InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control as="select">
              <option>2020</option>
              <option>2021</option>
              <option>2022</option>
              <option>2023</option>
            </Form.Control>
          </InputGroup>

          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text id="interviewer">Level</InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control as="select">
              <option>Intermediate</option>
              <option>Advanced</option>
            </Form.Control>
          </InputGroup>

          <Button variant="primary" type="submit">
            Begin
          </Button>
        </Form>
      </div>
    );
  }
}

export default StartScreen;
