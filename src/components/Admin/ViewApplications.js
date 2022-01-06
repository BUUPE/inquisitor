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
import { BackIcon } from "../TextDisplay";

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
    width: 4%;
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

const ApplicationList = styled.ul`
  font-family: Georgia;
  border: 1px solid black;
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
    if (!currentApplication) return <h3> Please select an application! </h3>;

    const renderResponse = (response) => {
      let Content = () => (
        <p>{response.value !== "" ? response.value : "N/A"}</p>
      );
      const style = {
        flexGrow: 1,
        paddingLeft: "3%",
      };

      // eslint-disable-next-line default-case
      switch (response.type) {
        case "file":
          style.width = "100%";
          Content = () => (
            <embed
              src={response.value}
              width="100%"
              height="500"
              type="application/pdf"
              title={response.name}
              style={{ marginBottom: "2%" }}
            />
          );
          break;
        case "textarea":
          style.width = "100%";
          break;
        case "yesno":
          Content = () => <p>{response.value ? "Yes" : "No"}</p>;
          break;
      }

      return (
        <div key={response.id} style={style}>
          <h3>{response.name}</h3>
          <Content />
        </div>
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
      <BackIcon />
      <Title>
        <h1> View Applications </h1>
      </Title>
      <Text>
        <Row style={{ height: "100%" }}>
          <Col style={{ flexGrow: 0, flexBasis: 200 }}>
            <ApplicationList>
              {applications
                .sort((a, b) =>
                  getApplicantName(a) > getApplicantName(b) ? 1 : -1
                )
                .map((application) => (
                  <ApplicationListItem
                    key={application.id}
                    data={application}
                  />
                ))}
            </ApplicationList>
          </Col>
          <Col>
            <Row>
              <CurrentApplication />
            </Row>
          </Col>
        </Row>
      </Text>
    </AdminLayout>
  );
};

export default compose(
  withAuthorization(
    (authUser) => isRecruitmentTeam(authUser) || isAdmin(authUser)
  ),
  withFirebase
)(ViewApplications);
