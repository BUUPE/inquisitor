import React, { useEffect } from "react";
import { navigate } from "gatsby";

import { withFirebase } from "upe-react-components";
import Logo from "../components/Logo";
import SEO from "../components/SEO";
import { Centered } from "../styles/global";

const Logout = ({ firebase }) => {
  useEffect(() => {
    if (firebase) {
      firebase
        .doSignOut()
        .then(() => navigate("/"))
        .catch(console.error);
    }
  }, [firebase]);

  return (
    <>
      <SEO title="Logout" route="/logout" />
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
          Signing Out...
        </h1>
      </Centered>
    </>
  );
};

export default withFirebase(Logout);
