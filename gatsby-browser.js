import React, { Fragment } from "react";

import { withTheme } from "styled-components";

import Firebase from "./src/components/Firebase";
import Header from "./src/components/Header";
import Footer from "./src/components/Footer";
import GlobalStyle from "./src/styles/global";

import { setLayoutBase, setFirebaseClass } from "upe-react-components";

import "bootstrap/dist/css/bootstrap.min.css";

import wrapWithProvider from "./wrap-with-provider";

export const wrapRootElement = wrapWithProvider;

export const onClientEntry = () => {
  setFirebaseClass(Firebase);

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
