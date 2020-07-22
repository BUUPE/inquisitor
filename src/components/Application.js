import React from 'react';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import logo from '../assets/img/logo.png';

class ApplicationForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      applicantName: '',
      resume: '',
      classYear: '',
      major: '',
      taken112: '',
      taken330: '',
      q1: '',
      q2: '',
      timeslots: {
        saturday: {
          "9 AM - 10 AM": false,
          "10 AM - 11 AM": false,
          "11 AM - 12 PM": false,
          "12 PM - 1 PM": false,
          "1 PM - 2 PM": false,
          "2 PM - 3 PM": false,
          "3 PM - 4 PM": false,
          "4 PM - 5 PM": false,
          "5 PM - 6 PM": false
        },
        sunday: {
          "9 AM - 10 AM": false,
          "10 AM - 11 AM": false,
          "11 AM - 12 PM": false,
          "12 PM - 1 PM": false,
          "1 PM - 2 PM": false,
          "2 PM - 3 PM": false,
          "3 PM - 4 PM": false,
          "4 PM - 5 PM": false,
          "5 PM - 6 PM": false
        }
      },
      validated: false,
      error: null,
      submitted: false
    };
  }

  onChange = event => this.setState({ [event.target.name]: event.target.value });

  onCheckboxChange = event => {
    const { timeslots } = this.state;
    const checked = timeslots[event.target.name][event.target.value];
    timeslots[event.target.name][event.target.value] = !checked;
    this.setState({ timeslots });
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
        resume: this.state.resume,
        classYear: this.state.classYear,
        major: this.state.major,
        taken112: this.state.taken112,
        taken330: this.state.taken330,
        q1: this.state.q1,
        q2: this.state.q2,
        timeslots: this.state.timeslots
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
      taken112,
      taken330,
      resume,
      q1,
      q2,
      timeslots,
      validated,
      submitted,
      error
    } = this.state;

    const successMessage = (
      <Container className="application-form-wrapper">
        <Row>
          <Col className="col-md-12 text-center">
            <img src={logo} alt="UPE Logo" height="256" width="256" />
            <h1>Application Submitted!</h1>
          </Col>
        </Row>
        <Row className="thanks-text">
          <Col className="col-md-12 text-center">
            <p>Thank you for applying to join UPE. We will be getting back to you by Friday the XX with a timeslot for your interview. </p>
            <p>Additional details will be sent to you via the email address you provided in your application!</p>
          </Col>
        </Row>
      </Container>
    );


    const year = new Date().getFullYear();
    const years= [];
    for (let i = year; i <= year + 7; i++) {
      years.push(i);
    }

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
            </Col>
            <Col>
              <h5>Resume</h5>
              <Form.Group>
                <Form.Control
                  name="resume"
                  type="file"
                  placeholder="Resume"
                  value={resume}
                  onChange={this.onChange}
                  required
                />
              </Form.Group>
            </Col>
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
          <Row>
            <Col>
              <h5>Taken CS 112?</h5>
              <Form.Group>
                <Form.Control as="select"
                  name="taken112"
                  value={taken112}
                  onChange={this.onChange}
                  required
                >
                  <option value="">-</option>
                  <option>Yes</option>
                  <option>No</option>
                  <option>Currently Enrolled</option>
                </Form.Control>
              </Form.Group>
            </Col>
            <Col>
              <h5>Taken CS 330?</h5>
              <Form.Group>
                <Form.Control as="select"
                  name="taken330"
                  value={taken330}
                  onChange={this.onChange}
                  required
                >
                  <option value="">-</option>
                  <option>Yes</option>
                  <option>No</option>
                  <option>Currently Enrolled</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <h5>Why do you want to join UPE?</h5>
              <p>Around 100 Words</p>
              <Form.Group>
                <Form.Control
                  name="q1"
                  as="textarea"
                  rows="7"
                  placeholder="..."
                  value={q1}
                  onChange={this.onChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <h5>What do you hope to gain from joining UPE?</h5>
              <p>Around 100 Words</p>
              <Form.Group>
                <Form.Control
                  name="q2"
                  as="textarea"
                  rows="7"
                  placeholder="..."
                  value={q2}
                  onChange={this.onChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <h5>When are you available for interviews?</h5>
            </Col>
          </Row>
          <Row>
            <Col>
              <h6>Saturday - 01/01/20</h6>
              <Form.Group>
                {Object.keys(timeslots.saturday).map(time => (
                  <Form.Check
                    key={time}
                    type="checkbox"
                    onChange={this.onCheckboxChange}
                    name="saturday"
                    value={time}
                    label={time}/>
                ))}
              </Form.Group>
            </Col>
            <Col>
              <h6>Sunday - 01/02/20</h6>
              <Form.Group>
                {Object.keys(timeslots.sunday).map(time => (
                  <Form.Check
                    key={time}
                    type="checkbox"
                    onChange={this.onCheckboxChange}
                    name="sunday"
                    value={time}
                    label={time}/>
                ))}
              </Form.Group>
            </Col>
          </Row>
          <Row className="row-button">
            <Col>
              <Button type="submit" onSubmit={this.onSubmit} className="btn btn-danger">
                Submit Application
              </Button>
            </Col>
          </Row>

          {error && <p className="error-msg">{error.message}</p>}
        </Form>
      </Container>
    );
  }
}

export default ApplicationForm;
