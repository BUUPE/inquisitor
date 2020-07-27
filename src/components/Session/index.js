import AuthUserContext from "./context";
import withAuthentication from "./withAuthentication";
import withAuthorization from "./withAuthorization";

const isAdmin = (authUser) => authUser && !!authUser.roles.admin;
const isLoggedIn = (authUser) => !!authUser;

export {
  AuthUserContext,
  withAuthentication,
  withAuthorization,
  isAdmin,
  isLoggedIn,
};
