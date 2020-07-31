import React, { useEffect, useState } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { withFirebase } from "../Firebase";
import AdminLayout from "./AdminLayout";
import Loader from "../Loader";

// TODO: don't allow kerberos roles to be removed
const ALL_ROLES = ["admin", "eboard", "recruitmentteam", "applicant"];

const ManageUsers = ({ firebase }) => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const handleShow = () => setShowModal(true);
  const handleClose = () => {
    setShowModal(false);
    setCurrentUser(null);
  };
  const updateUser = async () => {
    const updateUser = { ...currentUser };
    delete updateUser.uid;
    await firebase
      .user(currentUser.uid)
      .update(updateUser)
      .catch(console.error);
    loadUsers();
    handleClose();
  };

  const loadUsers = () => {
    if (firebase)
      firebase
        .users()
        .get()
        .then((snapshot) => {
          setUsers(
            snapshot.docs.map((doc) => {
              return {
                ...doc.data(),
                uid: doc.ref.path.split("/")[1],
              };
            })
          );
          setLoading(false);
        })
        .catch(console.error);
  };

  useEffect(loadUsers, [firebase]);

  if (loading) return <Loader />;

  const renderRow = (user, i) => {
    const roles = user.roles ? Object.keys(user.roles) : [];
    return (
      <tr
        key={user.uid}
        style={{ cursor: "pointer" }}
        onClick={() => {
          if (!user.roles) user.roles = {};
          setCurrentUser(user);
          handleShow();
        }}
      >
        <td>{user.name}</td>
        <td>{user.email}</td>
        <td>{roles && roles.join(", ")}</td>
      </tr>
    );
  };

  const DroppableColumn = ({ children, userOwned }) => {
    const [{ isOver }, drop] = useDrop({
      accept: "role",
      drop: (item) => {
        if (item.userOwned !== userOwned) {
          let { roles } = currentUser;
          if (item.userOwned) delete roles[item.role];
          else roles[item.role] = true;

          setCurrentUser({
            ...currentUser,
            roles,
          });
        }
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    });

    const props = {
      ref: drop,
      style: {
        display: "flex",
        flexDirection: "column",
        border: `${isOver ? "2px solid red" : "none"}`,
      },
    };
    return <Col {...props}>{children}</Col>;
  };

  const DraggableRole = ({ role, userOwned }) => {
    const [, dragRef] = useDrag({
      item: {
        type: "role",
        role,
        userOwned,
      },
    });

    return (
      <Button style={{ marginTop: 5, marginBottom: 5 }} ref={dragRef}>
        {role}
      </Button>
    );
  };

  return (
    <AdminLayout>
      <h1>Manage Users</h1>
      <Table bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Roles</th>
          </tr>
        </thead>
        <tbody>
          {users.sort((a, b) => (a.name > b.name ? 1 : -1)).map(renderRow)}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        {currentUser && (
          <Modal.Body>
            <strong>Name</strong>: {currentUser.name} <br />
            <strong>Email</strong>: {currentUser.email} <br />
            <DndProvider backend={HTML5Backend}>
              <Row>
                <Col>
                  <strong>All Roles</strong>
                </Col>
                <Col>
                  <strong>User Roles</strong>
                </Col>
              </Row>
              <Row>
                <DroppableColumn userOwned={false}>
                  {ALL_ROLES.filter(
                    (role) => !Object.keys(currentUser.roles).includes(role)
                  ).map((role) => (
                    <DraggableRole userOwned={false} role={role} key={role} />
                  ))}
                </DroppableColumn>
                <DroppableColumn userOwned={true}>
                  {Object.keys(currentUser.roles).map((role) => (
                    <DraggableRole userOwned={true} role={role} key={role} />
                  ))}
                </DroppableColumn>
              </Row>
            </DndProvider>
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={updateUser}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default withFirebase(ManageUsers);
