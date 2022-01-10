import React from "react";
import styled from "styled-components";

import Card from "react-bootstrap/Card";

import { StyledButton } from "../../styles/global";

const StyledCard = styled(Card)`
  text-align: center;
  position: relative;
  overflow: hidden;
  max-width: 19rem;
  margin: 10px;
  text-align: center;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 10px 29px 0 rgba(68, 88, 144, 0.1);
  margin: 0 15px 50px 15px;
  &:hover {
    -webkit-transform: translateY(-5px);
    transform: translateY(-5px);
  }
`;

const StyledCardTitle = styled(Card.Title)`
  font-family: Georgia;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  h1 {
    color: #f21131;
    font-style: italic;
    padding-top: 5%;
    max-width: 80%;
    text-align: center;
    font-weight: bold;
    font-size: 29px;
  }
`;

const StyledCardText = styled.div`
  font-family: Georgia;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  p {
    padding-bottom: 5%;
    padding-top: 5%;
    max-width: 80%;
    text-align: center;
    font-size: 19px;
  }
`;

const ActionCard = ({ title, text, onclick }) => (
  <StyledCard>
    <Card.Body>
      <StyledCardTitle>
        <h1> {title} </h1>
      </StyledCardTitle>

      <StyledCardText>
        <p> {text} </p>
      </StyledCardText>

      <StyledButton onClick={onclick}>Go!</StyledButton>
    </Card.Body>
  </StyledCard>
);

export default ActionCard;
