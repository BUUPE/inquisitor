import React, { Fragment } from "react";

import { Layout } from "upe-react-components";

import ErrorComponent from "./Error";
import { withSettingsProvider } from "./API/SettingsContext";

// Needs to make use of Inner Layout to get the proper Firebase Provider
const InnerLayout = withSettingsProvider((object) => (
  <Fragment>{object.children}</Fragment>
));

const InquisitorLayout = ({ children }) => (
  <Layout errorComponent={ErrorComponent}>
    <InnerLayout children={children} />
  </Layout>
);

export default InquisitorLayout;
