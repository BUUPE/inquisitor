import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';

import { withFirebase } from './Firebase';
import * as ROUTES from '../constants/routes';

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
    const { email, applicantName, classYear, major, taken112, taken330, resume, q1, q2, error } = this.state;
    const isInvalid = applicantName === '' || email === '' || classYear === '' || major === '' || taken112 === '' || taken112 === '' || resume === '' || q1 === '' || q2 === '';
    return (
      <div className="signin-form-wrapper">
        <Form onSubmit={this.onSubmit}>
		  <h1>UPE Application Form</h1>
		  <p> </p>
		  <p> </p>
		
		  <div className="row">
		    <div className="col-md-6">
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
		    <div className="col-md-6">
		      <h5>Name</h5>
              <InputGroup>
                <Form.Control 
                  name="name"
                  type="name" 
                  placeholder="Adam Smith" 
                  value={applicantName}
                  onChange={this.onChange}
                />
              </InputGroup>
		    </div>
		  </div>
		 
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
		  
		  <h5>Why do you want to join UPE?</h5>
		  <p>Around 100 Words</p>
          <InputGroup>
            <Form.Control 
              name="q1"
              as="textarea" 
              rows="10" 
              placeholder="..." 
              value={q1}
              onChange={this.onChange}
            />
          </InputGroup>
		  
		  <h5>What do you hope to gain from UPE</h5>
		  <p>Around 100 Words</p>
          <InputGroup>
            <Form.Control 
              name="q2"
              as="textarea" 
              rows="10" 
              placeholder="..." 
              value={q2}
              onChange={this.onChange}
            />
          </InputGroup>

          <Button disabled={isInvalid} type="submit">
            Submit Application
          </Button>

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