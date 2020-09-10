import React, { useState, useEffect, useRef, Fragment } from "react";
import styled from "styled-components";
import update from "immutability-helper";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";

import { withFirebase } from "upe-react-components";

const CenteredForm = styled(Form)`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 500px;
  margin: 0 auto;
`;

const StyledHr = styled.hr`
  border: 2px solid #333;
  border-radius: 5px;
`;

const DraggableQuestion = ({
  id,
  text,
  index,
  reorderQuestion,
  removeQuestion,
}) => {
  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: "question",
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      reorderQuestion(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    item: { type: "question", index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  const displayText = id === undefined ? `Question #${index}  Deleted!` : text;

  return (
    <Card
      ref={ref}
      style={{
        opacity,
        margin: "5px 0",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 3,
        cursor: "pointer",
      }}
    >
      <span>
        #{index}: {displayText}
      </span>
      <Button
        style={{ padding: "0 5px" }}
        variant="danger"
        onClick={() => removeQuestion(id)}
      >
        X
      </Button>
    </Card>
  );
};

const LevelDisplay = ({
  name,
  questions,
  otherQuestions,
  saveLevel,
  deleteLevel,
}) => {
  const [questionToAdd, setQuestionToAdd] = useState("");
  const [localQuestions, setLocalQuestions] = useState([]);
  useEffect(() => setLocalQuestions(questions), [questions]);

  const reorderQuestion = (originalIndex, newIndex) => {
    const question = localQuestions[originalIndex];

    setLocalQuestions(
      update(localQuestions, {
        $splice: [
          [originalIndex, 1],
          [newIndex, 0, question],
        ],
      }).map((question, i) => ({
        ...question,
        order: i,
      }))
    );
  };

  const removeQuestion = (questionId) => {
    setLocalQuestions(
      localQuestions
        .filter((q) => q.id !== questionId)
        .map((question, i) => ({
          ...question,
          order: i,
        }))
    );
  };

  const addQuestion = (questionId) => {
    if (questionId === "") return;
    const newQuestion = otherQuestions.find(
      (question) => question.id === questionId
    );

    setLocalQuestions(
      update(localQuestions, {
        $push: [newQuestion],
      }).map((question, i) => ({
        ...question,
        order: i,
      }))
    );
  };

  const questionIds = questions.map((question) => question.id);
  const filteredQuestions = otherQuestions.filter(
    (question) => !questionIds.includes(question.id)
  );

  return (
    <Card style={{ width: "23rem", margin: 10 }}>
      <Card.Body>
        <h2>{name}</h2>

        <div styled={{ textAlign: "center", itemAlign: "center" }}>
          <CenteredForm>
            <Form.Row style={{ width: "100%" }} key={0}>
              <Form.Group controlId={4} style={{ width: "100%" }}>
                <Form.Label>
                  <h5> Other Questions </h5>
                </Form.Label>
                <Form.Control
                  required
                  name={"addQ"}
                  as="select"
                  onChange={(e) => setQuestionToAdd(e.target.value)}
                >
                  <option value=""> - </option>
                  {filteredQuestions.map((question) => (
                    <option key={question.id} value={question.id}>
                      {question.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Form.Row>

            <Button
              onClick={() => addQuestion(questionToAdd)}
              disabled={questionToAdd === ""}
            >
              Add Question
            </Button>
          </CenteredForm>

          <br />

          <div style={{ textAlign: "center" }}>
            <h5>Level Questions</h5>

            <DndProvider backend={HTML5Backend}>
              {localQuestions
                .sort((a, b) => (a.order > b.order ? 1 : -1))
                .map((question) => (
                  <DraggableQuestion
                    key={question.id}
                    id={question.id}
                    index={question.order}
                    text={question.name}
                    reorderQuestion={reorderQuestion}
                    removeQuestion={removeQuestion}
                  />
                ))}
            </DndProvider>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button onClick={() => saveLevel(name, localQuestions)}>Save</Button>

          <Button onClick={() => deleteLevel(name)} variant="danger">
            Delete
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default withFirebase(LevelDisplay);
