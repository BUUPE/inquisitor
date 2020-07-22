import React, { useState } from "react";
import { navigate } from "gatsby";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { withFirebase } from "../components/Firebase";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { Container } from "../styles/global";

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
    <Container flexdirection="column">
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
    </Container>
  );
};

const LoginPage = withFirebase(LoginPageBase);

export default () => (
  <Layout>
    <SEO title="Login" route="/login" />
    <LoginPage />
  </Layout>
);
