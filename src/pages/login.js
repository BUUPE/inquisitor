import React, { useEffect, useContext } from "react";
import { navigate } from "gatsby";

//import { withFirebase } from "../components/Firebase";
import { withFirebase, FirebaseContext } from "upe-react-components/Firebase";
//import Layout from "../components/Layout";
import Layout from "../components/Layout2";
import Logo from "../components/Logo";
import { Centered } from "../styles/global";

const Login = ({ firebase }) => {
  useEffect(() => {
    console.log("firebase", firebase);
    if (firebase) {
      console.log("ya");
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      if (token) {
        const pathname = window.localStorage.getItem("pathname");
        window.localStorage.removeItem("pathname");
        firebase
          .doSignInWithToken(token)
          .then(() => navigate(pathname ? pathname : "/"))
          .catch(console.error);
      } else {
        window.location.href = "https://upe-authenticator.herokuapp.com/";
      }
    }
  }, [firebase]);

  const poo = useContext(FirebaseContext);
  console.log("poo", poo);

  return (
    <Centered>
      <Logo size="medium" />
      <h1>Authenticating...</h1>
    </Centered>
  );
};

const LoginPage = withFirebase(Login);
console.log("withFirebase", withFirebase);

export default () => (
  <Layout>
    <LoginPage />
  </Layout>
);
