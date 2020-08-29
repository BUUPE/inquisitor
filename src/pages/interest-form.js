import React from "react";

import Layout from "../components/Layout";
import InterestForm from "../components/InterestForm";

const InterestPage = ({ location }) => (
  <Layout>
    <InterestForm location={location} />
  </Layout>
);

export default InterestPage;
