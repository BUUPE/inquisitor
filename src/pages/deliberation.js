import React, { useContext } from "react";

import { isRecruitmentTeam } from "../util/conditions";
import { AuthUserContext } from "upe-react-components";
import Layout from "../components/Layout";
import { InterviewerView, ApplicantView } from "../components/Deliberation";

const DeliberationPage = ({ location }) => {
  const authUser = useContext(AuthUserContext);
  return isRecruitmentTeam(authUser) ? (
    <InterviewerView location={location} />
  ) : (
    <ApplicantView location={location} />
  );
};

export default () => (
  <Layout>
    <DeliberationPage />
  </Layout>
);
