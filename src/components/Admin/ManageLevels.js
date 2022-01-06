import React, { useState, useEffect } from "react";
import styled from "styled-components";
import swal from "@sweetalert/with-react";
import cloneDeep from "lodash.clonedeep";

import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Modal from "react-bootstrap/Modal";
import Card from "react-bootstrap/Card";
import Toast from "react-bootstrap/Toast";

import { withFirebase } from "upe-react-components";

import Loader from "../Loader";
import Error from "../Error";
import AdminLayout from "./AdminLayout";
import LevelDisplay from "./LevelDisplay";

import { BackIcon } from "../TextDisplay";

const StyledButton = styled(Button)`
  text-decoration: none;
  color: #ffffff;
  background-color: ${(props) => (props.green ? "#008000" : "#f21131")};
  border: none;
  font-size: 25px;
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

const Title = styled.div`
  padding-left: 5%;
  h1 {
    font-family: Georgia;
    font-size: 50px;
    font-style: italic;
  }
  h1:after {
    content: "";
    display: block;
    width: 4%;
    padding-top: 3px;
    border-bottom: 2px solid #f21131;
  }
`;

const Text = styled.div`
  padding-left: 7%;
  padding-right: 7%;
  font-family: Georgia;
  width: 100%;
  padding-top: 20px;
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  h2 {
    font-weight: bold;
    font-size: 35px;
    border-bottom: 2px solid #f21131;
    margin-bottom: 2%;
    margin-top: 2%;
    font-style: italic;
  }
  h3 {
    font-weight: bold;
    font-size: 30px;
    padding-bottom: 2%;
    color: #f21131;
    font-style: italic;
  }
  h4 {
    font-weight: bold;
    font-size: 25px;
    padding-bottom: 1.5%;
    font-style: italic;
  }
  h5 {
    font-weight: bold;
    font-size: 20px;
    padding-bottom: 1.5%;
  }
  h5:after {
    content: "";
    display: block;
    width: 5%;
    padding-top: 3px;
    border-bottom: 2px solid #f21131;
  }
  p {
    font-weight: bold;
    font-size: 15px;
    padding-bottom: 1%;
    max-width: 50%;
  }
`;

const ManageLevels = ({ firebase }) => {
  const [levelConfig, setLevelConfig] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [levelConfigLoaded, setLevelConfigLoaded] = useState(false);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

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

  const saveLevel = async (oldName, newName, newQuestions) => {
    const newLevelConfig = cloneDeep(levelConfig);

    if (oldName !== newName) delete newLevelConfig[oldName];
    newLevelConfig[newName] = newQuestions.map(({ id, order }) => ({
      id,
      order,
    }));

    await firebase
      .levelConfig()
      .set(newLevelConfig)
      .catch((err) => {
        console.error(err);
        setError(err);
      });

    setShowModal(false);
    setShowToast(true);
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

        setShowToast(true);
      }
    });

  if (error) return <Error error={error} />;
  if (loading) return <Loader />;

  const LevelDisplaySubmit = ({ oldName, newName, questions }) => (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <StyledButton
        onClick={() => saveLevel(oldName, newName, questions)}
        disabled={newName === "" || questions.length === 0}
      >
        Save
      </StyledButton>

      <StyledButton onClick={() => deleteLevel(oldName)} variant="danger">
        Delete
      </StyledButton>
    </div>
  );

  const LevelAddSubmit = ({ oldName, newName, questions }) => (
    <StyledButton
      onClick={() => saveLevel(oldName, newName, questions)}
      disabled={newName === "" || questions.length === 0}
    >
      Submit
    </StyledButton>
  );

  return (
    <AdminLayout>
      <BackIcon />
      <Title>
        <h1> Interview Levels </h1>
      </Title>
      <Text flexdirection="column">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <StyledButton
            onClick={() => setShowModal(true)}
            style={{ height: "fit-content" }}
          >
            Add Interview Level
          </StyledButton>
        </div>
        <br />
        <Row>
          {Object.entries(levelConfig)
            .sort((a, b) => (a[0] > b[0] ? 1 : -1))
            .map(([name, questions]) => {
              const populatedQuestions = questions.map((question) => {
                const fullQuestion = allQuestions.find(
                  (q) => q.id === question.id
                );
                return {
                  ...fullQuestion,
                  order: question.order,
                };
              });

              return (
                <Card style={{ width: "23rem", margin: 10 }} key={name}>
                  <Card.Body
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <LevelDisplay
                      name={name}
                      questions={populatedQuestions}
                      otherQuestions={allQuestions}
                      SubmitButton={LevelDisplaySubmit}
                    />
                  </Card.Body>
                </Card>
              );
            })}
        </Row>
      </Text>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Level</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <LevelDisplay
            name=""
            questions={[]}
            otherQuestions={allQuestions}
            SubmitButton={LevelAddSubmit}
          />
        </Modal.Body>
      </Modal>

      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={3000}
        autohide
        style={{ position: "fixed", right: 25, bottom: 25 }}
      >
        <Toast.Header
          style={{ color: "#333", backgroundColor: "rgb(135 251 135 / 85%)" }}
        >
          <strong className="mr-auto">Changes saved!</strong>
        </Toast.Header>
      </Toast>
    </AdminLayout>
  );
};

export default withFirebase(ManageLevels);
