import React from "react";

import { withAuthorization } from "../components/Session";
import Layout from "../components/Layout";

const AdminPageBase = () => <h1>Hullo Admins (must be logged in)</h1>;

const condition = (authUser) => !!authUser;
const AdminPage = withAuthorization(condition)(AdminPageBase);

export default () => (
  <Layout>
    <AdminPage />
  </Layout>
);
