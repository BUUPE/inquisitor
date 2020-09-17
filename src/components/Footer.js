import React from "react";
import styled from "styled-components";

const FooterContainer = styled.footer`
  width: 100%;
  height: 60px;
  background: #333333;
  border-bottom: 3px solid ${(props) => props.theme.palette.mainBrand};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 10px;
`;

const Link = styled.a`
  color: white;

  &:hover {
    color: white;
    text-decoration: none;
  }
`;

const Footer = () => (
  <FooterContainer>
    Copyright ©&nbsp;
    <Link href="https://upe.bu.edu/" className="hvr-underline-from-center">
      BU UPE
    </Link>
    &nbsp;
    {new Date().getFullYear()}
  </FooterContainer>
);

export default Footer;
