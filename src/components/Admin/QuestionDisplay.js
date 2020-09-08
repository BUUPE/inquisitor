import React, { Component, Fragment } from "react";
import styled from "styled-components";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import { withFirebase } from "upe-react-components";

import Loader from "../Loader";
import Error from "../Error";
import EditQuestion from "./EditQuestion";
import { Container } from "../../styles/global";

const StyledCol = styled(Col)`
  padding: 10px 10px 10px 10px;
`;

const StyledHr = styled.hr`
  border: 2px solid #333;
  border-radius: 5px;
`;

const StyledDiv = styled.div`
  width: 90%;
  padding: 15px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  border-radius: 15px;
  text-align: center;
  &:hover {
    -webkit-transform: translateY(-5px);
    transform: translateY(-5px);
    transition: all 0.3s linear;
  }

  a {
    color: white;
    font-weight: bold;
    padding-top: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid grey;
  }

  a[aria-current="page"] {
    color: ${(props) => props.theme.palette.mainBrand};
  }
`;

class QuestionDisplay extends Component {
  constructor(props) {
    super(props);

    this.toggleEdit = this.toggleEdit.bind(this);
    this.toggleDelete = this.toggleDelete.bind(this);
    this.updateData = this.updateData.bind(this);
  }

  _initFirebase = false;
  state = {
    loading: true,
    error: null,
    question: null,
    editQuestion: false,
    delQuestion: false,
  };
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

    this.setState({ question: this.props.question, loading: false });
  };

  toggleEdit = () => {
    this.setState({ editQuestion: !this.state.editQuestion });
  };

  toggleDelete = () => {
    this.setState({ delQuestion: !this.state.delQuestion });
  };

  deleteQuestion = () => {
    this.props.firebase
      .question(this.props.question.id)
      .delete()
      .then(() => {
        console.log("Question Deleted: ", this.props.question.id);
        this.updateData();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  updateData = () => {
    this.setState({ delQuestion: false, editQuestion: false });
    this.props.updateFunc();
  };

  render() {
    const { loading, error, editQuestion, question, delQuestion } = this.state;

    if (error) return <Error error={error} />;
    if (loading) return <Loader />;

    var hasIMG = false;
    if (question.image !== "") hasIMG = true;

    if (editQuestion) {
      return (
        <StyledCol md={4}>
          <StyledDiv>
            <h2>Edit Question</h2>

            <StyledHr />
            <EditQuestion
              question={question}
              uid={this.props.question.id}
              updateFunc={this.updateData}
            />
            <StyledHr />

            <Button onClick={this.toggleEdit}>Edit Data</Button>
            <StyledHr />
          </StyledDiv>
        </StyledCol>
      );
    }

    const Levels = () => {
      return (
        <Row>
          <Col>
            <h3> Level Scores </h3>

            {Object.entries(question.scores).map((level) => (
              <p key={level[0]}>
                {" "}
                {level[0]} | Average: {level[1].avrg} | Amount:{" "}
                {level[1].amount}{" "}
              </p>
            ))}
          </Col>
        </Row>
      );
    };

    const Delete = () => {
      return (
        <Fragment>
          <Button onClick={this.deleteQuestion}>Are you sure?</Button>
          <StyledHr />
        </Fragment>
      );
    };

    return (
      <StyledCol md={4}>
        <StyledDiv>
          <h2> {question.name} </h2>

          <StyledHr />
          <h3> Answer </h3>
          <p> {question.answer} </p>

          <h3> Description </h3>
          {hasIMG ? <img src={question.image} alt="Question" /> : <> </>}
          <p> {question.description} </p>

          <Levels />

          <StyledHr />
          <Button onClick={this.toggleEdit}>Edit Question</Button>
          <br />
          <br />
          <Button onClick={this.toggleDelete}>Delete Question</Button>
          <StyledHr />

          {delQuestion ? <Delete /> : <> </>}
        </StyledDiv>
      </StyledCol>
    );
  }
}

export default withFirebase(QuestionDisplay);
