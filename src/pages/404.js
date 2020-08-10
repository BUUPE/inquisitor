import React from "react";
import { Link } from "gatsby";

import Layout from "../components/Layout";
import Logo from "../components/Logo";
import { Centered } from "../styles/global";

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
