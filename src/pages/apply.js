import React, { Component } from "react";
import { compose } from "recompose";
import swal from "@sweetalert/with-react";

import Form from "react-bootstrap/Form";

import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";

import { withSettings } from "../components/API/SettingsContext";

import { isLoggedIn } from "../util/conditions";
import Loader from "../components/Loader";
import TextDisplay, { BackIcon } from "../components/TextDisplay";
import SEO from "../components/SEO";
import {
  Container,
  RequiredAsterisk,
  Title,
  CenteredForm,
  StyledButton,
} from "../styles/global";

const setFileValidity = (fileUpload) => {
  if (fileUpload.files.length === 0) {
    fileUpload.setCustomValidity("You must upload a file!");
    swal("Uh oh!", "You must upload a file!", "error");
  } else if (fileUpload.files.length > 1) {
    fileUpload.setCustomValidity("You can only upload 1 file!");
    swal("Uh oh!", "You can only upload 1 file!", "error");
  } else if (fileUpload.files[0].size > 1048576) {
    fileUpload.setCustomValidity("Max file size is 1MB!");
    fileUpload.value = "";
    swal("Uh oh!", "Max file size is 1MB!", "error");
  } else {
    fileUpload.setCustomValidity("");
  }
};

class ApplicationForm extends Component {
  _initFirebase = false;
  state = {
    applicationFormConfig: null,
    initialApplicationData: null,
    loading: true,
    validated: false,
    sending: false,
    submitted: false,
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
    const loadApplicationFormConfig = this.props.firebase
      .applicationFormConfig()
      .get()
      .then((snapshot) => snapshot.data())
      .catch(() =>
        this.setState({
          loading: false,
        })
      );
    const loadUserApplication = this.props.firebase
      .application(this.context.uid)
      .get()
      .then((snapshot) => (snapshot.exists ? snapshot.data() : null))
      .catch(() =>
        this.setState({
          loading: false,
        })
      );

    Promise.all([loadApplicationFormConfig, loadUserApplication]).then(
      ([applicationFormConfig, initialApplicationData]) =>
        this.setState({
          loading: false,
          applicationFormConfig,
          initialApplicationData,
        })
    );
  };

  render() {
    const {
      loading,
      submitted,
      validated,
      applicationFormConfig,
      sending,
    } = this.state;

    if (loading) return <Loader />;

    if (
      (this.context.roles.hasOwnProperty("denyListed") &&
        this.context.roles.denyListed) ||
      (this.context.roles.hasOwnProperty("upemember") &&
        this.context.roles.upemember) ||
      (this.context.roles.hasOwnProperty("provisionalMember") &&
        this.context.roles.provisionalMember)
    )
      return (
        <>
          <TextDisplay
            name={"Your Application"}
            text={
              "Unfortunately you are not eligible to apply to Upsilon PI Epsilon. If you think this is a mistake, or want further information on the situation, please contact our EBoard at upe@bu.edu."
            }
            displayBack={true}
          />
        </>
      );

    if (!this.props.settings.applicationsOpen)
      return (
        <TextDisplay
          name={"Your Application"}
          text={`Unfortunately, the application for the ${applicationFormConfig.semester} season has closed. If you're interesting in joining BU UPE, please come back next semester and apply, we'd love to have you!`}
          displayBack={true}
        />
      );

    const onSubmit = async (event) => {
      event.preventDefault();
      if (!this.props.settings.applicationsOpen) {
        swal(
          "Uh oh!",
          "Applications are closed! Not sure how you got here, but unfortunately we can't submit this for you as applications have closed.",
          "error"
        );
        return;
      }

      const form = event.currentTarget;
      const fileUploads = Array.from(
        form.querySelectorAll(".custom-file-input")
      );
      fileUploads.forEach((fileUpload) => setFileValidity(fileUpload));

      if (form.checkValidity() === false) {
        event.stopPropagation();
      } else {
        this.setState({ sending: true });
        const inputs = Array.from(form.querySelectorAll(".form-control"));
        const radios = Array.from(
          form.querySelectorAll(".custom-radio>.custom-control-input")
        ).filter((r) => r.checked);
        const { semester, questions } = this.state.applicationFormConfig;
        const { uid, roles } = this.context;
        roles.applicant = true;

        let firstName, email, newName;
        let responses = inputs.map(({ id: inputId, value }) => {
          const id = inputId;

          if (id === "name") {
            firstName = value.split(" ")[0];
            newName = value;
          } else if (id === "email") email = value;

          const { name, order, type } = questions.find((q) => q.id === id);
          return {
            id,
            value,
            name,
            order,
            type,
          };
        });

        const radioResponses = radios.map(
          ({ name: inputId, value: inputValue }) => {
            const id = inputId;
            // eslint-disable-next-line eqeqeq
            const value = inputValue == "true";
            const { name, order, type } = questions.find((q) => q.id === id);
            return {
              id,
              value,
              name,
              order,
              type,
            };
          }
        );

        const uploadFiles = fileUploads.map(
          (fileUpload) =>
            new Promise((resolve, reject) => {
              const id = fileUpload.id.split("-").pop();
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

        const fileURLs = await Promise.all(uploadFiles);
        responses = responses.concat(fileURLs).concat(radioResponses);

        const uploadApplicationData = this.props.firebase.application(uid).set({
          responses,
          semester,
          deliberation: {
            accepted: false,
            confirmed: false,
            feedback: "",
            votes: {},
          },
          interview: {
            interviewed: false,
          },
        });
        const updateUser = this.props.firebase.user(uid).update({
          roles,
          name: newName,
          profileIMG: "",
        });
        const sendReceipt = this.props.firebase.sendApplicationReceipt({
          email,
          firstName,
        });

        await Promise.all([uploadApplicationData, updateUser, sendReceipt]);
        this.setState({ submitted: true, sending: false });
      }

      this.setState({
        validated: true,
      });
    };

    const successMessage = (
      <TextDisplay
        name={"Your Application"}
        text={
          "Your application has been submitted! Thank you for applying to join BU UPE. Please check your email for a confirmation of your submission. Further details, such as interview timeslots, will be prompted via email and can be entered in this application. If you'd like to edit your submission, simply refresh this page and re-apply."
        }
        displayBack={true}
      />
    );

    if (submitted) return successMessage;

    const renderQuestion = (question) => {
      const { initialApplicationData } = this.state;
      let defaultValue = "";
      if (initialApplicationData !== null) {
        defaultValue = initialApplicationData.responses.find(
          (r) => r.id === question.id
        ).value;
      } else if (question.id === "name") defaultValue = this.context.name;
      else if (question.id === "email") defaultValue = this.context.email;

      let questionComponent;
      switch (question.type) {
        case "textarea":
          questionComponent = (
            <Form.Control
              required={question.required}
              as="textarea"
              rows="3"
              defaultValue={defaultValue}
            />
          );
          break;
        case "file":
          questionComponent = (
            <Form.File
              id={`custom-file-${question.id}`}
              label="Upload file"
              custom
              accept=".pdf"
              onChange={(e) => setFileValidity(e.target)}
            />
          );
          break;
        case "yesno":
          questionComponent = (
            <div>
              <Form.Check
                custom
                required={question.required}
                inline
                defaultChecked={defaultValue}
                value="true"
                label="Yes"
                type="radio"
                name={question.id}
                id={`${question.id}-1`}
              />
              <Form.Check
                custom
                required={question.required}
                inline
                defaultChecked={!defaultValue}
                value="false"
                label="No"
                type="radio"
                name={question.id}
                id={`${question.id}-2`}
              />
            </div>
          );
          break;
        default:
          questionComponent = (
            <Form.Control
              required={question.required}
              type={question.type}
              defaultValue={defaultValue}
            />
          );
          break;
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

    return (
      <>
        <SEO title="Apply" route="/apply" />
        <BackIcon />
        <Title>
          <h1> Your Application </h1>
        </Title>
        <Container flexdirection="row" style={{ justifyContent: "center" }}>
          <CenteredForm noValidate validated={validated} onSubmit={onSubmit}>
            {this.context.roles.hasOwnProperty("applicant") &&
              this.context.roles.applicant && (
                <p
                  style={{
                    color: "red",
                    paddingTop: "10px",
                    paddingBottom: "10px",
                  }}
                >
                  Look's like you've already applied! Feel free to reapply
                  however, just note that it will overwrite your previous
                  submission.
                </p>
              )}

            {applicationFormConfig.questions
              .sort((a, b) => (a.order > b.order ? 1 : -1))
              .map((question) => renderQuestion(question))}

            <StyledButton
              paddingRight={"10%"}
              paddingLeft={"10%"}
              paddingTop={"2%"}
              paddingBottom={"2%"}
              type="submit"
              disabled={sending}
            >
              {sending ? "Submitting..." : "Submit"}
            </StyledButton>
          </CenteredForm>
        </Container>
      </>
    );
  }
}

export default compose(
  withSettings,
  withAuthorization(isLoggedIn),
  withFirebase
)(ApplicationForm);
