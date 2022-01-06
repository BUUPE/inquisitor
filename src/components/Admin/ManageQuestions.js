import React, { useState, useEffect } from "react";
import styled from "styled-components";
import swal from "@sweetalert/with-react";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Modal from "react-bootstrap/Modal";
import Toast from "react-bootstrap/Toast";

import AdminLayout from "./AdminLayout";
import QuestionDisplay, { QuestionForm } from "./QuestionDisplay";

import { withFirebase } from "upe-react-components";

import Loader from "../Loader";
import Error from "../Error";
import { objectMap } from "../../util/helper";
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

const ManageQuestions = ({ firebase }) => {
  const [questionList, setQuestionList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (firebase) {
      const unsub = firebase.questions().onSnapshot(
        (querySnapshot) => {
          const questionList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setQuestionList(questionList);
          setLoading(false);
        },
        (error) => {
          console.error(error);
          setError(error);
        }
      );

      return () => unsub();
    }
  }, [firebase]);

  const addQuestion = async (question) => {
    const newQuestionRef = firebase.questions().doc();
    const uid = newQuestionRef.id;
    delete question.imagePreview;

    let imageURL = "";
    let filename = "";

    if (question.image !== "") {
      const ext = question.image.name.split(".")[1];
      filename = `${uid}.${ext}`;

      imageURL = await firebase
        .questionImage(filename)
        .put(question.image)
        .then((snapshot) => snapshot.ref.getDownloadURL());
    }

    await newQuestionRef
      .set({ ...question, image: imageURL, imageName: filename })
      .catch((err) => {
        console.error(err);
        setError(err);
      });

    setShowModal(false);
    setShowToast(true);
  };

  const updateQuestion = async (question) => {
    const uid = question.id;
    delete question.id;
    delete question.imagePreview;

    const originalQuestion = questionList.find((q) => q.id === uid);
    let imageURL = originalQuestion.image;
    let filename = originalQuestion.imageName;

    if (question.image !== "") {
      if (filename !== "" && filename !== undefined)
        await firebase.questionImage(filename).delete();

      const ext = question.image.name.split(".")[1];
      filename = `${uid}.${ext}`;

      imageURL = await firebase
        .questionImage(filename)
        .put(question.image)
        .then((snapshot) => snapshot.ref.getDownloadURL());
    }

    await firebase
      .question(uid)
      .update({ ...question, image: imageURL, imageName: filename })
      .catch((err) => {
        console.error(err);
        setError(err);
      });

    setShowToast(true);
  };

  const removeQuestionImage = async (uid, filename) => {
    await firebase.questionImage(filename).delete();

    await firebase
      .question(uid)
      .update({ image: "", imageName: "" })
      .catch((err) => {
        console.error(err);
        setError(err);
      });

    setShowToast(true);
  };

  const deleteQuestion = (uid, filename) =>
    swal({
      title: "Are you sure?",
      text:
        "Once you delete a question, you can't undo! Make sure you really want this!",
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
        if (filename !== "") await firebase.questionImage(filename).delete();

        await firebase.question(uid).delete();

        const levelConfig = await firebase
          .levelConfig()
          .get()
          .then((doc) => {
            if (!doc.exists) {
              throw new Error("LevelConfig does not exist!");
            }
            return doc.data();
          });

        const updatedLevelConfig = objectMap(levelConfig, (questions) => {
          let order = 0;
          const updatedQuestions = questions
            .filter((question) => question.id !== uid)
            .map((question) => {
              question.order = order++;
              return question;
            });

          return updatedQuestions;
        });

        await firebase.levelConfig().update(updatedLevelConfig);

        setShowToast(true);
      }
    });

  if (error) return <Error error={error} />;
  if (loading) return <Loader />;

  return (
    <AdminLayout>
      <BackIcon />
      <Title>
        <h1> Interview Questions </h1>
      </Title>
      <Text>
        <Row style={{ width: "100%" }}>
          <Col>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <StyledButton
                onClick={() => setShowModal(true)}
                style={{ height: "fit-content" }}
              >
                Add Question
              </StyledButton>
            </div>
            <br />
            <Row>
              {questionList
                .sort((a, b) => (a.name > b.name ? 1 : -1))
                .map((question) => (
                  <QuestionDisplay
                    key={question.id}
                    updateQuestion={updateQuestion}
                    removeQuestionImage={removeQuestionImage}
                    deleteQuestion={deleteQuestion}
                    {...question}
                  />
                ))}
            </Row>
          </Col>
        </Row>
      </Text>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Question</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <QuestionForm
            initialFormData={{
              name: "",
              answer: "",
              description: "",
              image: "",
              imagePreview: "",
              scores: {},
            }}
            submitFunction={addQuestion}
            SubmitButton={() => (
              <StyledButton type="submit">Submit</StyledButton>
            )}
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

export default withFirebase(ManageQuestions);
