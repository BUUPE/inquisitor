import React from 'react';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import logo from '../assets/img/logo.png';
class CreateAnAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      applicantName: '',
      classYear: '',
      major: '',
      validated: false,
      error: null,
      submitted: false
    };
  }
  
  onSubmit = event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      axios.post('/api/saveApplication', {
        email: this.state.email,
        name: this.state.applicantName,
        classYear: this.state.classYear,
        major: this.state.major,
      })
      .then(res => console.log(res))
      .catch(error => console.error(error));

      this.setState({ submitted: true });
      console.log(this.state);
    }

    this.setState({ validated: true });
  };

render() {
    const {
      email,
      applicantName,
      classYear,
      major,
      validated,
      submitted,
      error
    } = this.state;
    
    const successMessage = (
      <Container className="account-form-wrapper">
        <Row>
          <Col className="col-md-12 text-center">
            <img src={logo} alt="UPE Logo" height="256" width="256" />
            <h1>Account Created!</h1>
          </Col>
        </Row>
        <Row className="thanks-text">
          <Col className="col-md-12 text-center">
            <p>Thank you for creating an account with UPE. </p>
            <p>For future recruitment events and the application process, you will be able to login to your account to keep track of attendence at events.</p>
          </Col>
        </Row>
      </Container>
    );
    
    return submitted ? successMessage : (
      <Container className="application-form-wrapper">
        <Form noValidate validated={validated} onSubmit={this.onSubmit}>
		      <div className="text-center">
		        <img src={logo} alt="UPE Logo" height="256" width="256" />
			      <p> </p>
		        <h1>Application Form</h1>
		      </div>

		      <Row>
		        <Col>
		          <h5>Email</h5>
              <Form.Group>
                <Form.Control
                  name="email"
                  type="email"
                  placeholder="upe@bu.edu"
                  value={email}
                  onChange={this.onChange}
                  required
                />
              </Form.Group>
		        </Col>
		        <Col>
		          <h5>Name</h5>
              <Form.Group>
                <Form.Control
                  name="applicantName"
                  type="text"
                  placeholder="Adam Smith"
                  value={applicantName}
                  onChange={this.onChange}
                  required
                />
              </Form.Group>
		      </Row>
		      <Row>
		        <Col>
			        <h5>Major</h5>
              <Form.Group>
                <Form.Control
                  name="major"
                  type="text"
                  placeholder="Computer Science"
                  value={major}
                  onChange={this.onChange}
                  required
                />
              </Form.Group>
		        </Col>
		        <Col>
		          <h5>Class Year</h5>
			        <Form.Group>
        				<Form.Control
                  as="select"
        				  name="classYear"
        				  value={classYear}
        				  onChange={this.onChange}
                  required
        				>
                  <option value="">-</option>
                  {years.map(year => <option key={year}>{year}</option>)}
                </Form.Control>
			        </Form.Group>
		        </Col>
		      </Row>
    		  <Row className="row-button">
    		    <Col>
              <Button type="submit" onSubmit={this.onSubmit} className="btn btn-danger">
                Submit Account
              </Button>
    		    </Col>
    		  </Row>

          {error && <p className="error-msg">{error.message}</p>}
        </Form>
      </Container>
    );
  }
  
}
