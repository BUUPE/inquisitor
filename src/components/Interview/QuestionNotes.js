import React, { Component } from "react";
import styled from "styled-components";

import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Toast from "react-bootstrap/Toast";
import RangeSlider from "react-bootstrap-range-slider";

const StyledP = styled.p`
  white-space: pre-wrap;
`;

class QuestionNotes extends Component {
  state = {
    note: this.props.note,
    score: this.props.score,
    showToast: false,
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.props.overwritten) {
      this.setState(prevState);
      this.props.resetOverwritten();
    }
  }

  handleSubmit = async (event) => {
    const { note, score } = this.state;
    event.preventDefault();
    await this.props.saveApplication({
      note,
      score,
      id: this.props.question.id,
    });
    await this.props.submitApplication();
  };

  handleSave = () => {
    const { note, score } = this.state;
    this.props.saveApplication({
      note,
      score,
      id: this.props.question.id,
    });
  };

  render() {
    return (
      <>
        <StyledP>{this.props.question.answer}</StyledP>
        <Form onSubmit={this.handleSubmit}>
          <div className="note-wrapper">
            <Col sm={9}>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>
                  <strong>Notes</strong>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows="10"
                  placeholder="Enter notes here..."
                  value={this.state.note}
                  onChange={(e) => this.setState({ note: e.target.value })}
                  onBlur={() => this.handleSave()}
                  required
                />
              </Form.Group>
            </Col>
            <Col sm={3}>
              <strong>Score</strong>

              <RangeSlider
                value={this.state.score}
                onChange={(e) =>
                  this.setState({ score: parseFloat(e.target.value) })
                }
                onAfterChange={() => this.handleSave()}
                step={0.5}
                max={5}
                min={0}
              />
            </Col>
          </div>

          {this.props.submitApplication && (
            <Button type="submit">Submit</Button>
          )}

          <Toast
            onClose={() => this.setState({ showToast: false })}
            show={this.state.showToast}
            delay={3000}
            autohide
          >
            <Toast.Body>
              <strong>Saved!</strong>
            </Toast.Body>
          </Toast>
        </Form>
        <hr />
      </>
    );
  }
}

export default QuestionNotes;
