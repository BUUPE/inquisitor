import React, { useState, useEffect } from "react";
import styled from "styled-components";
import update from "immutability-helper";
import cloneDeep from "lodash.clonedeep";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";

import {
  FullWidthFormRow,
  FullWidthFormGroup,
  CenteredForm,
} from "../../styles/global";

const StyledButton = styled(Button)`
  text-decoration: none;
  color: #ffffff;
  background-color: ${(props) => (props.green ? "#008000" : "#f21131")};
  border: none;
  font-size: 20px;
  font-weight: bold;
  padding: 0.5% 2% 0.5% 2%;
  &:focus,
  &:active,
  &:visited,
  &:disabled {
    text-decoration: none;
    color: #ffffff;
    background-color: ${(props) => (props.green ? "#7FBF7F" : "#f88898")};
    border: none;
  }
  &:hover {
    text-decoration: none;
    color: #ffffff;
    background-color: ${(props) => (props.green ? "#004C00" : "#600613")};
    border: none;
  }
`;

const QuestionDisplay = ({
  id,
  name,
  answer,
  description,
  image,
  imageName,
  updateQuestion,
  removeQuestionImage,
  deleteQuestion,
}) => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("bs-custom-file-input").then((bsCustomFileInput) => {
        bsCustomFileInput.init();
      });
    }
  }, []);

  const FormSubmit = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <StyledButton type="submit">Save</StyledButton>
      <StyledButton
        variant="danger"
        onClick={() => deleteQuestion(id, imageName)}
      >
        Delete
      </StyledButton>
    </div>
  );

  return (
    <Card style={{ maxWidth: "18rem", margin: 10 }}>
      <Card.Body>
        <QuestionForm
          initialFormData={{
            name,
            answer,
            description,
            image: "",
            imagePreview: image,
            id,
          }}
          submitFunction={updateQuestion}
          imageClearFunc={() => removeQuestionImage(id, imageName)}
          SubmitButton={FormSubmit}
        />
      </Card.Body>
    </Card>
  );
};

export const QuestionForm = ({
  initialFormData,
  submitFunction,
  imageClearFunc,
  SubmitButton,
}) => {
  const [formData, setFormData] = useState(initialFormData);

  const [validated, setValidated] = useState(false);

  const saveQuestion = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
    } else {
      submitFunction(cloneDeep(formData));
      setValidated(false);
    }
  };

  const updateField = (e) =>
    setFormData(
      update(formData, {
        [e.target.name]: { $set: e.target.value },
      })
    );

  const updateImage = (e) => {
    const hasIMG = e.target.files.length === 1;
    setFormData(
      update(formData, {
        image: { $set: hasIMG ? e.target.files[0] : "" },
        imagePreview: {
          $set: hasIMG ? URL.createObjectURL(e.target.files[0]) : "",
        },
      })
    );
  };

  return (
    <CenteredForm noValidate validated={validated} onSubmit={saveQuestion}>
      <FullWidthFormRow>
        <FullWidthFormGroup controlId="name">
          <Form.Label>
            <h5>Name</h5>
          </Form.Label>
          <Form.Control
            name="name"
            type="text"
            placeholder="Enter question name..."
            value={formData.name}
            onChange={updateField}
            required
          />
        </FullWidthFormGroup>
      </FullWidthFormRow>

      <FullWidthFormRow>
        <FullWidthFormGroup controlId="answer">
          <Form.Label>
            <h5>Answer</h5>
          </Form.Label>
          <Form.Control
            rows={3}
            name="answer"
            as="textarea"
            placeholder="Enter question answer..."
            value={formData.answer}
            onChange={updateField}
            required
          />
        </FullWidthFormGroup>
      </FullWidthFormRow>

      <FullWidthFormRow>
        <FullWidthFormGroup controlId="description">
          <Form.Label>
            <h5>Description</h5>
          </Form.Label>
          <Form.Control
            rows={3}
            name="description"
            as="textarea"
            placeholder="Enter question description..."
            value={formData.description}
            onChange={updateField}
            required
          />
        </FullWidthFormGroup>
      </FullWidthFormRow>

      <FullWidthFormRow>
        <FullWidthFormGroup controlId="file">
          <Form.Label>
            <h5> Image </h5>
            {formData.imagePreview !== "" && (
              <img
                src={formData.imagePreview}
                alt="Hint for question"
                style={{ maxWidth: "100%" }}
              />
            )}
          </Form.Label>
          <Form.File
            id="custom-file-file"
            name="file"
            accept=".png,.jpg"
            onChange={updateImage}
          />
          <StyledButton
            style={{ marginTop: "1%" }}
            onClick={() => {
              setFormData(
                update(formData, {
                  image: { $set: "" },
                  imagePreview: { $set: "" },
                })
              );

              if (typeof imageClearFunc === "function") imageClearFunc();
            }}
          >
            Clear
          </StyledButton>
        </FullWidthFormGroup>
      </FullWidthFormRow>

      <SubmitButton />
    </CenteredForm>
  );
};

export default QuestionDisplay;
