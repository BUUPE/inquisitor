import React, { useState, useEffect, useContext } from "react";
import { compose } from "recompose";
import cloneDeep from "lodash.clonedeep";
import { Link } from "gatsby";
import update from "immutability-helper";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { isApplicant } from "../../util/conditions";
import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";

import { Container } from "../../styles/global";
import Loader from "../Loader";
import Error from "../Error";

const ApplicantView = ({ firebase }) => {
  const [settings, setSettings] = useState({});
  const [application, setApplication] = useState({});
  const [submittedForm, setSubmittedForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadedApp, setLoadedApp] = useState(false);
  const [loadedSettings, setLoadedSettings] = useState(false);
  const [error, setError] = useState(null);

  const authUser = useContext(AuthUserContext);

  useEffect(() => {
    if (firebase && !!authUser.inquisitor.application) {
      const settingsUnsub = firebase
        .generalSettings()
        .onSnapshot((docSnapshot) => {
          if (docSnapshot.exists) setSettings(docSnapshot.data());
          else setError("No Settings!");
          setLoadedSettings(true);
        });

      const applicationUnsub = firebase
        .application(authUser.inquisitor.application)
        .onSnapshot((docSnapshot) => {
          if (docSnapshot.exists) {
            setApplication(docSnapshot.data());
            setSubmittedForm(docSnapshot.data().deliberation.submittedForm);
          } else setError("No Application!");
          setLoadedApp(true);
        });

      return () => {
        settingsUnsub();
        applicationUnsub();
      };
    }
  }, [firebase, authUser]);

  console.log(submittedForm);

  useEffect(() => {
    if (loadedSettings && loadedApp) setLoading(false);
  }, [loadedApp, loadedSettings]);

  const accept = (round) => {
    if (!firebase) return;

    if (round === "1") {
      firebase
        .application(authUser.inquisitor.application)
        .set({ deliberation: { applicantAccepted: true } }, { merge: true })
        .then(() => {
          console.log("Successfully updated Data");
        })
        .catch((err) => {
          console.log(err);
          setError(err);
        });
    } else if (round === "2") {
      firebase
        .application(authUser.inquisitor.application)
        .set(
          { deliberation: { secondRound: { applicantAccepted: true } } },
          { merge: true }
        )
        .then(() => {
          firebase
            .editUser(authUser.uid, {
              roles: {
                provisionalMember: false,
                applicant: false,
                upemember: true,
              },
            })
            .then(() => {
              console.log("Successfully updated Data");
            })
            .catch((err) => {
              console.log(err);
              setError(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setError("Invalid round!");
    }
  };

  const submitData = (formData) => {
    const data = {
      gradYear: application.responses[4],
      profileIMG: formData.profileIMG,
      socials: {
        facebook: formData.facebook,
        github: formData.github,
        linkedin: formData.linkedin,
        twitter: formData.twitter,
      },
      roles: {
        nonMember: false,
        provisionalMember: true && settings.secondDeliberationRound,
        upemember: !settings.secondDeliberationRound,
        applicant: settings.secondDeliberationRound,
      },
    };

    if (formData.file !== null) {
      var uploadTask = firebase
        .uploadImage("Provisional", formData.profileIMG)
        .put(formData.file);

      uploadTask.on(
        "state_changed",
        function (snapshot) {
          var progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        function (error) {
          console.log(error);
          setError(error);
        },
        function () {
          console.log("Upload Successful!");
        }
      );
    }

    firebase
      .editUser(authUser.uid, data)
      .then(() => {
        console.log("Edited Data");
        firebase
          .application(authUser.inquisitor.application)
          .set({ deliberation: { submittedForm: true } }, { merge: true })
          .then(() => {
            setSubmittedForm(true);
          })
          .catch((err) => {
            setError(err);
          });
      })
      .catch((error) => {
        setError(error);
      });
  };

  if (loading) return <Loader />;
  if (error) return <Error error={error} />;

  if (!authUser.inquisitor.applied)
    return (
      <Container flexdirection="column">
        <h1>You have not yet applied this semester.</h1>
        <Link to="/apply">
          <Button>Apply!</Button>
        </Link>
      </Container>
    );

  if (!settings.deliberationOpen)
    return (
      <Container flexdirection="column">
        <h1>Deliberations are closed!</h1>
      </Container>
    );

  const secondRoundStatus =
    settings.deliberationsComplete &&
    settings.secondDeliberationRound &&
    application.deliberation.acceptedUPE &&
    authUser.roles.provisionalMember;

  if (
    !application.deliberation.complete ||
    (secondRoundStatus && !application.deliberation.secondRound.complete)
  )
    return (
      <Container flexdirection="column">
        <h1>Deliberations are not yet complete!</h1>
      </Container>
    );

  if (
    !application.deliberation.acceptedUPE ||
    (secondRoundStatus && !application.deliberation.secondRound.acceptedUPE)
  ) {
    return (
      <Container flexdirection="column">
        <h1>You have been emailed your results.</h1>
      </Container>
    );
  }

  if (secondRoundStatus) {
    if (application.deliberation.secondRound.applicantAccepted) {
      return (
        <Container flexdirection="column">
          <div>
            <h1>Next Steps</h1>
            <p>
              Now that the onboarding period is complete, you will soon be
              contacted by our E-Board with specifics about this semester's
              induction.
            </p>
            <br />
            <h2>WARNING</h2>
            <p>
              Upon reloading this page you will lose access to it, do not worry
              about it, it's by design as you are no longer an applicant!
            </p>
          </div>
        </Container>
      );
    } else {
      return (
        <Container flexdirection="column">
          <div>
            <h1>Your Deliberation</h1>
          </div>
          <br />
          <div>
            <h2>You have been officially accepted into UPE!</h2>
            <br />
            <p>
              We are pleased to announce that you have made it passed the
              provisional period, and have been officially accepted into UPE. In
              order for us to complete this process, we require that you confirm
              your acceptance by clicking bellow.
            </p>
            <Button onClick={() => accept("2")}>Accept</Button>
          </div>
        </Container>
      );
    }
  }

  if (application.deliberation.applicantAccepted)
    return (
      <Container flexdirection="column">
        <div>
          <h1>Next Steps</h1>
          <p>
            Now that you've accepted to join UPE, you will continue on with the
            onboarding period, during this time, and has mentioned during the
            Info Sessions, you will be required to attend chapter, meet current
            members, and contribute in some way to UPE. Further details about
            this will be given to you shortly by our Recruitment Team.
          </p>
          <p>
            For the time being however, we ask that you fill out the form
            bellow, so that once onboarding is over, we can induct you and add
            you to our database & website.
          </p>
        </div>
        <br />
        <h2> Data Form </h2>
        <DataForm
          firebase={firebase}
          submitFunction={submitData}
          submittedForm={submittedForm}
          application={application}
          initialFormData={{
            file: null,
            profileIMG: "",
            twitter: "",
            facebook: "",
            github: "",
            linkedin: "",
          }}
        />
      </Container>
    );

  return (
    <Container flexdirection="column">
      <div>
        <h1>Your Deliberation</h1>
      </div>
      <br />
      <div>
        <h2>You have been accepted into UPE!</h2>
        <br />
        <p>
          We are pleased to announce that you have been accepted to the latest
          class of UPE's chapter at BU. If you'd like to accept this, and
          proceed to start your onboarding period, please click the button
          bellow to continue
        </p>
        <Button onClick={() => accept("1")}>Accept</Button>
      </div>
    </Container>
  );
};

const DataForm = ({
  submitFunction,
  application,
  initialFormData,
  submittedForm,
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [validated, setValidated] = useState(false);

  const saveData = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
    } else {
      submitFunction(cloneDeep(formData));
      setValidated(false);
    }
  };

  if (submittedForm) {
    return (
      <Container flexdirection="column">
        <h5> Form Submitted </h5>
      </Container>
    );
  }

  const updateField = (e) =>
    setFormData(
      update(formData, {
        [e.target.name]: { $set: e.target.value },
      })
    );

  const updateImage = (e) => {
    const hasIMG = e.target.files.length === 1;
    let im = "";
    if (hasIMG) {
      if (formData.file.type.split("/")[1] === "jpeg")
        im = application.applicant.name.split(" ")[0] + ".jpg";
      else im = application.applicant.name.split(" ")[0] + ".png";
    }

    setFormData(
      update(formData, {
        file: { $set: hasIMG ? e.target.files[0] : "" },
        profileIMG: {
          $set: im,
        },
      })
    );
  };

  return (
    <Container flexdirection="column">
      <Form noValidate validated={validated} onSubmit={saveData}>
        <Form.Row style={{ width: "100%" }} key={0}>
          <Form.Group controlId={0} style={{ width: "100%" }}>
            <Form.Label>
              <h5> Profile Image </h5>
            </Form.Label>
            <Form.File
              name="file"
              accept=".png,.jpg"
              onChange={updateImage}
              required
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
              value={formData.twitter}
              onChange={updateField}
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
              value={formData.github}
              onChange={updateField}
              required
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
              value={formData.facebook}
              onChange={updateField}
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
              value={formData.linkedin}
              onChange={updateField}
              required
            />
          </Form.Group>
        </Form.Row>

        <Button type="submit">Submit</Button>
      </Form>
    </Container>
  );
};

export default compose(
  withAuthorization(isApplicant),
  withFirebase
)(ApplicantView);
