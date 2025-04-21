import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  InputGroup,
} from "react-bootstrap";
import Select from "react-select";
import api from "../api";
import { toast } from "react-toastify";

function AssignManager() {
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setFetching(true);
    try {
      const [userRes, templateRes] = await Promise.all([
        api.get("/users"),
        api.get("/templates"),
      ]);
      setUsers(userRes.data);
      setTemplates(templateRes.data);
    } catch {
      toast.error("Unable to load data");
    } finally {
      setFetching(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedTemplate || selectedUsers.length === 0) {
      toast.warn("Select a template and at least one user");
      return;
    }
    setSuccess(false);
    setLoading(true);
    try {
      await api.post("/assign", {
        template_id: selectedTemplate.value,
        user_ids: selectedUsers.map((u) => u.value),
      });
      toast.success("Emails sent successfully");
      setSuccess(true);
      setSelectedUsers([]);
    } catch {
      toast.error("Error sending emails");
    } finally {
      setLoading(false);
    }
  };

  const templateOptions = templates.map((t) => ({
    value: t.template_id,
    label: t.template_name,
  }));
  const userOptions = users.map((u) => ({
    value: u.user_id,
    label: `${u.user_name} (${u.user_email})`,
  }));

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "38px",
      borderColor: "#ced4da",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#86b7fe",
      },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#e9ecef",
    }),
  };

  return (
    <Card className="shadow-sm h-100 assign-card">
      <Card.Header className="bg-white border-0 pt-3 pb-0">
        <Card.Title className="text-primary">
          <i className="bi bi-envelope-paper me-2"></i>
          Assign & Send Emails
        </Card.Title>
      </Card.Header>
      <Card.Body>
        {fetching ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <Form>
            <div className="mb-4">
              <h6 className="text-uppercase text-muted small fw-bold mb-3">
                Template Selection
              </h6>
              <Form.Group controlId="templateSelect" className="mb-4">
                <Form.Label>Email Template</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-file-text"></i>
                  </InputGroup.Text>
                  <div className="form-control p-0 bg-transparent">
                    <Select
                      options={templateOptions}
                      value={selectedTemplate}
                      onChange={setSelectedTemplate}
                      placeholder="Choose a template"
                      isSearchable
                      styles={customSelectStyles}
                      className="select-override"
                      isDisabled={loading}
                    />
                  </div>
                </InputGroup>
                <Form.Text className="text-muted">
                  Select an email template you wish to send
                </Form.Text>
              </Form.Group>
            </div>

            <div className="mb-4">
              <h6 className="text-uppercase text-muted small fw-bold mb-3">
                Recipients
              </h6>
              <Form.Group controlId="userSelect" className="mb-3">
                <Form.Label>Select Users</Form.Label>
                <Select
                  isMulti
                  options={userOptions}
                  value={selectedUsers}
                  onChange={setSelectedUsers}
                  placeholder="Select users to email"
                  isSearchable
                  styles={customSelectStyles}
                  className="mb-3"
                  isDisabled={loading}
                />
                <div className="d-flex justify-content-between align-items-center mt-1">
                  <Form.Text className="text-muted">
                    Selected {selectedUsers.length} of {users.length} users
                  </Form.Text>
                  {selectedUsers.length > 0 && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setSelectedUsers([])}
                      className="p-0 text-decoration-none"
                      disabled={loading}
                    >
                      Clear selection
                    </Button>
                  )}
                </div>
              </Form.Group>
            </div>

            {success && (
              <Alert
                variant="success"
                className="d-flex align-items-center mb-4"
                onClose={() => setSuccess(false)}
                dismissible
              >
                <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                <div>Emails successfully sent!</div>
              </Alert>
            )}

            <Button
              variant="primary"
              onClick={handleAssign}
              disabled={
                loading || !selectedTemplate || selectedUsers.length === 0
              }
              className="w-100 py-2"
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Sending Emails...
                </>
              ) : (
                <>
                  <i className="bi bi-send-fill me-2"></i>
                  Send Emails ({selectedUsers.length} recipients)
                </>
              )}
            </Button>
          </Form>
        )}
      </Card.Body>
    </Card>
  );
}

export default AssignManager;
