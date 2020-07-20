import React from "react";
import styled from "styled-components";

const FooterContainer = styled.footer`
  width: 100%;
  height: 60px;
  background: #333333;
  border-bottom: 3px solid #f21131;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 10px;
`;

const Footer = () => (
  <FooterContainer>
    Copyright © BU UPE {new Date().getFullYear()}
  </FooterContainer>
);

export default Footer;
