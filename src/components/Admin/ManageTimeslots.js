import React, { useEffect, useState } from "react";
import { compose } from "recompose";
import styled from "styled-components";
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
import { formatTime } from "../../util/helper";

const TimeslotCard = styled(Card)`
  width: 18rem;
  margin: 10px;
  cursor: pointer;
  background: white;

  &:hover {
    border: 2px solid #87fb87;
  }
`;

// TODO: this needs refactoring into a class to remove the multiple loadings
const ManageTimeslots = ({ firebase }) => {
  const [timeslots, setTimeslots] = useState({});
  const [settings, setSettings] = useState({});
  const [currentTimeslot, setCurrentTimeslot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [interviewers, setInterviewers] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loadingTimeslots, setLoadingTimeslots] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(true);
  const [loadingInterviewers, setLoadingInterviewers] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(
    () => {
      if (firebase) {
        const unsubSettings = firebase.generalSettings().onSnapshot((doc) => {
          setSettings(doc.data());
          setLoadingSettings(false);
        }, console.error);

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
            for (const day in timeslots) {
              timeslots[day] = timeslots[day].filter((ts) =>
                validIds.includes(ts.id)
              );
              if (timeslots[day].length === 0) delete timeslots[day];
            }

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
          unsubSettings();
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [firebase]
  );

  useEffect(() => {
    if (
      !loadingTimeslots &&
      !loadingInterviewers &&
      !loadingApplicants &&
      !loadingSettings
    )
      setLoading(false);
  }, [
    loadingInterviewers,
    loadingApplicants,
    loadingTimeslots,
    loadingSettings,
  ]);

  if (loading) return <Loader />;

  const closeModal = () => {
    setCurrentTimeslot(null);
    setShowModal(false);
  };

  const saveTimeslotChanges = async () => {
    if (currentTimeslot.hasOwnProperty("id")) {
      try {
        await firebase.firestore.runTransaction(async (transaction) => {
          const ref = firebase.timeslot(currentTimeslot.id);
          const doc = await transaction.get(ref);
          // eslint-disable-next-line no-unused-vars
          const timeslot = { ...doc.data() };
          delete currentTimeslot.id;
          transaction.set(ref, currentTimeslot);
        });
      } catch (e) {
        console.error("Transaction failure!", e);
        swal(
          "Uh oh!",
          "Something went wrong with saving your selections! Please refresh the page and try again!",
          "error"
        );
      }
    } else {
      await firebase.timeslots().add(currentTimeslot);
    }

    closeModal();
  };

  const deleteTimeslot = () => {
    swal({
      title: "Are you sure?",
      text: "Once you delete this timeslot, you can't undo it!",
      icon: "warning",
      buttons: {
        cancel: {
          text: "No",
          value: false,
          visible: true,
        },
        confirm: {
          text: "Yes",
          value: true,
          visible: true,
        },
      },
    }).then(async (confirm) => {
      if (confirm) {
        await firebase.timeslot(currentTimeslot.id).delete();
        closeModal();
      }
    });
  };

  // TODO: rename slots => timeslots for clarity
  const TimeslotColumn = ({ date, slots }) => (
    <Col style={{ width: 300, flex: "none" }}>
      <h1>{date}</h1>

      {slots
        .sort((a, b) => {
          if (a.time.getTime() === b.time.getTime())
            return a.id > b.id ? 1 : -1;
          else return a.time > b.time ? 1 : -1;
        })
        .map((slot) => {
          const interviewers = Object.values(slot.interviewers);
          return (
            <TimeslotCard
              key={slot.id}
              onClick={() => {
                setCurrentTimeslot(slot);
                setShowModal(true);
              }}
            >
              <Card.Body>
                <Card.Title>
                  Applicant: {slot.applicant?.name || "No applicant"}
                </Card.Title>
                <Card.Subtitle className="mb-2">
                  Interviewer{interviewers.length !== 1 && "s"}:{" "}
                  {interviewers.length > 0 ? interviewers.join(", ") : "None"}
                </Card.Subtitle>
                <Card.Subtitle className="mb-2 text-muted">
                  Start Time: {formatTime(slot.time)}
                </Card.Subtitle>
                <Card.Subtitle className="mb-2 text-muted">
                  Length: {slot.timeslotLength} mins
                </Card.Subtitle>
              </Card.Body>
            </TimeslotCard>
          );
        })}
    </Col>
  );

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
    delete updatedTimeslot.applicant;
    if (newId !== "") {
      updatedTimeslot.applicant = {
        id: newId,
        name: applicants.find((applicant) => applicant.id === newId).name,
      };
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
      <Button
        style={{ marginBottom: 25 }}
        onClick={() => {
          const coeff = 1000 * 60;
          const date = new Date();
          const rounded = new Date(Math.round(date.getTime() / coeff) * coeff);
          setCurrentTimeslot({
            interviewers: {},
            timeslotLength: settings.timeslotLength,
            time: new Date(rounded - tzoffset),
          });
          setShowModal(true);
        }}
      >
        Add New Timeslot
      </Button>
      <ScrollableRow>
        {Object.entries(timeslots)
          .sort((a, b) => (new Date(a[0]) > new Date(b[0]) ? 1 : -1))
          .map(([date, slots]) => (
            <TimeslotColumn key={date} date={date} slots={slots} />
          ))}
      </ScrollableRow>

      <Modal show={showModal} onHide={closeModal}>
        {currentTimeslot && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>
                {currentTimeslot.hasOwnProperty("id") ? "Edit" : "Add new"}{" "}
                timeslot
              </Modal.Title>
            </Modal.Header>
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
                    onChange={(e) =>
                      setCurrentTimeslot({
                        ...currentTimeslot,
                        time: new Date(new Date(e.target.value) - tzoffset),
                      })
                    }
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              {currentTimeslot.hasOwnProperty("id") && (
                <Button variant="danger" onClick={deleteTimeslot}>
                  Delete
                </Button>
              )}
              <Button variant="primary" onClick={saveTimeslotChanges}>
                Save
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default compose(
  withAuthorization(isAdmin),
  withFirebase
)(ManageTimeslots);
