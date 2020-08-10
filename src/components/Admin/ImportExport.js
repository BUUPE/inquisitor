import React, { useState } from "react";
import { compose } from "recompose";
import styled from "styled-components";

import BootstrapButton from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";

import { withFirebase, withAuthorization } from "upe-react-components";

import { isAdmin } from "../../util/conditions";
import AdminLayout from "./AdminLayout";

const Button = styled(BootstrapButton)`
  display: block;
  margin: 10px 0;
`;

const ImportExport = ({ firebase }) => {
  const [loading, setLoading] = useState(false);

  const downloadObjectAsJson = (exportObj, exportName) => {
    var dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(exportObj, null, 2));
    var downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importFromStorage = () => alert("Not yet implemented!");

  const exportToStorage = async () => {
    setLoading(true);
    const { data } = await firebase.exportInquisitorData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = await firebase
      .backup(new Date().toDateString())
      .put(blob)
      .then((snapshot) => snapshot.ref.getDownloadURL());
    window.open(url, "_blank");
    setLoading(false);
  };

  const exportToFile = async () => {
    setLoading(true);
    const { data } = await firebase.exportInquisitorData();
    downloadObjectAsJson(
      data,
      `inquisitor-export-${new Date().toDateString()}`
    );
    setLoading(false);
  };

  const importFromFile = () => alert("Not yet implemented!");

  return (
    <AdminLayout>
      <h1>Import/Export Inquisitor Data</h1>
      <Col>
        <Button disabled={loading} onClick={importFromStorage}>
          Import from Cloud Storage
        </Button>
        <Button disabled={loading} onClick={exportToStorage}>
          Export to Cloud Storage
        </Button>
        <hr />
        <Button disabled={loading} onClick={importFromFile}>
          Import from File
        </Button>
        <Button disabled={loading} onClick={exportToFile}>
          Export to File
        </Button>
        <hr />
        <Button disabled variant="danger">
          Delete Inquisitor Data
        </Button>
      </Col>
    </AdminLayout>
  );
};

export default compose(withAuthorization(isAdmin), withFirebase)(ImportExport);
