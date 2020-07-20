import React, { useContext } from "react";
import styled from "styled-components";
import { Link, navigate } from "gatsby";
import Button from "react-bootstrap/Button";

import { AuthUserContext } from "./Session";

import { withFirebase } from "./Firebase";

const Navbar = styled.nav`
  width: 100%;
  height: 60px;
  background: #333333;
  border-top: 3px solid #f21131;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px;

  a.home {
    margin-right: auto;
  }
`;

const Header = ({ firebase }) => {
  const handleSignOut = () =>
    firebase
      .doSignOut()
      .then(() => navigate("/"))
      .catch(console.error);
  const authUser = useContext(AuthUserContext);

  return (
    <Navbar>
      <Link to="/" className="home">
        <Button>Home</Button>
      </Link>
      {!authUser && (
        <Link to="/login">
          <Button>Login</Button>
        </Link>
      )}
      {authUser && <Button onClick={handleSignOut}>Logout</Button>}
    </Navbar>
  );
};

export default withFirebase(Header);
