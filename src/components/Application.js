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
  d1t1: false,
  d1t2: false,
  d1t3: false,
  d1t4: false,
  d1t5: false,
  d1t6: false,
  d1t7: false,
  d1t8: false,
  d2t1: false,
  d2t2: false,
  d2t3: false,
  d2t4: false,
  d2t5: false,
  d2t6: false,
  d2t7: false,
  d2t8: false,
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
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };
  
  handleCheckBoxChange = x => {
	  switch(x) {
		  case 1:
			this.state.d1t1 = true;
			break;
		  case 2:
			this.state.d1t2 = true;
			break;
		  case 3:
			this.state.d1t3 = true;
			break;
		  case 4:
			this.state.d1t4 = true;
			break;
		  case 5:
			this.state.d1t5 = true;
			break;
		  case 6:
			this.state.d1t6 = true;
			break;
	      case 7:
			this.state.d1t7 = true;
			break;
	      case 8:
			this.state.d1t8 = true;
			break;
		  case 9:
			this.state.d2t1 = true;
			break;
		  case 10:
			this.state.d2t2 = true;
			break;
		  case 11:
			this.state.d2t3 = true;
			break;
		  case 12:
			this.state.d2t4 = true;
			break;
		  case 13:
			this.state.d2t5 = true;
			break;
		  case 14:
			this.state.d2t6 = true;
			break;
	      case 15:
			this.state.d2t7 = true;
			break;
	      case 16:
			this.state.d2t8 = true;
			break;
	  } 
  };

  render() {
    const { email, applicantName, classYear, major, taken112, taken330, resume, q1, q2, d1t1, d1t2, d1t3, d1t4, d1t5, d1t6, d1t7, d1t8, d2t1, d2t2, d2t3, d2t4, d2t5, d2t6, d2t7, d2t8, error } = this.state;
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
			    <Form.Check onChange={this.handleCheckBoxChange(1)} type="checkbox" label={"09:00 am - 10:00 am"}/>
				<Form.Check onChange={this.handleCheckBoxChange(2)} type="checkbox" label={"10:00 am - 11:00 am"}/>
				<Form.Check onChange={this.handleCheckBoxChange(3)} type="checkbox" label={"11:00 am - 12:00 pm"}/>
				<Form.Check onChange={this.handleCheckBoxChange(4)} type="checkbox" label={"12:00 pm - 01:00 pm"}/>
				<Form.Check onChange={this.handleCheckBoxChange(5)} type="checkbox" label={"01:00 pm - 02:00 pm"}/>
				<Form.Check onChange={this.handleCheckBoxChange(6)} type="checkbox" label={"02:00 pm - 03:00 pm"}/>
				<Form.Check onChange={this.handleCheckBoxChange(7)} type="checkbox" label={"03:00 pm - 04:00 pm"}/>
				<Form.Check onChange={this.handleCheckBoxChange(8)} type="checkbox" label={"04:00 pm - 05:00 pm"}/>
			  </div>
            </Col>
			<Col>
			  <h6> Sunday - 01/02/20 </h6>
              <div>
			    <Form.Check onChange={this.handleCheckBoxChange(9)} type="checkbox" label={"09:00 am - 10:00 am"}/>
				<Form.Check onChange={this.handleCheckBoxChange(10)} type="checkbox" label={"10:00 am - 11:00 am"}/>
				<Form.Check onChange={this.handleCheckBoxChange(11)} type="checkbox" label={"11:00 am - 12:00 pm"}/>
				<Form.Check onChange={this.handleCheckBoxChange(12)} type="checkbox" label={"12:00 pm - 01:00 pm"}/>
				<Form.Check onChange={this.handleCheckBoxChange(13)} type="checkbox" label={"01:00 pm - 02:00 pm"}/>
				<Form.Check onChange={this.handleCheckBoxChange(14)} type="checkbox" label={"02:00 pm - 03:00 pm"}/>
				<Form.Check onChange={this.handleCheckBoxChange(15)} type="checkbox" label={"03:00 pm - 04:00 pm"}/>
				<Form.Check onChange={this.handleCheckBoxChange(16)} type="checkbox" label={"04:00 pm - 05:00 pm"}/>
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