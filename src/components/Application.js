import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';

import { withFirebase } from './Firebase';
import * as ROUTES from '../constants/routes';
import logo from '../assets/img/logo.png';

const INITIAL_STATE = {
  email: '',
  applicantName: '',
  resume: '',
  classYear: '',
  major: '',
  taken112: '',
  taken330: '',
  q1: '',
  q2: '',
  time1: '',
  time2: '',
  error: null,
};

class ApplicationFormBase extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    //Save contents somewhere
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { email, applicantName, classYear, major, taken112, taken330, resume, q1, q2, time1, time2, error } = this.state;
    const isInvalid = applicantName === '' || email === '' || classYear === '' || major === '' || taken112 === '' || taken112 === '' || resume === '' || q1 === '' || q2 === '';
    return (
      <div className="application-form-wrapper">
        <Form onSubmit={this.onSubmit}>
		  <div className="text-center">
		    <img src={logo} alt="UPE Logo" height="256" width="256" />
			<p> </p>
		    <h1>Application Form</h1>
		  </div>
		
		  <div className="row">
		    <div className="col-md-4">
		      <h5>Email</h5>
              <InputGroup>
                <Form.Control 
                  name="email"
                  type="email" 
                  placeholder="upe@bu.edu" 
                  value={email}
                  onChange={this.onChange}
                />
              </InputGroup>
		    </div>
		    <div className="col-md-4">
		      <h5>Name</h5>
              <InputGroup>
                <Form.Control 
                  name="applicantName"
                  type="text" 				  
                  placeholder="Adam Smith" 
                  value={applicantName}
                  onChange={this.onChange}
                />
              </InputGroup>
		    </div>
		    <div className="col-md-4">
			  <h5>Resume</h5>
              <InputGroup>
                <Form.Control 
                  name="resume"
                  type="file" 
                  placeholder="Resume" 
                  value={resume}
                  onChange={this.onChange}
                />
              </InputGroup>
		    </div>
		  </div>
		 
		  <div className="row">
		    <div className="col-md-6">
			  <h5>Major</h5>
              <InputGroup>
                <Form.Control 
                  name="major"
                  type="text" 
                  placeholder="Computer Science" 
                  value={major}
                  onChange={this.onChange}
                />
              </InputGroup>
		    </div>
		    <div className="col-md-6">
		      <h5>Class Year</h5>
			  <InputGroup>
				<Form.Control as="select"
				  name="classYear"
				  value={classYear}
				  onChange={this.onChange}
				>
				  <option>2021</option>
				  <option>2022</option>
				  <option>2023</option>
				  <option>2024</option>
				  <option>Grad Student</option>
                </Form.Control>
			  </InputGroup>
		    </div>
		  </div>
		  
		  <div className="row">
		    <div className="col-md-6">
		      <h5>Taken CS 112?</h5>
              <InputGroup>
			    <Form.Control as="select"
			      name="taken112"
			      value={taken112}
			      onChange={this.onChange}
			    >
			      <option>Yes</option>
			      <option>No</option>
			      <option>Currently Enrolled</option>
                </Form.Control>
              </InputGroup>
		    </div>
		    <div className="col-md-6">
		      <h5>Taken CS 330?</h5>
              <InputGroup>
			    <Form.Control as="select"
			      name="taken330"
			      value={taken330}
			      onChange={this.onChange}
			    >
			      <option>Yes</option>
			      <option>No</option>
			      <option>Currently Enrolled</option>
                </Form.Control>
              </InputGroup>
		    </div>
		  </div>
		  
		  <div className="row">
		    <div className="col-md-12">
		      <h5>Why do you want to join UPE?</h5>
		      <p>Around 100 Words</p>
              <InputGroup>
                <Form.Control 
                  name="q1"
				  as="textarea" 
				  rows="7" 
				  placeholder="..." 
				  value={q1}
				  onChange={this.onChange}
				/>
              </InputGroup>
		    </div>
		  </div>
		  
		  <div className="row">
		    <div className="col-md-12">
		      <h5>What do you hope to gain from joining UPE?</h5>
		      <p>Around 100 Words</p>
              <InputGroup>
                <Form.Control 
                  name="q2"
				  as="textarea" 
				  rows="7" 
				  placeholder="..." 
				  value={q2}
				  onChange={this.onChange}
				/>
              </InputGroup>
		    </div>
		  </div>
		  
		  <div className="row">
		    <div className="col-md-12">
			  <h5>When are you available for interviews?</h5>
			</div>
			<div className="col-md-6">
			  <h6> Saturday - 01/01/20 </h6>
              <div>
			    <Form.Check type="checkbox" value={time1[0]} label={"09:00 am - 10:00 am"}/>
				<Form.Check type="checkbox" value={time1[1]} label={"10:00 am - 11:00 am"}/>
				<Form.Check type="checkbox" value={time1[2]} label={"11:00 am - 12:00 pm"}/>
				<Form.Check type="checkbox" value={time1[3]} label={"12:00 pm - 01:00 pm"}/>
				<Form.Check type="checkbox" value={time1[4]} label={"01:00 pm - 02:00 pm"}/>
				<Form.Check type="checkbox" value={time1[5]} label={"02:00 pm - 03:00 pm"}/>
				<Form.Check type="checkbox" value={time1[6]} label={"03:00 pm - 04:00 pm"}/>
				<Form.Check type="checkbox" value={time1[7]} label={"04:00 pm - 05:00 pm"}/>
			  </div>
            </div>
			<div className="col-md-6">
			  <h6> Sunday - 01/02/20 </h6>
              <div>
			    <Form.Check type="checkbox" value={time2[0]} label={"09:00 am - 10:00 am"}/>
				<Form.Check type="checkbox" value={time2[1]} label={"10:00 am - 11:00 am"}/>
				<Form.Check type="checkbox" value={time2[2]} label={"11:00 am - 12:00 pm"}/>
				<Form.Check type="checkbox" value={time2[3]} label={"12:00 pm - 01:00 pm"}/>
				<Form.Check type="checkbox" value={time2[4]} label={"01:00 pm - 02:00 pm"}/>
				<Form.Check type="checkbox" value={time2[5]} label={"02:00 pm - 03:00 pm"}/>
				<Form.Check type="checkbox" value={time2[6]} label={"03:00 pm - 04:00 pm"}/>
				<Form.Check type="checkbox" value={time2[7]} label={"04:00 pm - 05:00 pm"}/>
			  </div>
            </div>
		  </div>
		  
		  <div className="row-button">
		    <div className="col-md-12">
              <Button disabled={isInvalid} type="submit" className="btn btn-danger">
                Submit Application
              </Button>
		    </div>
		  </div>

          {error && <p className="error-msg">{error.message}</p>}
        </Form>
      </div>
    );
  }
}

const ApplicationForm = compose(
  withRouter,
  withFirebase,
)(ApplicationFormBase);

export default ApplicationForm;