import React, { useContext } from "react";

import { AuthUserContext, isRecruitmentTeam } from "../components/Session";
import Layout from "../components/Layout";
import { InterviewerView, ApplicantView } from "../components/Timeslots";

const TimeslotPage = ({ location }) => {
  const authUser = useContext(AuthUserContext);
  return (
    <Layout>
      {isRecruitmentTeam(authUser) ? (
        <InterviewerView location={location} />
      ) : (
        <ApplicantView location={location} />
      )}
    </Layout>
  );
};

export default TimeslotPage;
