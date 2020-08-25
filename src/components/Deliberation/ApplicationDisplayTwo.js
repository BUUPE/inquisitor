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

class ApplicationDisplayTwo extends Component {
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
        values.minor = val.value;
        this.setState({ values });
      } else if (val.id === 5) {
        values.classYear = val.value;
        this.setState({ values });
      } else if (val.id === 6) {
        values.file = val.value;
        this.setState({ values });
      }
    });

    this.setState({ loading: false });
  };

  acceptApplicant = () => {
    this.setState({ loading: true });
    const { data } = this.state;
    const deliberation = data.deliberation;
    const authUser = this.context;

    const hasVoted = authUser.uid in deliberation.secondRound.votes;

    const updatedData = {
      deliberation: {
        secondRound: {
          count: {
            accept: data.deliberation.secondRound.count.accept,
            deny: data.deliberation.secondRound.count.deny,
          },
          votes: data.deliberation.secondRound.votes,
        },
      },
    };

    if (hasVoted) {
      if (!updatedData.deliberation.secondRound.votes[authUser.uid]) {
        updatedData.deliberation.secondRound.count.accept =
          updatedData.deliberation.secondRound.count.accept + 1;
        updatedData.deliberation.secondRound.count.deny =
          updatedData.deliberation.secondRound.count.deny - 1;
      }
    } else {
      updatedData.deliberation.secondRound.count.accept =
        updatedData.deliberation.secondRound.count.accept + 1;
    }

    updatedData.deliberation.secondRound.votes[authUser.uid] = true;

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

  denyApplicant = () => {
    this.setState({ loading: true });
    const { data } = this.state;
    const deliberation = data.deliberation;
    const authUser = this.context;

    const hasVoted = authUser.uid in deliberation.secondRound.votes;

    const updatedData = {
      deliberation: {
        secondRound: {
          count: {
            accept: data.deliberation.secondRound.count.accept,
            deny: data.deliberation.secondRound.count.deny,
          },
          votes: data.deliberation.secondRound.votes,
        },
      },
    };

    if (hasVoted) {
      if (updatedData.deliberation.secondRound.votes[authUser.uid]) {
        updatedData.deliberation.secondRound.count.accept =
          updatedData.deliberation.secondRound.count.accept - 1;
        updatedData.deliberation.secondRound.count.deny =
          updatedData.deliberation.secondRound.count.deny + 1;
      }
    } else {
      updatedData.deliberation.secondRound.count.deny =
        updatedData.deliberation.secondRound.count.deny + 1;
    }

    updatedData.deliberation.secondRound.votes[authUser.uid] = false;

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

  render() {
    const {
      loading,
      error,
      values,
      formResponses,
      interview,
      data,
    } = this.state;

    if (loading) return <Loader />;
    if (error)
      return (
        <Container flexdirection="column">
          <h1>{error}</h1>
        </Container>
      );

    const authUser = this.context;

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
            <h2> Deliberation </h2>
            <br />
          </Col>
        </Row>
        <Row>
          <Col>
            <Button onClick={this.acceptApplicant}>Accept</Button>
          </Col>
          <Col>
            <Button onClick={this.denyApplicant}>Deny</Button>
          </Col>
        </Row>

        <br />
        <br />
      </Container>
    );
  }
}

export default compose(withFirebase)(ApplicationDisplayTwo);
