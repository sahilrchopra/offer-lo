import React, { useState } from "react";
import { Container, Navbar, Nav, Button } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import TemplatesTab from "./TemplatesTab";
import EmailsTab from "./EmailsTab";

const DashboardLayout = ({ children }) => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("templates"); 

  const renderTabContent = () => {
    switch (activeTab) {
      case "templates":
        return <TemplatesTab />;
      case "emails":
        return <EmailsTab />; 
      default:
        return <TemplatesTab />; 
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar bg="primary" variant="dark" expand="lg" className="navbar-custom">
        <Container>
          <Navbar.Brand href="#home" className="fw-bold">
            <i className="bi bi-envelope-paper me-2"></i>
            Email Engine
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link
                href="#templates"
                active={activeTab === "templates"}
                onClick={() => setActiveTab("templates")}
              >
                Templates
              </Nav.Link>
              <Nav.Link
                href="#emails"
                active={activeTab === "emails"}
                onClick={() => setActiveTab("emails")}
              >
                Emails
              </Nav.Link>
            </Nav>
            <Button
              variant="outline-light"
              onClick={logout}
              size="sm"
              className="d-flex align-items-center"
            >
              <i className="bi bi-box-arrow-right me-2"></i> Logout
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-4">
        {renderTabContent()}
      </Container>

      <footer className="bg-light py-3 mt-auto">
        <Container>
          <p className="text-center text-muted mb-0">
            &copy; {new Date().getFullYear()} Email Engine Admin Portal
          </p>
        </Container>
      </footer>
    </div>
  );
};

export default DashboardLayout;
