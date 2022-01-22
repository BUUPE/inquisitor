import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowCircleLeft } from "@fortawesome/free-solid-svg-icons";
import { navigate } from "gatsby";
import { Text, Title } from "../styles/global";

const StyledIcon = styled(FontAwesomeIcon)`
  color: #f21131;
  font-size: 50px;
  &:hover {
    color: #600613;
  }
`;

const BackDiv = styled.div`
  padding-left: 3%;
  padding-bottom: 1%;
`;

export const BackIcon = () => (
  <BackDiv>
    <a onClick={() => navigate(-1)}>
      {" "}
      <StyledIcon icon={faArrowCircleLeft} />{" "}
    </a>
  </BackDiv>
);

const TextDisplay = ({ name, text, displayBack }) => (
  <>
    {!!displayBack && <BackIcon />}
    <Title>
      <h1> {name} </h1>
    </Title>
    <Text>
      <p> {text} </p>
    </Text>
  </>
);

export default TextDisplay;
