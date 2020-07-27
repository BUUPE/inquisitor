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

class Firebase {
  constructor(app) {
    app.initializeApp(config);

    /* Firebase APIs */

    this.auth = app.auth();
    this.firestore = app.firestore().doc("inquisitor/data");
    this.firestoreRoot = app.firestore();
    this.storage = app.storage().ref("inquisitor");
  }

  // *** Auth API ***

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignOut = () => this.auth.signOut();

  // *** Merge Auth and DB User API *** //

  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        this.user(authUser.uid)
          .get()
          .then((snapshot) => {
            if (snapshot.exists) {
              const dbUser = snapshot.data();

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
                roles: ["Guest"],
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
          });
      } else {
        fallback();
      }
    });

  // *** User API ***
  user = (uid) => this.firestoreRoot.doc(`users/${uid}`);
  file = (uid, name) => this.storage.child(`files/${uid}/${name}`);
  application = (uid) => this.firestore.collection("applications").doc(uid);
  applications = () => this.firestore.collection("applications");

  applicationFormConfig = () =>
    this.firestoreRoot.doc("inquisitor/applicationFormConfig");
}

let firebase;

function getFirebase(app, auth, firestore, storage) {
  if (!firebase) {
    firebase = new Firebase(app, auth, firestore, storage);
  }

  return firebase;
}

export default getFirebase;
