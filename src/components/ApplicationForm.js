import React from "react";
import styled from "styled-components";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

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
  } else if (fileUpload.files.length > 1) {
    fileUpload.setCustomValidity("You can only upload 1 file!");
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
    errorMsg: "",
  };

  loadApplicationFormConfig = async () => {
    const doc = await this.props.firebase.applicationFormConfig().get();

    if (!doc.exists) {
      this.setState({
        errorMsg:
          'Document "applicationFormConfig" does not exist! Please inform an administrator.',
        loading: false,
      });
    } else {
      this.setState({
        applicationFormConfig: doc.data(),
        loading: false,
      });
    }
  };

  componentDidUpdate(prevProps) {
    if (this.props.firebase !== null) {
      this.loadApplicationFormConfig();
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
    } = this.state;

    if (loading) return <Loader />;

    const onSubmit = async (event) => {
      this.setState({ sending: true });
      event.preventDefault();
      const form = event.currentTarget;
      const fileUpload = form.querySelector(".custom-file-input");
      setFileValidity(fileUpload);

      if (form.checkValidity() === false) {
        event.stopPropagation();
      } else {
        const inputs = form.querySelectorAll(".form-control");

        console.log(inputs);
        console.log(fileUpload);
        // save to firebase

        this.setState({ submitted: true });
      }

      this.setState({
        sending: false,
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

export default withFirebase(ApplicationForm);
