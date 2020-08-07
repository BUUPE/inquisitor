import React from "react";

import { Layout } from "upe-react-components";

import { Centered } from "../styles/global";
import Logo from "./Logo";

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
