import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowCircleLeft } from "@fortawesome/free-solid-svg-icons";
import { navigate } from "gatsby";

const Title = styled.div`
  padding-left: 5%;
  h1 {
    font-family: Georgia;
    font-size: 50px;
    font-style: italic;
  }
  h1:after {
    content: "";
    display: block;
    width: 4%;
    padding-top: 3px;
    border-bottom: 2px solid #f21131;
  }
`;

const Text = styled.div`
  font-family: Georgia;
  width: 100%;
  padding-top: 80px;
  padding-bottom: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  p {
    padding-top: 70px;
    max-width: 50%;
    text-align: center;
    font-weight: bold;
    font-size: 30px;
    padding-bottom: 60px;
  }
`;

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
