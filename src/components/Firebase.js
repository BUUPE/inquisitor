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
    this.functions = app.functions();

    // *** Functions API ***
    this.exportInquisitorData = this.functions.httpsCallable(
      "exportInquisitorData"
    );
    this.importInquisitorData = this.functions.httpsCallable(
      "importInquisitorData"
    );
  }

  // *** Auth API ***
  doSignInWithToken = (token) => this.auth.signInWithCustomToken(token);

  doSignOut = () =>
    this.auth.signOut().then(() => localStorage.removeItem("authUser"));

  getIdToken = () => {
    if (this.auth.currentUser) return this.auth.currentUser.getIdToken();
    else return new Promise((resolve) => resolve(null));
  };

  // *** Merge Auth and DB User API ***
  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        this.user(authUser.uid)
          .get()
          .then(async (snapshot) => {
            if (snapshot.exists) {
              const dbUser = snapshot.data();
              if (!dbUser.hasOwnProperty("roles")) {
                dbUser.roles = {
                  guest: true,
                };
                await this.user(authUser.uid).update(dbUser);
              }

              authUser = {
                uid: authUser.uid,
                email: authUser.email,
                emailVerified: authUser.emailVerified,
                providerData: authUser.providerData,
                ...dbUser,
              };

              next(authUser);
            } else {
              const dbUser = {
                roles: {
                  guest: true,
                },
              };

              this.user(authUser.uid)
                .set(dbUser)
                .then(() => {
                  authUser = {
                    uid: authUser.uid,
                    email: authUser.email,
                    emailVerified: authUser.emailVerified,
                    providerData: authUser.providerData,
                    ...dbUser,
                  };

                  next(authUser);
                });
            }
          })
          .catch(console.error);
      } else {
        fallback();
      }
    });

  // *** User API ***
  user = (uid) => this.firestore.doc(`users/${uid}`);
  users = () => this.firestore.collection("users");

  application = (uid) =>
    this.inquisitorData.collection("applications").doc(uid);
  applications = () => this.inquisitorData.collection("applications");

  timeslot = (uid) => this.inquisitorData.collection("timeslots").doc(uid);
  timeslots = () => this.inquisitorData.collection("timeslots");

  applicationFormConfig = () =>
    this.firestore.doc("inquisitor/applicationFormConfig");
  generalSettings = () => this.firestore.doc("inquisitor/generalSettings");

  allRoles = () => this.firestore.doc("config/roles");

  // *** Storage API ***
  file = (uid, name) => this.storage.child(`files/${uid}/${name}`);
  backup = (name) => this.storage.child(`backups/${name}`);
}

export default Firebase;
