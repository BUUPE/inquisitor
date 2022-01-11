import React, { Component } from "react";
import styled from "styled-components";
import { compose } from "recompose";
import swal from "@sweetalert/with-react";
import cloneDeep from "lodash.clonedeep";

import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Modal from "react-bootstrap/Modal";
import Card from "react-bootstrap/Card";

import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";
import { withSettings } from "../API/SettingsContext";

import { isRecruitmentTeam } from "../../util/conditions";
import { formatTime, setStateAsync } from "../../util/helper";
import Loader from "../Loader";

import ScrollableRow from "./ScrollableRow";
import ScheduleColumn from "./ScheduleColumn";
import TextDisplay from "../TextDisplay";

import moment from "moment-timezone";

const TimeslotDiv = styled.div`
  font-family: Georgia;
  padding-left: 15%;
  padding-right: 15%;
`;

class InterviewerView extends Component {
  _initFirebase = false;
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      settings: null,
      timeslots: {}, // TODO: this needs a better name
      timeslotOptions: [],
      showModal: false,
      offsetHours: 0,
    };
    this.setStateAsync = setStateAsync.bind(this);
  }

  static contextType = AuthUserContext;
  unsubTimeslots = null;

  componentDidMount() {
    if (this.props.firebase && !this._initFirebase) this.loadData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.firebase && !this._initFirebase) this.loadData();
  }

  componentWillUnmount() {
    if (typeof this.unsubTimeslots === "function") this.unsubTimeslots();
  }

  loadData = async () => {
    this._initFirebase = true;

    const now = moment();
    const localOffset = now.utcOffset();
    now.tz("America/New_York"); // BU timezone, normalize to this
    const centralOffset = now.utcOffset();
    const diffInMinutes = localOffset - centralOffset;
    const offsetHours = diffInMinutes / 60;

    const settings = this.props.settings;
    const timeslots = {};
    settings.timeslotStart = (settings.timeslotStart + offsetHours) % 24;
    settings.timeslotEnd = (settings.timeslotEnd + offsetHours) % 24;
    settings.timeslotDays = settings.timeslotDays.map((day) => {
      const date = day.toDate();
      timeslots[date.toDateString()] = [];
      return date;
    });
    await this.setStateAsync({ settings, timeslots, offsetHours });

    const timeslotsOne = await new Promise((resolve, reject) => {
      let resolveOnce = (doc) => {
        resolveOnce = () => null;
        resolve(doc);
      };
      this.unsubTimeslots = this.props.firebase
        .timeslots()
        .onSnapshot(async (querySnapshot) => {
          const { timeslots } = this.state;
          const listenerData = querySnapshot.docs.map((doc) => {
            return {
              ...doc.data(),
              time: new Date(doc.data().time), // make sure to convert timestamp objects to date objects
              id: doc.id,
            };
          });
          // add new data from listener
          listenerData
            .filter(
              (ts) =>
                Object.keys(ts.interviewers).length < 2 ||
                ts.interviewers.hasOwnProperty(this.context.uid)
            )
            .forEach((ts) => {
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
          this.setState({ timeslots });
          resolveOnce(timeslots);
        }, reject);
    });

    this.setState({ timeslots: timeslotsOne, loading: false });
  };

  // selects a timeslot by its id. if someone else fills the slot first, shows an error
  selectTimeslot = async (ts) => {
    const authUser = this.context;
    const { firebase } = this.props;

    try {
      await firebase.firestore.runTransaction(async (transaction) => {
        const doc = await transaction.get(firebase.timeslot(ts.id));
        const timeslot = { ...doc.data() };
        if (Object.keys(timeslot.interviewers).length < 2) {
          timeslot.interviewers[authUser.uid] = authUser.name;
          transaction.update(firebase.timeslot(ts.id), timeslot);
        } else {
          swal(
            "Uh oh!",
            "Someone else has just registered this timeslot! Please select another.",
            "error"
          );
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

    this.setState({ showModal: false, timeslotOptions: [] });
  };

  addNewTimeslot = async (date) => {
    const {
      settings: { timeslotLength },
    } = this.state;
    const authUser = this.context;

    const interviewers = {};
    interviewers[authUser.uid] = authUser.name;
    await this.props.firebase.timeslots().add({
      time: date.getTime(),
      interviewers,
      timeslotLength,
    });
    this.setState({ showModal: false });
  };

  selectTimeslotByDate = async (date) => {
    const day = date.toDateString();
    const { timeslots } = this.state;
    const authUser = this.context;

    // show timeslots that match time and have an opening
    const matchingTimeslots = timeslots[day].filter(
      (ts) =>
        !ts.interviewers.hasOwnProperty(authUser.uid) &&
        ts.time.getTime() === date.getTime()
    );

    // if no matching timeslots, push a new one. otherwise show options to user
    if (matchingTimeslots.length === 0) await this.addNewTimeslot(date);
    else this.setState({ showModal: true, timeslotOptions: matchingTimeslots });
  };

  unselectTimeslot = async (date) => {
    const day = date.toDateString();
    const { timeslots } = this.state;
    const authUser = this.context;

    // copy timeslot that this user is a part of, remove their uid, and update firebase
    const timeslot = cloneDeep(
      timeslots[day].find(
        (ts) =>
          ts.interviewers.hasOwnProperty(authUser.uid) &&
          ts.time.getTime() === date.getTime()
      )
    );
    const { id, interviewers } = timeslot;
    delete interviewers[authUser.uid];
    if (
      Object.keys(interviewers).length === 0 &&
      !timeslot.hasOwnProperty("applicant")
    )
      await this.props.firebase.timeslot(id).delete();
    // TODO: notify admins if an timeslot with an applicant loses interviewers
    else await this.props.firebase.timeslot(id).update({ interviewers });
  };

  timeslotsToSlots = (timeslots) => {
    const startHour = this.state.settings.timeslotStart;
    const slots = {};
    timeslots.forEach((ts) => {
      const slot = (ts.time.getHours() - startHour) * 60 + ts.time.getMinutes();
      const end = slot + this.state.settings.timeslotLength - 15;
      for (let pos = slot; pos <= end; pos += 15) {
        slots[pos] = [slot, end];
      }
    });
    return slots;
  };

  render() {
    const {
      loading,
      runningTransaction,
      timeslots,
      showModal,
      timeslotOptions,
      offsetHours,
    } = this.state;

    if (loading || runningTransaction) return <Loader />;

    const {
      timeslotsOpen,
      timeslotLength,
      timeslotDays,
      timeslotStart,
      timeslotEnd,
    } = this.state.settings;

    const authUser = this.context;

    if (!timeslotsOpen)
      return (
        <TextDisplay
          name={"Timeslot Selection"}
          text={"Timeslot selection is currently closed."}
          displayBack={true}
        />
      );

    return (
      <>
        <TextDisplay
          name={"Timeslot Selection"}
          text={
            "Green slots are slots you occupy, Blue slots are slots that only have 1 Interviewer, Red slots are slots with an Applicant but without Interviewers."
          }
          displayBack={true}
        />
        <TimeslotDiv>
          <Row
            lg={2}
            md={2}
            sm={1}
            xl={2}
            xs={1}
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingBottom: "5%",
            }}
          >
            <ScrollableRow>
              {timeslotDays
                .sort((a, b) => a - b)
                .map((date, i) => {
                  // TODO: explain this data structure in depth, good place for docz
                  // selectedSlots is an object/hashmap for performance reasons
                  const timeslotsForDay = timeslots[date.toDateString()];
                  const userSelectedSlots = timeslotsForDay
                    ? this.timeslotsToSlots(
                        timeslotsForDay.filter((ts) =>
                          ts.interviewers.hasOwnProperty(authUser.uid)
                        )
                      )
                    : {};
                  const slotsWithOpening = timeslotsForDay
                    ? this.timeslotsToSlots(
                        timeslotsForDay.filter(
                          (ts) =>
                            !ts.interviewers.hasOwnProperty(authUser.uid) &&
                            Object.keys(ts.interviewers).length === 1
                        )
                      )
                    : {};
                  const orphanedApplicants = timeslotsForDay
                    ? this.timeslotsToSlots(
                        timeslotsForDay.filter(
                          (ts) =>
                            ts.hasOwnProperty("applicant") &&
                            Object.keys(ts.interviewers).length === 0
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
                      orphanedApplicants={orphanedApplicants}
                      selectTimeslot={this.selectTimeslotByDate}
                      unselectTimeslot={this.unselectTimeslot}
                      startHour={timeslotStart}
                      endHour={timeslotEnd}
                      offsetHours={offsetHours}
                    />
                  );
                })}
            </ScrollableRow>
          </Row>

          <Modal
            show={showModal}
            onHide={() => this.setState({ showModal: false })}
          >
            <Modal.Header closeButton>
              <Modal.Title>Choose a timeslot</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ScrollableRow>
                {timeslotOptions.map((ts) => (
                  <Card
                    key={ts.id}
                    style={{
                      minWidth: "15rem",
                      margin: "0 10px",
                      cursor: "pointer",
                    }}
                    onClick={() => this.selectTimeslot(ts)}
                  >
                    <Card.Body>
                      <Card.Title>
                        Interviewer: {Object.values(ts.interviewers).join(", ")}
                      </Card.Title>
                      {ts.applicant && (
                        <Card.Subtitle className="mb-2 text-muted">
                          Applicant: {ts.applicant.name}
                        </Card.Subtitle>
                      )}
                      <Card.Subtitle className="mb-2 text-muted">
                        {formatTime(ts.time)}
                      </Card.Subtitle>
                    </Card.Body>
                  </Card>
                ))}

                {timeslotOptions.length > 0 && (
                  <Card
                    style={{
                      minWidth: "15rem",
                      margin: "0 10px",
                      cursor: "pointer",
                    }}
                    onClick={() => this.addNewTimeslot(timeslotOptions[0].time)}
                  >
                    <Card.Body>
                      <Card.Title>Create new slot</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        {formatTime(timeslotOptions[0].time)}
                      </Card.Subtitle>
                    </Card.Body>
                  </Card>
                )}
              </ScrollableRow>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => this.setState({ showModal: false })}
              >
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
        </TimeslotDiv>
      </>
    );
  }
}

export default compose(
  withSettings,
  withAuthorization(isRecruitmentTeam),
  withFirebase
)(InterviewerView);
