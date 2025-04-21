import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  ListGroup,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";
import api from "../api";
import { toast } from "react-toastify";

const TemplatesTab = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [templateBody, setTemplateBody] = useState("");
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
      {/* Added gutter spacing */}
      {/* Template List (Left Pane) */}
      <Col md={6} className="d-flex flex-column">
        {" "}
        {/* Changed from md={5} to md={6} for symmetry */}
        <Card className="shadow-sm h-100">
          {" "}
          {/* Simplified to h-100 for full height */}
          <Card.Header className="bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Template List</h5>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleCreateNew}
              >
                <i className="bi bi-plus-lg me-1"></i> New
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="p-0 overflow-auto">
            {" "}
            {/* Added overflow-auto for scrolling */}
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
      {/* Template Editor (Right Pane) */}
      <Col md={6} className="d-flex flex-column">
        {" "}
        {/* Changed from md={7} to md={6} for symmetry */}
        <Card className="shadow-sm h-100">
          {" "}
          {/* Simplified to h-100 for full height */}
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

              <div className="d-grid">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? (
                    <Spinner animation="border" size="sm" className="me-2" />
                  ) : selectedTemplate ? (
                    <>
                      <i className="bi bi-save me-2"></i> Update Template
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle me-2"></i> Create Template
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

export default TemplatesTab;
