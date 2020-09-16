import React, { useContext } from "react";

import { memberOrRecruitmentTeam } from "../util/conditions";
import { AuthUserContext } from "upe-react-components";
import Layout from "../components/Layout";
import { InterviewerView, ApplicantView } from "../components/Deliberation";

const DeliberationPage = () => {
  const authUser = useContext(AuthUserContext);
  return memberOrRecruitmentTeam(authUser) ? (
    <InterviewerView />
  ) : (
    <ApplicantView />
  );
};

export default () => (
  <Layout>
    <DeliberationPage />
  </Layout>
);
