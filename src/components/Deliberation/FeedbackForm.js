import React, { Component } from "react";
import styled from "styled-components";
import { compose } from "recompose";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";

import { isLoggedIn } from "../../util/conditions";
import Loader from "../Loader";
import Logo from "../Logo";
import { Container } from "../../styles/global";

const CenteredForm = styled(Form)`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 500px;
  margin: 0 auto;
  margin-bottom: 25px;
`;

class FeedbackForm extends Component {
  constructor(props) {
    super(props);
    console.log(props);
  }

  _initFirebase = false;
  state = {
    data: null,
    feedback: "",
    loading: true,
    validated: false,
    sending: false,
    submitted: false,
    errorMsg: "",
  };
  static contextType = AuthUserContext;

  componentDidMount() {
    if (this.props.firebase && !this._initFirebase) this.loadData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.firebase && !this._initFirebase) this.loadData();
  }

  loadData = async () => {
    this._initFirebase = true;

    const doc = await this.props.firebase.application(this.props.data).get();

    if (!doc.exists) this.setState({ error: "Failed to load application!" });
    else {
      const data = doc.data();
      this.setState({ data }, () => {
        console.log("Application loaded");
        this.sortData();
      });
    }
  };

  onSubmit = (event) => {
    this.setState({ sending: true });

    const { feedback } = this.state;

    const data = {
      deliberation: {
        feedback: feedback,
        complete: true,
      },
    };

    this.props.firebase
      .application(this.props.data.id)
      .then(() => {
        console.log("Edited Data");
        this.setState({
          submitted: true,
          sending: false,
        });
      })
      .catch((error) => {
        this.setState({ error });
      });

    this.setState({
      validated: true,
    });
    event.preventDefault();
  };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const {
      data,
      feedback,
      loading,
      errorMsg,
      submitted,
      validated,
      sending,
    } = this.state;

    console.log(this);

    if (loading) return <Loader />;

    const successMessage = (
      <Container flexdirection="column">
        <div style={{ alignSelf: "center" }}>
          <Logo size="medium" />
        </div>

        <h1>Form Submitted!</h1>
      </Container>
    );

    if (errorMsg)
      return (
        <Container flexdirection="column">
          <h1>Uh oh!</h1>
          <p>{errorMsg}</p>
        </Container>
      );

    if (
      submitted ||
      (data.deliberation.complete && data.deliberation.feedback !== "")
    )
      return successMessage;

    return (
      <Container flexdirection="column">
        <CenteredForm noValidate validated={validated} onSubmit={this.onSubmit}>
          <Logo size="medium" />
          <h1>Feedback Form</h1>

          <Form.Row style={{ width: "100%" }} key={4}>
            <Form.Group controlId={4} style={{ width: "100%" }}>
              <Form.Label>
                <h5> Feedback </h5>
              </Form.Label>
              <Form.Control
                name="feedback"
                type="text"
                placeholder="..."
                value={feedback}
                onChange={this.onChange}
              />
            </Form.Group>
          </Form.Row>

          <Button type="submit" disabled={sending}>
            {sending ? "Submitting..." : "Submit"}
          </Button>
        </CenteredForm>
      </Container>
    );
  }
}

export default compose(
  withAuthorization(isLoggedIn),
  withFirebase
)(FeedbackForm);
