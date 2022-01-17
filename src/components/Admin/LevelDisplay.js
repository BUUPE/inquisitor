import React, { useState, useEffect, useRef } from "react";
import update from "immutability-helper";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";

import { withFirebase } from "upe-react-components";
import {
  FullWidthFormRow,
  FullWidthFormGroup,
  CenteredForm,
  StyledButton,
} from "../../styles/global";

const DraggableQuestion = ({
  uid,
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

  const displayText = uid === undefined ? `Question #${index}  Deleted!` : text;

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
        onClick={() => removeQuestion(uid)}
      >
        X
      </Button>
    </Card>
  );
};

const LevelDisplay = ({ name, questions, otherQuestions, SubmitButton }) => {
  const [questionToAdd, setQuestionToAdd] = useState([]);
  const [localQuestions, setLocalQuestions] = useState([]);
  const [localName, setLocalName] = useState("");

  useEffect(() => setLocalQuestions(questions), [questions]);
  useEffect(() => setLocalName(name), [name]);

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
        .filter((q) => q.uid !== questionId)
        .map((question, i) => ({
          ...question,
          order: i,
        }))
    );
  };

  const addQuestion = (questions) => {
    if (questions.length === 0) return;

    const newQuestions = questions.map((questionId) => {
      console.log(questionId);
      return otherQuestions.find((question) => question.uid === questionId);
    });

    setLocalQuestions(
      update(localQuestions, {
        $push: newQuestions,
      }).map((question, i) => ({
        ...question,
        order: i,
      }))
    );
  };

  const questionIds = localQuestions.map((question) => question.uid);
  const filteredQuestions = otherQuestions.filter(
    (question) => !questionIds.includes(question.uid)
  );

  return (
    <>
      <div style={{ flexGrow: 1 }}>
        <CenteredForm>
          <FullWidthFormRow>
            <FullWidthFormGroup controlId="levelName">
              <Form.Label>
                <h5>Level Name</h5>
              </Form.Label>
              <Form.Control
                required
                name="levelName"
                type="text"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
              />
            </FullWidthFormGroup>
          </FullWidthFormRow>
        </CenteredForm>

        <CenteredForm>
          <FullWidthFormRow>
            <FullWidthFormGroup controlId="newQuestionSelector">
              <Form.Label>
                <h5>Other Questions</h5>
              </Form.Label>
              <Form.Control
                required
                name="newQuestionSelector"
                as="select"
                multiple
                onChange={(e) => {
                  const selected = [].slice.call(e.target.selectedOptions);
                  const formatted = selected.map((item) => item.value);
                  setQuestionToAdd(formatted);
                }}
              >
                {filteredQuestions.map((question) => (
                  <option key={question.uid} value={question.uid}>
                    {question.name}
                  </option>
                ))}
              </Form.Control>
            </FullWidthFormGroup>
          </FullWidthFormRow>

          <StyledButton
            paddingTop={"0.5%"}
            paddingRight={"2%"}
            paddingBottom={"0.5%"}
            paddingLeft={"2%"}
            onClick={() => addQuestion(questionToAdd)}
            disabled={questionToAdd === ""}
          >
            Add Question
          </StyledButton>
        </CenteredForm>

        <br />

        <div style={{ textAlign: "center" }}>
          <h5>
            {localQuestions.length > 0 ? "Level Questions" : "No Questions!"}
          </h5>

          <DndProvider backend={HTML5Backend}>
            {localQuestions
              .sort((a, b) => (a.order > b.order ? 1 : -1))
              .map((question) => (
                <DraggableQuestion
                  key={question.uid}
                  uid={question.uid}
                  index={question.order}
                  text={question.name}
                  reorderQuestion={reorderQuestion}
                  removeQuestion={removeQuestion}
                />
              ))}
          </DndProvider>
        </div>
      </div>

      <SubmitButton
        oldName={name}
        newName={localName}
        questions={localQuestions}
      />
    </>
  );
};

export default withFirebase(LevelDisplay);
