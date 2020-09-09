import React, { useState, useEffect } from "react";
import styled from "styled-components";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import AdminLayout from "./AdminLayout";
import LevelDisplay from "./LevelDisplay";

import { withFirebase } from "upe-react-components";

import Loader from "../Loader";
import Error from "../Error";
import { LevelAdder } from "./EditLevel";
import { Container } from "../../styles/global";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const StyledDiv = styled.div`
  text-align: right;
`;

const StyledCol = styled(Col)`
  padding: 10px 10px 10px 10px;
  width: 200px;
`;

const StyledDivCard = styled.div`
  width: 90%;
  padding: 15px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  border-radius: 15px;
  text-align: center;
  &:hover {
    -webkit-transform: translateY(-5px);
    transform: translateY(-5px);
    transition: all 0.3s linear;
  }

  a {
    color: white;
    font-weight: bold;
    padding-top: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid grey;
  }

  a[aria-current="page"] {
    color: ${(props) => props.theme.palette.mainBrand};
  }
`;

const ManageLevels = ({firebase}) => {
  const [levelConfig, setLevelConfig] = useState(null);
  const [questionList, setQuestionList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (firebase) {
      const levelConfigUnsub = firebase.levelConfig().onSnapshot(docSnapshot => {
        if (docSnapshot.exists) setLevelConfig(docSnapshot.data())
        else setError("No levelConfig");
        setLoading(false)
      });

      const questionsUnsub = firebase
        .questions()
        .onSnapshot((querySnapshot) => {
          const questionList = querySnapshot.docs.map((doc) => {
            return { id: doc.id, ...doc.data() };
          });

          setQuestionList(questionList);
        });

      return () => {
        levelConfigUnsub();
        questionsUnsub();
      }
    }
  }, [firebase]);

  const toggleAdd = () => {
    this.setState({ addLevel: !this.state.addLevel });
  };

  const saveLevel = (level) => {

  }

    if (error) return <Error error={error} />;
    if (loading) return <Loader />;

    const AddLevel = () => {
      return (
        <Row>
          <StyledCol>
            <StyledDivCard>
              <h2>Add Level</h2>

              <Container flexdirection="column">
                <DndProvider
                  backend={HTML5Backend}
                  styled={{ textAlign: "center", itemAlign: "center" }}
                >
                  <LevelAdder
                    levelConfig={levelConfig}
                    allQuestions={questionList}
                  />
                </DndProvider>
              </Container>
            </StyledDivCard>
          </StyledCol>
        </Row>
      );
    };

    return (
      <AdminLayout>
        <Container flexdirection="column">
          <h1> Interview Levels </h1>
          <br />
          <StyledDiv>
            <Button onClick={toggleAdd}>Add Interview Level</Button>
          </StyledDiv>
          <br />

          {/*addLevel && <AddLevel />*/}

          <br />

          <Row>
            {Object.entries(levelConfig).map(([name, questions]) => {
              const populatedQuestions = questions.map(question => {
                const fullQuestion = questionList.find(q => q.id === question.id);
                return {
                  ...fullQuestion,
                  order: question.order
                }
              });


              return (
                <LevelDisplay
                  key={name}
                  name={name}
                  questions={populatedQuestions}
                  saveLevel={saveLevel}
                />
              )
            })}
          </Row>
        </Container>
      </AdminLayout>
    );
}

export default withFirebase(ManageLevels);
