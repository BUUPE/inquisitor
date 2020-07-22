import React from "react";
import styled from "styled-components";
import { Router } from "@reach/router";

import Layout from "../components/Layout";
import GeneralSettings from "../components/GeneralSettings";
import ConfigureApplication from "../components/ConfigureApplication";

const FullSizeRouter = styled(Router)`
  height: 100%;
  width: 100%;
  display: flex;
`;

export default () => (
  <Layout>
    <FullSizeRouter basepath="/admin">
      <ConfigureApplication path="/configure-application" />
      <GeneralSettings path="/" />
    </FullSizeRouter>
  </Layout>
);
