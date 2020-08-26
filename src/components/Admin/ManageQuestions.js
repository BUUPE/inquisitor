import React, { Component, Fragment } from "react";
import styled from "styled-components";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Toast from "react-bootstrap/Toast";
import AdminLayout from "./AdminLayout";
import QuestionDisplay from "./QuestionDisplay";

import { AuthUserContext, withFirebase } from "upe-react-components";

import Loader from "../Loader";
import { Container } from "../../styles/global";

class ManagerQuestions extends Component {
  constructor(props) {
    super(props);

    this.updatePage = this.updatePage.bind(this);
  }

  _initFirebase = false;
  state = {
    questionList: null,
    settings: null,
    loading: true,
    error: null,
    addQuestion: false,
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

  updatePage = () => {
    this.loadSettings();
  };

  loadSettings = async () => {
    this._initFirebase = true;

    this.props.firebase
      .questions()
      .get()
      .then((querySnapshot) => {
        const questionList = querySnapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() };
        });
        this.setState({ questionList, loading: false }, () => {
          console.log("Questions Loaded");
        });
      });
  };

  render() {
    const { loading, error, questionList } = this.state;

    if (loading) return <Loader />;
    if (error)
      return (
        <Container flexdirection="column">
          <h1>{error}</h1>
        </Container>
      );

    const authUser = this.context;

    const Questions = () => {
      return (
        <Row>
          {Object.entries(questionList).map((question) => (
            <QuestionDisplay
              updateFunc={this.updatePage}
              key={question[0]}
              uid={question[0]}
              question={question[1]}
            />
          ))}
        </Row>
      );
    };

    return (
      <AdminLayout>
        <Container>
          <Row>
            <Col>
              <h1> Interview Questions </h1>
              <br />
              <Questions />
            </Col>
          </Row>
        </Container>
      </AdminLayout>
    );
  }
}

export default withFirebase(ManagerQuestions);
