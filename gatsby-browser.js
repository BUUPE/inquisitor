import React from "react";
import Layout from "./src/components/Layout";
import wrapWithProvider from "./wrap-with-provider";

export const wrapRootElement = wrapWithProvider;

export const wrapPageElement = ({ element, props }) => (
  <Layout {...props}>{element}</Layout>
);
