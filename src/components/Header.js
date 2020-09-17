import React, { useContext } from "react";
import styled from "styled-components";
import { Link as GatsbyLink } from "gatsby";
import BootstrapNavbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";

import { AuthUserContext, withFirebase } from "upe-react-components";
import {
  isNonMember,
  isApplicantOrRecruitmentTeam,
  isAdmin,
} from "../util/conditions";

const Navbar = styled(BootstrapNavbar)`
  background: #333333;
  border-top: 3px solid ${(props) => props.theme.palette.mainBrand};
  color: white;
  padding: 1rem 1rem;
`;

const Link = styled(GatsbyLink)`
  color: white;
  margin: 0 10px;

  &:hover {
    color: white;
    text-decoration: none;
  }
`;

const Header = ({ firebase }) => {
  const authUser = useContext(AuthUserContext);

  return (
    <Navbar expand="lg">
      <Link to="/" className="hvr-underline-from-center">
        <Navbar.Brand style={{ padding: 0, marginRight: 0, color: "white" }}>
          Inquisitor
        </Navbar.Brand>
      </Link>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto" style={{ height: "100%" }}>
          {isNonMember(authUser) && (
            <>
              <Link to="/interest-form" className="hvr-underline-from-center">
                Interest Form
              </Link>
              <Link to="/apply" className="hvr-underline-from-center">
                Apply
              </Link>
            </>
          )}

          {isApplicantOrRecruitmentTeam(authUser) && (
            <Link to="/timeslots" className="hvr-underline-from-center">
              Timeslots
            </Link>
          )}

          {isAdmin(authUser) && (
            <Link to="/admin" className="hvr-underline-from-center">
              Admin
            </Link>
          )}

          {!authUser && (
            <Link to="/login" className="hvr-underline-from-center">
              Login
            </Link>
          )}
          {authUser && (
            <Link to="/logout" className="hvr-underline-from-center">
              Logout
            </Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default withFirebase(Header);
