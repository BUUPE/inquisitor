import React, { Component } from "react";
import { compose } from "recompose";
import styled from "styled-components";

import Loader from "../Loader";
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
    formResponses: [],
  };
  static contextType = AuthUserContext;
  unsub = null;

  componentDidMount() {
    if (this.props.firebase && !this._initFirebase) this.loadSettings();
  }

  componentDidUpdate(prevProps) {
    if (this.props.firebase && !this._initFirebase) this.loadSettings();
  }

  componentWillUnmount() {
    if (typeof this.unsub === "function") this.unsub();
  }

  loadSettings = async () => {
    this._initFirebase = true;

    const doc = await this.props.firebase.application(this.props.data).get();

    if (!doc.exists) this.setState({ error: "Failed to load application!" });
    else {
      const data = doc.data();
      this.setState({ data }, () => {
        console.log("Data loaded");
        this.sortData();
      });
    }
  };

  sortData = () => {
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
      } else {
        const formResponses = this.state.formResponses;
        formResponses.push({ val: val.value, name: val.name });
        this.setState({ formResponses });
      }
    });
    this.setState({ loading: false });
  };

  render() {
    const { loading, error, values, formResponses } = this.state;

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
      </Container>
    );
  }
}

export default compose(withFirebase)(ApplicationDisplay);
