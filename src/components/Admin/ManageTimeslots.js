import React, { useEffect, useState } from "react";
import { compose } from "recompose";

import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { withFirebase, withAuthorization } from "upe-react-components";

import { isAdmin } from "../../util/conditions";
import AdminLayout from "./AdminLayout";
import Loader from "../Loader";

const ManageTimeslots = ({ firebase }) => {
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
      <h1>Manage Timeslots</h1>
    </AdminLayout>
  );
};

export default compose(
  withAuthorization(isAdmin),
  withFirebase
)(ManageTimeslots);
