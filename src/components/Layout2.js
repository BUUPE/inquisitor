import React, { Fragment } from "react";
import { navigate, useStaticQuery, graphql } from "gatsby";

import { withTheme } from "styled-components";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import GlobalStyle, { Centered } from "../styles/global";

import Layout, { setLayoutBase } from "upe-react-components/Layout";
import {
  setWithAuthorizationWrapper,
  WithAuthorizationClass,
} from "upe-react-components/Session";

const LayoutBase = withTheme(({ theme, children }) => (
  <Fragment>
    <GlobalStyle theme={theme} />
    <Header />
    {children}
    <Footer />
  </Fragment>
));

setLayoutBase(LayoutBase);

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
  const savePathname = () =>
    window.localStorage.setItem(
      "pathname",
      this.props.location.pathname.replace(pathPrefix, "")
    );

  // authorizationFailed doesnt accept () => ()
  return (
    <WithAuthorizationClass
      firebaseAuthNext={(authUser) => {
        console.log("trying next");
        if (!authUser) {
          savePathname();
          navigate("/login");
        }
      }}
      firebaseAuthFallback={() => {
        console.log("trying fallback");
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
setWithAuthorizationWrapper(WithAuthorizationWrapper);

const config = {
  apiKey: "AIzaSyBxBIbTYbRuqP1np-ri4YaJ0H6OYK4L46g",
  authDomain: "upe-website-fa07a.firebaseapp.com",
  databaseURL: "https://upe-website-fa07a.firebaseio.com",
  projectId: "upe-website-fa07a",
  storageBucket: "upe-website-fa07a.appspot.com",
  messagingSenderId: "896060764020",
  appId: "1:896060764020:web:331114a396e41adfa30621",
  measurementId: "G-BV6VQMMSQ5",
};

export default ({ children }) => {
  return <Layout firebaseConfig={config}>{children}</Layout>;
};
