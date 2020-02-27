const fs = require('fs');
const moment = require('moment');
const app = require('firebase/app');
require('firebase/auth');
require('firebase/firestore');
require('dotenv').config()

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  interviewerEmail: process.env.INTERVIEWER_EMAIL,
  interviewerPassword: process.env.INTERVIEWER_PASS,
};

class Firebase {
  constructor() {
    app.initializeApp(config);
    this.auth = app.auth();
    this.firestore = app.firestore();
  }

  signIn(email, password) {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  interviews() {
    return this.firestore.collection('interview');
  }

  notes(uid) {
    return this.firestore.collection('interview').doc(uid).collection('notes').doc(uid);
  }
}

var stream = fs.createWriteStream(`${moment().format('hh-mm-ss')}.dump.json`, {flags:'a'});
const firebase = new Firebase();
firebase.signIn(config.interviewerEmail, config.interviewerPassword).then(auth => {
  firebase.interviews().get().then(snapshot => snapshot.forEach(doc => {
    firebase.notes(doc.id).get().then(notes => {
      const temp = {
        id: doc.id,
        details: doc.data(),
        notes: notes.data()
      };
      stream.write(JSON.stringify(temp) + "\n");
      console.log(`Processed doc: ${doc.id}`);
    });
  }));
});
