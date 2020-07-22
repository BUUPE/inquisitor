import React from "react";
import { Link } from "gatsby"
import Nav from "react-bootstrap/Nav";
import Col from "react-bootstrap/Col";
import {Container} from "../styles/global";

const Sidebar = () => (
  <Nav defaultActiveKey="link-2" className="flex-column">
    <Nav.Item eventKey="link-1">
      <Link to="/admin">General Settings</Link>
    </Nav.Item>
    <Nav.Item eventKey="link-2">
      <Link to="/admin/configure-application">Configure Application</Link>
    </Nav.Item>
  </Nav>
);

const AdminLayout = ({children}) => (
  <Container fluid flexDirection="row">
    <Sidebar />
    <Col>
      {children}
    </Col>
  </Container>
);

export default AdminLayout;
