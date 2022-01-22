import React, { useEffect } from "react";
import { navigate } from "gatsby";

import { withFirebase } from "upe-react-components";
import Logo from "../components/Logo";
import SEO from "../components/SEO";
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
        window.location.href = "http://localhost:3030";
      }
    }
  }, [firebase]);

  return (
    <>
      <SEO title="Login" route="/login" />
      <Centered style={{ paddingTop: "5%", paddingBottom: "5%" }}>
        <Logo size="large" />
        <h1
          style={{
            paddingTop: "3%",
            fontFamily: "Georgia",
            fontSize: "50px",
            fontStyle: "italic",
          }}
        >
          Authenticating...
        </h1>
      </Centered>
    </>
  );
};

export default withFirebase(Login);
