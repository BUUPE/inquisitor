import styled, { createGlobalStyle } from "styled-components";
import BootstrapContainer from "react-bootstrap/Container";

export const Container = styled(BootstrapContainer)`
  margin-top: 25px;
  margin-bottom: 25px;
  display: flex;
  flex: 1 0 auto;
  flex-direction: ${(props) => props.flexdirection};
`;

export const Centered = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

export const FlexDiv = styled.div`
  display: flex;
`;

export default createGlobalStyle`
  /* BOOTSTRAP OVERRIDES */

  input.form-control[type="checkbox"] {
    width: 16px;
  }

  .modal-content {
    background-color: ${(props) => props.theme.global.bg};

    button.close {
      color: ${(props) => props.theme.global.color};
    }
  }

  /*
  .btn.btn-primary {
    background-color: ${(props) => props.theme.palette.mainBrand};
    border-color: ${(props) => props.theme.palette.mainBrand};
  }
  */

  /* CUSTOM STYLES */

  #gatsby-focus-wrapper {
    display: flex;
    flex-direction: column;
  }

  html, body, #___gatsby, #gatsby-focus-wrapper {
    height: 100%;
  }

  body {
    background-color: ${(props) => props.theme.global.bg};
    color: ${(props) => props.theme.global.color};
    transition: background 0.2s ease-out;
  }

  .text-muted {
    color: ${(props) => props.theme.global.muted} !important;
  }

  /*
  a {
    color: ${(props) => props.theme.global.link};
  }

  a:hover {
    color: ${(props) => props.theme.global.linkHover};
  }
  */

  .swal-icon.swal-icon--custom {
    width: 250px;
    margin: 0 auto;
  }

  .swal-button.swal-button--confirm:hover {
    animation: wiggle 0.5s infinite;
  }

  .hvr-underline-from-center {
    display: inline-block;
    vertical-align: middle;
    -webkit-transform: perspective(1px) translateZ(0);
    transform: perspective(1px) translateZ(0);
    box-shadow: 0 0 1px rgba(0, 0, 0, 0);
    position: relative;
    overflow: hidden;
  }

  .hvr-underline-from-center:before {
    content: "";
    position: absolute;
    z-index: -1;
    left: 51%;
    right: 51%;
    bottom: 0;
    background: white;
    height: 4px;
    -webkit-transition-property: left, right;
    transition-property: left, right;
    -webkit-transition-duration: 0.3s;
    transition-duration: 0.3s;
    -webkit-transition-timing-function: ease-out;
    transition-timing-function: ease-out;
  }

  .hvr-underline-from-center:hover:before, .hvr-underline-from-center:focus:before, .hvr-underline-from-center:active:before, .hvr-underline-from-center[aria-current="page"]:before {
    left: 0;
    right: 0;
  }
`;
