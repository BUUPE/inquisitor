import React, { Component } from "react";
import { compose } from "recompose";
import styled from "styled-components";

import { Container } from "../../styles/global";
import Loader from "../Loader";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";
import { isRecruitmentTeam } from "../../util/conditions";

const StyledContainer = styled(Container)`
  padding-left: 0;
  margin-top: 0;
`;

class ApplicationDisplay extends Component {
  constructor(props) {
    super(props);
  }
  _initFirebase = false;
  state = {
    data: null,
    loading: true,
    error: null,
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
      this.setState({ data, loading: false }, () => {
        console.log("Settings loaded");
      });
    }
  };

  render() {
    const { loading, error, data } = this.state;

    if (loading) return <Loader />;
    if (error)
      return (
        <Container flexdirection="column">
          <h1>{error}</h1>
        </Container>
      );

    const authUser = this.context;

    return (
      <StyledContainer fluid flexdirection="row">
        <Row>
          <Col>
            <h1> test </h1>
          </Col>
        </Row>
      </StyledContainer>
    );
  }
}

export default compose(withFirebase)(ApplicationDisplay);
