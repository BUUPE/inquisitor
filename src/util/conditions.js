export const isAdmin = (authUser) => authUser && !!authUser.roles.admin;
export const isRecruitmentTeam = (authUser) =>
  authUser && !!authUser.roles.recruitmentteam;
export const isApplicant = (authUser) => authUser && !!authUser.roles.applicant;
export const isLoggedIn = (authUser) => !!authUser;
