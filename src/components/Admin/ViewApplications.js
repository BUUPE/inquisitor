import React, { useState, useEffect, Fragment } from "react";
import styled from "styled-components";
import { compose } from "recompose";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { withFirebase, withAuthorization } from "upe-react-components";

import { isRecruitmentTeam, isAdmin } from "../../util/conditions";
import AdminLayout from "./AdminLayout";
import Loader from "../Loader";
import Error from "../Error";

const ApplicationList = styled.ul`
  border: 1px solid black;
  height: 100%;
`;

const StyledLi = styled.li`
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ViewApplications = ({ firebase }) => {
  const [applications, setApplications] = useState([]);
  const [currentApplication, setCurrentApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (firebase) {
      firebase
        .applications()
        .get()
        .then((snapshot) => {
          setApplications(
            snapshot.docs.map((doc) => {
              return { id: doc.id, ...doc.data() };
            })
          );
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setError("Failed to load applications!");
        });
    }
  }, [firebase]);

  if (error) return <Error error={error} />;
  if (loading) return <Loader />;

  const ApplicationListItem = ({ data }) => (
    <StyledLi onClick={() => setCurrentApplication(data)}>
      {data.responses.find((r) => r.id === 1).value}
    </StyledLi>
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
        responseComponent = <p>{response.value.toString()}</p>;
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

  const getApplicantName = (application) =>
    application.responses.find((r) => r.id === 1).value;

  return (
    <AdminLayout>
      <Row style={{ height: "100%" }}>
        <Col style={{ flexGrow: 0, flexBasis: 200 }}>
          <ApplicationList>
            {applications
              .sort((a, b) =>
                getApplicantName(a) > getApplicantName(b) ? 1 : -1
              )
              .map((application) => (
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
