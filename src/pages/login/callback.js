import React, { useEffect } from "react";
import { navigate } from "gatsby";

import { withFirebase } from "../../components/Firebase";
import Layout from "../../components/Layout";

const Callback = ({ firebase }) => {
  useEffect(() => {
    if (firebase) {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      firebase
        .doSignInWithToken(token)
        .then(() => navigate("/"))
        .catch(console.error);
    }
  }, [firebase]);

  return <h1>Authenticating...</h1>;
};

const CallbackComponent = withFirebase(Callback);

export default () => (
  <Layout>
    <CallbackComponent />
  </Layout>
);
