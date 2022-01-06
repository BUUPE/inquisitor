import React, { Component } from "react";
import { compose } from "recompose";
import styled from "styled-components";
import swal from "@sweetalert/with-react";
import cloneDeep from "lodash.clonedeep";

import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";

import ScrollableRow from "./ScrollableRow";
import Loader from "../Loader";
import { Container } from "../../styles/global";
import { isApplicant } from "../../util/conditions";
import { formatTime, setStateAsync } from "../../util/helper";
import TextDisplay from "../TextDisplay";

const TimeslotCard = styled(Card)`
  font-family: Georgia;
  width: 18rem;
  margin: 10px;
  cursor: pointer;
  background: ${(props) => (props.selected ? "#87fb87" : "white")};
  &:hover {
    background: ${(props) => (props.selected ? "#fb8787" : "#87fb87")};
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

class ApplicantView extends Component {
  _initFirebase = false;
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: null,
      settings: null,
      timeslots: {},
      selectedTimeslot: {},
      selecting: false,
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
    const authUser = this.context;
    const doc = await this.props.firebase.generalSettings().get();

    let settings;
    if (!doc.exists)
      return this.setState({ error: "Failed to load settings!" });
    else settings = doc.data();

    const timeslots = await new Promise((resolve, reject) => {
      let resolveOnce = (doc) => {
        resolveOnce = () => null;
        resolve(doc);
      };
      this.unsubTimeslots = this.props.firebase
        .timeslots()
        .onSnapshot(async (querySnapshot) => {
          const { timeslots } = this.state;
          const listenerData = querySnapshot.docs
            .map((doc) => {
              return {
                ...doc.data(),
                time: new Date(doc.data().time), // make sure to convert timestamp objects to Date objects
                id: doc.id,
              };
            })
            .filter(
              (ts) =>
                ts?.applicant?.uid === authUser.uid ||
                (!ts.hasOwnProperty("applicant") &&
                  Object.keys(ts.interviewers).length > 0)
            ); // filter out ones that already have an applicant that isn't current user

          const selectedTimeslot =
            listenerData.find((ts) => ts?.applicant?.uid === authUser.uid) ||
            {};
          await this.setStateAsync({ selectedTimeslot });

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

          const clonedTimeslots = cloneDeep(timeslots);
          this.setState({ timeslots: clonedTimeslots });
          resolveOnce(clonedTimeslots);
        }, reject);
    });

    this.setState({ settings, timeslots, loading: false });
  };

  selectTimeslot = async (timeslot) => {
    await this.setStateAsync({ selecting: true });
    const { selectedTimeslot } = this.state;
    const { firebase } = this.props;
    const authUser = this.context;
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
          this.setState({ selectedTimeslot: { ...timeslot, id: doc.id } });
        } else {
          if (timeslotId === selectedTimeslot.id) {
            const ref = firebase.timeslot(timeslotId);
            const doc = await transaction.get(ref);
            const timeslot = { ...doc.data() };
            if (timeslot.applicant?.uid !== authUser.uid)
              throw new Error("Timeslot owned by other applicant!");
            delete timeslot.applicant;
            transaction.set(ref, timeslot);
            this.setState({ selectedTimeslot: {} });
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
            this.setState({
              selectedTimeslot: { ...newTimeslot, id: newDoc.id },
            });
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
      await firebase
        .timeslotSelected({
          firstName: authUser.name.split(" ")[0],
          email: authUser.email,
          time: `${formatTime(timeslot.time)}, ${timeslot.time.toDateString()}`,
        })
        .catch((error) => console.error(error));
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
      await firebase
        .timeslotUnselected({
          firstName: authUser.name.split(" ")[0],
          email: authUser.email,
        })
        .catch((error) => console.error(error));
      swal(
        "Unscheduled!",
        `You have unscheduled your interview, and a confirmation has been sent to your email. If you'd still like to interview with UPE, make sure to select another timeslot!`,
        "success"
      );
    }

    await this.setStateAsync({ selecting: false });
  };

  render() {
    const {
      error,
      loading,
      settings,
      timeslots,
      selectedTimeslot,
      selecting,
    } = this.state;

    if (error)
      return (
        <Container flexdirection="column">
          <h1>{error}</h1>
        </Container>
      );

    if (loading) return <Loader />;

    if (!settings.timeslotsOpenForApplicants)
      return (
        <TextDisplay
          name={"Timeslot Selection"}
          text={"Timeslot selection is currently closed."}
          displayBack={true}
        />
      );

    const TimeslotColumn = ({ date, slots }) => (
      <Col style={{ width: "100%", flex: "none" }}>
        <h1> {date} </h1>
        {slots
          .sort((a, b) => {
            if (a.time.getTime() === b.time.getTime())
              return a.id > b.id ? 1 : -1;
            else return a.time > b.time ? 1 : -1;
          })
          .map((slot) => (
            <TimeslotCard
              key={slot.id}
              onClick={() => this.selectTimeslot(slot)}
              selected={slot.id === selectedTimeslot.id}
            >
              <Card.Body>
                <Card.Title>{formatTime(slot.time)}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  Number of interviewers:{" "}
                  {Object.values(slot.interviewers).length}
                </Card.Subtitle>
                <Card.Subtitle className="mb-2 text-muted">
                  {slot.timeslotLength} mins
                </Card.Subtitle>
              </Card.Body>
            </TimeslotCard>
          ))}
      </Col>
    );

    return (
      <>
        <TextDisplay
          name={"Timeslot Selection"}
          text={
            "The timeslots below show start times, length, and the number of interviewers. You should receive a confirmation email, but in case you don't, please refer back to this page."
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
            {selecting && <Loader opacity={0.75} />}
            <ScrollableRow>
              {Object.entries(timeslots)
                .sort((a, b) => (new Date(a[0]) > new Date(b[0]) ? 1 : -1))
                .map(([date, slots]) => (
                  <TimeslotColumn key={date} date={date} slots={slots} />
                ))}
            </ScrollableRow>
          </Row>
        </TimeslotDiv>
      </>
    );
  }
}

export default compose(
  withAuthorization(isApplicant),
  withFirebase
)(ApplicantView);
