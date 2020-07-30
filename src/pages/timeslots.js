import React, { Component } from "react";
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

class Timeslots extends Component {
  state = {
    settings: null,
    loading: true,
    error: null,
    showToast: false,
    selectedTimeslots: {},
    firebaseInit: false,
  };
  static contextType = AuthUserContext;
  slider = React.createRef();
  unsub = null;

  componentDidMount() {
    if (this.props.firebase && !this.state.firebaseInit) this.loadSettings();
  }

  componentDidUpdate(prevProps) {
    if (this.props.firebase && !this.state.firebaseInit) this.loadSettings();
  }

  componentWillUnmount() {
    if (typeof this.unsub === "function") this.unsub();
  }

  loadSettings = async () => {
    this.setState({ firebaseInit: true });
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
              };
            });

            // TODO: merge data here, remove things that got removed

            listenerData.forEach((ts) => {
              const key = ts.time.toDateString();
              if (selectedTimeslots.hasOwnProperty(key)) {
                selectedTimeslots[key].push(ts);
              } else {
                selectedTimeslots[key] = [ts];
              }
            });

            this.setState({ selectedTimeslots });
          }, console.error);

        this.setState({ loading: false });
      });
    }
  };

  isDown = false;
  startX = null;
  scrollLeft = null;

  handleMouseDown = (e) => {
    this.isDown = true;
    this.startX = e.pageX - this.slider.current.offsetLeft;
    this.scrollLeft = this.slider.current.scrollLeft;
  };
  handleMouseUp = (e) => {
    this.isDown = false;
  };
  handleMouseMove = (e) => {
    if (!this.isDown) return;
    e.preventDefault();
    const x = e.pageX - this.slider.current.offsetLeft;
    const walk = (x - this.startX) * 3; //scroll-fast
    this.slider.current.scrollLeft = this.scrollLeft - walk;
  };
  handleMouseLeave = (e) => {
    this.isDown = false;
  };

  saveTimeslots = async () => {
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

  selectTimeslot = (date) => {
    const day = date.toDateString();
    const { selectedTimeslots } = this.state;
    const authUser = this.context;

    // iterate over timeslots interviewer is not in and add interviewer if possible
    let saved = false;
    selectedTimeslots[day]
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
      selectedTimeslots[day].push({
        time: date,
        interviewers,
        timeslotLength: this.state.settings.timeslotLength,
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
    const startHour = 8; // make this configurable
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
    const { loading, error, selectedTimeslots, showToast } = this.state;

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
        <Row
          style={{
            flexWrap: "unset",
            overflowX: "auto",
            justifyContent: "flex-start",
          }}
          ref={this.slider}
          onMouseDown={this.handleMouseDown}
          onMouseLeave={this.handleMouseLeave}
          onMouseMove={this.handleMouseMove}
          onMouseUp={this.handleMouseUp}
        >
          {timeslotDays.map((date, i) => {
            // TODO: explain this data structure in depth
            // selectedSlots is an object/hashmap for performance reasons
            const timeslotsForDay = selectedTimeslots[date.toDateString()];
            //console.log(timeslotsForDay);
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
              />
            );
          })}
        </Row>
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

const AuthorizedTimeslots = compose(
  withAuthorization(isLoggedIn),
  withFirebase
)(Timeslots);

export default ({ location }) => (
  <Layout>
    <AuthorizedTimeslots location={location} />
  </Layout>
);
