import React, { Component, Fragment } from "react";
import styled from "styled-components";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import { withFirebase } from "upe-react-components";

import Loader from "../Loader";
import EditLevelOrder from "./EditLevelOrder";
import { Container } from "../../styles/global";
import { asyncForEach } from "../../util/helper.js";

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

    this.toggleOrder = this.toggleOrder.bind(this);
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
    editOrder: false,
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
    const docOne = await this.props.firebase.levelConfig().get();

    if (docOne.exists) {
      const levelConfig = docOne.data();
      this.setState({
        levelConfig,
      });
    } else {
      this.setState({
        error: "No levelConfig",
        loading: false,
      });
    }

    this.props.firebase
      .questions()
      .get()
      .then((querySnapshot) => {
        const questionList = querySnapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() };
        });
        this.setState(
          {
            questionList,
            level: this.props.level,
            levelName: this.props.levelName,
          },
          () => {
            console.log("Data Loaded");
            this.sortData();
          }
        );
      });
  };

  sortData = async () => {
    const { questionList } = this.state;
    var questionMap = {};

    await asyncForEach(questionList, async (item, index) => {
      questionMap[item.id] = item.name;
    });

    this.setState({ loading: false, questionMap });
  };

  toggleEdit = () => {
    this.setState({ editLevel: !this.state.editLevel });
  };

  toggleDelete = () => {
    this.setState({ deleteLevel: !this.state.deleteLevel });
  };

  toggleOrder = () => {
    this.setState({ editOrder: !this.state.editOrder });
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
      editOrder,
    } = this.state;

    if (loading) return <Loader />;
    if (error)
      return (
        <Container flexdirection="column">
          <h1>{error}</h1>
        </Container>
      );

    if (editLevel) {
      return (
        <StyledCol>
          <StyledDiv>
            <h2>Edit Level</h2>
          </StyledDiv>
        </StyledCol>
      );
    }

    if (editOrder) {
      return (
        <StyledCol>
          <StyledDiv>
            <h2>Edit Order</h2>
            <br />

            <EditLevelOrder
              questionList={level}
              levelName={levelName}
              questionMap={questionMap}
              updateFunc={this.updateData}
            />

            <StyledHr />
            <Button onClick={this.toggleOrder}>Edit Order</Button>
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
          <Button onClick={this.toggleEdit}>Edit Questions</Button>
          <br />
          <br />
          <Button onClick={this.toggleOrder}>Edit Order</Button>
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
