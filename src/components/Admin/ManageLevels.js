import React, { Component, Fragment } from "react";
import styled from "styled-components";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Toast from "react-bootstrap/Toast";
import AdminLayout from "./AdminLayout";
import LevelDisplay from "./LevelDisplay";
import AddQuestion from "./AddQuestion";

import { AuthUserContext, withFirebase } from "upe-react-components";

import Loader from "../Loader";
import { Container } from "../../styles/global";

const StyledDiv = styled.div`
  text-align: right;
`;

class ManageLevels extends Component {
  constructor(props) {
    super(props);

    this.updatePage = this.updatePage.bind(this);
    this.toggleAdd = this.toggleAdd.bind(this);
  }

  _initFirebase = false;
  state = {
    levelConfig: null,
    settings: null,
    loading: true,
    error: null,
    addLevel: false,
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
    this.setState({ addQuestion: false });
    this.loadSettings();
  };

  loadSettings = async () => {
    this._initFirebase = true;
    const doc = await this.props.firebase.levelConfig().get();

    if (doc.exists) {
      const levelConfig = doc.data();
      this.setState({
        levelConfig,
        loading: false,
      });
    } else {
      this.setState({
        error: "No levelConfig",
        loading: false,
      });
    }
  };

  toggleAdd = () => {
    this.setState({ addLevel: !this.state.addLevel });
  };

  render() {
    const { loading, error, levelConfig, addLevel } = this.state;

    if (loading) return <Loader />;
    if (error)
      return (
        <Container flexdirection="column">
          <h1>{error}</h1>
        </Container>
      );

    const authUser = this.context;

    const Levels = () => {
      return (
        <Row>
          {Object.entries(levelConfig).map((level) => (
            <LevelDisplay
              key={level[0]}
              levelName={level[0]}
              level={level[1]}
              updateFunc={this.updatePage}
            />
          ))}
        </Row>
      );
    };

    return (
      <AdminLayout>
        <Container flexdirection="column">
          <h1> Interview Levels </h1>
          <br />
          <StyledDiv>
            <Button onClick={this.toggleAdd}>Add Interview Level</Button>
          </StyledDiv>
          <br />

          {addLevel ? <h2> Add Level </h2> : <> </>}

          <br />
          <Levels />
        </Container>
      </AdminLayout>
    );
  }
}

export default withFirebase(ManageLevels);
