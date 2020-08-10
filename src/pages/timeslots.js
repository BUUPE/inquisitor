import React, { useContext } from "react";

import { isRecruitmentTeam } from "../util/conditions";
import { AuthUserContext } from "upe-react-components";
import Layout from "../components/Layout";
import { InterviewerView, ApplicantView } from "../components/Timeslots";

const TimeslotPage = ({ location }) => {
  const authUser = useContext(AuthUserContext);
  return isRecruitmentTeam(authUser) ? (
    <InterviewerView location={location} />
  ) : (
    <ApplicantView location={location} />
  );
};

export default () => (
  <Layout>
    <TimeslotPage />
  </Layout>
);
