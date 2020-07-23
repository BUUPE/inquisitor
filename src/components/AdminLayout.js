import React from "react";
import { Link } from "gatsby";
import styled from "styled-components";
import Nav from "react-bootstrap/Nav";
import Col from "react-bootstrap/Col";
import { Container } from "../styles/global";

const StyledNav = styled(Nav)`
  width: 200px;
  padding: 15px;
  background: ${(props) => props.theme.palette.darkShades};

  a {
    color: white;
    font-weight: bold;
    padding-top: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid grey;
  }

  a[aria-current="page"] {
    color: ${(props) => props.theme.palette.mainBrand};
  }
`;

const Sidebar = () => (
  <StyledNav className="flex-column">
    <Link to="/admin">General Settings</Link>
    <Link to="/admin/configure-application">Configure Application</Link>
  </StyledNav>
);

const AdminContainer = styled(Container)`
  padding-left: 0;
  margin-top: 0;
`;

const AdminLayout = ({ children }) => (
  <AdminContainer fluid flexdirection="row">
    <Sidebar />
    <Col style={{ padding: 25 }}>{children}</Col>
  </AdminContainer>
);

export default AdminLayout;
