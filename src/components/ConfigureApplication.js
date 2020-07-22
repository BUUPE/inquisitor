import React, { useState, useEffect } from "react";
import { compose } from "recompose";

import AdminLayout from "./AdminLayout";
import { FormExample } from "./GeneralSettings";
import { withAuthorization } from "../components/Session";
import { withFirebase } from "../components/Firebase";

/*
  Types of questions:
  short/long text, number, checkbox, file upload
  Things that wont change semester to semester: name, email, major, year, resume

  Things that may change: taken 112/330 checkbox, short paragraph questions
  Allow addition/removal of checkboxes and textareas for now, as well as reordering them
*/

const ConfigureApplication = ({ firebase }) => {
  const [applicationConfig, setApplicationConfig] = useState(null);
  // pull down data from firebase
  useEffect(() => {
    const getApplicationConfig = async () => {
      const doc = await firebase.applicationConfig().get();

      if (!doc.exists) {
        console.log("No such document!");
      } else {
        console.log("Document data:", doc.data());
        setApplicationConfig(doc.data());
      }
    };
    if (firebase) getApplicationConfig();
  }, [firebase]);

  return (
    <AdminLayout>
      <h1>Configure Application</h1>
      <FormExample />
    </AdminLayout>
  );
};

const condition = (authUser) => !!authUser;
export default compose(
  withAuthorization(condition),
  withFirebase
)(ConfigureApplication);
