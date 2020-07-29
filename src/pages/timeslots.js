import React, { useEffect, useState, useContext } from "react";
import { compose } from "recompose";

import Row from "react-bootstrap/Row";

import {
  AuthUserContext,
  withAuthorization,
  isLoggedIn,
} from "../components/Session";
import { withFirebase } from "../components/Firebase";
import Layout from "../components/Layout";
import Loader from "../components/Loader";
import ScheduleColumn from "../components/ScheduleColumn";
import { Container } from "../styles/global";

const Timeslots = ({ firebase }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authUser = useContext(AuthUserContext);

  useEffect(() => {
    const loadSettings = async () => {
      const doc = await firebase.generalSettings().get();

      if (!doc.exists) {
        setError("Failed to load timeslots!");
      } else {
        const settings = doc.data();
        settings.timeslotDays = settings.timeslotDays.map((day) =>
          day.toDate()
        );
        setSettings(settings);
      }
      setLoading(false);
    };

    if (firebase) loadSettings();
  }, [firebase]);

  if (loading) return <Loader />;
  if (error)
    return (
      <Container flexdirection="column">
        <h1>{error}</h1>
      </Container>
    );

  const {
    timeslotsOpen,
    timeslotsOpenForApplicants,
    timeslotLength,
    timeslotDays,
  } = settings;

  if (!timeslotsOpen)
    return (
      <Container flexdirection="column">
        <h1>Timeslot selection is closed!</h1>
      </Container>
    );

  if (authUser.roles.applicant && !timeslotsOpenForApplicants)
    return (
      <Container flexdirection="column">
        <h1>Timeslot selection isn't open yet!</h1>
      </Container>
    );

  {
    /* use data listener to reload whenever someone picks a slot */
  }
  return (
    <Container flexdirection="column">
      <h1>Select Timeslots</h1>
      <Row>
        {timeslotDays.map((date, i) => (
          <ScheduleColumn key={i} date={date} timeslotLength={timeslotLength} />
        ))}
      </Row>
    </Container>
  );
};

const AuthorizedTimeslots = compose(
  withAuthorization(isLoggedIn),
  withFirebase
)(Timeslots);

export default ({ location }) => (
  <Layout>
    <AuthorizedTimeslots location={location} />
  </Layout>
);
