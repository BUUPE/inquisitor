import React, { Component } from "react";
import swal from "@sweetalert/with-react";
import DayPicker, { DateUtils } from "react-day-picker";
import "react-day-picker/lib/style.css";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Toast from "react-bootstrap/Toast";

import { withFirebase } from "../Firebase";
import AdminLayout from "./AdminLayout";
import Loader from "../Loader";

const DEFAULT_GENERAL_SETTINGS = {
  applicationsOpen: false,
  timeslotsOpen: false,
  timeslotsOpenForApplicants: false,
  timeslotLength: 45,
  timeslotDays: [],
  timeslotStart: 8,
  timeslotEnd: 22,
};

class GeneralSettings extends Component {
  _initFirebase = false;
  state = {
    settings: null,
    loading: true,
    showToast: false,
  };

  componentDidMount() {
    if (this.props.firebase && !this._initFirebase) this.loadSettings();
  }

  componentDidUpdate() {
    if (this.props.firebase && !this._initFirebase) this.loadSettings();
  }

  loadSettings = async () => {
    this._initFirebase = true;
    const doc = await this.props.firebase.generalSettings().get();

    if (!doc.exists) {
      await this.props.firebase.generalSettings().set(DEFAULT_GENERAL_SETTINGS);
      this.setState({
        settings: DEFAULT_GENERAL_SETTINGS,
        loading: false,
      });
    } else {
      const settings = doc.data();
      settings.timeslotDays = settings.timeslotDays.map((day) => day.toDate());
      this.setState({
        settings,
        loading: false,
      });
    }
  };

  resetSettings = () => {
    swal({
      title: "Are you sure?",
      text: "This will reset all general settings to their default values!",
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
        await this.props.firebase
          .generalSettings()
          .set(DEFAULT_GENERAL_SETTINGS);
        this.setState({
          settings: DEFAULT_GENERAL_SETTINGS,
          showToast: true,
        });
      }
    });
  };

  saveSettings = async (e) => {
    e.preventDefault();
    const { settings } = this.state;

    if (
      (settings.timeslotsOpen || settings.timeslotsOpenForApplicants) &&
      settings.timeslotDays.length === 0
    ) {
      return swal(
        "Uh oh!",
        "If timeslot selection is open, you must select timeslot days!",
        "error"
      );
    }

    if (!settings.timeslotsOpen) {
      settings.timeslotsOpenForApplicants = false;
      settings.timeslotDays = [];
    }

    await this.props.firebase.generalSettings().set(settings);
    this.setState({ showToast: true });
  };

  handleDayClick = (day, { selected }) => {
    const { timeslotDays } = this.state.settings;
    if (selected) {
      const selectedIndex = timeslotDays.findIndex((selectedDay) =>
        DateUtils.isSameDay(selectedDay, day)
      );
      timeslotDays.splice(selectedIndex, 1);
    } else {
      timeslotDays.push(day);
    }
    this.setState({ settings: { ...this.state.settings, timeslotDays } });
  };

  render() {
    const { loading, settings, showToast } = this.state;

    if (loading) return <Loader />;

    let initialMonth = new Date();
    if (settings.timeslotDays.length > 0) {
      initialMonth = settings.timeslotDays[0];
    }

    return (
      <AdminLayout>
        <h1>General Settings</h1>

        <Form onSubmit={this.saveSettings}>
          <Form.Row>
            <Form.Check
              custom
              checked={settings.applicationsOpen}
              type="switch"
              label={`Applications are ${
                settings.applicationsOpen ? "open" : "closed"
              }`}
              id="applicationsOpen"
              onChange={(e) =>
                this.setState({
                  settings: { ...settings, applicationsOpen: e.target.checked },
                })
              }
            />
          </Form.Row>
          <hr />
          <Form.Row>
            <div stlye={{ display: "flex", flexDirection: "column" }}>
              <Form.Check
                custom
                checked={settings.timeslotsOpen}
                type="switch"
                label={
                  <span>
                    Timeslot selection for <strong>interviewers</strong> is{" "}
                    {settings.timeslotsOpen ? "open" : "closed"}
                  </span>
                }
                id="timeslotsOpen"
                onChange={(e) =>
                  this.setState({
                    settings: { ...settings, timeslotsOpen: e.target.checked },
                  })
                }
              />
              {settings.timeslotsOpen && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    marginTop: 15,
                  }}
                >
                  <Form.Group controlId="timeslotStart">
                    <Form.Label>Timeslot Start Time</Form.Label>
                    <Form.Control
                      type="time"
                      placeholder="Enter Start..."
                      step="3600"
                      value={`${settings.timeslotStart
                        .toString()
                        .padStart(2, "0")}:00`}
                      onChange={(e) =>
                        this.setState({
                          settings: {
                            ...settings,
                            timeslotStart: parseInt(
                              e.target.value.split(":")[0]
                            ),
                          },
                        })
                      }
                    />
                    <Form.Text className="text-muted">
                      Earliest time an interview can start.
                    </Form.Text>
                  </Form.Group>
                  <Form.Group controlId="timeslotEnd">
                    <Form.Label>Timeslot End Time</Form.Label>
                    <Form.Control
                      type="time"
                      placeholder="Enter End..."
                      step="3600"
                      value={`${settings.timeslotEnd
                        .toString()
                        .padStart(2, "0")}:00`}
                      onChange={(e) =>
                        this.setState({
                          settings: {
                            ...settings,
                            timeslotEnd: parseInt(e.target.value.split(":")[0]),
                          },
                        })
                      }
                    />
                    <Form.Text className="text-muted">
                      Latest time an interview can end.
                    </Form.Text>
                  </Form.Group>
                  <Form.Group controlId="timeslotLength">
                    <Form.Label>Timeslot Length (minutes)</Form.Label>
                    <Form.Control
                      type="number"
                      min="30"
                      step="15"
                      max="120"
                      placeholder="Enter length..."
                      value={settings.timeslotLength}
                      onChange={(e) =>
                        this.setState({
                          settings: {
                            ...settings,
                            timeslotLength: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                    <Form.Text className="text-muted">
                      Length of a single interview.
                    </Form.Text>
                  </Form.Group>
                  <strong>Select Interview Days</strong>
                  <DayPicker
                    initialMonth={initialMonth}
                    selectedDays={settings.timeslotDays}
                    onDayClick={this.handleDayClick}
                  />
                  {settings.timeslotDays.length > 0 && (
                    <Button
                      onClick={() =>
                        this.setState({
                          settings: { ...settings, timeslotDays: [] },
                        })
                      }
                    >
                      Clear
                    </Button>
                  )}
                  <Form.Check
                    style={{ marginTop: 15 }}
                    custom
                    checked={settings.timeslotsOpenForApplicants}
                    type="switch"
                    label={
                      <span>
                        Timeslot selection for <strong>applicants</strong> is{" "}
                        {settings.timeslotsOpenForApplicants
                          ? "open"
                          : "closed"}
                      </span>
                    }
                    id="timeslotsOpenForApplicants"
                    onChange={(e) =>
                      this.setState({
                        settings: {
                          ...settings,
                          timeslotsOpenForApplicants: e.target.checked,
                        },
                      })
                    }
                  />
                </div>
              )}
            </div>
          </Form.Row>
          <hr />
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                flexGrow: 1,
              }}
            >
              <Button type="submit">Save</Button>
              <Toast
                onClose={() => this.setState({ showToast: false })}
                show={showToast}
                delay={3000}
                autohide
                style={{
                  width: "fit-content",
                  marginLeft: 25,
                }}
              >
                <Toast.Header>
                  <strong className="mr-auto">Settings Saved!</strong>
                </Toast.Header>
              </Toast>
            </div>
            <Button variant="danger" onClick={this.resetSettings}>
              Reset
            </Button>
          </div>
        </Form>
      </AdminLayout>
    );
  }
}

export default withFirebase(GeneralSettings);
