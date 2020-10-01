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
      <Centered>
        <Logo size="medium" />
        <h1>Signing Out...</h1>
      </Centered>
    </>
  );
};

export default withFirebase(Logout);
