import React from "react";

import Layout from "../components/Layout";
import ApplicationForm from "../components/ApplicationForm";

// check if application form is open, otherwise show message
const ApplyPage = () => (
  <Layout>
    <ApplicationForm />
  </Layout>
);

export default ApplyPage;
