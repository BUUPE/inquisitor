import React, { Component, Fragment } from "react";
import styled from "styled-components";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import { withFirebase } from "upe-react-components";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import Error from "../Error";
import Loader from "../Loader";
import { LevelEditor } from "./EditLevel";
import { Container } from "../../styles/global";

const StyledCol = styled(Col)`
  padding: 10px 10px 10px 10px;
  width: 200px;
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

class LevelDisplay extends Component {
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
    level: null,
    levelName: "",
    editLevel: false,
    deleteQuestion: false,
    questionList: null,
    questionMap: null,
    levelConfig: null,
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

    this.setState(
      {
        questionList: this.props.questionList,
        level: this.props.level,
        levelName: this.props.levelName,
        levelConfig: this.props.levelConfig,
        questionMap: this.props.questionMap,
        loading: false,
      },
      () => {
        console.log("Loaded data");
      }
    );
  };

  toggleEdit = () => {
    this.setState({ editLevel: !this.state.editLevel });
  };

  toggleDelete = () => {
    this.setState({ deleteLevel: !this.state.deleteLevel });
  };

  deleteL = () => {
    const { levelName, levelConfig } = this.state;
    delete levelConfig[levelName];

    this.props.firebase
      .levelConfig()
      .set(levelConfig)
      .then(() => {
        console.log("Level Deleted: ", levelName);
        this.updateData();
      });
  };

  updateData = () => {
    this.setState({ deleteLevel: false, editLevel: false });
    this.props.updateFunc();
  };

  render() {
    const {
      loading,
      error,
      editLevel,
      level,
      levelName,
      deleteLevel,
      questionList,
      questionMap,
      levelConfig,
    } = this.state;

    if (error) return <Error error={error} />;
    if (loading) return <Loader />;

    if (editLevel) {
      return (
        <StyledCol>
          <StyledDiv>
            <h2>Edit Level</h2>

            <Container flexdirection="column">
              <DndProvider
                backend={HTML5Backend}
                styled={{ textAlign: "center", itemAlign: "center" }}
              >
                <LevelEditor
                  questions={level}
                  questionMap={questionMap}
                  firebase={this.props.firebase}
                  updateFunc={this.updateData}
                  levelConfig={levelConfig}
                  levelName={levelName}
                  allQuestions={questionList}
                />
              </DndProvider>
            </Container>

            <StyledHr />
            <Button onClick={this.toggleEdit}>Edit Level</Button>
            <StyledHr />
          </StyledDiv>
        </StyledCol>
      );
    }

    const Questions = () => {
      return (
        <Row>
          <Col>
            <h3> Questions </h3>
            {Object.entries(level).map((question) => (
              <Fragment key={question[0]}>
                <h5> {questionMap[question[1].id]} </h5>
                <p> Order: {question[1].order} </p>
              </Fragment>
            ))}
          </Col>
        </Row>
      );
    };

    const Delete = () => {
      return (
        <Fragment>
          <Button onClick={this.deleteL}>Are you sure?</Button>
          <StyledHr />
        </Fragment>
      );
    };

    return (
      <StyledCol>
        <StyledDiv>
          <h2> {levelName} </h2>

          <StyledHr />
          <Questions />

          <StyledHr />
          <Button onClick={this.toggleEdit}>Edit Level</Button>
          <br />
          <br />
          <Button onClick={this.toggleDelete}>Delete Level</Button>
          <StyledHr />

          {deleteLevel ? <Delete /> : <> </>}
        </StyledDiv>
      </StyledCol>
    );
  }
}

export default withFirebase(LevelDisplay);
