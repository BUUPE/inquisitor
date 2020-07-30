import React, { useEffect, useState, useContext, useRef } from "react";
import { compose } from "recompose";

import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Toast from "react-bootstrap/Toast";

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
  const [showToast, setShowToast] = useState(false);
  const [selectedTimeslots, setSelectedTimeslots] = useState({});
  const authUser = useContext(AuthUserContext);
  const slider = useRef(null);

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

    if (firebase) {
      loadSettings();
      const unsub = firebase.timeslots().onSnapshot((querySnapshot) => {
        // whenever /data/timeslots changes, merge changes with our state
        const timeslots = { ...selectedTimeslots };
        const listenerData = querySnapshot.docs.map((doc) => {
          return {
            ...doc.data(),
            time: doc.data().time.toDate(), // make sure to convert timestamp objects to Date objects
          };
        });

        listenerData.forEach((ts) => {
          const key = ts.time.toDateString();
          if (timeslots.hasOwnProperty(key)) {
            timeslots[key].push(ts);
          } else {
            timeslots[key] = [ts];
          }
        });

        setSelectedTimeslots(timeslots);
      }, console.error);

      return () => unsub();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  let isDown = false;
  let startX;
  let scrollLeft;

  const handleMouseDown = (e) => {
    isDown = true;
    startX = e.pageX - slider.current.offsetLeft;
    scrollLeft = slider.current.scrollLeft;
  };
  const handleMouseUp = (e) => {
    isDown = false;
  };
  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.current.offsetLeft;
    const walk = (x - startX) * 3; //scroll-fast
    slider.current.scrollLeft = scrollLeft - walk;
  };
  const handleMouseLeave = (e) => {
    isDown = false;
  };

  const saveTimeslots = async () => {
    // these are firestore documents
    /*const existingTimeslots = await firebase
      .timeslots()
      .get()
      .then((snapshot) =>
        snapshot.docs.map((doc) => {
          return {
            ...doc.data(),
            time: doc.data().time.toDate(),
            id: doc.id,
          };
        })
      );

    // these are just date objects
    const newTimeslots = Object.values(selectedTimeslots).flat();
    const newTimeslotMap = {};
    newTimeslots.forEach((date, i) => (newTimeslotMap[date] = i));

    // first remove timeslots the user no longer is in
    existingTimeslots
      .filter((ts) =>
        // filter for timeslots this user is a part of
        ts.interviewers.hasOwnProperty(authUser.uid)
      )
      .forEach((ts, i) => {
        // if old timeslot is no longer selected, remove interviewer from it
        if (!newTimeslotMap.hasOwnProperty(ts.time)) {
          const doc = this[i];
          const { id } = doc;
          delete doc.id;
          delete doc.interviewers[authUser.uid];
          firebase.timeslot(id).update(doc);
          // TODO: notify admins if an timeslot with an applicant loses interviewers
        }
      }, existingTimeslots);

    // helper function that does for each and waits
    const asyncForEach = async (array, callback) => {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    };

    // TODO: filter out ones they are already in
    // iterate over newly selected timeslots
    await asyncForEach(newTimeslots, async (ts) => {
      // get existing timeslots that match current timeslot time
      const matchingTimeslots = existingTimeslots.filter(
        (ets) => ets.time.getTime() === ts.getTime()
      );

      let wroteToDb = false;
      await asyncForEach(matchingTimeslots, async (mts) => {
        try {
          // run inside transaction in case others are concurrently editing
          await firebase.firestoreRoot.runTransaction(async (t) => {
            if (wroteToDb) return;
            const doc = await t.get(firebase.timeslot(mts.id));
            const newDoc = { ...doc.data() };
            if (Object.keys(newDoc.interviewers).length < 2) {
              newDoc.interviewers[authUser.uid] = true;
              t.update(firebase.timeslot(mts.id), newDoc);
              wroteToDb = true;
            }
          });
        } catch (e) {
          console.error("Transaction failure!", e);
        }
      });

      if (!wroteToDb) {
        // if none, create a new timeslot object and add it to existing timeslots
        const interviewers = {};
        interviewers[authUser.uid] = true;
        firebase.timeslots().add({
          time: ts,
          interviewers,
          timeslotLength: settings.timeslotLength,
        });
      }
    });

    setShowToast(true);*/
  };

  const unselectTimeslot = (date) => {
    const day = date.toDateString();
    const newTimeslots = { ...selectedTimeslots };

    // first remove this user from list of interviewers in relevant timeslot
    newTimeslots[day] = newTimeslots[day].map((ts) => {
      if (
        ts.interviewers.hasOwnProperty(authUser.uid) &&
        ts.time.getTime() === date.getTime()
      )
        delete ts.interviewers[authUser.uid];
      return ts;
    });

    // filter out timeslots with no interviewers or applicants
    newTimeslots[day] = newTimeslots[day].filter(
      (ts) =>
        Object.keys(ts.interviewers).length > 0 ||
        ts.hasOwnProperty("applicant")
    );
    setSelectedTimeslots(newTimeslots);
  };

  const selectTimeslot = (date) => {
    const day = date.toDateString();
    const newTimeslots = { ...selectedTimeslots };

    // iterate over timeslots interviewer is not in and add interviewer if possible
    let saved = false;
    newTimeslots[day]
      .filter((ts) => !ts.interviewers.hasOwnProperty(authUser.uid))
      .some((ts) => {
        if (
          ts.time.getTime() === date.getTime() &&
          Object.keys(ts.interviewers).length < 2
        ) {
          ts.interviewers[authUser.uid] = authUser.name;
          saved = true;
        }
        return saved;
      });

    // if interviewer hasn't been added yet, push a new timeslot
    if (!saved) {
      const interviewers = {};
      interviewers[authUser.uid] = authUser.name;
      newTimeslots[day].push({
        time: date,
        interviewers,
        timeslotLength: settings.timeslotLength,
      });
    }
    setSelectedTimeslots(newTimeslots);
  };

  const timeslotsToSlots = (timeslots) => {
    const startHour = 8; // make this configurable
    const slots = {};
    timeslots.forEach((ts) => {
      const slot = (ts.time.getHours() - startHour) * 60 + ts.time.getMinutes();
      const end = slot + timeslotLength - 15;
      for (let pos = slot; pos <= end; pos += 15) {
        slots[pos] = [slot, end];
      }
    });
    return slots;
  };

  return (
    <Container flexdirection="column">
      <h1>Interviewer Timeslot Selection</h1>
      <Row
        style={{
          flexWrap: "unset",
          overflowX: "auto",
          justifyContent: "flex-start",
        }}
        ref={slider}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {timeslotDays.map((date, i) => {
          // TODO: explain this data structure in depth
          // selectedSlots is an object/hashmap for performance reasons
          const timeslotsForDay = selectedTimeslots[date.toDateString()];
          const userSelectedSlots = timeslotsForDay
            ? timeslotsToSlots(
                timeslotsForDay.filter((ts) =>
                  ts.interviewers.hasOwnProperty(authUser.uid)
                )
              )
            : {};
          const slotsWithOpening = timeslotsForDay
            ? timeslotsToSlots(
                timeslotsForDay.filter(
                  (ts) =>
                    !ts.interviewers.hasOwnProperty(authUser.uid) &&
                    Object.keys(ts.interviewers).length < 2
                )
              )
            : {};
          return (
            <ScheduleColumn
              key={i}
              date={date}
              timeslotLength={timeslotLength}
              userSelectedSlots={userSelectedSlots}
              slotsWithOpening={slotsWithOpening}
              selectTimeslot={selectTimeslot}
              unselectTimeslot={unselectTimeslot}
            />
          );
        })}
      </Row>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Button
          style={{ width: "fit-content", marginTop: 20, marginBottom: 20 }}
          onClick={saveTimeslots}
        >
          Save Selections
        </Button>
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          style={{
            width: "fit-content",
            height: "fit-content",
            marginLeft: 25,
          }}
        >
          <Toast.Header>
            <strong className="mr-auto">Selections Saved!</strong>
          </Toast.Header>
        </Toast>
      </div>
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
