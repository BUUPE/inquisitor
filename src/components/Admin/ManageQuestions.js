import React, { Component } from "react";
import styled from "styled-components";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import AdminLayout from "./AdminLayout";
import QuestionDisplay from "./QuestionDisplay";
import AddQuestion from "./AddQuestion";

import { AuthUserContext, withFirebase } from "upe-react-components";

import Loader from "../Loader";
import Error from "../Error";
import { Container } from "../../styles/global";

const StyledDiv = styled.div`
  text-align: right;
`;

class ManagerQuestions extends Component {
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
    if (this.props.firebase && !this._initFirebase) this.loadQuestions();
  }

  componentDidUpdate(prevProps) {
    if (this.props.firebase && !this._initFirebase) this.loadQuestions();
  }

  componentWillUnmount() {
    if (typeof this.unsub === "function") this.unsub();
  }

  updatePage = () => {
    this.setState({ addQuestion: false });
    this.loadQuestions();
  };

  loadQuestions = async () => {
    this._initFirebase = true;

    this.props.firebase
      .questions()
      .get()
      .then((querySnapshot) => {
        const questionList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        this.setState({ questionList, loading: false }, () =>
          console.log("Questions Loaded")
        );
      });
  };

  toggleAdd = () => {
    this.setState({ addQuestion: !this.state.addQuestion });
  };

  render() {
    const { loading, error, questionList, addQuestion } = this.state;

    if (error) return <Error error={error} />;
    if (loading) return <Loader />;

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
              <StyledDiv>
                <Button onClick={this.toggleAdd}>Add Question</Button>
              </StyledDiv>
              <br />

              {addQuestion && <AddQuestion updateFunc={this.updatePage} />}

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
