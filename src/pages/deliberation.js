import React, { useContext } from "react";

import { isMember } from "../util/conditions";
import { AuthUserContext } from "upe-react-components";
import { InterviewerView, ApplicantView } from "../components/Deliberation";

export default () => {
  const authUser = useContext(AuthUserContext);
  return isMember(authUser) ? <InterviewerView /> : <ApplicantView />;
};
