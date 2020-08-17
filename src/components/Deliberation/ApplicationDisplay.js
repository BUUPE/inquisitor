import React, { Component, Fragment } from "react";
import { compose } from "recompose";
import styled from "styled-components";

import Loader from "../Loader";
import QuestionDisplay from "./QuestionDisplay";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";
import { isRecruitmentTeam } from "../../util/conditions";
import { asyncForEach } from "../../util/helper";

class ApplicationDisplay extends Component {
  constructor(props) {
    super(props);
  }
  _initFirebase = false;
  state = {
    data: null,
    loading: true,
    error: null,
    values: {
      name: "",
      email: "",
      major: "",
      minor: "",
      classYear: "",
      file: null,
    },
    interview: {
      level: "",
      interviewers: [],
      questions: {},
    },
    formResponses: [],
  };
  static contextType = AuthUserContext;
  unsub = null;

  componentDidMount() {
    if (this.props.firebase && !this._initFirebase) this.loadApplication();
  }

  componentDidUpdate(prevProps) {
    if (this.props.firebase && !this._initFirebase) this.loadApplication();
  }

  componentWillUnmount() {
    if (typeof this.unsub === "function") this.unsub();
  }

  loadApplication = async () => {
    this._initFirebase = true;

    const doc = await this.props.firebase.application(this.props.data).get();

    if (!doc.exists) this.setState({ error: "Failed to load application!" });
    else {
      const data = doc.data();
      this.setState({ data }, () => {
        console.log("Application loaded");
        this.sortData();
      });
    }
  };

  sortData = async () => {
    const { data } = this.state;
    var values = this.state.values;
    var interview = this.state.interview;
    var questions = {};
    var counter = 0;

    data.responses.map((val) => {
      if (val.id === 1) {
        values.name = val.value;
        this.setState({ values });
      } else if (val.id === 2) {
        values.email = val.value;
        this.setState({ values });
      } else if (val.id === 3) {
        values.major = val.value;
        this.setState({ values });
      } else if (val.id === 4) {
        values.minors = val.value;
        this.setState({ values });
      } else if (val.id === 5) {
        values.classYear = val.value;
        this.setState({ values });
      } else if (val.id === 6) {
        values.file = val.value;
        this.setState({ values });
      } else {
        const formResponses = this.state.formResponses;
        formResponses.push({ value: val.value, name: val.name, id: val.id });
        this.setState({ formResponses });
      }
    });

    const interviewers = Object.entries(
      data.interview.interviewers
    ).map((a) => ({ uid: a[0], name: a[1] }));
    const questionsList = Object.entries(
      data.interview.notes[interviewers[0].uid]
    ).map((a) => a[0]);

    await asyncForEach(questionsList, async (item, index) => {
      if (item === "finalNotes") {
        questions[item] = {
          uid: index,
        };

        questions[item][interviewers[0].uid] = {
          score: data.interview.scores[interviewers[0].uid][item],
          notes: data.interview.notes[interviewers[0].uid][item],
        };
        questions[item][interviewers[1].uid] = {
          score: data.interview.scores[interviewers[1].uid][item],
          notes: data.interview.notes[interviewers[1].uid][item],
        };
      } else if (item === "resume") {
        questions[item] = {
          uid: index,
        };

        questions[item][interviewers[0].uid] = {
          score: data.interview.scores[interviewers[0].uid][item],
          notes: data.interview.notes[interviewers[0].uid][item],
        };
        questions[item][interviewers[1].uid] = {
          score: data.interview.scores[interviewers[1].uid][item],
          notes: data.interview.notes[interviewers[1].uid][item],
        };
      } else {
        var name = "";
        var description = "";
        var answer = "";
        var img = "";
        var generalAvrg = 0;
        var classAvrg = 0;
        var levelAvrg = 0;

        const doc = await this.props.firebase.question(item).get();
        if (!doc.exists) this.setState({ error: "Failed to load question!" });
        else {
          const docData = doc.data();
          name = docData.name;
          description = docData.description;
          answer = docData.answer;
          img = docData.image;
          generalAvrg = docData.scores["general"].avrg;
          classAvrg = docData.scores[this.state.values.classYear].avrg;
          levelAvrg = docData.scores[data.interview.level].avrg;
        }

        questions[item] = {};

        questions[item] = {
          uid: index,
          name: name,
          generalAvrg: generalAvrg,
          classAvrg: classAvrg,
          levelAvrg: levelAvrg,
        };

        questions[item][interviewers[0].uid] = {
          score: data.interview.scores[interviewers[0].uid][item],
          notes: data.interview.notes[interviewers[0].uid][item],
        };
        questions[item][interviewers[1].uid] = {
          score: data.interview.scores[interviewers[1].uid][item],
          notes: data.interview.notes[interviewers[1].uid][item],
        };
      }
    });

    interview.level = data.interview.level;
    interview.interviewers = [interviewers[0].name, interviewers[1].name];
    interview.questions = questions;

    this.setState({ interview, loading: false });
  };

  render() {
    const { loading, error, values, formResponses, interview } = this.state;

    if (loading) return <Loader />;
    if (error)
      return (
        <Container flexdirection="column">
          <h1>{error}</h1>
        </Container>
      );

    const authUser = this.context;

    const InterviewResponses = () => {
      return (
        <Fragment>
          {Object.entries(interview.questions).map((question) => (
            <QuestionDisplay key={question.uid} question={question} />
          ))}
        </Fragment>
      );
    };

    const FormResponses = () => {
      const renderResponse = (response) => {
        let responseComponent;
        if (response.type === "file") {
          responseComponent = (
            <embed
              src={response.value}
              width="100%"
              height="500"
              type="application/pdf"
              title={response.name}
            />
          );
        } else {
          responseComponent = <p>{response.value}</p>;
        }

        return (
          <Fragment key={response.id}>
            <h4>{response.name}</h4>
            {responseComponent}
          </Fragment>
        );
      };

      return (
        <Fragment>
          {formResponses.map((response) => renderResponse(response))}
        </Fragment>
      );
    };

    return (
      <Container>
        <Row>
          <Col>
            <h1> Personal Details </h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <h4> Full name </h4>
            <p> {values.name} </p>
          </Col>
          <Col>
            <h4> Email </h4>
            <p> {values.email} </p>
          </Col>
        </Row>
        <Row>
          <Col>
            <h4> Major </h4>
            <p> {values.major} </p>
          </Col>
          <Col>
            <h4> Minor </h4>
            <p> {values.minor} </p>
          </Col>
          <Col>
            <h4> Class Year </h4>
            <p> {values.classYear} </p>
          </Col>
        </Row>
        <Row>
          <Col>
            <h4> Resume </h4>
            <embed
              src={values.file}
              width="100%"
              height="300"
              type="application/pdf"
            />
          </Col>
        </Row>

        <br />

        <Row>
          <Col>
            <h1> Application Responses </h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormResponses />
          </Col>
        </Row>

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
      </Container>
    );
  }
}

export default compose(withFirebase)(ApplicationDisplay);
