import React, { Fragment, Component, useState } from "react";
import styled from "styled-components";
import { compose } from "recompose";
import QRCode from "qrcode.react";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import DayPicker from "react-day-picker";
import "react-day-picker/lib/style.css";

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

import {
  Title,
  Text,
  StyledButton,
  FullWidthFormRow,
  FullWidthFormGroup,
  CenteredForm,
  Centered,
} from "../../styles/global";

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

const DEFAULT_EVENT = {
  id: "default",
  title: "Default Event",
  open: false,
  websiteReference: "default",
  attendance: {},
  upeAttendance: {},
};

const DEFAULT_WEBSITE_EVENT = {
  id: "default",
  allDay: false,
  startDay: "1",
  startMonth: "1",
  startYear: "2000",
  startHour: "12",
  startMinute: "0",
  endDay: "1",
  endMonth: "1",
  endYear: "2000",
  endHour: "13",
  endMinute: "0",
  index: 10000,
  title: "Default Event",
};

const EventForm = ({ initialFormData, submitFunction, SubmitButton }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [startDays, setStartDays] = useState([]);
  const [endDays, setEndDays] = useState([]);

  const [validated, setValidated] = useState(false);

  const saveLevel = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
    } else {
      submitFunction(cloneDeep(formData));
      setValidated(false);
    }
  };

  return (
    <CenteredForm noValidate validated={validated} onSubmit={saveLevel}>
      <FullWidthFormRow>
        <FullWidthFormGroup controlId="title">
          <Form.Label>
            <h5>Title</h5>
          </Form.Label>
          <Form.Control
            name="event.title"
            type="text"
            placeholder="Enter event title..."
            value={formData.event.title}
            onChange={(e) => {
              const cloned = cloneDeep(formData);
              cloned.event.title = e.target.value;
              setFormData(cloned);
            }}
            required
          />
        </FullWidthFormGroup>
      </FullWidthFormRow>

      <FullWidthFormRow>
        <FullWidthFormGroup controlId="allDay">
          <Form.Label>
            <h5>Is this an All Day Event?</h5>
          </Form.Label>
          <Form.Check
            custom
            checked={formData.website.allDay}
            type="switch"
            label="test"
            id="website.allDay"
            onChange={(e) => {
              const cloned = cloneDeep(formData);
              cloned.website.allDay = !formData.website.allDay;
              setFormData(cloned);
            }}
          />
        </FullWidthFormGroup>
      </FullWidthFormRow>

      <FullWidthFormRow>
        <FullWidthFormGroup controlId="startTime">
          <Form.Label>
            <h5> {!formData.website.allDay ? "Start Time" : "Event Day"} </h5>
          </Form.Label>
          {!formData.website.allDay && (
            <Form.Control
              type="time"
              placeholder="Enter Start Time..."
              step="18000"
              value={formData.website.startHour
                .padStart(2, "0")
                .concat(":", formData.website.startMinute.padStart(2, "0"))}
              onChange={(e) => {
                const cloned = cloneDeep(formData);
                cloned.website.startHour = e.target.value.split(":")[0];
                cloned.website.startMinute = e.target.value.split(":")[1];
                setFormData(cloned);
              }}
            />
          )}

          <br />

          <DayPicker
            initialMonth={new Date()}
            selectedDays={startDays}
            onDayClick={(day, { selected }) => {
              if (selected) {
                setStartDays([]);
                const cloned = cloneDeep(formData);
                cloned.website.startMonth = DEFAULT_WEBSITE_EVENT.startMonth;
                cloned.website.startDay = DEFAULT_WEBSITE_EVENT.startDay;
                cloned.website.startYear = DEFAULT_WEBSITE_EVENT.startYear;
                setFormData(cloned);
              } else {
                let tempDays = [];
                tempDays.push(day);
                setStartDays(tempDays);
                const cloned = cloneDeep(formData);
                cloned.website.startMonth = String(day.getMonth() + 1);
                cloned.website.startDay = String(day.getDate());
                cloned.website.startYear = String(day.getFullYear());
                setFormData(cloned);
              }
            }}
          />
          {startDays.length > 0 && (
            <Button
              onClick={() => {
                setStartDays([]);
              }}
            >
              Clear
            </Button>
          )}
        </FullWidthFormGroup>
      </FullWidthFormRow>

      {!formData.website.allDay && (
        <FullWidthFormRow>
          <FullWidthFormGroup controlId="endTime">
            <Form.Label>
              <h5>End Time</h5>
            </Form.Label>
            <Form.Control
              type="time"
              placeholder="Enter End Time..."
              step="18000"
              value={formData.website.endHour
                .padStart(2, "0")
                .concat(":", formData.website.endMinute.padStart(2, "0"))}
              onChange={(e) => {
                const cloned = cloneDeep(formData);
                cloned.website.endHour = e.target.value.split(":")[0];
                cloned.website.endMinute = e.target.value.split(":")[1];
                setFormData(cloned);
              }}
            />
            <DayPicker
              initialMonth={new Date()}
              selectedDays={endDays}
              onDayClick={(day, { selected }) => {
                if (selected) {
                  setEndDays([]);
                  const cloned = cloneDeep(formData);
                  cloned.website.endMonth = DEFAULT_WEBSITE_EVENT.endMonth;
                  cloned.website.endDay = DEFAULT_WEBSITE_EVENT.endDay;
                  cloned.website.endYear = DEFAULT_WEBSITE_EVENT.endYear;
                  setFormData(cloned);
                } else {
                  let tempDays = [];
                  tempDays.push(day);
                  setEndDays(tempDays);
                  const cloned = cloneDeep(formData);
                  cloned.website.endMonth = String(day.getMonth() + 1);
                  cloned.website.endDay = String(day.getDate());
                  cloned.website.endYear = String(day.getFullYear());
                  setFormData(cloned);
                }
              }}
            />
            {endDays.length > 0 && (
              <Button
                onClick={() => {
                  setEndDays([]);
                }}
              >
                Clear
              </Button>
            )}
          </FullWidthFormGroup>
        </FullWidthFormRow>
      )}

      <SubmitButton />
    </CenteredForm>
  );
};

class ManageEvents extends Component {
  _initFirebase = false;
  state = {
    edit: false,
    loading: true,
    maxIndex: 1000000,
    events: [],
    currentEvent: null,
    currentEventWebsite: null,
    showModal: false,
    showQRModal: false,
    modalEvent: DEFAULT_EVENT,
    modalWebsiteEvent: DEFAULT_WEBSITE_EVENT,
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

    await this.props.firebase.getIndex().then((doc) => {
      this.setState({ maxIndex: doc.data().maxIndex + 1 });
    });

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

  toggleAddEvent = () => {
    const { showModal } = this.state;
    this.setState({
      edit: false,
      showModal: !showModal,
      modalWebsiteEvent: DEFAULT_WEBSITE_EVENT,
      modalEvent: DEFAULT_EVENT,
    });
  };

  toggleEditEvent = () => {
    const { showModal, currentEvent, currentEventWebsite } = this.state;
    if (!currentEvent || !currentEventWebsite) return;

    this.setState({
      edit: true,
      showModal: !showModal,
      modalWebsiteEvent: currentEventWebsite,
      modalEvent: currentEvent,
    });
  };

  saveNewEvent = async (formData) => {
    const { currentEventWebsite, currentEvent, edit } = this.state;
    const eventToSave = formData.event;
    const websiteEvent = formData.website;

    websiteEvent.title = eventToSave.title;
    websiteEvent.index = this.state.maxIndex;
    delete websiteEvent.id;
    if (edit) {
      await this.props.firebase
        .events()
        .doc(currentEventWebsite.id)
        .set(websiteEvent)
        .then(async () => {
          delete eventToSave.id;
          await this.props.firebase
            .recruitmentEvents()
            .doc(currentEvent.id)
            .set(eventToSave)
            .then(() => {
              eventToSave.id = currentEvent.id;
              websiteEvent.id = currentEventWebsite.id;
              this.setState({
                showModal: false,
                modalWebsiteEvent: DEFAULT_WEBSITE_EVENT,
                modalEvent: DEFAULT_EVENT,
                currentEvent: eventToSave,
                currentEventWebsite: websiteEvent,
              });
            })
            .catch((error) => console.log("Unable to add Recruitment Event"));
        })
        .catch((error) => console.log("Unable to add Event", error));
    } else {
      await this.props.firebase
        .events()
        .add(websiteEvent)
        .then(async (docRef) => {
          delete eventToSave.id;
          eventToSave.websiteReference = docRef.id;

          await this.props.firebase
            .recruitmentEvents()
            .doc(docRef.id)
            .set(eventToSave)
            .then(() => {
              eventToSave.id = docRef.id;
              websiteEvent.id = docRef.id;
              this.setState({
                showModal: false,
                modalWebsiteEvent: DEFAULT_WEBSITE_EVENT,
                modalEvent: DEFAULT_EVENT,
                currentEvent: eventToSave,
                currentEventWebsite: websiteEvent,
              });
            })
            .catch((error) => console.log("Unable to add Recruitment Event"));
        })
        .catch((error) => console.log("Unable to add Event"));
    }
  };

  toggleQRModal = () => {
    const { currentEvent } = this.state;
    if (!currentEvent) return;

    this.setState({ showQRModal: true });
  };

  render() {
    const {
      loading,
      currentEvent,
      events,
      currentEventWebsite,
      showModal,
      showQRModal,
      modalWebsiteEvent,
      modalEvent,
    } = this.state;
    const hasEvents = events.length !== 0;

    if (loading) return <Loader />;

    const combinedData = {
      event: modalEvent,
      website: modalWebsiteEvent,
    };

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
          <ResponseDiv width={"33%"}>
            <h3> Title </h3>
            <p> {currentEvent.title} </p>
          </ResponseDiv>
          <ResponseDiv width={"33%"}>
            <h3> Time </h3>
            {currentEventWebsite.allDay && (
              <p>
                {" "}
                All Day - {currentEventWebsite.startMonth}/
                {currentEventWebsite.startDay}/{currentEventWebsite.startYear}{" "}
              </p>
            )}
            {!currentEventWebsite.allDay && (
              <p>
                {formattedStartHour}:{formattedStartMinute} -{" "}
                {currentEventWebsite.startMonth}/{currentEventWebsite.startDay}/
                {currentEventWebsite.startYear} to {formattedEndHour}:
                {formattedEndMinute} - {currentEventWebsite.endMonth}/
                {currentEventWebsite.endDay}/{currentEventWebsite.endYear}
              </p>
            )}
          </ResponseDiv>
          <ResponseDiv width={"33%"}>
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
          <ResponseDiv width={"25%"}>
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
          <ResponseDiv width={"25%"}>
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
          <ResponseDiv width={"25%"}>
            <StyledButton
              paddingTop={"0.5%"}
              paddingRight={"3%"}
              paddingBottom={"0.5%"}
              paddingLeft={"3%"}
              onClick={() => this.toggleQRModal()}
            >
              Get QR Code
            </StyledButton>
          </ResponseDiv>
          <ResponseDiv width={"25%"}>
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

    const SubmitButton = () => (
      <StyledButton
        paddingTop={"0.5%"}
        paddingRight={"3%"}
        paddingBottom={"0.5%"}
        paddingLeft={"3%"}
        type="submit"
      >
        Save
      </StyledButton>
    );

    const QRCodeWrapper = () => {
      if (!currentEvent) return <h1> No event selected! </h1>;

      return (
        <QRCode
          size={"400"}
          value={`https://upe.bu.edu/inquisitor/events?code=${currentEvent.id}`}
        />
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
                style={{ marginBottom: "5%" }}
                paddingTop={"0.5%"}
                paddingRight={"3%"}
                paddingBottom={"0.5%"}
                paddingLeft={"3%"}
                onClick={() => this.toggleAddEvent()}
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

        <Modal show={showQRModal} onHide={() => this.toggleQRModal()}>
          <Modal.Header closeButton>
            <Modal.Title> Event QR </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{}}>
            <Centered>
              <QRCodeWrapper />
            </Centered>
          </Modal.Body>
        </Modal>

        <Modal show={showModal} onHide={() => this.toggleAddEvent()}>
          <Modal.Header closeButton>
            <Modal.Title>Add Event</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <EventForm
              SubmitButton={SubmitButton}
              initialFormData={combinedData}
              submitFunction={(formData) => this.saveNewEvent(formData)}
            />
          </Modal.Body>
        </Modal>
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
