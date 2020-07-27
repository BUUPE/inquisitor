import React, { useState, useEffect, Fragment } from "react";
import { compose } from "recompose";
import styled from "styled-components";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { withAuthorization, isAdmin } from "../components/Session";
import { withFirebase } from "../components/Firebase";
import AdminLayout from "./AdminLayout";
import Loader from "./Loader";

const ApplicationList = styled.ul`
  border: 1px solid black;
  height: 100%;
`;

const ViewApplications = ({ firebase }) => {
  const [applicationFormConfig, setApplicationFormConfig] = useState(null);
  const [applications, setApplications] = useState([]);
  const [currentApplication, setCurrentApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (firebase) {
      const loadApplicationFormConfig = firebase
        .applicationFormConfig()
        .get()
        .then((snapshot) => setApplicationFormConfig(snapshot.data()))
        .catch(() => {
          setError("Application Form Config doesn't exist!");
          setLoading(false);
        });
      const loadApplicationList = firebase
        .applications()
        .get()
        .then((snapshot) =>
          setApplications(
            snapshot.docs.map((doc) => {
              return { id: doc.id, ...doc.data() };
            })
          )
        );

      Promise.all([loadApplicationFormConfig, loadApplicationList]).then(() =>
        setLoading(false)
      );
    }
  }, [firebase]);

  if (loading) return <Loader />;
  if (error) return <h1>{error}</h1>;

  const ApplicationListItem = ({ data }) => (
    <li onClick={() => setCurrentApplication(data)}>
      {data.responses.find((r) => r.id === 1).value}
    </li>
  );

  const CurrentApplication = () => {
    if (!currentApplication) return <h1>Select an application!</h1>;

    const renderQuestion = (question) => {
      const { value } = currentApplication.responses.find(
        (r) => r.id === question.id
      );
      let questionComponent;
      if (question.type === "file") {
        questionComponent = (
          <embed
            src={value}
            width="100%"
            height="500"
            type="application/pdf"
            title={question.name}
          />
        );
      } else {
        questionComponent = <p>{value}</p>;
      }

      return (
        <Fragment key={question.id}>
          <h3>{question.name}</h3>
          {questionComponent}
        </Fragment>
      );
    };

    return (
      <Fragment>
        {applicationFormConfig.questions
          .sort((a, b) => (a.order > b.order ? 1 : -1))
          .map((question) => renderQuestion(question))}
      </Fragment>
    );
  };

  return (
    <AdminLayout>
      <Row style={{ height: "100%" }}>
        <Col style={{ flexGrow: 0, flexBasis: 200 }}>
          <ApplicationList>
            {applications.map((application) => (
              <ApplicationListItem key={application.id} data={application} />
            ))}
          </ApplicationList>
        </Col>
        <Col>
          <CurrentApplication />
        </Col>
      </Row>
    </AdminLayout>
  );
};

export default compose(
  withAuthorization(isAdmin),
  withFirebase
)(ViewApplications);
