import React from "react";
import styled from "styled-components";
import { Link } from "gatsby";

import Layout from "../components/Layout";
import Logo from "../components/Logo";

const Centered = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const NotFoundPage = () => (
  <Layout>
    <Centered>
      <Logo size="medium" />

      <h1>404: Not found!</h1>

      <p>
        The page you're looking for doesn't exist! Please head{" "}
        <Link to="/">home</Link>.
      </p>
    </Centered>
  </Layout>
);

export default NotFoundPage;
