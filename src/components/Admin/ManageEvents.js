import React, { Fragment, Component } from "react";
import styled from "styled-components";
import { compose } from "recompose";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import {
  withFirebase,
  withAuthorization,
  AuthUserContext,
} from "upe-react-components";
import cloneDeep from "lodash.clonedeep";

import { isRecruitmentTeam, isAdmin } from "../../util/conditions";
import AdminLayout from "./AdminLayout";
import Loader from "../Loader";
import { BackIcon } from "../TextDisplay";

import { Title, Text, StyledButton } from "../../styles/global";

const EventList = styled.ul`
  font-family: Georgia;
  border: 1px solid black;
`;

const StyledLi = styled.li`
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ResponseDiv = styled.div`
  width: ${(props) => (props.width ? props.width : "50%")};
  flex-grow: 1;
  padding-left: 3%;
`;

class ManageEvents extends Component {
  _initFirebase = false;
  state = {
    loading: true,
    events: [],
    currentEvent: null,
    currentEventWebsite: null,
  };
  unsubEvents = null;
  unsubCurrentEventWebsite = null;

  static contextType = AuthUserContext;

  componentDidMount() {
    if (this.props.firebase && !this._initFirebase) this.loadData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.firebase && !this._initFirebase) this.loadData();
  }

  componentWillUnmount() {
    if (typeof this.unsubEvents === "function") this.unsubEvents();
    if (typeof this.unsubCurrentEventWebsite === "function")
      this.unsubCurrentEventWebsite();
  }

  loadData = async () => {
    this._initFirebase = true;

    const events = await new Promise((resolve, reject) => {
      let resolveOnce = (doc) => {
        resolveOnce = () => null;
        resolve(doc);
      };
      this.unsubEvents = this.props.firebase
        .recruitmentEvents()
        .onSnapshot((querySnapshot) => {
          const events = querySnapshot.docs.map((doc) => {
            return {
              ...doc.data(),
              id: doc.id,
            };
          });

          this.setState({ events });
          resolveOnce(events);
        }, reject);
    });

    this.setState({
      events,
      loading: false,
    });
  };

  fetchEvent = (id) => {
    if (!id) return;

    if (typeof this.unsubCurrentEventWebsite === "function")
      this.unsubCurrentEventWebsite();
    this.unsubCurrentEventWebsite = this.props.firebase
      .event(id)
      .onSnapshot((doc) => {
        if (!doc.exists) return console.log("Event not found!");
        const fetchedEvent = { ...doc.data(), id: doc.id };
        this.setState({ currentEventWebsite: fetchedEvent });
      });
  };

  toggleEventStatus = async () => {
    const { currentEvent, currentEventWebsite } = this.state;
    if (!currentEventWebsite || !currentEvent) return;

    const updatedEvent = cloneDeep(currentEvent);
    updatedEvent.open = !updatedEvent.open;

    delete updatedEvent.id;

    await this.props.firebase
      .recruitmentEvent(currentEvent.id)
      .set(updatedEvent)
      .then(() => {
        updatedEvent.id = currentEvent.id;
        this.setState({ currentEvent: updatedEvent });
        this.fetchEvent(updatedEvent.id);
      })
      .catch((error) => console.log("Failed to save event"));
  };

  deleteEvent = async () => {
    const { currentEvent, currentEventWebsite } = this.state;
    if (!currentEventWebsite || !currentEvent) return;
    this.setState({ loading: true });

    const deleteEvent = this.props.firebase
      .event(currentEventWebsite.id)
      .delete()
      .catch((error) => console.log("Failed to delete Website Event"));
    const deleteWebsiteEvent = this.props.firebase
      .recruitmentEvent(currentEvent.id)
      .delete()
      .catch((error) => console.log("Failed to delete Event"));

    Promise.all([deleteEvent, deleteWebsiteEvent]).then(() =>
      this.setState({
        loading: false,
        currentEvent: null,
        currentEventWebsite: null,
      })
    );
  };

  render() {
    const { loading, currentEvent, events, currentEventWebsite } = this.state;
    const hasEvents = events.length !== 0;

    if (loading) return <Loader />;

    const EventListItem = ({ data }) => (
      <StyledLi
        onClick={() => {
          this.setState({ currentEvent: data });
          this.fetchEvent(data.websiteReference);
        }}
      >
        {data.title}
      </StyledLi>
    );

    const CurrentEvent = () => {
      if (!currentEvent || !currentEventWebsite)
        return (
          <h3 style={{ paddingLeft: "3%" }}>
            {" "}
            {hasEvents
              ? "Please select an Event!"
              : "No available Events!"}{" "}
          </h3>
        );

      const formattedStartHour =
        parseInt(currentEventWebsite.startHour) < 10
          ? "0".concat("", currentEventWebsite.startHour)
          : currentEventWebsite.startHour;
      const formattedEndHour =
        parseInt(currentEventWebsite.endHour) < 10
          ? "0".concat("", currentEventWebsite.endHour)
          : currentEventWebsite.endHour;
      const formattedStartMinute =
        parseInt(currentEventWebsite.startMinute) < 10
          ? "0".concat("", currentEventWebsite.startMinute)
          : currentEventWebsite.startMinute;
      const formattedEndMinute =
        parseInt(currentEventWebsite.endMinute) < 10
          ? "0".concat("", currentEventWebsite.endMinute)
          : currentEventWebsite.endMinute;

      return (
        <Fragment>
          <ResponseDiv width={"100%"}>
            <h2> Details </h2>
          </ResponseDiv>
          <ResponseDiv width={"50%"}>
            <h3> Title </h3>
            <p> {currentEvent.title} </p>
          </ResponseDiv>
          <ResponseDiv width={"50%"}>
            <h3> Time </h3>
            {currentEventWebsite.allDay && (
              <p>
                {" "}
                All Day - {currentEventWebsite.startMonth}/
                {currentEventWebsite.startDay}/{currentEventWebsite.startYear}{" "}
              </p>
            )}
            <p>
              {formattedStartHour}:{formattedStartMinute} -{" "}
              {currentEventWebsite.startMonth}/{currentEventWebsite.startDay}/
              {currentEventWebsite.startYear} to {formattedEndHour}:
              {formattedEndMinute} - {currentEventWebsite.endMonth}/
              {currentEventWebsite.endDay}/{currentEventWebsite.endYear}
            </p>
          </ResponseDiv>
          <ResponseDiv width={"50%"}>
            <h3> Password </h3>
            <p> {currentEvent.password} </p>
          </ResponseDiv>
          <ResponseDiv width={"50%"}>
            <h3> Status </h3>
            <p> {currentEvent.open ? "Open" : "Closed"} </p>
          </ResponseDiv>
          <ResponseDiv width={"100%"}>
            <h2> Attendance </h2>
          </ResponseDiv>
          <ResponseDiv width={"50%"}>
            <h3> UPE Attendance </h3>
            {Object.entries(currentEvent.upeAttendance).map((user) => (
              <p key={user[0]}> {user[1]} </p>
            ))}
          </ResponseDiv>
          <ResponseDiv width={"50%"}>
            <h3> Other Attendance </h3>
            {Object.entries(currentEvent.attendance).map((user) => (
              <p key={user[0]}> {user[1]} </p>
            ))}
          </ResponseDiv>
          <ResponseDiv width={"100%"}>
            <h2> Actions </h2>
          </ResponseDiv>
          <br />
          <ResponseDiv width={"33%"}>
            <StyledButton
              paddingTop={"0.5%"}
              paddingRight={"3%"}
              paddingBottom={"0.5%"}
              paddingLeft={"3%"}
              onClick={() => this.toggleEventStatus()}
            >
              {currentEvent.open ? "Close" : "Open"}
            </StyledButton>
          </ResponseDiv>
          <ResponseDiv width={"33%"}>
            <StyledButton
              paddingTop={"0.5%"}
              paddingRight={"3%"}
              paddingBottom={"0.5%"}
              paddingLeft={"3%"}
              onClick={() => this.toggleEditEvent()}
            >
              Edit
            </StyledButton>
          </ResponseDiv>
          <ResponseDiv width={"33%"}>
            <StyledButton
              paddingTop={"0.5%"}
              paddingRight={"3%"}
              paddingBottom={"0.5%"}
              paddingLeft={"3%"}
              onClick={() => this.deleteEvent()}
            >
              Delete
            </StyledButton>
          </ResponseDiv>
        </Fragment>
      );
    };

    return (
      <AdminLayout>
        <BackIcon />
        <Title>
          <h1> Manage Events </h1>
        </Title>
        <Text
          paddingTop={"20px"}
          paddingLeft={"7%"}
          paddingRight={"7%"}
          pFontSize={"15px"}
          pTextAlign={"left"}
          pMaxWidth={"100%"}
          position={"left"}
          h2MarginTop={"2%"}
        >
          <Row style={{ height: "100%" }}>
            <Col style={{ flexGrow: 0, flexBasis: 200 }}>
              <StyledButton
                paddingTop={"0.5%"}
                paddingRight={"3%"}
                paddingBottom={"0.5%"}
                paddingLeft={"3%"}
                onClick={() => this.togglAddEvent()}
              >
                New Event
              </StyledButton>
              {hasEvents && (
                <EventList>
                  {events
                    .sort((a, b) => (a.title > b.title ? 1 : -1))
                    .map((event) => (
                      <EventListItem key={event.id} data={event} />
                    ))}
                </EventList>
              )}
            </Col>
            <Col>
              <Row>
                <CurrentEvent />
              </Row>
            </Col>
          </Row>
        </Text>
      </AdminLayout>
    );
  }
}

export default compose(
  withAuthorization(
    (authUser) => isRecruitmentTeam(authUser) || isAdmin(authUser)
  ),
  withFirebase
)(ManageEvents);
