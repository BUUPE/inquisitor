import React from "react";

import AdminLayout from "./AdminLayout";
import {FormExample} from "./GeneralSettings";
import { withAuthorization } from "../components/Session";


const ConfigureApplication = () => (
  <AdminLayout>
    <h1>Configure Application</h1>
    <FormExample />
  </AdminLayout>
);

const condition = (authUser) => !!authUser;
export default withAuthorization(condition)(ConfigureApplication);
