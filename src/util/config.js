export const DEFAULT_GENERAL_SETTINGS = {
  deliberationsOpen: false,
  useTwoRoundDeliberations: false,
  applicationsOpen: false,
  timeslotsOpen: false,
  timeslotsOpenForApplicants: false,
  remoteInterview: false,
  timeslotLength: 45,
  timeslotDays: [],
  timeslotStart: 8,
  timeslotEnd: 22,
  zoomlink: "https://bostonu.zoom.us/s/96821681891",
};

export const DEFAULT_TEXT_SETTINGS = {
  interviewWelcomeText: "",
  interviewOverviewText: "",
  interviewInterviewerNotesText: "",
  interviewResumeNotesText: "",
  interviewFinalNotesInterviewerText: "",
  interviewFinalNotesApplicantText: "",
};

export const DEFAULT_EVENT = {
  uid: "default",
  title: "Default Event",
  open: false,
  websiteReference: "default",
  attendance: {},
  upeAttendance: {},
};

export const DEFAULT_WEBSITE_EVENT = {
  uid: "default",
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
