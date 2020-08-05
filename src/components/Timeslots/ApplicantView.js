import React from "react";
import { compose } from "recompose";

import { isApplicant } from "../../util/conditions";
import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";

import { Container } from "../../styles/global";

const ApplicantView = ({ firebase }) => {
  return (
    <Container flexdirection="column">
      <h1>Applicant Timeslot Selection</h1>
    </Container>
  );
};

export default compose(
  withAuthorization(isApplicant),
  withFirebase
)(ApplicantView);
