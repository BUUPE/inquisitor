import styled, { createGlobalStyle } from "styled-components";
import BootstrapContainer from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

export const Wrapper = styled.div`
  padding-right: ${(props) =>
    !!props.paddingRight ? props.paddingRight : "7%"};
  padding-left: ${(props) => (!!props.paddingLeft ? props.paddingLeft : "7%")};
  padding-top: ${(props) => (!!props.paddingTop ? props.paddingTop : "3%")};
  padding-bottom: ${(props) =>
    !!props.paddingBottom ? props.paddingBottom : "3%"};
  font-family: Georgia;
`;

export const StyledButton = styled(Button)`
  text-decoration: none;
  color: #ffffff;
  background-color: ${(props) => (props.green ? "#008000" : "#f21131")};
  border: none;
  font-size: ${(props) => (!!props.fontSize ? props.fontSize : "25px")};
  font-weight: bold;
  padding-right: ${(props) =>
    !!props.paddingRight ? props.paddingRight : "25%"};
  padding-left: ${(props) => (!!props.paddingLeft ? props.paddingLeft : "25%")};
  padding-top: ${(props) => (!!props.paddingTop ? props.paddingTop : "3%")};
  padding-bottom: ${(props) =>
    !!props.paddingBottom ? props.paddingBottom : "3%"};
  &:focus,
  &:active,
  &:visited,
  &:disabled {
    text-decoration: none;
    color: #ffffff;
    background-color: ${(props) => (props.green ? "#7FBF7F" : "#f88898")};
    border: none;
  }
  &:hover {
    text-decoration: none;
    color: #ffffff;
    background-color: ${(props) => (props.green ? "#004C00" : "#600613")};
    border: none;
  }
`;

export const Title = styled.div`
  padding-left: ${(props) => (!!props.paddingLeft ? props.paddingLeft : "5%")};
  h1 {
    font-family: Georgia;
    font-size: ${(props) => (!!props.fontSize ? props.fontSize : "50px")};
    font-style: italic;
  }
  h1:after {
    content: "";
    display: block;
    width: ${(props) => (!!props.lineWidth ? props.lineWidth : "4%")};
    padding-top: 3px;
    border-bottom: 2px solid #f21131;
  }
`;

export const Text = styled.div`
  font-family: Georgia;
  width: ${(props) => (!!props.contentWidth ? props.contentWidth : "100%")};
  padding-top: ${(props) => (!!props.paddingTop ? props.paddingTop : "80px")};
  padding-bottom: ${(props) =>
    !!props.paddingBottom ? props.paddingBottom : "100px"};
  padding-left: ${(props) => (!!props.paddingLeft ? props.paddingLeft : "0")};
  padding-right: ${(props) =>
    !!props.paddingRight ? props.paddingRight : "0"};
  display: flex;
  justify-content: ${(props) => (!!props.position ? props.position : "center")};
  align-items: ${(props) => (!!props.position ? props.position : "center")};
  flex-direction: column;
  h2 {
    font-weight: bold;
    font-size: 35px;
    border-bottom: 2px solid #f21131;
    margin-bottom: ${(props) =>
      !!props.h2MarginBottom ? props.h2MarginBottom : "2%"};
    margin-top: ${(props) => (!!props.h2MarginTop ? props.h2MarginTop : "0%")};
    font-style: italic;
  }
  h3 {
    font-weight: bold;
    font-size: 30px;
    padding-bottom: 2%;
    color: #f21131;
    font-style: italic;
  }
  h4 {
    font-weight: bold;
    font-size: 25px;
    padding-bottom: 1.5%;
    font-style: italic;
  }
  h5 {
    font-weight: bold;
    font-size: 20px;
    padding-bottom: 1.5%;
  }
  h5:after {
    content: "";
    display: block;
    width: ${(props) => (!!props.h5LineWidth ? props.h5LineWidth : "4%")};
    padding-top: 3px;
    border-bottom: 2px solid #f21131;
  }
  p {
    font-weight: bold;
    font-size: ${(props) => (!!props.pFontSize ? props.pFontSize : "35px")};
    padding-bottom: 1%;
    max-width: ${(props) => (!!props.pMaxWidth ? props.pMaxWidth : "50%")};
    text-align: ${(props) =>
      !!props.pTextAlign ? props.pTextAlign : "center"};
  }
`;

export const RequiredAsterisk = styled.span`
  color: red;

  &:after {
    content: "*";
  }
`;

export const Container = styled(BootstrapContainer)`
  margin-top: 25px;
  margin-bottom: 25px;
  display: flex;
  flex: 1 0 auto;
  flex-direction: ${(props) => props.flexdirection};
`;

export const FullSizeContainer = styled(Container)`
  padding-left: 0;
  margin-top: 0;
  margin-bottom: 0;
`;

export const CenteredForm = styled(Form)`
  font-family: Georgia;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 500px;
  margin: 0 auto;
`;

export const FullWidthFormRow = styled(Form.Row)`
  width: 100%;
`;

export const FullWidthFormGroup = styled(Form.Group)`
  width: 100%;
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
    background-color: #ffffff;

    button.close {
      color: #201e20;
    }
  }

  /*
  .btn.btn-primary {
    background-color: #f21131;
    border-color: #f21131;
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
    background-color: #ffffff;
    color: #201e20;
    transition: background 0.2s ease-out;
  }

  .text-muted {
    color: #6c757d !important;
  }

  /*
  a {
    color: #f21131;
  }

  a:hover {
    color: #600613;
  }
  */

  .swal-icon.swal-icon--custom {
    width: 250px;
    margin: 0 auto;
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
    background: #f21131;
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
