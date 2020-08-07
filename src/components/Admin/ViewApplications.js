import React, { useState, useEffect, Fragment } from "react";
import styled from "styled-components";
import { compose } from "recompose";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { withFirebase, withAuthorization } from "upe-react-components";

import { isRecruitmentTeam, isAdmin } from "../../util/conditions";
import AdminLayout from "./AdminLayout";
import Loader from "../Loader";

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

    const renderResponse = (response) => {
      let responseComponent;
      if (response.type === "file") {
        responseComponent = (
          <embed
            src={response.value}
            width="100%"
            height="500"
            type="application/pdf"
            title={response.name}
          />
        );
      } else {
        responseComponent = <p>{response.value}</p>;
      }

      return (
        <Fragment key={response.id}>
          <h3>{response.name}</h3>
          {responseComponent}
        </Fragment>
      );
    };

    return (
      <Fragment>
        {currentApplication.responses
          .sort((a, b) => (a.order > b.order ? 1 : -1))
          .map((response) => renderResponse(response))}
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
  withAuthorization(
    (authUser) => isRecruitmentTeam(authUser) || isAdmin(authUser)
  ),
  withFirebase
)(ViewApplications);
