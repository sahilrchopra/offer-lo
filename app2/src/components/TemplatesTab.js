import React, { useState, useEffect } from "react";
import { Row, Col, Card, ListGroup, Form, Button, Spinner, Modal } from "react-bootstrap";
import api from "../api";
import { toast } from "react-toastify";

const TemplatesTab = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setFetching(true);
    try {
      const { data } = await api.get("/templates");
      setTemplates(data);
    } catch (error) {
      toast.error("Failed to load templates");
    } finally {
      setFetching(false);
    }
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setTemplateName(template.template_name);
    setTemplateBody(template.template_body);
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setTemplateName("");
    setTemplateBody("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (selectedTemplate) {
        await api.put(`/templates/${selectedTemplate.template_id}`, {
          template_name: templateName,
          template_body: templateBody,
        });
        toast.success("Template updated successfully");
      } else {
        await api.post("/templates", {
          template_name: templateName,
          template_body: templateBody,
        });
        toast.success("Template created successfully");
        setTemplateName("");
        setTemplateBody("");
      }
      loadTemplates();
    } catch (error) {
      toast.error(
        selectedTemplate
          ? "Failed to update template"
          : "Failed to create template"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row className="tab-content-row g-4">
      {" "}
      <Col md={6} className="d-flex flex-column">
        {" "}
        <Card className="shadow-sm h-100">
          {" "}
          <Card.Header className="bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Template List</h5>
            </div>
          </Card.Header>
          <Card.Body className="p-0 overflow-auto">
            {" "}
            {fetching ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <ListGroup variant="flush">
                {templates.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-file-earmark-text fs-1 mb-2"></i>
                    <p>No templates available</p>
                  </div>
                ) : (
                  templates.map((template) => (
                    <ListGroup.Item
                      key={template.template_id}
                      action
                      active={
                        selectedTemplate &&
                        selectedTemplate.template_id === template.template_id
                      }
                      onClick={() => handleSelectTemplate(template)}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <h6 className="mb-0">{template.template_name}</h6>
                        <small className="text-muted">
                          {template.template_body.substring(0, 50)}...
                        </small>
                      </div>
                      <i className="bi bi-chevron-right text-muted"></i>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            )}
          </Card.Body>
        </Card>
      </Col>
      <Col md={6} className="d-flex flex-column">
        {" "}
        <Card className="shadow-sm h-100">
          {" "}
          <Card.Header className="bg-white">
            <h5 className="mb-0">
              {selectedTemplate ? "Edit Template" : "Create New Template"}
            </h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Template Name</Form.Label>
                <Form.Control
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Template Body</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={8}
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  placeholder="Enter email template content..."
                  required
                  className="font-monospace"
                />
                <Form.Text className="text-muted">
                  Write the email content that will be sent to users.
                </Form.Text>
              </Form.Group>

              <div className="d-flex gap-2 mb-3">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? (
                    <Spinner animation="border" size="sm" className="me-2" />
                  ) : selectedTemplate ? (
                    <><i className="bi bi-save me-2"></i> Update</>
                  ) : (
                    <><i className="bi bi-plus-circle me-2"></i> Create</>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowPreview(v => !v)}
                >
                  <i className="bi bi-eye me-2"></i>
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>

      {/* Preview Modal */}
      <Modal
        show={showPreview}
        onHide={() => setShowPreview(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Template Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: 0, height: '60vh' }}>
          <iframe
            title="template-preview"
            srcDoc={templateBody}
            sandbox="allow-same-origin"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </Modal.Body>
      </Modal>
    </Row>
  );
};

export default TemplatesTab;
