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

const axios = require('axios')

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
  saturday: {
	"9am": false,
	"10am": false,
	"11am": false,
	"12pm": false,
	"1pm": false,
	"2pm": false,
	"3pm": false,
	"4pm": false,
	"5pm": false
  },
  sunday: {
	"9am": false,
	"10am": false,
	"11am": false,
	"12pm": false,
	"1pm": false,
	"2pm": false,
	"3pm": false,
	"4pm": false,
	"5pm": false
  },
  error: null,
};


class ApplicationFormBase extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    event.preventDefault();
	console.log(this.state);

    axios.post('http://http://upe-interview.bu.edu/api/saveApplication', {
		email: this.state.email,
		name: this.state.applicantName,
		resume: this.state.resume,
		classYear: this.state.classYear,
		major: this.state.major,
		taken112: this.state.taken112,
		taken330: this.state.taken330,
		q1: this.state.q1,
		q2: this.state.q2,
		saturday: this.state.saturday,
		sunday: this.state.sunday
	})
	.then((res) => {
		console.log(`statusCode: ${res.statusCode}`)
		console.log(res)
	})
	.catch((error) => {
		console.error(error)
	});
	
	console.log(this.state);
	
    this.props.history.push('/appsubmitted');
	
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };
  
  checkboxVerify1 = event => {
    const { saturday } = this.state;
    const checked = saturday[event.target.value];
    saturday[event.target.value] = !checked;
    this.setState({saturday});
  }
  
  checkboxVerify2 = event => {
    const { sunday } = this.state;
    const checked = sunday[event.target.value];
    sunday[event.target.value] = !checked;
    this.setState({sunday});
  }

  render() {
    const { email, applicantName, classYear, major, taken112, taken330, resume, q1, q2, saturday, sunday, error } = this.state;
    const isInvalid = applicantName === '' || email === '' || classYear === '' || major === '' || taken112 === '' || taken112 === '' || resume === '' || q1 === '' || q2 === '';
    return (
      <div className="application-form-wrapper">
        <Form onSubmit={this.onSubmit}>
		  <div className="text-center">
		    <img src={logo} alt="UPE Logo" height="256" width="256" />
			<p> </p>
		    <h1>Application Form</h1>
		  </div>
		
		  <Row>
		    <Col>
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
		    </Col>
		    <Col>
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
		    </Col>
		    <Col>
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
		    </Col>
		  </Row>
		 
		  <Row>
		    <Col>
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
		    </Col>
		    <Col>
		      <h5>Class Year</h5>
			  <InputGroup>
				<Form.Control as="select"
				  name="classYear"
				  value={classYear}
				  onChange={this.onChange}
				>
				  <option>-</option>
				  <option>2021</option>
				  <option>2022</option>
				  <option>2023</option>
				  <option>2024</option>
				  <option>Grad Student</option>
                </Form.Control>
			  </InputGroup>
		    </Col>
		  </Row>
		  
		  <Row>
		    <Col>
		      <h5>Taken CS 112?</h5>
              <InputGroup>
			    <Form.Control as="select"
			      name="taken112"
			      value={taken112}
			      onChange={this.onChange}
			    >
				  <option>-</option>
			      <option>Yes</option>
			      <option>No</option>
			      <option>Currently Enrolled</option>
                </Form.Control>
              </InputGroup>
		    </Col>
		    <Col>
		      <h5>Taken CS 330?</h5>
              <InputGroup>
			    <Form.Control as="select"
			      name="taken330"
			      value={taken330}
			      onChange={this.onChange}
			    >
				  <option>-</option>
			      <option>Yes</option>
			      <option>No</option>
			      <option>Currently Enrolled</option>
                </Form.Control>
              </InputGroup>
		    </Col>
		  </Row>
		  
		  <Row>
		    <Col>
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
		    </Col>
		  </Row>
		  
		  <Row>
		    <Col>
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
		    </Col>
		  </Row>
		  
		  <Row>
		    <Col>
			  <h5>When are you available for interviews?</h5>
			</Col>
		  </Row>
		  <Row>
			<Col>
			  <h6> Saturday - 01/01/20 </h6>
              <div>
			    {
				 Object.keys(saturday).map(time => 
											<Form.Check key={time} type="checkbox" onChange={this.checkboxVerify1} value={time} label={time}/>
				 )
				}
			  </div>
            </Col>
			<Col>
			  <h6> Sunday - 01/02/20 </h6>
              <div>
			    {
				 Object.keys(sunday).map(time => 
											<Form.Check key={time} type="checkbox" onChange={this.checkboxVerify2} value={time} label={time}/>
				 )
				}
			  </div>
            </Col>
		  </Row>
		  
		  <Row className="row-button">
		    <Col>
              <Button disabled={isInvalid} type="submit" onSubmit={this.onSubmit} className="btn btn-danger">
                Submit Application
              </Button>
		    </Col>
		  </Row>

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