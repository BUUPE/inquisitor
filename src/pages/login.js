import React, { useEffect } from "react";
import { navigate } from "gatsby";

import { withFirebase } from "../components/Firebase";
import Layout from "../components/Layout";
import Logo from "../components/Logo";
import { Centered } from "../styles/global";

const Login = ({ firebase }) => {
  useEffect(() => {
    if (firebase) {
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

  return (
    <Centered>
      <Logo size="medium" />
      <h1>Authenticating...</h1>
    </Centered>
  );
};

const LoginPage = withFirebase(Login);

export default () => (
  <Layout>
    <LoginPage />
  </Layout>
);
