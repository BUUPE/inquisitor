import React from "react";
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

class ApplicationForm extends React.Component {
  state = {
    applicationFormConfig: null,
    loading: true,
    validated: false,
    sending: false,
    submitted: false,
    firebaseInit: false,
    alreadyApplied: false,
    errorMsg: "",
  };
  static contextType = AuthUserContext;

  loadApplicationFormConfig = async () => {
    const doc = await this.props.firebase.applicationFormConfig().get();
    const { applied: alreadyApplied } = await this.props.firebase
      .user(this.context.uid)
      .get()
      .then((snapshot) => snapshot.data())
      .catch(console.error);

    if (!doc.exists) {
      this.setState({
        errorMsg:
          'Document "applicationFormConfig" does not exist! Please inform an administrator.',
        loading: false,
        alreadyApplied,
      });
    } else {
      this.setState({
        applicationFormConfig: doc.data(),
        loading: false,
        alreadyApplied,
      });
    }
  };

  componentDidUpdate(prevProps) {
    if (this.props.firebase !== null && !this.state.firebaseInit) {
      this.loadApplicationFormConfig();
      this.setState({ firebaseInit: true });
    }
    if (typeof window !== "undefined") {
      import("bs-custom-file-input").then((bsCustomFileInput) => {
        bsCustomFileInput.init();
      });
    }
  }

  render() {
    const {
      loading,
      errorMsg,
      submitted,
      validated,
      applicationFormConfig,
      sending,
      alreadyApplied,
    } = this.state;

    if (loading) return <Loader />;

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
        const { semester } = this.state.applicationFormConfig;

        let responses = inputs.map(({ id, value }) => {
          return {
            id: parseInt(id),
            value,
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
                .then((value) =>
                  resolve({
                    id,
                    value,
                  })
                );
            })
        );

        Promise.all(uploadFiles).then((fileURLs) => {
          responses = responses.concat(fileURLs);

          const uploadApplicationData = this.props.firebase
            .application(uid)
            .set({ responses });
          const setApplied = this.props.firebase
            .user(uid)
            .update({ applied: true, semester });

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
