import React from "react";
import { withPrefix } from "gatsby";
import styled from "styled-components";
import { Router } from "@reach/router";

import SEO from "../components/SEO";

import {
  GeneralSettings,
  ConfigureApplicationForm,
  ViewApplications,
  ManageUsers,
  ManageRoles,
  ManageTimeslots,
  ImportExport,
  ManageQuestions,
  ManageLevels,
} from "../components/Admin";

const FullSizeRouter = styled(Router)`
  display: flex;
  flex-grow: 1;
`;

export default () => (
  <>
    <SEO title="Admin" route="/admin" />
    <FullSizeRouter basepath={withPrefix("/admin")}>
      <ConfigureApplicationForm path="/configure-application" />
      <ViewApplications path="/view-applications" />
      <ManageUsers path="/manage-users" />
      <ManageRoles path="/manage-roles" />
      <ManageTimeslots path="/manage-timeslots" />
      <ImportExport path="/import-export" />
      <ManageQuestions path="/manage-questions" />
      <ManageLevels path="/manage-levels" />
      <GeneralSettings path="/" />
    </FullSizeRouter>
  </>
);
