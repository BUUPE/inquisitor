import React from "react";
import { withPrefix } from "gatsby";
import styled from "styled-components";
import { Router } from "@reach/router";

import { withAuthorization, isAdmin } from "../components/Session";
import Layout from "../components/Layout";
import {
  GeneralSettings,
  ConfigureApplicationForm,
  ViewApplications,
  ManageUsers,
} from "../components/Admin";

const FullSizeRouter = styled(Router)`
  display: flex;
  flex-grow: 1;
`;

const AuthorizedRouter = withAuthorization(isAdmin)(() => (
  <FullSizeRouter basepath={withPrefix("/admin")}>
    <ConfigureApplicationForm path="/configure-application" />
    <ViewApplications path="/view-applications" />
    <ManageUsers path="/manage-users" />
    <GeneralSettings path="/" />
  </FullSizeRouter>
));

export default ({ location }) => (
  <Layout>
    <AuthorizedRouter location={location} />
  </Layout>
);
