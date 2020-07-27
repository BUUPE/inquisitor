import React, { useEffect } from "react";
import { navigate } from "gatsby";

import { withFirebase } from "../components/Firebase";
import Layout from "../components/Layout";
import Logo from "../components/Logo";
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
    <Centered>
      <Logo size="medium" />
      <h1>Signing Out...</h1>
    </Centered>
  );
};

const LogoutPage = withFirebase(Logout);

export default () => (
  <Layout>
    <LogoutPage />
  </Layout>
);
