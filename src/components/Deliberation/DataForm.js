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
  margin-bottom: 25px;
`;

class DataForm extends Component {
  _initFirebase = false;
  state = {
    file: null,
    fileExtension: "",
    linkedin: "",
    facebook: "",
    github: "",
    twitter: "",
    application: null,
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
    if (typeof window !== "undefined") {
      import("bs-custom-file-input").then((bsCustomFileInput) => {
        bsCustomFileInput.init();
      });
    }
  }

  loadData = async () => {
    this._initFirebase = true;

    const doc = await this.props.firebase
      .application(this.context.inquisitor.application)
      .get();

    if (!doc.exists) this.setState({ errorMsg: "Failed loading application" });
    else {
      const application = doc.data();
      this.setState({ application, loading: false }, () => {
        console.log("Loaded Application");
      });
    }
  };

  onSubmit = (event) => {
    this.setState({ sending: true });

    const {
      facebook,
      github,
      linkedin,
      twitter,
      file,
      fileExtension,
    } = this.state;

    const im = this.context.name.split(" ")[0] + "." + fileExtension;
    const face = facebook;
    const git = github;
    const tw = twitter;
    const lin = linkedin;

    const data = {
      profileIMG: im,
      gradYear: this.state.application.responses[4],
      socials: {
        facebook: face,
        github: git,
        linkedin: lin,
        twitter: tw,
      },
      roles: {
        nonMember: false,
        provisionalMember: true,
      },
    };

    if (file !== null) {
      var uploadTask = this.props.firebase
        .uploadImage("Provisional", im)
        .put(file);

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
      .editUser(this.context.uid, data)
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
      twitter,
      github,
      facebook,
      linkedin,
      loading,
      errorMsg,
      submitted,
      validated,
      sending,
      application,
    } = this.state;

    if (loading) return <Loader />;

    const onSubmit = async (event) => {
      this.setState({ sending: true });

      this.setState({ validated: true });
    };

    const successMessage = (
      <Container flexdirection="column">
        <div style={{ alignSelf: "center" }}>
          <Logo size="medium" />
        </div>

        <h1>Form Submitted!</h1>
        <p>
          Thank you for submitting this form, a member of the Recruitment team
          will soon contact you in regards to further steps.
        </p>
      </Container>
    );

    if (errorMsg)
      return (
        <Container flexdirection="column">
          <h1>Uh oh!</h1>
          <p>{errorMsg}</p>
        </Container>
      );

    if (submitted || application.deliberation.submittedForm)
      return successMessage;

    return (
      <Container flexdirection="column">
        <CenteredForm noValidate validated={validated} onSubmit={this.onSubmit}>
          <Logo size="medium" />
          <h1>UPE Member Data Form</h1>

          <Form.Row style={{ width: "100%" }} key={0}>
            <Form.Group controlId={0} style={{ width: "100%" }}>
              <Form.Label>
                <h5> Profile Image </h5>
              </Form.Label>
              <Form.File
                name="file"
                accept=".png,.jpg"
                onChange={this.onFileChange}
              />
            </Form.Group>
          </Form.Row>

          <Form.Row style={{ width: "100%" }} key={1}>
            <Form.Group controlId={1} style={{ width: "100%" }}>
              <Form.Label>
                <h5> Twitter </h5>
              </Form.Label>
              <Form.Control
                name="twitter"
                type="url"
                placeholder="https://twitter.com/..."
                value={twitter}
                onChange={this.onChange}
              />
            </Form.Group>
          </Form.Row>

          <Form.Row style={{ width: "100%" }} key={2}>
            <Form.Group controlId={2} style={{ width: "100%" }}>
              <Form.Label>
                <h5> Github </h5>
              </Form.Label>
              <Form.Control
                name="github"
                type="url"
                placeholder="https://github.com/..."
                value={github}
                onChange={this.onChange}
              />
            </Form.Group>
          </Form.Row>

          <Form.Row style={{ width: "100%" }} key={3}>
            <Form.Group controlId={3} style={{ width: "100%" }}>
              <Form.Label>
                <h5> Facebook </h5>
              </Form.Label>
              <Form.Control
                name="facebook"
                type="url"
                placeholder="https://facebook.com/..."
                value={facebook}
                onChange={this.onChange}
              />
            </Form.Group>
          </Form.Row>

          <Form.Row style={{ width: "100%" }} key={4}>
            <Form.Group controlId={4} style={{ width: "100%" }}>
              <Form.Label>
                <h5> Linkedin </h5>
              </Form.Label>
              <Form.Control
                name="linkedin"
                type="url"
                placeholder="https://linkedin.com/..."
                value={linkedin}
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

export default compose(withAuthorization(isLoggedIn), withFirebase)(DataForm);
