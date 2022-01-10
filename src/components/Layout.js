import React from "react";

import { Layout } from "upe-react-components";

import ErrorComponent from "./Error";

export default ({ children }) => (
  <Layout errorComponent={ErrorComponent}>{children}</Layout>
);
