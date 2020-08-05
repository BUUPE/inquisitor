import React from "react";
import Layout2 from "../components/Layout2";
import { Container } from "../styles/global";

import { withAuthorization } from "upe-react-components/Session";

const Secret = () => <h1>I am secret</h1>;
const condition = (authUser) => !!authUser;
const Authorized = withAuthorization(condition)(Secret);

export default () => {
  return (
    <Layout2>
      <Container>
        <Authorized />
      </Container>
    </Layout2>
  );
};
