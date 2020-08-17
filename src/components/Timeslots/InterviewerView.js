import React, { Component } from "react";
import { compose } from "recompose";
import swal from "@sweetalert/with-react";

import Button from "react-bootstrap/Button";
import Toast from "react-bootstrap/Toast";

import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";

import { isRecruitmentTeam } from "../../util/conditions";
import Loader from "../Loader";
import { Container } from "../../styles/global";

import ScrollableRow from "./ScrollableRow";
import ScheduleColumn from "./ScheduleColumn";

class InterviewerView extends Component {
  _initFirebase = false;
  state = {
    settings: null,
    loading: true,
    error: null,
    showToast: false,
    selectedTimeslots: {},
    firstDataLoad: true,
    runningTransaction: false,
  };
  static contextType = AuthUserContext;
  unsub = null;

  componentDidMount() {
    if (this.props.firebase && !this._initFirebase) this.loadSettings();
  }

  componentDidUpdate(prevProps) {
    if (this.props.firebase && !this._initFirebase) this.loadSettings();
  }

  componentWillUnmount() {
    if (typeof this.unsub === "function") this.unsub();
  }

  loadSettings = async () => {
    this._initFirebase = true;
    const doc = await this.props.firebase.generalSettings().get();

    if (!doc.exists) this.setState({ error: "Failed to load timeslots!" });
    else {
      const settings = doc.data();
      const selectedTimeslots = {};
      settings.timeslotDays = settings.timeslotDays.map((day) => {
        const date = day.toDate();
        selectedTimeslots[date.toDateString()] = [];
        return date;
      });
      this.setState({ settings, selectedTimeslots }, () => {
        this.unsub = this.props.firebase
          .timeslots()
          .onSnapshot((querySnapshot) => {
            const { selectedTimeslots } = this.state;
            const listenerData = querySnapshot.docs.map((doc) => {
              return {
                ...doc.data(),
                time: doc.data().time.toDate(), // make sure to convert timestamp objects to Date objects
                id: doc.id,
              };
            });

            listenerData.forEach((ts) => {
              const key = ts.time.toDateString();
              if (selectedTimeslots.hasOwnProperty(key)) {
                const index = selectedTimeslots[key].findIndex(
                  (sts) => sts.id === ts.id
                );
                if (index > -1) {
                  selectedTimeslots[key][index] = ts;
                } else {
                  selectedTimeslots[key].push(ts);
                }
              } else {
                selectedTimeslots[key] = [ts];
              }
            });

            this.setState({
              selectedTimeslots,
              loading: false,
              firstDataLoad: false,
            });
          }, console.error);
      });
    }
  };

  // when saving, only deal with timeslots associated with this user
  saveTimeslots = async () => {
    const { firebase } = this.props;
    const authUser = this.context;
    const { selectedTimeslots, settings } = this.state;

    // wipe state before transaction
    this.setState({
      selectedTimeslots: settings.timeslotDays.reduce((acc, cur) => {
        acc[cur.toDateString()] = [];
        return acc;
      }, {}),
      runningTransaction: true,
    });

    const existingTimeslots = await firebase
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

    const newTimeslots = Object.values(selectedTimeslots)
      .flat()
      .filter((ts) => ts.interviewers.hasOwnProperty(authUser.uid));
    const newTimeslotMap = {};
    newTimeslots.forEach((ts, i) => (newTimeslotMap[ts.time] = i));

    // helper function that does for each and waits
    const asyncForEach = async (array, callback) => {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    };

    try {
      // run all of this inside a transaction so it will restart if someone makes changes at the same time
      await firebase.firestoreRoot.runTransaction(async (transaction) => {
        // first remove timeslots the user no longer is in
        await asyncForEach(
          existingTimeslots.filter((ts) =>
            // filter for timeslots this user is a part of
            ts.interviewers.hasOwnProperty(authUser.uid)
          ),
          async (ts, i) => {
            // if old timeslot is no longer selected, remove interviewer from it
            if (!newTimeslotMap.hasOwnProperty(ts.time)) {
              const doc = existingTimeslots[i];
              const { id } = doc;
              delete doc.id;
              delete doc.interviewers[authUser.uid];
              if (
                Object.keys(doc.interviewers).length === 0 &&
                !doc.hasOwnProperty("applicant")
              )
                transaction.delete(firebase.timeslot(id));
              // TODO: notify admins if an timeslot with an applicant loses interviewers
              else transaction.update(firebase.timeslot(id), doc);
            }
          }
        );

        // iterate over newly selected timeslots
        // that is timeslots the user is in and don't already exist
        await asyncForEach(newTimeslots, async (ts) => {
          // get existing timeslots that match current timeslot time
          const matchingTimeslots = existingTimeslots.filter(
            (ets) => ets.time.getTime() === ts.time.getTime()
          );

          // only proceed if none of those timeslots have the current user already
          if (
            matchingTimeslots.every(
              (ts) => !ts.interviewers.hasOwnProperty(authUser.uid)
            )
          ) {
            let wroteToDb = false;
            await asyncForEach(matchingTimeslots, async (mts) => {
              if (wroteToDb) return;
              const doc = await transaction.get(firebase.timeslot(mts.id));
              const timeslot = { ...doc.data() };
              if (Object.keys(timeslot.interviewers).length < 2) {
                timeslot.interviewers[authUser.uid] = authUser.name;
                transaction.update(firebase.timeslot(mts.id), timeslot);
                wroteToDb = true;
              }
            });

            if (!wroteToDb) {
              // if none, create a new timeslot object and add it to existing timeslots
              const interviewers = {};
              interviewers[authUser.uid] = authUser.name;
              const newTimeslotRef = firebase.timeslots().doc();
              transaction.set(newTimeslotRef, ts);
            }
          }
        });
      });
    } catch (e) {
      this.setState({ selectedTimeslots });
      console.error("Transaction failure!", e);
      swal(
        "Uh oh!",
        "Something went wrong with saving your selections! Please refresh the page and try again!",
        "error"
      );
    }

    this.setState({ showToast: true, runningTransaction: false });
    window.scrollTo(0, document.body.scrollHeight);
  };

  selectTimeslot = (date) => {
    const day = date.toDateString();
    const {
      selectedTimeslots,
      settings: { timeslotLength },
    } = this.state;
    const authUser = this.context;

    // iterate over timeslots interviewer is not in and add interviewer if possible
    let saved = false;
    selectedTimeslots[day]
      .filter((ts) => !ts.interviewers.hasOwnProperty(authUser.uid))
      .forEach((ts) => {
        if (
          ts.time.getTime() === date.getTime() &&
          Object.keys(ts.interviewers).length < 2 &&
          !saved
        ) {
          ts.interviewers[authUser.uid] = authUser.name;
          saved = true;
        }
      });

    // if interviewer hasn't been added yet, push a new timeslot
    if (!saved) {
      const interviewers = {};
      interviewers[authUser.uid] = authUser.name;
      selectedTimeslots[day].push({
        time: date,
        interviewers,
        timeslotLength,
      });
    }
    this.setState({ selectedTimeslots });
  };

  unselectTimeslot = (date) => {
    const day = date.toDateString();
    const { selectedTimeslots } = this.state;
    const authUser = this.context;

    // first remove this user from list of interviewers in relevant timeslot
    selectedTimeslots[day] = selectedTimeslots[day].map((ts) => {
      if (
        ts.interviewers.hasOwnProperty(authUser.uid) &&
        ts.time.getTime() === date.getTime()
      )
        delete ts.interviewers[authUser.uid];
      return ts;
    });

    // filter out timeslots with no interviewers or applicants
    selectedTimeslots[day] = selectedTimeslots[day].filter(
      (ts) =>
        Object.keys(ts.interviewers).length > 0 ||
        ts.hasOwnProperty("applicant")
    );
    this.setState({ selectedTimeslots });
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
      error,
      selectedTimeslots,
      showToast,
    } = this.state;

    if (loading || runningTransaction) return <Loader />;
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
      timeslotStart,
      timeslotEnd,
    } = this.state.settings;

    const authUser = this.context;

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

    return (
      <Container flexdirection="column">
        <h1>Interviewer Timeslot Selection</h1>
        <ScrollableRow>
          {timeslotDays.map((date, i) => {
            // TODO: explain this data structure in depth, good place for docz
            // selectedSlots is an object/hashmap for performance reasons
            const timeslotsForDay = selectedTimeslots[date.toDateString()];
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
                selectTimeslot={this.selectTimeslot}
                unselectTimeslot={this.unselectTimeslot}
                startHour={timeslotStart}
                endHour={timeslotEnd}
              />
            );
          })}
        </ScrollableRow>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Button
            style={{ width: "fit-content", marginTop: 20, marginBottom: 20 }}
            onClick={this.saveTimeslots}
          >
            Save Selections
          </Button>
          <Toast
            onClose={() => this.setState({ showToast: false })}
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
  }
}

export default compose(
  withAuthorization(isRecruitmentTeam),
  withFirebase
)(InterviewerView);
