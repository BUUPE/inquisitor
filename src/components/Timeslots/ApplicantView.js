import React from "react";
import { compose } from "recompose";

import {
  AuthUserContext,
  withAuthorization,
  isApplicant,
} from "../../components/Session";
import { withFirebase } from "../../components/Firebase";

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
