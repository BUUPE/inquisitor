import React, { Component, Fragment } from "react";
import styled from "styled-components";

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
            <h1> test </h1>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default QuestionDisplay;
