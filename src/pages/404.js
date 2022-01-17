import React from "react";

import SEO from "../components/SEO";
import TextDisplay from "../components/TextDisplay";

export default () => (
  <>
    <SEO title="404" route="/404" />
    <TextDisplay
      name={"Error 404: Page Not found!"}
      text={"The page you're looking for doesn't exist!"}
      displayBack={true}
    />
    <br />
    <br />
    <br />
    <br />
  </>
);
