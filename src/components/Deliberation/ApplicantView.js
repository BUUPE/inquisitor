import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import swal from "@sweetalert/with-react";
import { compose } from "recompose";
import cloneDeep from "lodash.clonedeep";
import { navigate } from "gatsby";
import update from "immutability-helper";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { isApplicant } from "../../util/conditions";
import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";

import { RequiredAsterisk } from "../../styles/global";
import Loader from "../Loader";
import Error from "../Error";
import TextDisplay, { BackIcon } from "../TextDisplay";

const Title = styled.div`
  padding-left: 5%;
  h1 {
    font-family: Georgia;
    font-size: 50px;
    font-style: italic;
  }
  h1:after {
    content: "";
    display: block;
    width: 4%;
    padding-top: 3px;
    border-bottom: 2px solid #f21131;
  }
`;

const Text = styled.div`
  font-family: Georgia;
  width: 100%;
  padding-top: 80px;
  padding-bottom: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  h2 {
    font-weight: bold;
    font-size: 35px;
    border-bottom: 2px solid #f21131;
    margin-bottom: 2%;
    font-style: italic;
  }
  h3 {
    font-weight: bold;
    font-size: 30px;
    padding-bottom: 2%;
    color: #f21131;
    font-style: italic;
  }
  h4 {
    font-weight: bold;
    font-size: 25px;
    padding-bottom: 1.5%;
    font-style: italic;
  }
  h5 {
    font-weight: bold;
    font-size: 20px;
    padding-bottom: 1.5%;
  }
  h5:after {
    content: "";
    display: block;
    width: 4%;
    padding-top: 3px;
    border-bottom: 2px solid #f21131;
  }
  p {
    font-weight: bold;
    font-size: 15px;
    padding-bottom: 1%;
    max-width: 50%;
  }
`;

const StyledButton = styled(Button)`
  text-decoration: none;
  color: #ffffff;
  background-color: ${(props) => (props.green ? "#008000" : "#f21131")};
  border: none;
  font-size: 25px;
  font-weight: bold;
  padding: 0.5% 2% 0.5% 2%;
  &:focus,
  &:active,
  &:disabled {
    text-decoration: none;
    color: #ffffff;
    background-color: ${(props) => (props.green ? "#7FBF7F" : "#f88898")};
    border: none;
  }
  &:hover {
    text-decoration: none;
    color: #ffffff;
    background-color: ${(props) => (props.green ? "#004C00" : "#600613")};
    border: none;
  }
`;

const ApplicantView = ({ firebase }) => {
  const [settings, setSettings] = useState({});
  const [application, setApplication] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadedApplication, setLoadedApplication] = useState(false);
  const [loadedSettings, setLoadedSettings] = useState(false);
  const [error, setError] = useState(null);

  const authUser = useContext(AuthUserContext);

  useEffect(() => {
    if (firebase && !!authUser) {
      const settingsUnsub = firebase
        .generalSettings()
        .onSnapshot((docSnapshot) => {
          if (docSnapshot.exists) setSettings(docSnapshot.data());
          else setError("No Settings!");
          setLoadedSettings(true);
        });

      const applicationUnsub = firebase
        .application(authUser.uid)
        .onSnapshot((docSnapshot) => {
          if (docSnapshot.exists) {
            setApplication(docSnapshot.data());
          } else setError("No Application!");
          setLoadedApplication(true);
        });

      return () => {
        settingsUnsub();
        applicationUnsub();
      };
    }
  }, [firebase, authUser]);

  useEffect(() => {
    if (loadedSettings && loadedApplication) setLoading(false);
  }, [loadedApplication, loadedSettings]);

  if (error) return <Error error={error} />;
  if (loading) return <Loader />;

  const confirm = async () => {
    const roles = cloneDeep(authUser.roles);
    delete roles.nonmember;
    if (
      settings.useTwoRoundDeliberations &&
      !authUser.roles.provisionalMember
    ) {
      roles.provisionalMember = true;

      await firebase.user(authUser.uid).update({ roles });
      await firebase
        .application(authUser.uid)
        .update({ "deliberation.confirmed": true });
    } else {
      delete roles.provisionalMember;
      delete roles.applicant;
      roles.upemember = true;

      const gradYear = application.responses.find((r) => r.id === 5).value;

      await firebase.user(authUser.uid).update({ roles, gradYear });
      await firebase.application(authUser.uid).delete();

      // TODO: make this welcome actually pretty
      await swal(
        "You're in!",
        "Welcome to Upsilon Pi Epsilon at Boston University",
        "success"
      );
      navigate("/");
    }
  };

  const submitData = async (formData) => {
    if (formData.file === null) return;

    const data = {
      profileIMG: formData.profileIMG,
      socials: {
        facebook: formData.facebook,
        github: formData.github,
        linkedin: formData.linkedin,
        twitter: formData.twitter,
      },
    };

    // TODO: refactor along with image url change (keep all user data in storage/userData/UID/)
    await firebase
      .uploadProfile("Provisional", formData.profileIMG)
      .put(formData.file)
      .catch((error) => {
        setError(error);
      });

    await firebase
      .user(authUser.uid)
      .update(data)
      .catch((error) => {
        setError(error);
      });

    await swal("All set!", "We got your info!", "success");
    navigate("/");
  };

  // Hasn't applied yet
  if (!authUser.roles.applicant)
    return (
      <TextDisplay
        name={"Deliberation Results"}
        text={"You have yet to apply this Semester."}
        displayBack={true}
      />
    );

  // Hasn't interviewed yet
  if (!application.interview.interviewed)
    return (
      <TextDisplay
        name={"Deliberation Results"}
        text={
          "You must complete your interview before getting any deliberation results."
        }
        displayBack={true}
      />
    );

  // Deliberations are incomplete or feedback hasn't been given
  if (
    settings.deliberationsOpen ||
    (!application.deliberation.accepted &&
      application.deliberation.feedback === "")
  )
    // TODO: make this centered, prettier
    return (
      <TextDisplay
        name={"Deliberation Results"}
        text={"Deliberations are still underway."}
        displayBack={true}
      />
    );

  // Denied but waiting for emails to go out
  if (
    !application.deliberation.accepted &&
    application.deliberation.feedback !== ""
  )
    return (
      <TextDisplay
        name={"Deliberation Results"}
        text={"Keep an eye on your inbox for an update on your deliberation!"}
        displayBack={true}
      />
    );

  // Theyre accepted and need to confirm
  // TODO: get eboard to fix the wording
  if (!application.deliberation.confirmed) {
    const ResultText = () =>
      settings.useTwoRoundDeliberations && !authUser.roles.provisionalMember ? (
        <>
          <h3>You have been provisionally accepted into UPE!</h3>
          <p>
            We are pleased to extend to you provisional membership to UPE. This
            means that you are now on the way to becoming a fully fledged member
            of our group. Now you must go through the provisional period
            requirements as described in the info sessions. If you'd like to
            accept this and start your onboarding period, please click the
            button below to confirm.
          </p>
        </>
      ) : (
        <>
          <h3>You have been officially accepted into UPE!</h3>
          <p>
            We are pleased to announce that you have been officially accepted
            into UPE. In order for us to complete this process, we require that
            you confirm your acceptance by clicking below.
          </p>
        </>
      );

    return (
      <>
        <BackIcon />
        <Title>
          <h1> Deliberation Results </h1>
        </Title>
        <Text>
          <ResultText />
          <StyledButton onClick={confirm}>Confirm</StyledButton>
        </Text>
      </>
    );
  }

  // make this pretty
  if (authUser.profileIMG !== "")
    return (
      <TextDisplay
        name={"Deliberation Results"}
        text={"You're all set!"}
        displayBack={true}
      />
    );

  return (
    <>
      <BackIcon />
      <Title>
        <h1> Deliberation Results </h1>
      </Title>
      <Text>
        <h2>Next Steps</h2>
        <p>
          Now that you've accepted to join UPE, you will continue on with the
          onboarding period, during this time, and has mentioned during the Info
          Sessions, you will be required to attend chapter, meet current
          members, and contribute in some way to UPE. Further details about this
          will be given to you shortly by our Recruitment Team.
        </p>
        <p>
          For the time being however, we ask that you fill out the form bellow,
          so that once onboarding is over, we can induct you and add you to our
          database & website in a timely manner.
        </p>
        <br />
        <h2> Data Form </h2>
        <DataForm
          submitFunction={submitData}
          firstName={authUser.name.split(" ")[0]}
        />
      </Text>
    </>
  );
};

const DataForm = ({ submitFunction, firstName }) => {
  const [formData, setFormData] = useState({
    file: null,
    profileIMG: "",
    twitter: "",
    facebook: "",
    github: "",
    linkedin: "",
  });
  const [validated, setValidated] = useState(false);

  const setFileValidity = (fileUpload) => {
    if (fileUpload.files.length === 0) {
      fileUpload.setCustomValidity("You must upload a file!");
      swal("Uh oh!", "You must upload a file!", "error");
    } else if (fileUpload.files.length > 1) {
      fileUpload.setCustomValidity("You can only upload 1 file!");
      swal("Uh oh!", "You can only upload 1 file!", "error");
    } else if (fileUpload.files[0].size > 1048576 * 5) {
      fileUpload.setCustomValidity("Max file size is 5MB!");
      fileUpload.value = "";
      swal("Uh oh!", "Max file size is 5MB!", "error");
    } else {
      fileUpload.setCustomValidity("");
    }
  };

  const saveData = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fileUploads = Array.from(form.querySelectorAll(".form-control-file"));
    fileUploads.forEach((fileUpload) => setFileValidity(fileUpload));
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      swal(
        "Missing photo!",
        "Please provide a headshot for your profile photo of size less than 5MB.",
        "error"
      );
    } else {
      submitFunction(cloneDeep(formData));
      setValidated(false);
    }
  };

  const updateField = (e) =>
    setFormData(
      update(formData, {
        [e.target.name]: { $set: e.target.value },
      })
    );

  const updateImage = (e) => {
    const hasIMG = e.target.files.length === 1;
    let fileName = "";
    // TODO: Needs refactor after website
    if (hasIMG) {
      if (e.target.files[0].type.split("/")[1] === "jpeg")
        fileName = firstName + ".jpg";
      else fileName = firstName + ".png";
    } else return;

    setFormData(
      update(formData, {
        file: { $set: hasIMG ? e.target.files[0] : "" },
        profileIMG: {
          $set: fileName,
        },
      })
    );
  };

  // TODO: Look into custom form issue
  return (
    <Text>
      <Form noValidate validated={validated} onSubmit={saveData}>
        <Form.Row>
          <Form.Group>
            <Form.Label>
              <h5>
                Profile Image <RequiredAsterisk />
              </h5>
            </Form.Label>
            <Form.File
              name="profileIMG"
              accept=".png,.jpg"
              onChange={updateImage}
              required
            />
          </Form.Group>
        </Form.Row>

        <Form.Row>
          <Form.Group>
            <Form.Label>
              <h5>Twitter</h5>
            </Form.Label>
            <Form.Control
              name="twitter"
              type="url"
              placeholder="https://twitter.com/..."
              value={formData.twitter}
              onChange={updateField}
            />
          </Form.Group>
        </Form.Row>

        <Form.Row>
          <Form.Group>
            <Form.Label>
              <h5>
                Github <RequiredAsterisk />
              </h5>
            </Form.Label>
            <Form.Control
              name="github"
              type="url"
              placeholder="https://github.com/..."
              value={formData.github}
              onChange={updateField}
              required
            />
          </Form.Group>
        </Form.Row>

        <Form.Row>
          <Form.Group>
            <Form.Label>
              <h5>Facebook</h5>
            </Form.Label>
            <Form.Control
              name="facebook"
              type="url"
              placeholder="https://facebook.com/..."
              value={formData.facebook}
              onChange={updateField}
            />
          </Form.Group>
        </Form.Row>

        <Form.Row>
          <Form.Group>
            <Form.Label>
              <h5>
                Linkedin <RequiredAsterisk />
              </h5>
            </Form.Label>
            <Form.Control
              name="linkedin"
              type="url"
              placeholder="https://linkedin.com/..."
              value={formData.linkedin}
              onChange={updateField}
              required
            />
          </Form.Group>
        </Form.Row>

        <StyledButton type="submit">Submit</StyledButton>
      </Form>
    </Text>
  );
};

export default compose(
  withAuthorization(isApplicant),
  withFirebase
)(ApplicantView);
