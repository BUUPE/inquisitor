import React from "react";
import { Container } from "../styles/global";

const Error = ({ error }) => (
  <Container flexdirection="column">
    <h1>{error}</h1>
  </Container>
);

export default Error;
