import React from "react";
import { Link } from "gatsby";
import styled from "styled-components";

import Nav from "react-bootstrap/Nav";
import Col from "react-bootstrap/Col";

import { FullSizeContainer } from "../../styles/global";

const StyledNav = styled(Nav)`
  font-family: Georgia;
  max-width: 300px;
  padding: 15px;
  background: #333333;
  margin-left: 1%;
  margin-right: 1%;
  border-radius: 25px;

  a {
    color: white;
    font-weight: bold;
    padding-top: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid grey;
  }

  a:hover {
    color: #f21131;
    text-decoration: underline;
  }

  a[aria-current="page"] {
    color: #f21131;
  }
`;

const Sidebar = () => (
  <StyledNav className="flex-column">
    <Link to="/admin">General Settings</Link>
    <Link to="/admin/configure-application">Configure Application</Link>
    <Link to="/admin/view-applications">View Applications</Link>
    <Link to="/admin/manage-timeslots">Manage Timeslots</Link>
    <Link to="/admin/manage-questions">Manage Questions</Link>
    <Link to="/admin/manage-levels">Manage Levels</Link>
  </StyledNav>
);

const AdminLayout = ({ children }) => (
  <FullSizeContainer fluid flexdirection="row">
    <Sidebar />
    <Col style={{ padding: 25 }}>{children}</Col>
  </FullSizeContainer>
);

export default AdminLayout;
