import React, { useState, useEffect } from "react";
import swal from "@sweetalert/with-react";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Modal from "react-bootstrap/Modal";

import AdminLayout from "./AdminLayout";
import QuestionDisplay, { QuestionForm } from "./QuestionDisplay";

import { withFirebase } from "upe-react-components";

import Loader from "../Loader";
import Error from "../Error";
import { Container } from "../../styles/global";

const ManageQuestions = ({ firebase }) => {
  const [questionList, setQuestionList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
        await firebase.questionImage(filename).delete();

        await firebase
          .question(uid)
          .delete()
          .catch((err) => {
            console.error(err);
            setError(err);
          });
      }
    });

  if (error) return <Error error={error} />;
  if (loading) return <Loader />;

  return (
    <AdminLayout>
      <Container>
        <Row>
          <Col>
            <h1> Interview Questions </h1>
            <br />
            <div style={{ textAlign: "right" }}>
              <Button onClick={() => setShowModal(true)}>Add Question</Button>
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
      </Container>

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
            SubmitButton={() => <Button type="submit">Submit</Button>}
          />
        </Modal.Body>
      </Modal>
    </AdminLayout>
  );
};

export default withFirebase(ManageQuestions);
