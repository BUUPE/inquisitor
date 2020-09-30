import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background: white;
  z-index: 10;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: ${(props) => props.opacity};
`;

const Spinner = styled.div`
  display: inline-block;
  width: 64px;
  height: 64px;

  @keyframes lds-dual-ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  &:after {
    content: " ";
    display: block;
    width: 46px;
    height: 46px;
    margin: 1px;
    border-radius: 50%;
    border: 5px solid #333;
    border-color: #333 transparent #333 transparent;
    animation: lds-dual-ring 1.2s linear infinite;
  }
`;

const Loader = ({ opacity }) => (
  <Wrapper opacity={opacity}>
    <Spinner />
  </Wrapper>
);

Loader.propTypes = {
  opacity: PropTypes.number,
};

Loader.defaultProps = {
  opacity: 1,
};

export default Loader;
