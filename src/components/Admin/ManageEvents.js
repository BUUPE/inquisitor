import React, { Component } from "react";
import styled from "styled-components";
import { compose } from "recompose";
import QRCode from "qrcode.react";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";
import "react-day-picker/lib/style.css";

import {
  withFirebase,
  withAuthorization,
  AuthUserContext,
} from "upe-react-components";
import cloneDeep from "lodash.clonedeep";

import { isAdmin } from "../../util/conditions";
import AdminLayout from "./AdminLayout";
import Loader from "../Loader";
import { BackIcon } from "../TextDisplay";

import { Title, Text, StyledButton, Centered } from "../../styles/global";

import { DEFAULT_WEBSITE_EVENT, DEFAULT_EVENT } from "../../util/config";
import EventFile from "./EventFile";
import EventForm from "./EventForm";

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
              uid: doc.id,
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

  fetchEvent = (uid) => {
    if (!uid) return;

    if (typeof this.unsubCurrentEventWebsite === "function")
      this.unsubCurrentEventWebsite();
    this.unsubCurrentEventWebsite = this.props.firebase
      .event(uid)
      .onSnapshot((doc) => {
        if (!doc.exists) return console.log("Event not found!");
        const fetchedEvent = { ...doc.data(), uid: doc.id };
        this.setState({ currentEventWebsite: fetchedEvent });
      });
  };

  toggleEventStatus = async () => {
    const { currentEvent, currentEventWebsite } = this.state;
    if (!currentEventWebsite || !currentEvent) return;

    const updatedEvent = cloneDeep(currentEvent);
    updatedEvent.open = !updatedEvent.open;

    delete updatedEvent.uid;

    await this.props.firebase
      .recruitmentEvent(currentEvent.uid)
      .set(updatedEvent)
      .then(() => {
        updatedEvent.uid = currentEvent.uid;
        this.setState({ currentEvent: updatedEvent });
        this.fetchEvent(updatedEvent.uid);
      })
      .catch((error) => console.log("Failed to save event"));
  };

  deleteEvent = async () => {
    const { currentEvent, currentEventWebsite } = this.state;
    if (!currentEventWebsite || !currentEvent) return;
    this.setState({ loading: true });

    const deleteEvent = this.props.firebase
      .event(currentEventWebsite.uid)
      .delete()
      .catch((error) => console.log("Failed to delete Website Event"));
    const deleteWebsiteEvent = this.props.firebase
      .recruitmentEvent(currentEvent.uid)
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
    delete websiteEvent.uid;
    if (edit) {
      await this.props.firebase
        .events()
        .doc(currentEventWebsite.uid)
        .set(websiteEvent)
        .then(async () => {
          delete eventToSave.uid;
          await this.props.firebase
            .recruitmentEvents()
            .doc(currentEvent.uid)
            .set(eventToSave)
            .then(() => {
              eventToSave.uid = currentEvent.uid;
              websiteEvent.uid = currentEventWebsite.uid;
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
          delete eventToSave.uid;
          eventToSave.websiteReference = docRef.id;

          await this.props.firebase
            .recruitmentEvents()
            .doc(docRef.id)
            .set(eventToSave)
            .then(() => {
              eventToSave.uid = docRef.id;
              websiteEvent.uid = docRef.id;
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
    const { currentEvent, showQRModal } = this.state;
    if (!currentEvent) return;

    this.setState({ showQRModal: !showQRModal });
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

      return (
        <EventFile
          currentEvent={currentEvent}
          currentEventWebsite={currentEventWebsite}
          deleteEvent={() => this.deleteEvent()}
          toggleEditEvent={() => this.toggleEditEvent()}
          toggleEventStatus={() => this.toggleEventStatus()}
          toggleQRModal={() => this.toggleQRModal()}
        />
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
                      <EventListItem key={event.uid} data={event} />
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
  withAuthorization((authUser) => isAdmin(authUser)),
  withFirebase
)(ManageEvents);
