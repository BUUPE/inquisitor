import React, { Component, Fragment } from "react";
import styled from "styled-components";
import { compose } from "recompose";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { withFirebase } from "upe-react-components";

import Loader from "../Loader";
import { Container } from "../../styles/global";
import { asyncForEach } from "../../util/helper.js";

export const RequiredAsterisk = styled.span`
  color: red;
  &:after {
    content: "*";
  }
`;

const CenteredForm = styled(Form)`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 500px;
  margin: 0 auto;
`;

class EditLevelOrder extends Component {
  _initFirebase = false;
  state = {
    availableOrder: [],
    questionMap: null,
    questionList: null,
    loading: true,
    validated: false,
    sending: false,
    submitted: false,
    error: null,
    levelConfig: null,
    msg: "",
  };

  componentDidMount() {
    if (this.props.firebase && !this._initFirebase) this.loadData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.firebase && !this._initFirebase) this.loadData();
    if (typeof window !== "undefined") {
      import("bs-custom-file-input").then((bsCustomFileInput) => {
        bsCustomFileInput.init();
      });
    }
  }

  loadData = async () => {
    this._initFirebase = true;

    const doc = await this.props.firebase.levelConfig().get();

    if (doc.exists) {
      const levelConfig = doc.data();
      this.setState({
        availableOrder: Array.from(
          Array(this.props.questionList.length),
          (_, i) => i + 1
        ),
        questionList: this.props.questionList,
        questionMap: this.props.questionMap,
        levelName: this.props.levelName,
        loading: false,
        levelConfig,
      });
    } else {
      this.setState({
        error: "No levelConfig",
        loading: false,
      });
    }
  };

  onSubmit = async (event) => {
    event.preventDefault();
    this.setState({ sending: true });

    const { questionList, questionMap, levelName } = this.state;
    var { levelConfig } = this.state;

    var orderList = [];
    await asyncForEach(questionList, async (item, index) => {
      orderList.push(item.order);
    });

    if (new Set(orderList).size !== orderList.length) {
      this.setState({ validated: false, msg: "Validation Failed" });
      console.log("Failed Validation");
    } else {
      this.setState({ validated: true });

      delete levelConfig[levelName];
      levelConfig[levelName] = questionList;

      this.props.firebase
        .levelConfig()
        .set(levelConfig)
        .then(() => {
          console.log("Level Updated: ", levelName);
          this.setState({ submitted: true }, () => {
            this.props.updateFunc();
          });
        })
        .catch((error) => {
          this.setState({ error });
        });
    }

    this.setState({ sending: false });
  };

  onChange = (event) => {
    var { questionList } = this.state;

    questionList[event.target.name].order = parseInt(event.target.value);

    this.setState({ questionList });
  };

  render() {
    const {
      availableOrder,
      questionList,
      questionMap,
      loading,
      validated,
      sending,
      submitted,
      error,
      msg,
    } = this.state;

    if (loading) return <Loader />;

    if (error)
      return (
        <Container flexdirection="column">
          <h1>Uh oh!</h1>
          <p>{error}</p>
        </Container>
      );

    return (
      <Container flexdirection="column">
        <CenteredForm noValidate validated={validated} onSubmit={this.onSubmit}>
          {Object.entries(questionList).map((question) => (
            <Form.Row style={{ width: "100%" }} key={question[1].id}>
              <Form.Group controlId={question[1].id} style={{ width: "100%" }}>
                <Form.Label>
                  <h5> {questionMap[question[1].id]} </h5>
                </Form.Label>
                <Form.Control
                  required
                  name={question[0]}
                  as="select"
                  value={question[1].order}
                  onChange={this.onChange}
                >
                  <option value={0}> - </option>
                  {availableOrder.map((item, index) => (
                    <option key={index} value={item}>
                      {" "}
                      {item}{" "}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Form.Row>
          ))}

          <br />

          {msg ? <h5>{msg}</h5> : <> </>}

          <Button type="submit" disabled={sending}>
            {sending ? "Submitting..." : "Submit"}
          </Button>
        </CenteredForm>
      </Container>
    );
  }
}

export default withFirebase(EditLevelOrder);
