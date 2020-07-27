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
    this.auth = app.auth();
    this.firestore = app.firestore().doc("inquisitor/data");
    this.firestoreRoot = app.firestore();
    this.storage = app.storage().ref("inquisitor");
  }

  // *** Auth API ***
  doSignInWithToken = (token) => this.auth.signInWithCustomToken(token);

  doSignOut = () => this.auth.signOut();

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
  user = (uid) => this.firestoreRoot.doc(`users/${uid}`);
  users = () => this.firestoreRoot.collection("users");
  file = (uid, name) => this.storage.child(`files/${uid}/${name}`);
  application = (uid) => this.firestore.collection("applications").doc(uid);
  applications = () => this.firestore.collection("applications");

  applicationFormConfig = () =>
    this.firestoreRoot.doc("inquisitor/applicationFormConfig");
  generalSettings = () => this.firestoreRoot.doc("inquisitor/generalSettings");
}

let firebase;

function getFirebase(app, auth, firestore, storage) {
  if (!firebase) {
    firebase = new Firebase(app, auth, firestore, storage);
  }

  return firebase;
}

export default getFirebase;
