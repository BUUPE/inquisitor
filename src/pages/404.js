import React from "react";
import { Link } from "gatsby";

import Logo from "../components/Logo";
import SEO from "../components/SEO";
import { Centered } from "../styles/global";

export default () => (
  <>
    <SEO title="404" route="/404" />
    <Centered>
      <Logo size="medium" />
      <h1>404: Not found!</h1>
      <p>
        The page you're looking for doesn't exist! Please head{" "}
        <Link to="/">home</Link>.
      </p>
    </Centered>
  </>
);
