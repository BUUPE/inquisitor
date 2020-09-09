import React, { useState, Fragment } from "react";
import styled from "styled-components";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";

import { withFirebase } from "upe-react-components";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { LevelEditor } from "./EditLevel";

const StyledHr = styled.hr`
  border: 2px solid #333;
  border-radius: 5px;
`;

const LevelDisplay = ({name, questions, saveLevel}) => {
  const [deleteLevel, setDeleteLevel] = useState(false);

  const deleteLevel2 = () => {
    const { levelName, levelConfig } = this.state;
    delete levelConfig[levelName];

    this.props.firebase
      .levelConfig()
      .set(levelConfig)
      .then(() => {
        console.log("Level Deleted: ", levelName);
        this.updateData();
      });
  };

    const Delete = () => {
      return (
        <Fragment>
          <Button onClick={deleteLevel2}>Are you sure?</Button>
          <StyledHr />
        </Fragment>
      );
    };

    return (
        <Card style={{ maxWidth: "18rem", margin: 10 }}>
      <Card.Body>
          <h2>{name}</h2>

          {/*<Col>
            <h3>Questions</h3>
            {questions.map((question) => {
              if (question.id === undefined) {
                return (
                  <h5 key={Math.random().toString(36)}>#{question.order}: Question Deleted!</h5>
                )
              } else {
                return (
                  <h5 key={question.id}>#{question.order}: {question.name}</h5>
                )
              }
            })}
          </Col>*/}

          <DndProvider
                  backend={HTML5Backend}
                  styled={{ textAlign: "center", itemAlign: "center" }}
                >
                  <LevelEditor
                  questions={questions}
                  saveLevel={saveLevel}
                />
                </DndProvider>


          <Button onClick={() => setDeleteLevel(!deleteLevel)}>Delete Level</Button>

          {deleteLevel && <Delete />}
      </Card.Body>
    </Card>
    );
  }

export default withFirebase(LevelDisplay);
