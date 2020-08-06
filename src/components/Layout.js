import React from "react";
import { navigate, useStaticQuery, graphql } from "gatsby";
import { useLocation } from "@reach/router";

import {
  Layout,
  setWithAuthorizationWrapper,
  WithAuthorizationClass,
} from "upe-react-components";

import { Centered } from "../styles/global";
import Logo from "./Logo";

const WithAuthorizationWrapper = (props) => {
  const {
    site: { pathPrefix },
  } = useStaticQuery(
    graphql`
      query {
        site {
          pathPrefix
        }
      }
    `
  );

  const location = useLocation();
  const savePathname = () =>
    window.localStorage.setItem(
      "pathname",
      location.pathname.replace(pathPrefix, "")
    );

  return (
    <WithAuthorizationClass
      firebaseAuthNext={(authUser) => {
        if (!authUser) {
          savePathname();
          navigate("/login");
        }
      }}
      firebaseAuthFallback={() => {
        savePathname();
        navigate("/login");
      }}
      authorizationFailed={
        <Centered>
          <Logo size="medium" />
          <h3>You don't have permission to view this page!</h3>
          <p>If you believe you should have access, please contact an admin.</p>
        </Centered>
      }
      {...props}
    />
  );
};
// would've preferred to call this in gatsby-browser onClientEntry, but can't do Queries in there
setWithAuthorizationWrapper(WithAuthorizationWrapper);

const ErrorComponent = ({ error, errorInfo }) => (
  <Centered>
    <Logo size="medium" />
    <h1>Uh oh!</h1>
    <p>Something went wrong!</p>
    <details
      style={{ whiteSpace: "pre-wrap", maxHeight: "50%", overflowY: "auto" }}
    >
      {error && error.toString()}
      <br />
      {errorInfo.componentStack}
    </details>
  </Centered>
);

export default ({ children }) => (
  <Layout errorComponent={ErrorComponent}>{children}</Layout>
);
