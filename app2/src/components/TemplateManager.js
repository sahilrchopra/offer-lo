import React, { useState, useEffect } from "react";
import {
  Card,
  ListGroup,
  Form,
  Button,
  Spinner,
  Badge,
  InputGroup,
} from "react-bootstrap";
import api from "../api";
import { toast } from "react-toastify";

function TemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setFetching(true);
    try {
      const { data } = await api.get("/templates");
      setTemplates(data);
    } catch {
      toast.error("Unable to load templates");
    } finally {
      setFetching(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing)
        await api.put(`/templates/${editing}`, {
          template_name: name,
          template_body: body,
        });
      else
        await api.post("/templates", {
          template_name: name,
          template_body: body,
        });
      toast.success(editing ? "Template updated" : "Template created");
      setName("");
      setBody("");
      setEditing(null);
      loadTemplates();
    } catch {
      toast.error("Error saving template");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (t) => {
    setEditing(t.template_id);
    setName(t.template_name);
    setBody(t.template_body);
  };

  const cancelEdit = () => {
    setEditing(null);
    setName("");
    setBody("");
  };

  return (
    <Card className="shadow-sm h-100 template-card">
      <Card.Header className="bg-white border-0 pt-3 pb-0">
        <Card.Title className="text-primary">
          <i className="bi bi-file-earmark-text me-2"></i>
          Email Templates
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="template-list mb-4">
          <h6 className="text-uppercase text-muted small fw-bold mb-3">
            Available Templates
          </h6>

          {fetching ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-inbox-fill fs-3 d-block mb-2"></i>
              <p>No templates available. Create your first one!</p>
            </div>
          ) : (
            <ListGroup variant="flush" className="template-list-group">
              {templates.map((t) => (
                <ListGroup.Item
                  key={t.template_id}
                  className="d-flex justify-content-between align-items-center px-0 py-3 border-top-0 border-start-0 border-end-0"
                >
                  <div>
                    <h6 className="mb-0">{t.template_name}</h6>
                    <small className="text-muted">
                      {t.template_body.substring(0, 50)}...
                    </small>
                  </div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onEdit(t)}
                  >
                    <i className="bi bi-pencil-fill me-1"></i> Edit
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>

        <div className="template-form">
          <h6 className="text-uppercase text-muted small fw-bold mb-3">
            {editing ? "Edit Template" : "Create New Template"}
            {editing && (
              <Badge bg="info" className="ms-2">
                Editing #{editing}
              </Badge>
            )}
          </h6>

          <Form onSubmit={onSubmit}>
            <Form.Group controlId="templateName" className="mb-3">
              <Form.Label>Template Name</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-tag"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter template name"
                  required
                />
              </InputGroup>
            </Form.Group>

            <Form.Group controlId="templateBody" className="mb-4">
              <Form.Label>Email Body</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your email content here..."
                required
                className="template-body-textarea"
              />
              <Form.Text className="text-muted">
                Write the email content that will be sent to users.
              </Form.Text>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="px-4"
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : editing ? (
                  <>
                    <i className="bi bi-save me-2"></i>
                    Update
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-lg me-2"></i>
                    Create
                  </>
                )}
              </Button>

              {editing && (
                <Button
                  type="button"
                  variant="light"
                  onClick={cancelEdit}
                  className="px-4"
                >
                  Cancel
                </Button>
              )}
            </div>
          </Form>

          {/* Live preview of template body */}
          <div className="mt-4">
            <h6 className="text-uppercase text-muted small fw-bold mb-2">Preview</h6>
            <div
              style={{
                border: '1px solid #ddd',
                padding: '12px',
                minHeight: '250px',
                overflowY: 'auto',
                backgroundColor: '#fcfcfc',
              }}
              // If body contains HTML tags, render as HTML, else as text
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default TemplateManager;
