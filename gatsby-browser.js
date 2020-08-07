import React, { Fragment } from "react";
import { navigate } from "gatsby";
import { useLocation } from "@reach/router";
import { withTheme } from "styled-components";

import Firebase from "./src/components/Firebase";
import Header from "./src/components/Header";
import Footer from "./src/components/Footer";
import Logo from "./src/components/Logo";
import GlobalStyle, {Centered} from "./src/styles/global";

import { setLayoutBase, setFirebaseClass,
  setWithAuthorizationWrapper,
  WithAuthorizationClass, } from "upe-react-components";

import "bootstrap/dist/css/bootstrap.min.css";

import wrapWithProvider from "./wrap-with-provider";

import {pathPrefix} from "./gatsby-config";

export const wrapRootElement = wrapWithProvider;



export const onClientEntry = () => {
  setFirebaseClass(Firebase);

  const WithAuthorizationWrapper = (props) => {

  const location = useLocation();
  const savePathname = () =>
    window.localStorage.setItem(
      "pathname",
      location.pathname.replace(pathPrefix, "")
    );

  const AuthorizationFailed = () => (
    <Centered>
      <Logo size="medium" />
      <h3>You don't have permission to view this page!</h3>
      <p>If you believe you should have access, please contact an admin.</p>
    </Centered>
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
      authorizationFailed={<AuthorizationFailed />}
      {...props}
    />
  );
};
// would've preferred to call this in gatsby-browser onClientEntry, but can't do Queries in there
setWithAuthorizationWrapper(WithAuthorizationWrapper);

  const LayoutBase = withTheme(({ theme, children }) => (
    <Fragment>
      <GlobalStyle theme={theme} />
      <Header />
      {children}
      <Footer />
    </Fragment>
  ));
  LayoutBase.displayName = "LayoutBase";
  setLayoutBase(LayoutBase);
};
