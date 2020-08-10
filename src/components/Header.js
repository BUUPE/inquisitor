import React, { useContext } from "react";
import styled from "styled-components";
import { Link, navigate } from "gatsby";
import Button from "react-bootstrap/Button";

import { AuthUserContext, withFirebase } from "upe-react-components";

const Navbar = styled.nav`
  width: 100%;
  height: 60px;
  background: #333333;
  border-top: 3px solid ${(props) => props.theme.palette.mainBrand};
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px;

  a.home {
    margin-right: auto;
  }

  & > * {
    margin-left: 5px;
    margin-right: 5px;
  }
`;

const Header = ({ firebase }) => {
  const authUser = useContext(AuthUserContext);

  return (
    <Navbar>
      <Link to="/" className="home">
        <Button>Home</Button>
      </Link>

      <Link to="/apply">
        <Button>Apply</Button>
      </Link>
      <Link to="/timeslots">
        <Button>Timeslots</Button>
      </Link>
      <Link to="/admin">
        <Button>Admin</Button>
      </Link>

      {!authUser && (
        <Link to="/login">
          <Button>Login</Button>
        </Link>
      )}
      {authUser && <Button onClick={() => navigate("/logout")}>Logout</Button>}
    </Navbar>
  );
};

export default withFirebase(Header);
