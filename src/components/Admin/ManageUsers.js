import React, { useEffect, useState } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
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

const ManageUsers = ({ firebase }) => {
  const [allRoles, setAllRoles] = useState({});
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
    const users = await loadUsers();
    setUsers(users);
    handleClose();
  };

  const loadAllRoles = () =>
    new Promise((resolve) => {
      if (firebase)
        resolve(
          firebase
            .allRoles()
            .get()
            .then((snapshot) => snapshot.data())
        );
    });

  const loadUsers = () =>
    new Promise((resolve) => {
      if (firebase)
        resolve(
          firebase
            .users()
            .get()
            .then((snapshot) => {
              return snapshot.docs.map((doc) => {
                return {
                  ...doc.data(),
                  uid: doc.ref.path.split("/")[1],
                };
              });
            })
        );
    });

  useEffect(() => {
    Promise.all([loadAllRoles(), loadUsers()])
      .then((values) => {
        setAllRoles(values[0]);
        setUsers(values[1]);
        setLoading(false);
      })
      .catch(console.error);
  }, [firebase]);

  if (loading) return <Loader />;

  const renderRow = (user, i) => {
    const roles = user.roles ? Object.entries(user.roles) : [];
    return (
      <tr
        key={user.uid}
        style={{ cursor: "pointer" }}
        onClick={() => {
          if (!user.roles) user.roles = {};
          setCurrentUser(JSON.parse(JSON.stringify(user)));
          handleShow();
        }}
      >
        <td>{user.name}</td>
        <td>{user.email}</td>
        <td>
          {roles
            .map((role) => role[0])
            .sort()
            .join(", ")}
        </td>
      </tr>
    );
  };

  const DroppableColumn = ({ children, userOwned }) => {
    const [{ isOver }, drop] = useDrop({
      accept: "role",
      drop: (item) => {
        if (item.userOwned !== userOwned) {
          let { roles } = currentUser;
          if (item.userOwned) delete roles[item.role[0]];
          else roles[item.role[0]] = item.role[1];
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

    const props = {
      style: {
        marginTop: 5,
        marginBottom: 5,
        backgroundColor: role[1] === "kerberos" && "grey",
      },
    };
    if (role[1] !== "kerberos") props.ref = dragRef;

    return <Button {...props}>{role[0]}</Button>;
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
          {users
            .sort((a, b) => {
              if (a.name === b.name) return a.uid > b.uid ? 1 : -1;
              else return a.name > b.name ? 1 : -1;
            })
            .map(renderRow)}
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
                  {Object.entries(allRoles)
                    .filter(
                      (role) =>
                        !Object.keys(currentUser.roles).includes(role[0])
                    )
                    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
                    .map((role) => (
                      <DraggableRole userOwned={false} role={role} key={role} />
                    ))}
                </DroppableColumn>
                <DroppableColumn userOwned={true}>
                  {Object.entries(currentUser.roles)
                    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
                    .map((role) => (
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

export default compose(withAuthorization(isAdmin), withFirebase)(ManageUsers);
