import React from "react";
import { withPrefix } from "gatsby";
import styled from "styled-components";
import { Router } from "@reach/router";

import Layout from "../components/Layout";
import {
  GeneralSettings,
  ConfigureApplicationForm,
  ViewApplications,
  ManageUsers,
  ManageRoles,
} from "../components/Admin";

const FullSizeRouter = styled(Router)`
  display: flex;
  flex-grow: 1;
`;

export default ({ location }) => (
  <Layout>
    <FullSizeRouter basepath={withPrefix("/admin")}>
      <ConfigureApplicationForm path="/configure-application" />
      <ViewApplications path="/view-applications" />
      <ManageUsers path="/manage-users" />
      <ManageRoles path="/manage-roles" />
      <GeneralSettings path="/" />
    </FullSizeRouter>
  </Layout>
);
