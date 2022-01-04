import React from "react";
import styled from "styled-components";

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

const WelcomeDisplay = ({ name, text }) => (
  <>
    <Title>
      <h1> Welcome {name}! </h1>
    </Title>
    <Text>
      <p> {text} </p>
    </Text>
  </>
);

export default WelcomeDisplay;
