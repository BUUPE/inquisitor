import React, { Component } from "react";
import styled from "styled-components";
import { compose } from "recompose";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { AuthUserContext, withAuthorization, isLoggedIn } from "./Session";
import { withFirebase } from "./Firebase";
import Loader from "./Loader";
import Logo from "./Logo";
import { Container } from "../styles/global";

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

// use sweetalert here since its non blocking
const setFileValidity = (fileUpload) => {
  if (fileUpload.files.length === 0) {
    fileUpload.setCustomValidity("You must upload a file!");
    alert("You must upload a file!");
  } else if (fileUpload.files.length > 1) {
    fileUpload.setCustomValidity("You can only upload 1 file!");
    alert("You can only upload 1 file!");
  } else if (fileUpload.files[0].size > 1048576) {
    fileUpload.setCustomValidity("Max file size is 1MB!");
    fileUpload.value = "";
    alert("Max file size is 1MB!");
  } else {
    fileUpload.setCustomValidity("");
  }
};

const renderQuestion = (question) => {
  let questionComponent;
  if (question.type === "textarea") {
    questionComponent = (
      <Form.Control required={question.required} as="textarea" rows="3" />
    );
  } else if (question.type === "file") {
    questionComponent = (
      <Form.File
        id={`custom-file-${question.id}`}
        label="Upload file"
        custom
        accept=".pdf"
        onChange={(e) => setFileValidity(e.target)}
      />
    );
  } else {
    questionComponent = (
      <Form.Control required={question.required} type={question.type} />
    );
  }

  return (
    <Form.Row style={{ width: "100%" }} key={question.id}>
      <Form.Group controlId={question.id} style={{ width: "100%" }}>
        <Form.Label>
          {question.name} {question.required && <RequiredAsterisk />}
        </Form.Label>
        {questionComponent}
      </Form.Group>
    </Form.Row>
  );
};

class ApplicationForm extends Component {
  state = {
    applicationFormConfig: null,
    generalSettings: null,
    loading: true,
    validated: false,
    sending: false,
    submitted: false,
    firebaseInit: false,
    alreadyApplied: false,
    errorMsg: "",
  };
  static contextType = AuthUserContext;

  componentDidMount() {
    if (this.props.firebase && !this.state.firebaseInit) this.loadData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.firebase && !this.state.firebaseInit) this.loadData();
    if (typeof window !== "undefined") {
      import("bs-custom-file-input").then((bsCustomFileInput) => {
        bsCustomFileInput.init();
      });
    }
  }

  loadData = async () => {
    const loadApplicationFormConfig = this.props.firebase
      .applicationFormConfig()
      .get()
      .then((snapshot) => snapshot.data())
      .catch(() =>
        this.setState({
          errorMsg: "Application Form Config doesn't exist!",
          loading: false,
        })
      );
    const loadAlreadyApplied = this.props.firebase
      .user(this.context.uid)
      .get()
      .then((snapshot) => snapshot.data())
      .catch(console.error);
    const loadGeneralSettings = this.props.firebase
      .generalSettings()
      .get()
      .then((snapshot) => snapshot.data())
      .catch(() =>
        this.setState({
          errorMsg: "General settings doesn't exist!",
          loading: false,
        })
      );

    Promise.all([
      loadApplicationFormConfig,
      loadAlreadyApplied,
      loadGeneralSettings,
    ]).then((values) =>
      this.setState({
        loading: false,
        applicationFormConfig: values[0],
        alreadyApplied: values[1].applied,
        generalSettings: values[2],
        firebaseInit: true,
      })
    );
  };

  render() {
    const {
      loading,
      errorMsg,
      submitted,
      validated,
      applicationFormConfig,
      sending,
      alreadyApplied,
      generalSettings,
    } = this.state;

    if (loading) return <Loader />;

    if (!generalSettings.applicationsOpen)
      return (
        <Container
          flexdirection="column"
          style={{
            justifyContent: "center",
            alignItems: "center",
            maxWidth: 700,
          }}
        >
          <Logo size="medium" />
          <h1>Applications are closed!</h1>
          <p>
            Unfortunately, the application for the{" "}
            {applicationFormConfig.semester} season has closed. If you're
            interesting in joining BU UPE, please come back next semester and
            apply, we'd love to have you! In the meantime, feel free to check
            out the public events on{" "}
            <a href="https://upe.bu.edu/events">our calendar</a>.
          </p>
        </Container>
      );

    const onSubmit = (event) => {
      this.setState({ sending: true });
      event.preventDefault();
      const form = event.currentTarget;
      const fileUploads = Array.from(
        form.querySelectorAll(".custom-file-input")
      );
      fileUploads.forEach((fileUpload) => setFileValidity(fileUpload));

      if (form.checkValidity() === false) {
        event.stopPropagation();
      } else {
        const inputs = Array.from(form.querySelectorAll(".form-control"));
        const { uid } = this.context;
        const { semester, questions } = this.state.applicationFormConfig;

        let responses = inputs.map(({ id: inputId, value }) => {
          const id = parseInt(inputId);
          const { name, order, type } = questions.find((q) => q.id === id);
          return {
            id,
            value,
            name,
            order,
            type,
          };
        });

        const uploadFiles = fileUploads.map(
          (fileUpload) =>
            new Promise((resolve, reject) => {
              const id = parseInt(fileUpload.id.split("-").pop());
              this.props.firebase
                .file(uid, id)
                .put(fileUpload.files[0])
                .then((snapshot) => snapshot.ref.getDownloadURL())
                .then((value) => {
                  const { name, order, type } = questions.find(
                    (q) => q.id === id
                  );
                  return resolve({
                    id,
                    value,
                    name,
                    order,
                    type,
                  });
                });
            })
        );

        Promise.all(uploadFiles).then((fileURLs) => {
          responses = responses.concat(fileURLs);

          const uploadApplicationData = this.props.firebase
            .application(uid)
            .set({ responses, semester });
          const setApplied = this.props.firebase
            .user(uid)
            .update({ applied: true });

          Promise.all([uploadApplicationData, setApplied]).then(() =>
            this.setState({ submitted: true, sending: false })
          );
        });
      }

      this.setState({
        validated: true,
      });
    };

    const successMessage = (
      <Container flexdirection="column">
        <div style={{ alignSelf: "center" }}>
          <Logo size="medium" />
        </div>

        <h1>Application Submitted!</h1>
        <p>
          Thank you for applying to join BU UPE. Please check your email for a
          confirmation of your submission. Further details, such as interview
          timeslots, will be prompted via email and can be entered in this
          application. If you'd like to edit your submission, simply refresh
          this page and re-apply.
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

    if (submitted) return successMessage;

    // use auth user context here, if user has already applied dont let them apply again (alternatively, just let them know they've applied already and further applications will overwrite previous ones)
    return (
      <Container flexdirection="column">
        <CenteredForm noValidate validated={validated} onSubmit={onSubmit}>
          <Logo size="medium" />
          <h1>Apply to BU UPE</h1>
          {/* maybe this message here should be configurable as well? */}
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras
            fringilla, dui vitae maximus luctus, magna urna convallis purus,
            condimentum ullamcorper velit dui eu dolor. Pellentesque et
            tincidunt tellus. Fusce venenatis magna sed elit bibendum, sed
            scelerisque augue placerat. Vestibulum nec mi efficitur, posuere
            nisl at, pretium ex. Quisque quam dui, pulvinar a pellentesque eu,
            cursus et elit. Ut volutpat imperdiet ex, id commodo nulla pretium
            id. Proin accumsan dignissim tortor, id pulvinar urna euismod ac.
            Morbi suscipit massa id dui feugiat ultrices. Nulla ac faucibus
            tortor, quis pharetra leo.
          </p>

          {alreadyApplied && (
            <p style={{ color: "red" }}>
              Look's like you've already applied! Feel free to reapply however,
              just note that it will overwrite your previous submission.
            </p>
          )}

          {applicationFormConfig.questions
            .sort((a, b) => (a.order > b.order ? 1 : -1))
            .map((question) => renderQuestion(question))}

          <Button type="submit" disabled={sending}>
            Submit
          </Button>
        </CenteredForm>
      </Container>
    );
  }
}

export default compose(
  withAuthorization(isLoggedIn),
  withFirebase
)(ApplicationForm);
