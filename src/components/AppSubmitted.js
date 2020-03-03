import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { withFirebase } from './Firebase';
import * as ROUTES from '../constants/routes';
import logo from '../assets/img/logo.png';


class ApplicationFormBase extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="application-form-wrapper">
	    <Row>
		  <Col className="col-md-12 text-center">
		    <img src={logo} alt="UPE Logo" height="256" width="256" />
			<p> </p>
		    <h1>Application Form</h1>
		  </Col>
		</Row>
		
		<Row className="thanks-text">
		  <Col className="col-md-12 text-center">
		    <p>Thank you for applying to join UPE, we will be getting back to you by Friday the XX with a timeslot for your interview. </p>
			<p>Additional details will be sent to you via the email address you provided during your application!</p>
		  </Col>
		</Row>
      </div>
    );
  }
}

const ApplicationForm = compose(
  withRouter,
  withFirebase,
)(ApplicationFormBase);

export default ApplicationForm;