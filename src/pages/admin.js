import React from "react";
import { withPrefix } from "gatsby";
import styled from "styled-components";
import { Router } from "@reach/router";

import Layout from "../components/Layout";
import GeneralSettings from "../components/GeneralSettings";
import ConfigureApplicationForm from "../components/ConfigureApplicationForm";

const FullSizeRouter = styled(Router)`
  display: flex;
  flex-grow: 1;
`;

export default () => (
  <Layout>
    <FullSizeRouter basepath={withPrefix("/admin")}>
      <ConfigureApplicationForm path="/configure-application" />
      <GeneralSettings path="/" />
    </FullSizeRouter>
  </Layout>
);
