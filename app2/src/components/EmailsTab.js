import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  ListGroup,
  Form,
  Button,
  Spinner,
  Badge,
  Alert,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import Select from "react-select";
import api from "../api";
import { toast } from "react-toastify";

const EmailsTab = () => {
  const [sentEmails, setSentEmails] = useState([]);
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [lastSentResult, setLastSentResult] = useState(null);
  const [scheduledTime, setScheduledTime] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setFetching(true);
    try {
      const [usersRes, templatesRes, emailHistoryRes] = await Promise.all([
        api.get("/users"),
        api.get("/templates"),
        api.get("/emails/history"),
      ]);

      setUsers(usersRes.data);
      setTemplates(templatesRes.data);
      setSentEmails(emailHistoryRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setFetching(false);
    }
  };

  const handleSendEmails = async (e) => {
    e.preventDefault();
    if (!selectedTemplate || selectedUsers.length === 0) {
      toast.warning("Please select a template and at least one recipient");
      return;
    }

    setLoading(true);
    setLastSentResult(null);

    try {
      const response = await api.post("/assign", {
        template_id: selectedTemplate.value,
        user_ids: selectedUsers.map((user) => user.value),
        scheduled_time: scheduledTime || null,
      });

      if (scheduledTime) {
        toast.success(`Email is scheduled to send at ${new Date(scheduledTime).toLocaleString()}`);
      } else {
        toast.success(`Emails sent: ${response.data.success_count} successful, ${response.data.failed_count} failed`);
      }

      setLastSentResult(response.data);

      const emailHistoryRes = await api.get("/emails/history");
      setSentEmails(emailHistoryRes.data);

      setSelectedUsers([]);
      setScheduledTime(""); 
    } catch (error) {
      console.error("Failed to send emails:", error);
      toast.error(
        "Failed to send emails: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const templateOptions = templates.map((template) => ({
    value: template.template_id,
    label: template.template_name,
  }));

  const userOptions = users.map((user) => ({
    value: user.user_id,
    label: `${user.user_name} (${user.user_email})`,
  }));

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadge = (email) => {
    if (email.failed_count > 0 && email.success_count === 0) {
      return <Badge bg="danger">Failed</Badge>;
    } else if (email.failed_count > 0) {
      return <Badge bg="warning">Partially Sent</Badge>;
    } else {
      return <Badge bg="success">Delivered</Badge>;
    }
  };

  return (
    <Row>
      <Col md={5}>
        <Card className="shadow-sm h-100">
          <Card.Header className="bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Sent Emails</h5>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={loadData}
                disabled={fetching}
              >
                <i className="bi bi-arrow-clockwise me-1"></i> Refresh
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            {fetching ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <ListGroup variant="flush">
                {sentEmails.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-envelope fs-1 mb-2"></i>
                    <p>No emails sent yet</p>
                  </div>
                ) : (
                  sentEmails.map((email) => (
                    <ListGroup.Item
                      key={email.email_id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <h6 className="mb-0">{email.template_name}</h6>
                        <small className="text-muted">
                          Sent: {formatDate(email.sent_at)} • Recipients:{" "}
                          {email.recipients_count}
                        </small>
                      </div>
                      <div className="text-end">
                        <OverlayTrigger
                          placement="left"
                          overlay={
                            <Tooltip>
                              Success: {email.success_count}, Failed:{" "}
                              {email.failed_count}
                            </Tooltip>
                          }
                        >
                          <div>{getStatusBadge(email)}</div>
                        </OverlayTrigger>
                      </div>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            )}
          </Card.Body>
        </Card>
      </Col>

      <Col md={7}>
        <Card className="shadow-sm h-100">
          <Card.Header className="bg-white">
            <h5 className="mb-0">Send Emails</h5>
          </Card.Header>
          <Card.Body>
            {lastSentResult && (
              <Alert
                variant={
                  lastSentResult.failed_count > 0 ? "warning" : "success"
                }
                dismissible
                onClose={() => setLastSentResult(null)}
                className="mb-4"
              >
                <Alert.Heading>Email Send Results</Alert.Heading>
                <p>
                  <strong>Template:</strong> {lastSentResult.template}
                  <br />
                  <strong>Time:</strong> {formatDate(lastSentResult.sent_at)}
                  <br />
                  <strong>Status:</strong> {lastSentResult.success_count}{" "}
                  successful, {lastSentResult.failed_count} failed
                </p>
                {lastSentResult.failed_count > 0 && (
                  <p className="mb-0">
                    Some emails failed to send. Please check server logs for
                    details.
                  </p>
                )}
              </Alert>
            )}

            <Form onSubmit={handleSendEmails}>
              <Form.Group className="mb-4">
                <Form.Label>Email Template</Form.Label>
                <Select
                  options={templateOptions}
                  value={selectedTemplate}
                  onChange={setSelectedTemplate}
                  placeholder="Select a template"
                  isSearchable
                />
                {selectedTemplate && (
                  <div className="mt-3 p-3 bg-light rounded">
                    <h6>Template Preview</h6>
                    <p className="mb-0 small">
                      {templates
                        .find((t) => t.template_id === selectedTemplate.value)
                        ?.template_body.substring(0, 150)}
                      ...
                    </p>
                  </div>
                )}
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Recipients</Form.Label>
                <Select
                  options={userOptions}
                  value={selectedUsers}
                  onChange={setSelectedUsers}
                  placeholder="Select recipients"
                  isMulti
                  isSearchable
                />
                <Form.Text className="text-muted">
                  Selected {selectedUsers.length} of {users.length} users
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-4" controlId="scheduleTime">
                <Form.Label>Schedule Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  Leave empty to send instantly.
                </Form.Text>
              </Form.Group>

              <div className="d-grid">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={
                    loading || !selectedTemplate || selectedUsers.length === 0
                  }
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" /> 
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i> Send Email to{" "}
                      {selectedUsers.length} Recipients
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default EmailsTab;
