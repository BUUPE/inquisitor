import React, { useState, useEffect } from "react";
import swal from "@sweetalert/with-react";
import cloneDeep from "lodash.clonedeep";
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

const ManageLevels = ({ firebase }) => {
  const [levelConfig, setLevelConfig] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [levelConfigLoaded, setLevelConfigLoaded] = useState(false);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (firebase) {
      const levelConfigUnsub = firebase
        .levelConfig()
        .onSnapshot((docSnapshot) => {
          if (docSnapshot.exists) setLevelConfig(docSnapshot.data());
          else setError("No levelConfig");
          setLevelConfigLoaded(true);
        });

      const questionsUnsub = firebase
        .questions()
        .onSnapshot((querySnapshot) => {
          const allQuestions = querySnapshot.docs.map((doc) => {
            return { id: doc.id, ...doc.data() };
          });

          setAllQuestions(allQuestions);
          setQuestionsLoaded(true);
        });

      return () => {
        levelConfigUnsub();
        questionsUnsub();
      };
    }
  }, [firebase]);

  useEffect(() => {
    if (levelConfigLoaded && questionsLoaded) setLoading(false);
  }, [levelConfigLoaded, questionsLoaded]);

  const toggleAdd = () => {
    this.setState({ addLevel: !this.state.addLevel });
  };

  const saveLevel = async (levelName, newQuestions) => {
    const newLevelConfig = cloneDeep(levelConfig);
    newLevelConfig[levelName] = newQuestions;
    await firebase
      .levelConfig()
      .update(newLevelConfig)
      .catch((err) => {
        console.error(err);
        setError(err);
      });
  };

  const deleteLevel = (levelName) =>
    swal({
      title: "Are you sure?",
      text:
        "Once you delete a level, you can't undo! Make sure you really want this!",
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
    }).then(async (confirm) => {
      if (confirm) {
        const newLevelConfig = cloneDeep(levelConfig);
        delete newLevelConfig[levelName];

        await firebase
          .levelConfig()
          .set(newLevelConfig)
          .catch((err) => {
            console.error(err);
            setError(err);
          });
      }
    });

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
                  allQuestions={allQuestions}
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
            const populatedQuestions = questions.map((question) => {
              const fullQuestion = allQuestions.find(
                (q) => q.id === question.id
              );
              return {
                ...fullQuestion,
                order: question.order,
              };
            });

            const questionIds = questions.map((question) => question.id);
            const otherQuestions = allQuestions.filter(
              (question) => !questionIds.includes(question.id)
            );

            return (
              <LevelDisplay
                key={name}
                name={name}
                questions={populatedQuestions}
                otherQuestions={otherQuestions}
                saveLevel={saveLevel}
                deleteLevel={deleteLevel}
              />
            );
          })}
        </Row>
      </Container>
    </AdminLayout>
  );
};

export default withFirebase(ManageLevels);
