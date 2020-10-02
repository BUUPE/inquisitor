import React, { Component, Fragment } from "react";
import { compose } from "recompose";
import styled from "styled-components";

import Loader from "../Loader";
import QuestionDisplay from "./QuestionDisplay";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import { AuthUserContext, withFirebase } from "upe-react-components";
import { asyncForEach } from "../../util/helper";

const ApplicationDisplay = ({
  id,
deliberation,
interview,
responses,
name,
semester,
questions,
levelConfig,
}) => {
  const {level} = interview;
  const classYear = responses.find(r => r.id === 5).value;
  const levelQuestions = levelConfig[level];
  let augmentedQuestions = [
  {
    id: "resume",
    name: "Resume",
    order: 0,
   },
   {
    id: "finalNotes",
    name: "Final Notes",
    order: levelQuestions.length + 1,
   }
  ];

   levelQuestions.forEach(({id, order}) => {
    const question = questions.find(q => q.id === id);
    augmentedQuestions.push({...question, order: order + 1})
   });

   const interviewers = Object.entries(
      interview.interviewers
    ).map(([uid, name]) => ({ uid, name }));

   augmentedQuestions = augmentedQuestions.map(question => {
    const [interviewerA, interviewerB] = interviewers;
    // TODO: whittle down scores
    return {
      ...question,
      interviewers: {
        [interviewerA.uid]: {
          score: interview.scores[interviewerA.uid][question.id],
          note: interview.notes[interviewerA.uid][question.id],
        },
        [interviewerB.uid]: {
          score: interview.scores[interviewerB.uid][question.id],
          note: interview.notes[interviewerB.uid][question.id],
        }
      }
    }
   });

  const acceptApplicant = () => {
    this.setState({ loading: true });
    const { data } = this.state;
    const deliberation = data.deliberation;
    const authUser = this.context;

    const hasVoted = authUser.uid in deliberation.votes;

    const updatedData = {
      deliberation: {
        count: {
          accept: data.deliberation.count.accept,
          deny: data.deliberation.count.deny,
        },
        votes: data.deliberation.votes,
      },
    };

    if (hasVoted) {
      if (!updatedData.deliberation.votes[authUser.uid]) {
        updatedData.deliberation.count.accept =
          updatedData.deliberation.count.accept + 1;
        updatedData.deliberation.count.deny =
          updatedData.deliberation.count.deny - 1;
      }
    } else {
      updatedData.deliberation.count.accept =
        updatedData.deliberation.count.accept + 1;
    }

    updatedData.deliberation.votes[authUser.uid] = true;

    this.props.firebase
      .application(this.props.data)
      .set(updatedData, { merge: true })
      .then(() => {
        console.log("Successfully updated deliberation data!");
        this.loadApplication();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const denyApplicant = () => {
    this.setState({ loading: true });
    const { data } = this.state;
    const deliberation = data.deliberation;
    const authUser = this.context;

    const hasVoted = authUser.uid in deliberation.votes;

    const updatedData = {
      deliberation: {
        count: {
          accept: data.deliberation.count.accept,
          deny: data.deliberation.count.deny,
        },
        votes: data.deliberation.votes,
      },
    };

    if (hasVoted) {
      if (updatedData.deliberation.votes[authUser.uid]) {
        updatedData.deliberation.count.accept =
          updatedData.deliberation.count.accept - 1;
        updatedData.deliberation.count.deny =
          updatedData.deliberation.count.deny + 1;
      }
    } else {
      updatedData.deliberation.count.deny =
        updatedData.deliberation.count.deny + 1;
    }

    updatedData.deliberation.votes[authUser.uid] = false;

    this.props.firebase
      .application(this.props.data)
      .set(updatedData, { merge: true })
      .then(() => {
        console.log("Successfully updated deliberation data!");
        this.loadApplication();
      })
      .catch((err) => {
        console.log(err);
      });
  };

    const InterviewResponses = () => {
      return (
        <>
          {augmentedQuestions
            .sort((a, b) => a.order > b.order ? 1 : - 1)
            .map((question) => (
              <QuestionDisplay key={question.id} level={level} classYear={classYear} {...question} />
            ))}
        </>
      );
    };

    const FormResponses = () => {
      const Response = ({type, name, value}) => {
        let Content;
        if (type === "file") {
          Content = () => (
            <embed
              src={value}
              width="100%"
              height="500"
              type="application/pdf"
              title={name}
            />
          );
        } else {
          Content = () => <p>{value}</p>;
        }

        return (
          <>
            <h4>{name}</h4>
            <Content />
          </>
        );
      };

      return (
        <>
          {responses.map((response) => <Response key={response.id} {...response} />)}
        </>
      );
    };

    return (
      <Container>
        <Row>
          <Col>
            <h1>Application Responses</h1>
          </Col>
        </Row>
        <FormResponses />

        <br />

        <Row>
          <Col>
            <h1> Interview Details </h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <h4> Level </h4>
            <p> {interview.level} </p>
          </Col>
          <Col>
            <h4> Interviewers </h4>
            <p>
              {" "}
              {interview.interviewers[0]} | {interview.interviewers[1]}{" "}
            </p>
          </Col>
        </Row>

        <Row>
          <Col>
            <h2> Questions </h2>
          </Col>
        </Row>
        <Row>
          <Col>
            <InterviewResponses />
          </Col>
        </Row>

        <Row>
          <Col>
            <h2> Deliberation </h2>
            <br />
          </Col>
        </Row>
        <Row>
          <Col>
            <Button>Accept</Button>
          </Col>
          <Col>
            <Button>Deny</Button>
          </Col>
        </Row>

        <br />
        <br />
      </Container>
    );
}

export default compose(withFirebase)(ApplicationDisplay);
