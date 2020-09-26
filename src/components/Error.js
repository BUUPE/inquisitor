import React from "react";
import { Container } from "../styles/global";

// TODO: use this
const Error = ({ message }) => (
  <Container flexdirection="column">
    <h1>{message}</h1>
  </Container>
);

export default Error;
