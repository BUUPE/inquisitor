import React, { useContext, useEffect, useState } from "react";
import { compose } from "recompose";

import { withSettings } from "../components/API/SettingsContext";
import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";

import SEO from "../components/SEO";
import Loader from "../components/Loader";
import TextDisplay from "../components/TextDisplay";
import { isLoggedIn } from "../util/conditions";

const IndexPage = ({ firebase }) => {
  const [event, setEvent] = useState(null);
  const [code, setCode] = useState("");
  const [success, setSuccess] = useState(true);
  const [loading, setLoading] = useState(false);
  const authUser = useContext(AuthUserContext);

  useEffect(() => {
    setLoading(true);
    const codeTwo = new URL(window.location.href).searchParams.get("code");
    if (firebase && codeTwo !== "") {
      firebase
        .recruitmentEvent(codeTwo)
        .get()
        .then((doc) => {
          if (doc.exists) {
            setEvent({ ...doc.data(), uid: doc.id });
            setCode(codeTwo);
          } else {
            setCode(codeTwo);
            setLoading(false);
          }
        })
        .catch((error) => {
          console.log("Error in loading event!");
          setLoading(false);
        });
    }
  }, [firebase]);

  useEffect(() => {
    if (firebase && !!event && authUser) {
      try {
        firebase.firestore.runTransaction(async (transaction) => {
          const ref = firebase.recruitmentEvent(event.uid);
          const doc = await transaction.get(ref);
          if (doc.exists) {
            // eslint-disable-next-line no-unused-vars
            const otherEvent = { ...doc.data() };
            const updateObject = {};
            if (authUser.roles.upemember) {
              updateObject[`upeAttendance.${authUser.uid}`] = authUser.name;
            } else {
              updateObject[`attendance.${authUser.uid}`] = authUser.name;
            }
            transaction.update(ref, updateObject);
            setSuccess(true);
          }
          setLoading(false);
        });
      } catch (e) {
        console.error("Transaction failure!", e);
        setLoading(false);
      }
    }
  }, [event, firebase, authUser]);

  if (loading) return <Loader />;

  if (!authUser)
    return (
      <TextDisplay
        name={"Events"}
        text={
          "You seem to have entered this page without logging in, please wait while we authenticate you so you can continue onwards!"
        }
        displayBack={true}
      />
    );

  const Content = () => {
    if (!!!code) {
      return (
        <TextDisplay
          name={"Events"}
          text={
            "You seem to have entered this page without a proper Event Link! Please return return back to the Home Page by clicking above!"
          }
          displayBack={true}
        />
      );
    }

    if (!!event) {
      if (success)
        return (
          <TextDisplay
            name={"Events"}
            text={`You successfully checked-in for ${event.title}! Thank you so much for attending!`}
            displayBack={true}
          />
        );
      else
        return (
          <TextDisplay
            name={"Events"}
            text={`You were unsuccessful in checking-in for ${event.title}! Please reach out to a member of EBoard!`}
            displayBack={true}
          />
        );
    } else
      return (
        <TextDisplay
          name={"Events"}
          text={`Unable to fetch the proper event to check-in! Please reach out to a member of EBoard!`}
          displayBack={true}
        />
      );
  };

  return (
    <>
      <SEO title="Events" route="/events" />
      <Content />
      <br />
      <br />
    </>
  );
};

export default compose(
  withSettings,
  withAuthorization(isLoggedIn),
  withFirebase
)(IndexPage);
