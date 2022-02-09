import React, { useEffect, useState } from "react";
import { compose } from "recompose";
import styled from "styled-components";
import cloneDeep from "lodash.clonedeep";
import swal from "@sweetalert/with-react";

import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";

import { withSettings } from "../API/SettingsContext";
import { withFirebase, withAuthorization } from "upe-react-components";

import { isAdmin } from "../../util/conditions";
import AdminLayout from "./AdminLayout";
import Loader from "../Loader";
import ScrollableRow from "../Timeslots/ScrollableRow";
import { formatTime } from "../../util/helper";

import { BackIcon } from "../TextDisplay";

import { StyledButton, Title, Text } from "../../styles/global";

const TimeslotCard = styled(Card)`
  width: 18rem;
  margin: 10px;
  cursor: pointer;
  background: white;

  &:hover {
    border: 2px solid #fb8787;
  }
`;

const TimeslotDiv = styled.div`
  font-family: Georgia;
  padding-left: 15%;
  padding-right: 15%;
  width: 100%;
  h1 {
    font-family: Georgia;
    font-size: 40px;
    font-style: italic;
    padding-bottom: 5%;
  }
  h1:after {
    content: "";
    display: block;
    width: 4%;
    padding-top: 3px;
    border-bottom: 2px solid #f21131;
  }
`;

// TODO: this needs refactoring into a class to remove the multiple loadings
const ManageTimeslots = ({ firebase, settings }) => {
  const [timeslots, setTimeslots] = useState({});
  const [currentTimeslot, setCurrentTimeslot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [interviewers, setInterviewers] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loadingTimeslots, setLoadingTimeslots] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(true);
  const [loadingInterviewers, setLoadingInterviewers] = useState(true);
  const [loading, setLoading] = useState(true);
  const tzoffset = new Date().getTimezoneOffset() * 60000;

  useEffect(
    () => {
      if (firebase) {
        const unsubTimeslots = firebase
          .timeslots()
          .onSnapshot((querySnapshot) => {
            const listenerData = querySnapshot.docs.map((doc) => {
              return {
                ...doc.data(),
                time: new Date(doc.data().time), // make sure to convert timestamp objects to Date objects
                uid: doc.id,
              };
            });

            // add new data from listener
            listenerData.forEach((ts) => {
              const day = ts.time.toDateString();

              // if data for day exists, add to it, otherwise create new field
              if (timeslots.hasOwnProperty(day)) {
                const index = timeslots[day].findIndex(
                  (timeslot) => timeslot.uid === ts.uid // check if existing timeslot matches the update (ts)
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
            const validIds = listenerData.map((ts) => ts.uid);
            for (const day in timeslots) {
              timeslots[day] = timeslots[day].filter((ts) =>
                validIds.includes(ts.uid)
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
                uid: doc.id,
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
                uid: doc.id,
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
    const newTimeslot = cloneDeep(currentTimeslot);
    newTimeslot.time = newTimeslot.time.getTime();
    if (newTimeslot.hasOwnProperty("uid")) {
      try {
        await firebase.firestore.runTransaction(async (transaction) => {
          const ref = firebase.timeslot(newTimeslot.uid);
          const doc = await transaction.get(ref);
          // eslint-disable-next-line no-unused-vars
          const timeslot = { ...doc.data() };
          delete newTimeslot.uid;
          transaction.set(ref, newTimeslot);
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
      await firebase.timeslots().add(newTimeslot);
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
        await firebase.timeslot(currentTimeslot.uid).delete();
        closeModal();
      }
    });
  };

  const updateInterviewer = (oldId, newId) => {
    const updatedTimeslot = cloneDeep(currentTimeslot);
    delete updatedTimeslot.interviewers[oldId];
    if (newId !== "")
      updatedTimeslot.interviewers[newId] = interviewers.find(
        (interviewer) => interviewer.uid === newId
      ).name;
    setCurrentTimeslot(updatedTimeslot);
  };

  const updateApplicant = (newId) => {
    const updatedTimeslot = cloneDeep(currentTimeslot);
    delete updatedTimeslot.applicant;
    if (newId !== "") {
      updatedTimeslot.applicant = {
        uid: newId,
        name: applicants.find((applicant) => applicant.uid === newId).name,
      };
    }
    setCurrentTimeslot(updatedTimeslot);
  };

  const TimeslotColumn = ({ date, timeslots }) => (
    <Col style={{ width: 300, flex: "none" }}>
      <h1>{date}</h1>

      {timeslots
        .sort((a, b) => {
          if (a.time.getTime() === b.time.getTime())
            return a.uid > b.uid ? 1 : -1;
          else return a.time > b.time ? 1 : -1;
        })
        .map((timeslot) => {
          const interviewers = Object.values(timeslot.interviewers);
          return (
            <TimeslotCard
              key={timeslot.uid}
              onClick={() => {
                setCurrentTimeslot(timeslot);
                setShowModal(true);
              }}
            >
              <Card.Body>
                <Card.Title>
                  Applicant: {timeslot.applicant?.name || "No applicant"}
                </Card.Title>
                <Card.Subtitle className="mb-2">
                  Interviewer{interviewers.length !== 1 && "s"}:{" "}
                  {interviewers.length > 0 ? interviewers.join(", ") : "None"}
                </Card.Subtitle>
                <Card.Subtitle className="mb-2 text-muted">
                  Start Time: {formatTime(timeslot.time)}
                </Card.Subtitle>
                <Card.Subtitle className="mb-2 text-muted">
                  Length: {timeslot.timeslotLength} mins
                </Card.Subtitle>
              </Card.Body>
            </TimeslotCard>
          );
        })}
    </Col>
  );

  return (
    <AdminLayout>
      <BackIcon />
      <Title>
        <h1> Manage Timeslots </h1>
      </Title>
      <Text
        paddingTop={"20px"}
        paddingLeft={"7%"}
        paddingRight={"7%"}
        pFontSize={"15px"}
        pMaxWidth={"100%"}
        pTextAlign={"left"}
        position={"left"}
        h2MarginTop={"2%"}
      >
        <p>
          Click a timeslot below to edit the associated interviewers, applicant,
          and time. Be careful as there is nothing stopping you from
          double-booking people; make sure that the people you swap in actually
          have availability. You can also create a new timeslot, use this for
          edge cases where someone needs a special time/date for their
          interview.
        </p>
        <StyledButton
          paddingTop={"0.5%"}
          paddingRight={"2%"}
          paddingBottom={"0.5%"}
          paddingLeft={"2%"}
          style={{ marginBottom: 25 }}
          onClick={() => {
            const coeff = 1000 * 60;
            const date = new Date();
            const rounded = new Date(
              Math.round(date.getTime() / coeff) * coeff
            );
            setCurrentTimeslot({
              interviewers: {},
              timeslotLength: settings.timeslotLength,
              time: new Date(rounded - tzoffset),
            });
            setShowModal(true);
          }}
        >
          Add New Timeslot
        </StyledButton>
        <StyledButton
          paddingTop={"0.5%"}
          paddingRight={"2%"}
          paddingBottom={"0.5%"}
          paddingLeft={"2%"}
          style={{ marginBottom: 25 }}
          onClick={() => {
            firebase
              .interviewerTimeslotsOpen()
              .catch((err) => console.error(err));
          }}
        >
          Alert Interviewers
        </StyledButton>
        <StyledButton
          paddingTop={"0.5%"}
          paddingRight={"2%"}
          paddingBottom={"0.5%"}
          paddingLeft={"2%"}
          style={{ marginBottom: 25 }}
          onClick={() => {
            firebase
              .applicantTimeslotsOpen()
              .catch((err) => console.error(err));
          }}
        >
          Alert Interviewees
        </StyledButton>
      </Text>
      <TimeslotDiv>
        <ScrollableRow>
          {Object.entries(timeslots)
            .sort((a, b) => (new Date(a[0]) > new Date(b[0]) ? 1 : -1))
            .map(([date, timeslots]) => (
              <TimeslotColumn key={date} date={date} timeslots={timeslots} />
            ))}
        </ScrollableRow>
      </TimeslotDiv>

      <Modal show={showModal} onHide={closeModal}>
        {currentTimeslot && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>
                {currentTimeslot.hasOwnProperty("uid") ? "Edit" : "Add new"}{" "}
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
                    {interviewers
                      .sort((a, b) => (a.name > b.name ? 1 : -1))
                      .map((interviewer) => (
                        <option value={interviewer.uid} key={interviewer.uid}>
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
                    {interviewers
                      .sort((a, b) => (a.name > b.name ? 1 : -1))
                      .map((interviewer) => (
                        <option value={interviewer.uid} key={interviewer.uid}>
                          {interviewer.name}
                        </option>
                      ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="applicant">
                  <Form.Label>Applicant</Form.Label>
                  <Form.Control
                    as="select"
                    value={currentTimeslot.applicant?.uid}
                    onChange={(e) => updateApplicant(e.target.value)}
                    custom
                  >
                    <option value="">-</option>
                    {applicants
                      .sort((a, b) => (a.name > b.name ? 1 : -1))
                      .map((applicant) => (
                        <option value={applicant.uid} key={applicant.uid}>
                          {applicant.name}
                        </option>
                      ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="timeslotDatetime">
                  <Form.Label>Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={new Date(currentTimeslot.time.getTime() - tzoffset)
                      .toISOString()
                      .slice(0, -1)}
                    onChange={(e) =>
                      setCurrentTimeslot({
                        ...currentTimeslot,
                        time: new Date(new Date(e.target.value)),
                      })
                    }
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <StyledButton
                paddingTop={"0.5%"}
                paddingRight={"2%"}
                paddingBottom={"0.5%"}
                paddingLeft={"2%"}
                onClick={closeModal}
              >
                Cancel
              </StyledButton>
              {currentTimeslot.hasOwnProperty("uid") && (
                <StyledButton
                  paddingTop={"0.5%"}
                  paddingRight={"2%"}
                  paddingBottom={"0.5%"}
                  paddingLeft={"2%"}
                  onClick={deleteTimeslot}
                >
                  Delete
                </StyledButton>
              )}
              <StyledButton
                paddingTop={"0.5%"}
                paddingRight={"2%"}
                paddingBottom={"0.5%"}
                paddingLeft={"2%"}
                green
                onClick={saveTimeslotChanges}
              >
                Save
              </StyledButton>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default compose(
  withSettings,
  withAuthorization(isAdmin),
  withFirebase
)(ManageTimeslots);
