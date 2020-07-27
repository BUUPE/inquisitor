import React, { useState, useEffect } from "react";
import { compose } from "recompose";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Toast from "react-bootstrap/Toast";

import { withAuthorization, isAdmin } from "./Session";
import { withFirebase } from "./Firebase";
import AdminLayout from "./AdminLayout";
import Loader from "./Loader";

const DEFAULT_GENERAL_SETTINGS = {
  applicationsOpen: false,
};

const GeneralSettings = ({ firebase }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const doc = await firebase.generalSettings().get();

      if (!doc.exists) {
        await firebase.generalSettings().set(DEFAULT_GENERAL_SETTINGS);
        setSettings(DEFAULT_GENERAL_SETTINGS);
      } else {
        setSettings(doc.data());
      }

      setLoading(false);
    };
    if (firebase) loadSettings();
  }, [firebase]);

  if (loading) return <Loader />;

  const saveSettings = async (e) => {
    e.preventDefault();
    await firebase.generalSettings().set(settings);
    setShowToast(true);
  };

  return (
    <AdminLayout>
      <h1>General Settings</h1>

      <Form onSubmit={saveSettings}>
        <Form.Row>
          <Form.Check
            custom
            checked={settings.applicationsOpen}
            type="switch"
            label={`Applications are ${
              settings.applicationsOpen ? "open" : "closed"
            }`}
            id="applicationsOpen"
            onChange={(e) =>
              setSettings({ ...settings, applicationsOpen: e.target.checked })
            }
          />
        </Form.Row>
        <hr />
        <div
          style={{
            display: "flex",
          }}
        >
          <Button type="submit">Save</Button>
          <Toast
            onClose={() => setShowToast(false)}
            show={showToast}
            delay={3000}
            autohide
            style={{
              width: "fit-content",
              marginLeft: 25,
            }}
          >
            <Toast.Header>
              <strong className="mr-auto">Settings Saved!</strong>
            </Toast.Header>
          </Toast>
        </div>
      </Form>
    </AdminLayout>
  );
};

export default compose(
  withAuthorization(isAdmin),
  withFirebase
)(GeneralSettings);
