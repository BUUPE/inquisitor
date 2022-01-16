import React, { useState, useEffect, Fragment } from "react";
import styled from "styled-components";
import { compose } from "recompose";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { withFirebase, withAuthorization } from "upe-react-components";

import { isRecruitmentTeam, isAdmin } from "../../util/conditions";
import AdminLayout from "./AdminLayout";
import Loader from "../Loader";
import { BackIcon } from "../TextDisplay";

import { Title, Text } from "../../styles/global";

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

  useEffect(() => {
    if (firebase) {
      firebase
        .applications()
        .get()
        .then((snapshot) => {
          setApplications(
            snapshot.docs.map((doc) => {
              return { uid: doc.uid, ...doc.data() };
            })
          );
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [firebase]);

  if (loading) return <Loader />;

  const ApplicationListItem = ({ data }) => (
    <StyledLi onClick={() => setCurrentApplication(data)}>
      {data.responses.find((r) => r.uid === "name").value}
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
        <div key={response.uid} style={style}>
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
    application.responses.find((r) => r.uid === "name").value;

  return (
    <AdminLayout>
      <BackIcon />
      <Title>
        <h1> View Applications </h1>
      </Title>
      <Text
        paddingTop={"20px"}
        paddingLeft={"7%"}
        paddingRight={"7%"}
        pFontSize={"15px"}
        pTextAlign={"left"}
        pMaxWidth={"100%"}
        position={"left"}
        h2MarginTop={"2%"}
      >
        <Row style={{ height: "100%" }}>
          <Col style={{ flexGrow: 0, flexBasis: 200 }}>
            <ApplicationList>
              {applications
                .sort((a, b) =>
                  getApplicantName(a) > getApplicantName(b) ? 1 : -1
                )
                .map((application) => (
                  <ApplicationListItem
                    key={application.uid}
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
