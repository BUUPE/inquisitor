import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import swal from "@sweetalert/with-react";
import { compose } from "recompose";

import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Toast from "react-bootstrap/Toast";

import { withAuthorization, isAdmin } from "../Session";
import { withFirebase } from "../Firebase";
import AdminLayout from "./AdminLayout";
import Loader from "../Loader";
import { RequiredAsterisk } from "../ApplicationForm";
import { FlexDiv } from "../../styles/global";

// assumes this is run before the coming recruitment season
const estimateSemester = () => {
  const month = new Date().getMonth();
  let semester;

  if (month >= 10) {
    // november or december
    semester = `Spring-${new Date().getFullYear() + 1}`;
  } else if (month >= 2) {
    // march or later
    semester = `Fall-${new Date().getFullYear()}`;
  } else {
    // january or february
    semester = `Spring-${new Date().getFullYear()}`;
  }

  return semester;
};

const DEFAULT_APPLICATION_FORM_CONFIG = {
  semester: estimateSemester(),
  questions: [
    {
      id: 1,
      order: 1,
      name: "Full Name",
      type: "text",
      required: true,
      default: true,
    },
    {
      id: 2,
      order: 2,
      name: "Email",
      type: "email",
      required: true,
      default: true,
    },
    {
      id: 3,
      order: 3,
      name: "Major",
      type: "text",
      required: true,
      default: true,
    },
    {
      id: 4,
      order: 4,
      name: "Minor",
      type: "text",
      required: false,
      default: true,
    },
    {
      id: 5,
      order: 5,
      name: "Class Year",
      type: "number",
      required: true,
      default: true,
    },
    {
      id: 6,
      order: 6,
      name: "Resume",
      type: "file",
      required: true,
      default: true,
    },
  ],
};

const UnderlinedLabel = styled(Form.Label)`
  text-decoration: underline;
  text-decoration-color: ${(props) => props.theme.palette.mainBrand};
`;

const ConfigureApplicationForm = ({ firebase }) => {
  const [applicationFormConfig, setApplicationFormConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  useEffect(() => {
    const loadApplicationFormConfig = async () => {
      const doc = await firebase.applicationFormConfig().get();

      if (!doc.exists) {
        await firebase
          .applicationFormConfig()
          .set(DEFAULT_APPLICATION_FORM_CONFIG);
        setApplicationFormConfig(DEFAULT_APPLICATION_FORM_CONFIG);
      } else {
        setApplicationFormConfig(doc.data());
      }

      setLoading(false);
    };
    if (firebase) loadApplicationFormConfig();
  }, [firebase]);

  if (loading) return <Loader />;

  const saveApplicationFormConfig = (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      const doUpdate = () => {
        const semester = form.querySelector("#semester").value;
        const year = form.querySelector("#year").value;
        const newApplicationFormConfig = {
          ...applicationFormConfig,
          semester: `${semester}-${year}`,
        };

        firebase
          .applicationFormConfig()
          .set(newApplicationFormConfig)
          .then(() => {
            setApplicationFormConfig(newApplicationFormConfig);
            setShowToast(true);
          });
      };

      firebase
        .applications()
        .get()
        .then((snapshot) => {
          if (snapshot.size > 0) {
            swal({
              title: "Applications already exist!",
              text:
                "If you edit the application form configuration now, some applications will have different questions than others! Are you sure you want to do this?",
              icon: "warning",
              buttons: {
                cancel: {
                  text: "No",
                  value: false,
                  visible: true,
                },
                confirm: {
                  text: "Yes",
                  value: true,
                  visible: true,
                },
              },
            }).then((confirm) => {
              if (confirm) doUpdate();
            });
          } else doUpdate();
        });
    }
  };

  const resetApplicationFormConfig = () => {
    swal({
      title: "Are you sure?",
      text:
        "This will reset the application form configuration to its default state! If applications have already been sent, new applications will have different questions!",
      icon: "warning",
      buttons: {
        cancel: {
          text: "No",
          value: false,
          visible: true,
        },
        confirm: {
          text: "Yes",
          value: true,
          visible: true,
        },
      },
    }).then((confirm) => {
      if (confirm) {
        firebase
          .applicationFormConfig()
          .set(DEFAULT_APPLICATION_FORM_CONFIG)
          .then(() => {
            setApplicationFormConfig(DEFAULT_APPLICATION_FORM_CONFIG);
            setShowToast(true);
          });
      }
    });
  };

  const addNewQuestion = (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      const questions = [...applicationFormConfig.questions];
      const nextId =
        Math.max(...applicationFormConfig.questions.map((q) => q.id)) + 1;
      const nextOrder =
        Math.max(...applicationFormConfig.questions.map((q) => q.order)) + 1;

      questions.push({
        id: nextId,
        order: nextOrder,
        name: form.querySelector("#newQuestionName").value,
        type: form.querySelector("#newQuestionType").value,
        required: form.querySelector("#newQuestionRequired").checked,
      });

      setApplicationFormConfig({
        ...applicationFormConfig,
        questions,
      });
      closeModal();
    }
  };

  const removeQuestion = (questionId) => {
    const questions = applicationFormConfig.questions.filter(
      (q) => q.id !== questionId
    );
    setApplicationFormConfig({
      ...applicationFormConfig,
      questions,
    });
  };

  const updateQuestionOrder = (questionId, questionOrder, slotOrder) => {
    if (questionOrder === slotOrder) return; // if order doesn't change, do nothing

    let questions = [...applicationFormConfig.questions]; // copy array

    const questionIndex = questions.findIndex(
      (question) => question.order === questionOrder
    ); // find question
    const question = questions[questionIndex];

    // remove question to be moved
    questions = questions.filter(
      (question) => question.order !== questionOrder
    );

    // split array at new slot index
    let newSlotIndex = questions.findIndex(
      (question) => question.order === slotOrder
    );
    if (slotOrder > questionOrder) newSlotIndex += 1;
    const p1 = questions.slice(0, newSlotIndex);
    const p2 = questions.slice(newSlotIndex);

    // add question at split and rejoin array
    p1.push(question);
    questions = p1.concat(p2);

    // redo order numbers and save
    questions.forEach((question, i) => (question.order = i + 1));
    setApplicationFormConfig({
      ...applicationFormConfig,
      questions,
    });
  };

  const updateQuestionRequired = (e, questionId) => {
    const questions = [...applicationFormConfig.questions].map((q) => {
      if (q.id === questionId) {
        return {
          ...q,
          required: e.target.checked,
        };
      } else {
        return q;
      }
    });

    setApplicationFormConfig({
      ...applicationFormConfig,
      questions,
    });
  };

  const QuestionSlot = ({ isdefault, order, children }) => {
    const [{ isOver }, drop] = useDrop({
      accept: "question",
      drop: (item) => updateQuestionOrder(item.id, item.order, order),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    });

    const style = {
      maxWidth: 300,
      display: "flex",
      justifyContent: "space-between",
    };
    let props = {
      ref: drop,
      style: {
        ...style,
        borderTop: `${isOver ? "2px solid red" : "none"}`,
        borderBottom: `${isOver ? "2px solid red" : "none"}`,
      },
    };

    // default slots shouldn't interact with drop events
    if (isdefault)
      props = {
        style,
      };

    return <div {...props}>{children}</div>;
  };

  const QuestionWrapper = ({ questionId, isdefault, order, children }) => {
    const [, dragRef] = useDrag({
      item: {
        type: "question",
        id: questionId,
        order,
      },
    });

    const props = {};
    if (!isdefault) props.ref = dragRef; // only non-default questions should be draggable

    return (
      <Form.Row {...props}>
        <Form.Group controlId={questionId}>{children}</Form.Group>
      </Form.Row>
    );
  };

  const renderQuestion = (question) => {
    const renderLabel = (question) => {
      if (question.default) {
        return (
          <UnderlinedLabel>
            {question.order}. {question.name}{" "}
            {question.required && <RequiredAsterisk />}
          </UnderlinedLabel>
        );
      } else {
        return (
          <Form.Label>
            {question.order}. {question.name}{" "}
            {question.required && <RequiredAsterisk />}
          </Form.Label>
        );
      }
    };

    let questionComponent;
    if (question.type === "textarea") {
      questionComponent = (
        <Form.Control
          required={question.required}
          as="textarea"
          rows="3"
          disabled
        />
      );
    } else if (question.type === "file") {
      questionComponent = (
        <Form.File
          id={`custom-file-${question.id}`}
          label="Upload file"
          custom
          disabled
        />
      );
    } else {
      questionComponent = (
        <Form.Control
          required={question.required}
          type={question.type}
          disabled
        />
      );
    }

    return (
      <QuestionSlot
        key={question.id}
        isdefault={question.default}
        order={question.order}
      >
        <QuestionWrapper
          questionId={question.id}
          isdefault={question.default}
          order={question.order}
        >
          {renderLabel(question)}
          {questionComponent}
        </QuestionWrapper>

        {!question.default && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Form.Check
              custom
              checked={question.required}
              type="switch"
              label="Required?"
              id={`${question.id}-required`}
              onChange={(e) => updateQuestionRequired(e, question.id)}
            />
            <div
              style={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <button
                type="button"
                className="close ml-2 mb-1"
                onClick={() => removeQuestion(question.id)}
              >
                <span aria-hidden="true">×</span>
                <span className="sr-only">Close</span>
              </button>
            </div>
          </div>
        )}
      </QuestionSlot>
    );
  };

  const year = new Date().getFullYear();
  return (
    <AdminLayout>
      <h1>Configure Application</h1>

      <Form onSubmit={saveApplicationFormConfig}>
        <Row>
          <Col md="6">
            <p>
              This sets the semester-year for the coming recruitment season.
              Make sure to set this before starting the season.
            </p>
            <Form.Row>
              <Form.Group controlId="semester">
                <Form.Label>Semester</Form.Label>
                <Form.Control
                  as="select"
                  defaultValue={applicationFormConfig.semester.split("-")[0]}
                >
                  <option value="Fall">Fall</option>
                  <option value="Spring">Spring</option>
                </Form.Control>
              </Form.Group>
            </Form.Row>
            <Form.Row>
              <Form.Group controlId="year">
                <Form.Label>Year</Form.Label>
                <Form.Control
                  as="select"
                  defaultValue={applicationFormConfig.semester.split("-")[1]}
                >
                  <option value={year}>{year}</option>
                  <option value={year + 1}>{year + 1}</option>
                </Form.Control>
              </Form.Group>
            </Form.Row>
          </Col>
          <Col md="6">
            <p>
              These are the questions that applicants will see (in this order).
              Default questions are underlined in red and can't be re-ordered.
              Required questions will have an asterisk.
            </p>
            <DndProvider backend={HTML5Backend}>
              {applicationFormConfig.questions
                .sort((a, b) => (a.order > b.order ? 1 : -1))
                .map((question) => renderQuestion(question))}
            </DndProvider>

            <Button onClick={openModal}>Add Question</Button>
          </Col>
        </Row>
        <hr />
        <FlexDiv>
          <FlexDiv
            style={{
              flexGrow: 1,
            }}
          >
            <Button type="submit" disabled={showToast}>
              Save Config
            </Button>
            <Toast
              onClose={() => setShowToast(false)}
              show={showToast}
              delay={3000}
              autohide
              style={{
                width: "fit-content",
                marginLeft: 25,
              }}
            >
              <Toast.Header>
                <strong className="mr-auto">Config Saved!</strong>
              </Toast.Header>
            </Toast>
          </FlexDiv>
          <Button variant="danger" onClick={resetApplicationFormConfig}>
            Reset
          </Button>
        </FlexDiv>
      </Form>

      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Question</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={addNewQuestion} id="newQuestionForm">
            <Form.Row>
              <Form.Group as={Col} md="4" controlId="newQuestionName">
                <Form.Label>Name</Form.Label>
                <Form.Control required type="text" placeholder="Enter Name" />
              </Form.Group>

              <Form.Group as={Col} md="4" controlId="newQuestionType">
                <Form.Label>Type</Form.Label>
                <Form.Control as="select" required>
                  <option value="">-- Select Type --</option>
                  <option value="text">text</option>
                  <option value="textarea">textarea</option>
                  <option value="email">email</option>
                  <option value="number">number</option>
                  <option value="checkbox">checkbox</option>
                  <option value="file">file</option>
                </Form.Control>
              </Form.Group>

              <Form.Group as={Col} md="4" controlId="newQuestionRequired">
                <Form.Label>Required?</Form.Label>
                <Form.Control type="checkbox" />
              </Form.Group>
            </Form.Row>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">Add</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </AdminLayout>
  );
};

export default compose(
  withAuthorization(isAdmin),
  withFirebase
)(ConfigureApplicationForm);
