// todo: use ?. here
export const isAdmin = (authUser) => authUser && !!authUser.roles.admin;
export const isRecruitmentTeam = (authUser) =>
  authUser && !!authUser.roles.recruitmentteam;
export const isApplicant = (authUser) => authUser && !!authUser.roles.applicant;
export const isLoggedIn = (authUser) => !!authUser;
export const isNonMember = (authUser) => authUser && !!authUser.roles.nonmember;
export const isApplicantOrRecruitmentTeam = (authUser) =>
  authUser && (!!authUser.roles.applicant || !!authUser.roles.recruitmentteam);
