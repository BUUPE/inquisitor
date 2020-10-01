import React, { useContext } from "react";
import { AuthUserContext } from "upe-react-components";
import { isRecruitmentTeam } from "../util/conditions";
import { InterviewerView, ApplicantView } from "../components/Timeslots";
import SEO from "../components/SEO";

export default () => {
  const authUser = useContext(AuthUserContext);
  return (
    <>
      <SEO title="Timeslots" route="/timeslots" />
      {isRecruitmentTeam(authUser) ? <InterviewerView /> : <ApplicantView />}
    </>
  );
};
