import React, { Component } from "react";
import styled from "styled-components";
import { compose } from "recompose";
import Iframe from "react-iframe";

import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";

import { isLoggedIn } from "../util/conditions";
import Loader from "./Loader";
import Logo from "./Logo";
import { Container } from "../styles/global";

const StyledContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 500px;
  margin: 0 auto;
  margin-bottom: 25px;
  margin-top: 25px;
`;

const InterestForm = () => {
  return (
    <StyledContainer flexdirection="column">
      <Logo size="medium" />
      <h1>BU UPE Interest Form</h1>

      <br />

      <Iframe url="http://eepurl.com/dGiFzH" width="100%" height="750px" />
    </StyledContainer>
  );
};

export default compose(
  withAuthorization(isLoggedIn),
  withFirebase
)(InterestForm);
