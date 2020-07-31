import AuthUserContext from "./context";
import withAuthentication from "./withAuthentication";
import withAuthorization from "./withAuthorization";

const isAdmin = (authUser) => authUser && !!authUser.roles.admin;
const isRecruitmentTeam = (authUser) =>
  authUser && !!authUser.roles.recruitmentteam;
const isApplicant = (authUser) => authUser && !!authUser.roles.applicant;
const isLoggedIn = (authUser) => !!authUser;

export {
  AuthUserContext,
  withAuthentication,
  withAuthorization,
  isAdmin,
  isRecruitmentTeam,
  isApplicant,
  isLoggedIn,
};
