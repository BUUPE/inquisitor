import React from "react";
import TextDisplay from "./TextDisplay";

const Error = ({ error }) => (
  <div style={{ width: "100%" }}>
    <TextDisplay
      name={"Error Occured"}
      text={error.toString()}
      displayBack={true}
    />
  </div>
);

export default Error;
