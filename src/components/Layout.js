import React, { Component, Fragment } from "react";
import { withTheme } from "styled-components";

import getFirebase, { FirebaseContext } from "./Firebase";
import { withAuthentication } from "./Session";
import Header from "./Header";
import Footer from "./Footer";
import Logo from "./Logo";
import GlobalStyle, { Centered } from "../styles/global";

import "bootstrap/dist/css/bootstrap.min.css";

class Layout extends Component {
  state = {
    firebase: null,
    error: null,
    errorInfo: null,
  };

  componentDidMount() {
    const app = import("firebase/app");
    const auth = import("firebase/auth");
    const firestore = import("firebase/firestore");
    const storage = import("firebase/storage");
    const functions = import("firebase/functions");

    Promise.all([app, auth, firestore, storage, functions]).then((values) => {
      const firebase = getFirebase(values[0]);

      this.setState({ firebase });
    });
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.hasError)
      return (
        <LayoutBase>
          <Centered>
            <Logo size="medium" />
            <h1>Uh oh!</h1>
            <p>Something went wrong!</p>
            <details style={{ whiteSpace: "pre-wrap" }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo.componentStack}
            </details>
          </Centered>
        </LayoutBase>
      );

    return (
      <FirebaseContext.Provider value={this.state.firebase}>
        <AppWithAuthentication {...this.props} />
      </FirebaseContext.Provider>
    );
  }
}

const LayoutBase = withTheme(({ theme, children }) => (
  <Fragment>
    <GlobalStyle theme={theme} />
    <Header />
    {children}
    <Footer />
  </Fragment>
));

const AppWithAuthentication = withAuthentication(({ children }) => (
  <LayoutBase>{children}</LayoutBase>
));

export default Layout;
