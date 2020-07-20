import React, { useState } from "react";
import { navigate } from "gatsby";
//import firebase from "gatsby-plugin-firebase";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import Layout from "../components/Layout";
import SEO from "../components/SEO";

import { withFirebase } from "../components/Firebase";

const LoginPageBase = ({ firebase }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(() => navigate("/"))
      .catch((error) => console.error(error));
  };

  return (
    <React.Fragment>
      <h1>Login</h1>

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </React.Fragment>
  );
};

const LoginPage = withFirebase(LoginPageBase);

export default () => (
  <Layout>
    <SEO title="Login" route="/login" />
    <LoginPage />
  </Layout>
);
