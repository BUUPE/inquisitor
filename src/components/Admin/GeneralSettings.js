import React, { Component } from "react";
import styled from "styled-components";
import { compose } from "recompose";
import swal from "@sweetalert/with-react";
import isEqual from "lodash.isequal";
import DayPicker, { DateUtils } from "react-day-picker";
import "react-day-picker/lib/style.css";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Toast from "react-bootstrap/Toast";

import { withFirebase, withAuthorization } from "upe-react-components";

import { isAdmin } from "../../util/conditions";
import AdminLayout from "./AdminLayout";
import Loader from "../Loader";
import {
  FlexDiv,
  FullWidthFormGroup,
  Title,
  Text,
  StyledButton,
} from "../../styles/global";
import { BackIcon } from "../TextDisplay";

import {
  DEFAULT_GENERAL_SETTINGS,
  DEFAULT_TEXT_SETTINGS,
} from "../../util/config";

const StyledFormRow = styled(Form.Row)`
  margin: 0;
`;

const interceptAnchors = (interceptor) =>
  Array.from(document.querySelectorAll("a")).forEach((link) =>
    link.addEventListener("click", interceptor, true)
  );
const deinterceptAnchors = (interceptor) =>
  Array.from(document.querySelectorAll("a")).forEach((link) =>
    link.removeEventListener("click", interceptor, true)
  );

class GeneralSettings extends Component {
  _initFirebase = false;
  state = {
    preSaveSettings: null,
    settings: null,
    preSaveTextSettings: null,
    textSettings: null,
    loading: true,
    showToast: false,
  };

  interceptor = async (e) => {
    if (
      !isEqual(this.state.settings, this.state.preSaveSettings) ||
      !isEqual(this.state.textSettings, this.state.preSaveTextSettings)
    ) {
      e.preventDefault();
      swal({
        title: "You have unsaved settings!",
        text: "Changes to settings will be lost! Are you sure you want to leave this page?",
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
      }).then((confirm) => {
        if (confirm) {
          deinterceptAnchors(this.interceptor);
          window.location.href = e.target.href;
        }
      });
    }
  };

  componentDidMount() {
    if (this.props.firebase && !this._initFirebase) this.loadSettings();
    interceptAnchors(this.interceptor);
  }

  componentDidUpdate() {
    if (this.props.firebase && !this._initFirebase) this.loadSettings();
    interceptAnchors(this.interceptor);
  }

  componentWillUnmount() {
    deinterceptAnchors(this.interceptor);
  }

  loadSettings = async () => {
    this._initFirebase = true;
    let loadedOne = false;
    const doc = await this.props.firebase.generalSettings().get();
    const docTwo = await this.props.firebase.textSettings().get();

    if (!doc.exists) {
      await this.props.firebase.generalSettings().set(DEFAULT_GENERAL_SETTINGS);
      this.setState({
        settings: DEFAULT_GENERAL_SETTINGS,
        preSaveSettings: DEFAULT_GENERAL_SETTINGS,
        loading: !loadedOne,
      });
      loadedOne = true;
    } else {
      const settings = doc.data();
      settings.timeslotDays = settings.timeslotDays.map((day) => day.toDate());
      this.setState({
        settings,
        preSaveSettings: settings,
        loading: !loadedOne,
      });
      loadedOne = true;
    }

    if (!docTwo.exists) {
      await this.props.firebase.textSettings().set(DEFAULT_TEXT_SETTINGS);
      this.setState({
        textSettings: DEFAULT_TEXT_SETTINGS,
        preSaveTextSettings: DEFAULT_TEXT_SETTINGS,
        loading: !loadedOne,
      });
      loadedOne = true;
    } else {
      const textSettings = docTwo.data();
      this.setState({
        textSettings,
        preSaveTextSettings: textSettings,
        loading: !loadedOne,
      });
      loadedOne = true;
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
        await this.props.firebase.textSettings().set(DEFAULT_TEXT_SETTINGS);
        this.setState({
          settings: DEFAULT_GENERAL_SETTINGS,
          preSaveSettings: DEFAULT_GENERAL_SETTINGS,
          textSettings: DEFAULT_TEXT_SETTINGS,
          preSaveTextSettings: DEFAULT_TEXT_SETTINGS,
          showToast: true,
        });
      }
    });
  };

  saveSettings = async (e) => {
    e.preventDefault();
    const { settings, preSaveSettings, textSettings } = this.state;

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

    if (settings.timeslotStart >= settings.timeslotEnd)
      return swal(
        "Uh oh!",
        "Timeslot End Time must be greater than Timeslot Start Time!",
        "error"
      );

    let confirm = true;
    if (
      (settings.timeslotsOpenForApplicants &&
        !preSaveSettings.timeslotsOpenForApplicants) ||
      (!settings.timeslotsOpenForApplicants &&
        preSaveSettings.timeslotsOpenForApplicants)
    ) {
      const action = settings.timeslotsOpenForApplicants
        ? "opening"
        : "closing";
      const msg =
        action === "opening"
          ? "mean that applicants can start selecting their interview timeslots. This will trigger sending emails to every applicant to let them know."
          : "close timeslot selection for applicants i.e. if there are those who have not yet picked a timeslot, they will no longer be able to do so.";
      confirm = await swal({
        title: "Modifying Timeslot Selection!",
        text: `Saving these settings will ${msg} Are you sure you want to do this?`,
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
      });

      action === "opening"
        ? this.props.firebase.notifyTimeslotsAreOpen()
        : this.props.firebase.notifyTimeslotsAreClosed();
    }

    if (confirm) {
      // TODO actually send an email for this
      await this.props.firebase.generalSettings().set(settings);
      await this.props.firebase.textSettings().set(textSettings);
      this.setState({
        showToast: true,
        preSaveSettings: settings,
        preSaveTextSettings: textSettings,
      });
    } else {
      this.setState({ settings: preSaveSettings });
    }
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
    const { loading, settings, textSettings, showToast } = this.state;

    if (loading) return <Loader />;

    let initialMonth = new Date();
    if (settings.timeslotDays.length > 0) {
      initialMonth = settings.timeslotDays[0];
    }

    return (
      <AdminLayout>
        <BackIcon />
        <Title>
          <h1> General Settings </h1>
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
          <Form onSubmit={this.saveSettings}>
            <h2>General Settings</h2>
            <StyledFormRow>
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
                    settings: {
                      ...settings,
                      applicationsOpen: e.target.checked,
                    },
                  })
                }
              />
            </StyledFormRow>
            <br />
            <StyledFormRow>
              <Form.Check
                custom
                checked={settings.eventSeason}
                type="switch"
                label={`Event Season is ${settings.eventSeason ? "on" : "off"}`}
                id="eventSeason"
                onChange={(e) =>
                  this.setState({
                    settings: {
                      ...settings,
                      eventSeason: e.target.checked,
                    },
                  })
                }
              />
            </StyledFormRow>
            <h2>Timeslot Settings</h2>
            <StyledFormRow>
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
                      settings: {
                        ...settings,
                        timeslotsOpen: e.target.checked,
                      },
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
                              timeslotEnd: parseInt(
                                e.target.value.split(":")[0]
                              ),
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
            </StyledFormRow>
            <h2>Interview Settings</h2>
            <StyledFormRow>
              <Form.Group controlId="zoomlink">
                <Form.Label>Zoom Link</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="https://bostonu.zoom.us/..."
                  value={settings.zoomlink}
                  onChange={(e) =>
                    this.setState({
                      settings: {
                        ...settings,
                        zoomlink: e.target.value,
                      },
                    })
                  }
                />
              </Form.Group>
            </StyledFormRow>
            <StyledFormRow>
              <FullWidthFormGroup controlId="interviewWelcomeText">
                <Form.Label>Welcome Text</Form.Label>
                <Form.Control
                  required
                  as="textarea"
                  rows={3}
                  placeholder="FILL THIS OUT!"
                  value={textSettings.interviewWelcomeText}
                  onChange={(e) =>
                    this.setState({
                      textSettings: {
                        ...textSettings,
                        interviewWelcomeText: e.target.value,
                      },
                    })
                  }
                />
              </FullWidthFormGroup>
            </StyledFormRow>
            <StyledFormRow>
              <FullWidthFormGroup controlId="interviewOverviewText">
                <Form.Label>Overview Text</Form.Label>
                <Form.Control
                  required
                  as="textarea"
                  rows={3}
                  placeholder="FILL THIS OUT!"
                  value={textSettings.interviewOverviewText}
                  onChange={(e) =>
                    this.setState({
                      textSettings: {
                        ...textSettings,
                        interviewOverviewText: e.target.value,
                      },
                    })
                  }
                />
              </FullWidthFormGroup>
            </StyledFormRow>
            <StyledFormRow>
              <FullWidthFormGroup controlId="interviewInterviewerNotesText">
                <Form.Label>Interviewer Notes</Form.Label>
                <Form.Control
                  required
                  as="textarea"
                  rows={3}
                  placeholder="FILL THIS OUT!"
                  value={textSettings.interviewInterviewerNotesText}
                  onChange={(e) =>
                    this.setState({
                      textSettings: {
                        ...textSettings,
                        interviewInterviewerNotesText: e.target.value,
                      },
                    })
                  }
                />
              </FullWidthFormGroup>
            </StyledFormRow>
            <StyledFormRow>
              <FullWidthFormGroup controlId="interviewResumeNotesText">
                <Form.Label>Resume Notes</Form.Label>
                <Form.Control
                  required
                  as="textarea"
                  rows={3}
                  placeholder="FILL THIS OUT!"
                  value={textSettings.interviewResumeNotesText}
                  onChange={(e) =>
                    this.setState({
                      textSettings: {
                        ...textSettings,
                        interviewResumeNotesText: e.target.value,
                      },
                    })
                  }
                />
              </FullWidthFormGroup>
            </StyledFormRow>
            <StyledFormRow>
              <FullWidthFormGroup controlId="interviewFinalNotesInterviewerText">
                <Form.Label>Final Notes Interviewer Text</Form.Label>
                <Form.Control
                  required
                  as="textarea"
                  rows={3}
                  placeholder="FILL THIS OUT!"
                  value={textSettings.interviewFinalNotesInterviewerText}
                  onChange={(e) =>
                    this.setState({
                      textSettings: {
                        ...textSettings,
                        interviewFinalNotesInterviewerText: e.target.value,
                      },
                    })
                  }
                />
              </FullWidthFormGroup>
            </StyledFormRow>
            <StyledFormRow>
              <FullWidthFormGroup controlId="interviewFinalNotesApplicantText">
                <Form.Label>Final Notes Applicant Text</Form.Label>
                <Form.Control
                  required
                  as="textarea"
                  rows={3}
                  placeholder="FILL THIS OUT!"
                  value={textSettings.interviewFinalNotesApplicantText}
                  onChange={(e) =>
                    this.setState({
                      textSettings: {
                        ...textSettings,
                        interviewFinalNotesApplicantText: e.target.value,
                      },
                    })
                  }
                />
              </FullWidthFormGroup>
            </StyledFormRow>
            {/* TODO: warning here with swal when flipping deliberations, it will reset deliberation object in applications */}
            <Form.Row>
              <Form.Check
                custom
                checked={settings.deliberationsOpen}
                type="switch"
                label={`Deliberations are ${
                  settings.deliberationsOpen ? "open" : "closed"
                }`}
                id="deliberationsOpen"
                onChange={(e) =>
                  this.setState({
                    settings: {
                      ...settings,
                      deliberationsOpen: e.target.checked,
                    },
                  })
                }
              />
            </Form.Row>
            <br />
            <Form.Row>
              <Form.Check
                custom
                checked={settings.useTwoRoundDeliberations}
                type="switch"
                label={`Two Round Deliberations is ${
                  settings.useTwoRoundDeliberations ? "enabled" : "disabled"
                }`}
                id="useTwoRoundDeliberations"
                onChange={(e) =>
                  this.setState({
                    settings: {
                      ...settings,
                      useTwoRoundDeliberations: e.target.checked,
                    },
                  })
                }
              />
            </Form.Row>
            <br />
            <Form.Row>
              <Form.Check
                custom
                checked={settings.remoteInterview}
                type="switch"
                label={`Remote Interviews are ${
                  settings.remoteInterview ? "enabled" : "disabled"
                }`}
                id="remoteInterview"
                onChange={(e) =>
                  this.setState({
                    settings: {
                      ...settings,
                      remoteInterview: e.target.checked,
                    },
                  })
                }
              />
            </Form.Row>

            <hr />
            <FlexDiv>
              <FlexDiv
                style={{
                  flexGrow: 1,
                }}
              >
                <StyledButton
                  paddingTop={"0.5%"}
                  paddingRight={"2%"}
                  paddingBottom={"0.5%"}
                  paddingLeft={"2%"}
                  green
                  type="submit"
                >
                  Save
                </StyledButton>
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
              </FlexDiv>
              <StyledButton
                paddingTop={"0.5%"}
                paddingRight={"2%"}
                paddingBottom={"0.5%"}
                paddingLeft={"2%"}
                onClick={this.resetSettings}
              >
                Reset
              </StyledButton>
            </FlexDiv>
          </Form>
        </Text>
      </AdminLayout>
    );
  }
}

export default compose(
  withAuthorization(isAdmin),
  withFirebase
)(GeneralSettings);
