import React, { Component, Fragment } from "react";
import styled from "styled-components";
import Img from "gatsby-image";

import Loader from "../Loader";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

class QuestionDisplay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      extra: false,
      error: null,
    };

    this.toggleExtra = this.toggleExtra.bind(this);
  }

  toggleExtra = () => {
    this.setState({ extra: !this.state.extra });
  };

  render() {
    const { error, extra } = this.state;
    const { question } = this.props;
    const questionID = question[0];
    const questionData = question[1];

    if (error)
      return (
        <Container flexdirection="column">
          <h1>{error}</h1>
        </Container>
      );

    const authUser = this.context;

    const InterviewersData = () => {
      return (
        <Fragment>
          {Object.entries(questionData.interviewers).map(
            (interviewer, index) => (
              <Col key={interviewer[0]}>
                <h4> Interviewer {index} </h4>
                <h5> Score </h5>
                <p> {interviewer[1].score} </p>
                <h5> Notes </h5>
                <p> {interviewer[1].notes} </p>
              </Col>
            )
          )}
        </Fragment>
      );
    };

    const InterviewersData2 = () => {
      return (
        <Fragment>
          {Object.entries(questionData.interviewers).map(
            (interviewer, index) => (
              <Col key={interviewer[0]}>
                <h4> Interviewer {index} </h4>
                <h5> Notes </h5>
                <p> {interviewer[1].notes} </p>
              </Col>
            )
          )}
        </Fragment>
      );
    };

    const QuestionDetails = () => {
      var hasIMG = false;
      if (questionData.img !== "") hasIMG = true;

      return (
        <>
          <Row key={questionData.uid}>
            <Col>
              <h3> Details </h3>
            </Col>
          </Row>
          <Row>
            <Col md={3}>
              <h4> Answer </h4>
              <p> {questionData.answer} </p>
            </Col>
            <Col md={9}>
              <h4> Description </h4>
              {hasIMG ? <img src={questionData.img} alt="Member" /> : <> </>}
              <p> {questionData.description} </p>
            </Col>
          </Row>
        </>
      );
    };

    if (questionID === "resume") {
      return (
        <Container>
          <br />

          <Row>
            <Col>
              <h3> Resume </h3>
            </Col>
          </Row>

          <Row>
            <InterviewersData2 />
          </Row>

          <br />
        </Container>
      );
    }

    if (questionID === "finalNotes") {
      return (
        <Container>
          <br />

          <Row>
            <Col>
              <h3> Final Notes </h3>
            </Col>
          </Row>

          <Row>
            <InterviewersData2 />
          </Row>

          <br />
        </Container>
      );
    }

    return (
      <Container>
        <br />

        <Row>
          <Col>
            <h3> {questionData.name} </h3>
          </Col>
        </Row>
        <Row>
          <Col>
            <h4> General Average </h4>
            <p> {questionData.generalAvrg} </p>
          </Col>
          <Col>
            <h4> Class Averagge </h4>
            <p> {questionData.classAvrg} </p>
          </Col>
          <Col>
            <h4> Level Averagge </h4>
            <p> {questionData.levelAvrg} </p>
          </Col>
        </Row>

        <Row>
          <InterviewersData />
        </Row>

        {extra ? <QuestionDetails /> : <> </>}

        <Row>
          <Col>
            <Button onClick={this.toggleExtra}>Question Details</Button>
          </Col>
        </Row>

        <br />
      </Container>
    );
  }
}

export default QuestionDisplay;
