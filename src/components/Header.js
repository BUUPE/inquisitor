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
`;

const SiteHeading = styled.div`
  padding: 200px 0 150px;
  height: 650px;
  color: #fff;
  text-align: center;
  justify-content: center;
  & h1 {
    font-size: 50px;
    margin-top: 0;
  }
`;

const Header = () => (
  <MastHead>
    <SiteHeading></SiteHeading>
  </MastHead>
);

export default Header;
