import React from "react";
import { withPrefix } from "gatsby";
import styled from "styled-components";
import { Router } from "@reach/router";

import SEO from "../components/SEO";

import {
  GeneralSettings,
  ConfigureApplicationForm,
  ViewApplications,
  ManageTimeslots,
  ManageQuestions,
  ManageLevels,
  ManageInterviews,
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
      <ManageTimeslots path="/manage-timeslots" />
      <ManageQuestions path="/manage-questions" />
      <ManageLevels path="/manage-levels" />
      <ManageInterviews path="/manage-interviews" />
      <GeneralSettings path="/" />
    </FullSizeRouter>
  </>
);
