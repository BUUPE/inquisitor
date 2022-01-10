import React from "react";
import styled from "styled-components";

import Background from "../images/main-background.png";

const MastHead = styled.div`
  margin-bottom: 60px;
  background: no-repeat center center;
  background-color: #868e96;
  background-attachment: scroll;
  position: relative;
  background-size: cover;
  background-image: url(${Background});
  padding: 325px 0 325px;
`;

const Header = () => <MastHead />;

export default Header;
