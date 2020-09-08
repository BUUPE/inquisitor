import React, { Component } from "react";
import styled from "styled-components";
import { compose } from "recompose";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { withFirebase } from "upe-react-components";

import { isLoggedIn } from "../../util/conditions";
import Loader from "../Loader";
import Error from "../Error";
import Logo from "../Logo";
import { Container } from "../../styles/global";

export const RequiredAsterisk = styled.span`
  color: red;
  &:after {
    content: "*";
  }
`;

const StyledContainer = styled(Container)`
  width: 300px;
  padding: 15px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  border-radius: 15px;
  text-align: center;
  &:hover {
    -webkit-transform: translateY(-5px);
    transform: translateY(-5px);
    transition: all 0.3s linear;
  }
`;

const CenteredForm = styled(Form)`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 500px;
  margin: 0 auto;
`;

class EditQuestion extends Component {
  _initFirebase = false;
  state = {
    fileExtension: "",
    file: null,
    name: "",
    answer: "",
    description: "",
    loading: true,
    validated: false,
    sending: false,
    submitted: false,
    error: null,
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

    this.setState({
      loading: false,
    });
  };

  onSubmit = (event) => {
    this.setState({ sending: true });

    const { answer, description, name, file, fileExtension } = this.state;

    if (answer === "" || description === "" || name === "") {
      this.setState({ validated: false });
    } else {
      this.setState({ validated: true });
      var im = this.props.uid + "." + fileExtension;
      if (file === null) {
        im = "";
      }

      const data = {
        answer: answer,
        description: description,
        name: name,
        image: im,
        scores: {},
      };

      if (file !== null) {
        var uploadTask = this.props.firebase.file("Questions", im).put(file);

        uploadTask.on(
          "state_changed",
          function (snapshot) {
            var progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
          },
          function (error) {
            console.log(error);
          },
          function () {
            console.log("Upload Successful!");
          }
        );
      }

      this.props.firebase
        .questions()
        .add(data)
        .then(() => {
          console.log("Added Question");
          this.setState(
            {
              submitted: true,
            },
            () => {
              this.props.updateFunc();
            }
          );
        })
        .catch((error) => {
          this.setState({ error });
        });
    }

    this.setState({ sending: false });
    event.preventDefault();
  };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onFileChange = (event) => {
    var f = event.target.files[0];
    console.log(f);
    if (f.type !== "image/jpeg" && f.type !== "image/png") {
      console.log("Invalid file type");
      f = null;
    } else {
      var fileExtension = "jpg";
      if (f.type.split("/")[1] === "png") fileExtension = "png";
      this.setState({ fileExtension: fileExtension });
    }

    this.setState({ file: f });
  };

  render() {
    const {
      fileExtension,
      file,
      name,
      answer,
      description,
      loading,
      error,
      submitted,
      validated,
      sending,
    } = this.state;

    if (error) return <Error error={error} />;
    if (loading) return <Loader />;

    return (
      <StyledContainer flexdirection="column">
        <CenteredForm noValidate validated={validated} onSubmit={this.onSubmit}>
          <h2> Add Question </h2>
          <Form.Row style={{ width: "100%" }} key={0}>
            <Form.Group controlId={4} style={{ width: "100%" }}>
              <Form.Label>
                <h5> Name </h5>
              </Form.Label>
              <Form.Control
                name="name"
                type="text"
                placeholder="..."
                value={name}
                onChange={this.onChange}
              />
            </Form.Group>
          </Form.Row>

          <Form.Row style={{ width: "100%" }} key={1}>
            <Form.Group controlId={4} style={{ width: "100%" }}>
              <Form.Label>
                <h5> Answer </h5>
              </Form.Label>
              <Form.Control
                rows={5}
                name="answer"
                type="textarea"
                placeholder="..."
                value={answer}
                onChange={this.onChange}
              />
            </Form.Group>
          </Form.Row>

          <Form.Row style={{ width: "100%" }} key={2}>
            <Form.Group controlId={4} style={{ width: "100%" }}>
              <Form.Label>
                <h5> Description </h5>
              </Form.Label>
              <Form.Control
                rows={5}
                name="description"
                type="textarea"
                placeholder="..."
                value={description}
                onChange={this.onChange}
              />
            </Form.Group>
          </Form.Row>

          <Form.Row style={{ width: "100%" }} key={3}>
            <Form.Group controlId={0} style={{ width: "100%" }}>
              <Form.Label>
                <h5> Image </h5>
              </Form.Label>
              <Form.File
                name="file"
                accept=".png,.jpg"
                onChange={this.onFileChange}
              />
            </Form.Group>
          </Form.Row>

          <Button type="submit" disabled={sending}>
            {sending ? "Submitting..." : "Submit"}
          </Button>
        </CenteredForm>
      </StyledContainer>
    );
  }
}

export default withFirebase(EditQuestion);
