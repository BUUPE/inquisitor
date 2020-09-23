import React, { useEffect, useContext, useState } from "react";
import { compose } from "recompose";
import styled from "styled-components";
import swal from "@sweetalert/with-react";
import cloneDeep from "lodash.clonedeep";

import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";

import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";

import ScrollableRow from "./ScrollableRow";
import Loader from "../Loader";
import { Container } from "../../styles/global";
import { isApplicant } from "../../util/conditions";
import { formatTime } from "../../util/helper";

const TimeslotCard = styled(Card)`
  width: 18rem;
  margin: 10px;
  cursor: pointer;
  background: ${(props) => (props.selected ? "#87fb87" : "white")};

  &:hover {
    background: ${(props) => (props.selected ? "#fb8787" : "#87fb87")};
  }
`;

const ApplicantView = ({ firebase }) => {
  const authUser = useContext(AuthUserContext);
  const [timeslots, setTimeslots] = useState({});
  const [selectedTimeslot, setSelectedTimeslot] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(
    () => {
      if (firebase) {
        const unsub = firebase.timeslots().onSnapshot((querySnapshot) => {
          const listenerData = querySnapshot.docs
            .map((doc) => {
              return {
                ...doc.data(),
                time: doc.data().time.toDate(), // make sure to convert timestamp objects to Date objects
                id: doc.id,
              };
            })
            .filter(
              (ts) =>
                ts?.applicant?.uid === authUser.uid ||
                (!ts.hasOwnProperty("applicant") &&
                  Object.keys(ts.interviewers).length > 0)
            ); // filter out ones that already have an applicant that isn't current user

          setSelectedTimeslot(
            listenerData.find((ts) => ts?.applicant?.uid === authUser.uid) || {}
          );

          // add new data from listener
          listenerData.forEach((ts) => {
            const day = ts.time.toDateString();

            // if data for day exists, add to it, otherwise create new field
            if (timeslots.hasOwnProperty(day)) {
              const index = timeslots[day].findIndex(
                (timeslot) => timeslot.id === ts.id // check if existing timeslot matches the update (ts)
              );

              // if timeslot exists, update the value, otherwise push it
              if (index > -1) {
                timeslots[day][index] = ts;
              } else {
                timeslots[day].push(ts);
              }
            } else {
              timeslots[day] = [ts];
            }
          });

          // remove timeslots that no longer exist
          const validIds = listenerData.map((ts) => ts.id);
          for (const day in timeslots)
            timeslots[day] = timeslots[day].filter((ts) =>
              validIds.includes(ts.id)
            );

          setTimeslots(cloneDeep(timeslots));
        }, console.error);
        setLoading(false);

        return () => unsub();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [firebase]
  );

  if (error)
    return (
      <Container flexdirection="column">
        <h1>{error}</h1>
      </Container>
    );

  if (loading) return <Loader />;

  const TimeslotColumn = ({ date, slots }) => {
    const selectTimeslot = async (timeslot) => {
      const timeslotId = timeslot.id;
      let action = "schedule";

      // TODO: add firebase rules to ensure that applicants dont change other peoples data
      try {
        await firebase.firestore.runTransaction(async (transaction) => {
          if (
            Object.keys(selectedTimeslot).length === 0 &&
            selectedTimeslot.constructor === Object
          ) {
            const ref = firebase.timeslot(timeslotId);
            const doc = await transaction.get(ref);
            const timeslot = { ...doc.data() };
            if (timeslot.hasOwnProperty("applicant"))
              throw new Error("Applicant already exists!");
            timeslot.applicant = {
              name: authUser.name,
              uid: authUser.uid,
            };
            transaction.update(ref, timeslot);
            setSelectedTimeslot({ ...timeslot, id: doc.id });
          } else {
            if (timeslotId === selectedTimeslot.id) {
              const ref = firebase.timeslot(timeslotId);
              const doc = await transaction.get(ref);
              const timeslot = { ...doc.data() };
              if (timeslot.applicant?.uid !== authUser.uid)
                throw new Error("Timeslot owned by other applicant!");
              delete timeslot.applicant;
              transaction.set(ref, timeslot);
              setSelectedTimeslot({});
              action = "unschedule";
            } else {
              const oldRef = firebase.timeslot(selectedTimeslot.id);
              const oldDoc = await transaction.get(oldRef);
              const oldTimeslot = { ...oldDoc.data() };
              if (oldTimeslot.applicant?.uid !== authUser.uid)
                throw new Error("Timeslot owned by other applicant!");
              delete oldTimeslot.applicant;

              const newRef = firebase.timeslot(timeslotId);
              const newDoc = await transaction.get(newRef);
              const newTimeslot = { ...newDoc.data() };
              if (newTimeslot.hasOwnProperty("applicant"))
                throw new Error("Applicant already exists!");
              newTimeslot.applicant = {
                name: authUser.name,
                uid: authUser.uid,
              };

              transaction.set(oldRef, oldTimeslot);
              transaction.update(newRef, newTimeslot);
              setSelectedTimeslot({ ...newTimeslot, id: newDoc.id });
            }
          }
        });
      } catch (e) {
        console.error("Transaction failure!", e);
        swal(
          "Uh oh!",
          "Something went wrong with saving your selections! Please refresh the page and try again!",
          "error"
        );
      }

      if (action === "schedule") {
        swal({
          title: "You're all set!",
          content: (
            <span>
              Your interview is scheduled for{" "}
              <strong>
                {formatTime(timeslot.time)}, {timeslot.time.toDateString()}
              </strong>
              ! A confirmation has also been sent to your email.
            </span>
          ),
          icon: "success",
        });
      } else if (action === "unschedule") {
        swal(
          "Unscheduled!",
          `You have unscheduled your interview, and a confirmation has been sent to your email. If you'd still like to interview with UPE, make sure to select another timeslot!`,
          "success"
        );
      }
      // TODO send email
    };

    return (
      <Col style={{ width: 300, flex: "none" }}>
        <h1>{date}</h1>

        {slots
          .sort((a, b) => {
            if (a.time.getTime() === b.time.getTime())
              return a.id > b.id ? 1 : -1;
            else return a.time > b.time ? 1 : -1;
          })
          .map((slot) => (
            <TimeslotCard
              key={slot.id}
              onClick={() => selectTimeslot(slot)}
              selected={slot.id === selectedTimeslot.id}
            >
              <Card.Body>
                <Card.Title>{formatTime(slot.time)}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {Object.values(slot.interviewers).join(", ")}
                </Card.Subtitle>
                <Card.Subtitle className="mb-2 text-muted">
                  {slot.timeslotLength} mins
                </Card.Subtitle>
              </Card.Body>
            </TimeslotCard>
          ))}
      </Col>
    );
  };

  return (
    <Container flexdirection="column">
      <h1>Applicant Timeslot Selection</h1>
      <p>
        The timeslots below show times, length, and interviewers. Don't select a
        timeslot with interviewers that you know.
      </p>
      <ScrollableRow>
        {Object.entries(timeslots)
          .sort((a, b) => (new Date(a[0]) > new Date(b[0]) ? 1 : -1))
          .map(([date, slots]) => (
            <TimeslotColumn key={date} date={date} slots={slots} />
          ))}
      </ScrollableRow>
    </Container>
  );
};

export default compose(
  withAuthorization(isApplicant),
  withFirebase
)(ApplicantView);
