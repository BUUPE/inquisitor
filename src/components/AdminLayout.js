import React from "react";
import { Link } from "gatsby";
import styled from "styled-components";
import Nav from "react-bootstrap/Nav";
import Col from "react-bootstrap/Col";
import { Container } from "../styles/global";

const StyledNav = styled(Nav)`
  width: 155px;
  padding: 15px;
`;

const Sidebar = () => (
  <StyledNav className="flex-column">
    <Link to="/admin">General Settings</Link>
    <Link to="/admin/configure-application">Configure Application</Link>
  </StyledNav>
);

const AdminContaienr = styled(Container)`
  padding-left: 0;
  margin-top: 0;
`;

const AdminLayout = ({ children }) => (
  <AdminContaienr fluid flexdirection="row">
    <Sidebar />
    <Col>{children}</Col>
  </AdminContaienr>
);

export default AdminLayout;
