import { Firebase as FirebaseSuper } from "upe-react-components";

const config = {
  apiKey: "AIzaSyBxBIbTYbRuqP1np-ri4YaJ0H6OYK4L46g",
  authDomain: "upe-website-fa07a.firebaseapp.com",
  databaseURL: "https://upe-website-fa07a.firebaseio.com",
  projectId: "upe-website-fa07a",
  storageBucket: "upe-website-fa07a.appspot.com",
  messagingSenderId: "896060764020",
  appId: "1:896060764020:web:331114a396e41adfa30621",
  measurementId: "G-BV6VQMMSQ5",
};

class Firebase extends FirebaseSuper {
  constructor(app) {
    super(app, config);

    this.inquisitorData = app.firestore().doc("inquisitor/data");
    this.storage = app.storage().ref("inquisitor");
    this.profiles = app.storage().ref("profiles");
    this.functions = app.functions();

    // *** Functions API ***
    this.exportInquisitorData = this.functions.httpsCallable(
      "exportInquisitorData"
    );
    this.importInquisitorData = this.functions.httpsCallable(
      "importInquisitorData"
    );
    this.sendApplicationReceipt = this.functions.httpsCallable(
      "sendApplicationReceipt"
    );
    this.applicantTimeslotsOpen = this.functions.httpsCallable(
      "applicantTimeslotsOpen"
    );
    this.interviewerTimeslotsOpen = this.functions.httpsCallable(
      "interviewerTimeslotsOpen"
    );
    this.timeslotSelected = this.functions.httpsCallable("timeslotSelected");
    this.timeslotUnselected =
      this.functions.httpsCallable("timeslotUnselected");
    this.sendAcceptedEmail = this.functions.httpsCallable("applicantAccepted");
    this.sendDeniedEmail = this.functions.httpsCallable("applicantDenied");

    this.sendFinalAcceptedEmail = this.functions.httpsCallable(
      "applicantFinalAccepted"
    );
    this.sendFinalDeniedEmail = this.functions.httpsCallable(
      "applicantFinalDenied"
    );
  }

  question = (uid) => this.inquisitorData.collection("questions").doc(uid);
  questions = () => this.inquisitorData.collection("questions");

  application = (uid) =>
    this.inquisitorData.collection("applications").doc(uid);
  applications = () => this.inquisitorData.collection("applications");

  interviewedApplicants = () =>
    this.inquisitorData
      .collection("applications")
      .where("interview.interviewed", "==", true)
      .orderBy("interview.level");

  question = (uid) => this.inquisitorData.collection("questions").doc(uid);

  timeslot = (uid) => this.inquisitorData.collection("timeslots").doc(uid);
  timeslots = () => this.inquisitorData.collection("timeslots");

  recruitmentEvent = (uid) => this.inquisitorData.collection("events").doc(uid);
  recruitmentEvents = () => this.inquisitorData.collection("events");

  event = (uid) =>
    this.firestore.collection("website/events/eventData").doc(uid);
  events = () => this.firestore.collection("website/events/eventData");
  getIndex = () => this.firestore.collection("website").doc("eventIndex").get();

  applicationFormConfig = () =>
    this.firestore.doc("inquisitor/applicationFormConfig");
  generalSettings = () => this.firestore.doc("inquisitor/generalSettings");
  textSettings = () => this.firestore.doc("inquisitor/textSettings");
  levelConfig = () => this.firestore.doc("inquisitor/levelConfig");

  allRoles = () => this.firestore.doc("config/roles");

  uploadProfile = (className, fileName) =>
    this.profiles.child(`${className}/${fileName}`);

  // *** Storage API ***
  file = (uid, name) => this.storage.child(`files/${uid}/${name}`);
  questionImage = (name) => this.storage.child(`Questions/${name}`);
  backup = (name) => this.storage.child(`backups/${name}`);
}

export default Firebase;
