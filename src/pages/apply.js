import React from "react";

import Layout from "../components/Layout";
import ApplicationForm from "../components/ApplicationForm";

const ApplyPage = ({ location }) => (
  <Layout>
    <ApplicationForm location={location} />
  </Layout>
);

export default ApplyPage;
