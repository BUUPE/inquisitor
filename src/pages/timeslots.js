import React, { useContext } from "react";

import { isRecruitmentTeam } from "../util/conditions";
import { AuthUserContext } from "upe-react-components";
import Layout from "../components/Layout";
import { InterviewerView, ApplicantView } from "../components/Timeslots";

const TimeslotPage = () => {
  const authUser = useContext(AuthUserContext);
  return isRecruitmentTeam(authUser) ? <InterviewerView /> : <ApplicantView />;
};

export default () => (
  <Layout>
    <TimeslotPage />
  </Layout>
);
