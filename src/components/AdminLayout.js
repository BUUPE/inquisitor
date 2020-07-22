import React from "react";
import { Link } from "gatsby";
import Nav from "react-bootstrap/Nav";
import Col from "react-bootstrap/Col";
import { Container } from "../styles/global";

const Sidebar = () => (
  <Nav className="flex-column">
    <Link to="/admin">General Settings</Link>
    <Link to="/admin/configure-application">Configure Application</Link>
  </Nav>
);

const AdminLayout = ({ children }) => (
  <Container fluid flexdirection="row">
    <Sidebar />
    <Col>{children}</Col>
  </Container>
);

export default AdminLayout;
