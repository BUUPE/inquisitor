import React, { useEffect, useState } from "react";
import { compose } from "recompose";
import cloneDeep from "lodash.clonedeep";
import swal from "@sweetalert/with-react";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";

import { withFirebase, withAuthorization } from "upe-react-components";

import { isAdmin } from "../../util/conditions";
import AdminLayout from "./AdminLayout";
import Loader from "../Loader";
import ScrollableRow from "../Timeslots/ScrollableRow";
import { TimeslotCard } from "../Timeslots/ApplicantView";
import { formatTime } from "../../util/helper";

const ManageTimeslots = ({ firebase }) => {
  const [timeslots, setTimeslots] = useState({});
  const [currentTimeslot, setCurrentTimeslot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [interviewers, setInterviewers] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loadingTimeslots, setLoadingTimeslots] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(true);
  const [loadingInterviewers, setLoadingInterviewers] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(
    () => {
      if (firebase) {
        const unsubTimeslots = firebase
          .timeslots()
          .onSnapshot((querySnapshot) => {
            const listenerData = querySnapshot.docs.map((doc) => {
              return {
                ...doc.data(),
                time: doc.data().time.toDate(), // make sure to convert timestamp objects to Date objects
                id: doc.id,
              };
            });

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
            setLoadingTimeslots(false);
          }, console.error);

        const unsubApplicants = firebase
          .users()
          .where("roles.applicant", "==", true)
          .onSnapshot((querySnapshot) => {
            const listenerData = querySnapshot.docs.map((doc) => {
              return {
                ...doc.data(),
                id: doc.id,
              };
            });

            setApplicants(listenerData);
            setLoadingApplicants(false);
          }, console.error);

        const unsubInterviewers = firebase
          .users()
          .where("roles.recruitmentteam", "==", true)
          .onSnapshot((querySnapshot) => {
            const listenerData = querySnapshot.docs.map((doc) => {
              return {
                ...doc.data(),
                id: doc.id,
              };
            });

            setInterviewers(listenerData);
            setLoadingInterviewers(false);
          }, console.error);

        return () => {
          unsubTimeslots();
          unsubApplicants();
          unsubInterviewers();
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [firebase]
  );

  useEffect(() => {
    if (!loadingTimeslots && !loadingInterviewers && !loadingApplicants)
      setLoading(false);
  }, [loadingInterviewers, loadingApplicants, loadingTimeslots]);

  if (loading) return <Loader />;

  const closeModal = () => {
    setCurrentTimeslot(null);
    setShowModal(false);
  };

  const saveTimeslotChanges = async () => {
    try {
      await firebase.firestore.runTransaction(async (transaction) => {
        const ref = firebase.timeslot(currentTimeslot.id);
        const doc = await transaction.get(ref);
        // eslint-disable-next-line no-unused-vars
        const timeslot = { ...doc.data() };
        delete currentTimeslot.id;
        transaction.update(ref, currentTimeslot);
      });
    } catch (e) {
      console.error("Transaction failure!", e);
      swal(
        "Uh oh!",
        "Something went wrong with saving your selections! Please refresh the page and try again!",
        "error"
      );
    }

    setCurrentTimeslot(null);
    closeModal();
  };

  // TODO: rename slots => timeslots for clarity
  const TimeslotColumn = ({ date, slots }) => {
    const selectTimeslot = async (timeslot) => {
      /*const timeslotId = timeslot.id;
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
      // TODO send email*/
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
              onClick={() => {
                setCurrentTimeslot(slot);
                setShowModal(true);
              }}
            >
              <Card.Body>
                <Card.Title>{formatTime(slot.time)}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  Interviewers: {Object.values(slot.interviewers).join(", ")}
                </Card.Subtitle>
                <Card.Subtitle className="mb-2 text-muted">
                  Applicant: {slot.applicant?.name || "No applicant"}
                </Card.Subtitle>
                <Card.Subtitle className="mb-2 text-muted">
                  Length: {slot.timeslotLength} mins
                </Card.Subtitle>
              </Card.Body>
            </TimeslotCard>
          ))}
      </Col>
    );
  };

  const tzoffset = new Date().getTimezoneOffset() * 60000;

  const updateInterviewer = (oldId, newId) => {
    const updatedTimeslot = cloneDeep(currentTimeslot);
    delete updatedTimeslot.interviewers[oldId];
    if (newId !== "")
      updatedTimeslot.interviewers[newId] = interviewers.find(
        (interviewer) => interviewer.id === newId
      ).name;
    setCurrentTimeslot(updatedTimeslot);
  };

  const updateApplicant = (newId) => {
    const updatedTimeslot = cloneDeep(currentTimeslot);
    updatedTimeslot.applicant = {};
    if (newId !== "") {
      updatedTimeslot.applicant.id = newId;
      updatedTimeslot.applicant.name = applicants.find(
        (applicant) => applicant.id === newId
      ).name;
    }
    setCurrentTimeslot(updatedTimeslot);
  };

  return (
    <AdminLayout>
      <h1>Manage Timeslots</h1>
      <p>
        Click a timeslot below to edit the associated interviewers, applicant,
        and time. Be careful as there is nothing stopping you from
        double-booking people; make sure that the people you swap in actually
        have availability. You can also create a new timeslot, use this for edge
        cases where someone needs a special time/date for their interview.
      </p>
      <Button style={{ marginBottom: 25 }}>Add New Timeslot</Button>
      <ScrollableRow>
        {Object.entries(timeslots)
          .sort((a, b) => (new Date(a[0]) > new Date(b[0]) ? 1 : -1))
          .map(([date, slots]) => (
            <TimeslotColumn key={date} date={date} slots={slots} />
          ))}
      </ScrollableRow>

      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit timeslot</Modal.Title>
        </Modal.Header>
        {currentTimeslot && (
          <Modal.Body>
            <Form>
              <Form.Group controlId="interviewer1">
                <Form.Label>Interviewer 1</Form.Label>
                <Form.Control
                  as="select"
                  value={Object.keys(currentTimeslot.interviewers)[0]}
                  onChange={(e) =>
                    updateInterviewer(
                      Object.keys(currentTimeslot.interviewers)[0],
                      e.target.value
                    )
                  }
                  custom
                >
                  <option value="">-</option>
                  {interviewers.map((interviewer) => (
                    <option value={interviewer.id} key={interviewer.id}>
                      {interviewer.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="interviewer2">
                <Form.Label>Interviewer 2</Form.Label>
                <Form.Control
                  as="select"
                  value={Object.keys(currentTimeslot.interviewers)[1]}
                  onChange={(e) =>
                    updateInterviewer(
                      Object.keys(currentTimeslot.interviewers)[1],
                      e.target.value
                    )
                  }
                  custom
                >
                  <option value="">-</option>
                  {interviewers.map((interviewer) => (
                    <option value={interviewer.id} key={interviewer.id}>
                      {interviewer.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="applicant">
                <Form.Label>Applicant</Form.Label>
                <Form.Control
                  as="select"
                  value={currentTimeslot.applicant?.id}
                  onChange={(e) => updateApplicant(e.target.value)}
                  custom
                >
                  <option value="">-</option>
                  {applicants.map((applicant) => (
                    <option value={applicant.id} key={applicant.id}>
                      {applicant.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="timeslotDatetime">
                <Form.Label>Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={currentTimeslot.time.toISOString().slice(0, -1)}
                  onChange={(e) => {
                    console.log(e.target.value);
                    setCurrentTimeslot({
                      ...currentTimeslot,
                      time: new Date(new Date(e.target.value) - tzoffset),
                    });
                  }}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveTimeslotChanges}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default compose(
  withAuthorization(isAdmin),
  withFirebase
)(ManageTimeslots);
