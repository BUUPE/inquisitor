import React, { useContext } from "react";
import { isRecruitmentTeam } from "../util/conditions";
import { AuthUserContext } from "upe-react-components";
import Layout from "../components/Layout";
import { InterviewerView, ApplicantView } from "../components/Interview";

export default () => {
  const authUser = useContext(AuthUserContext);
  console.log("isRecruitmentTeam(authUser)", isRecruitmentTeam(authUser));
  console.log("authUser", authUser);
  return (
    <Layout>
      {isRecruitmentTeam(authUser) ? <InterviewerView /> : <ApplicantView />}
    </Layout>
  );
};
