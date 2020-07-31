import React, { useEffect, useState } from "react";
import { compose } from "recompose";

import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { withAuthorization, isAdmin } from "../Session";
import { withFirebase } from "../Firebase";
import AdminLayout from "./AdminLayout";
import Loader from "../Loader";

const ManageRoles = ({ firebase }) => {
  const [allRoles, setAllRoles] = useState({});
  const [loading, setLoading] = useState(true);

  const loadAllRoles = () => {
    if (firebase)
      firebase
        .allRoles()
        .get()
        .then((snapshot) => {
          setAllRoles(snapshot.data());
          setLoading(false);
        })
        .catch(console.error);
  };

  useEffect(loadAllRoles, [firebase]);

  if (loading) return <Loader />;

  return (
    <AdminLayout>
      <h1>Manage Roles</h1>
    </AdminLayout>
  );
};

export default compose(withAuthorization(isAdmin), withFirebase)(ManageRoles);
