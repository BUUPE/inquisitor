import React from "react";
import styled from "styled-components";

import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Logo from "../components/Logo";

const Landing = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  p {
    max-width: 500px;
  }
`;

const IndexPage = () => (
  <Layout>
    <SEO title="Home" route="/" />
    <Landing>
      <Logo size="medium" />

      <h1>Welcome!</h1>

      <p>
        This is BU UPE's interview application. Please login to get started; you
        will be redirected to the appropriate page based on your affiliation.
      </p>
    </Landing>
  </Layout>
);

export default IndexPage;
