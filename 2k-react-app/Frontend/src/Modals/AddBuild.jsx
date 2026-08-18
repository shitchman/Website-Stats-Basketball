import { useState } from "react";
import { Container, Row, Card, Button, Form } from "react-bootstrap";

import { apiFetch } from "../../api.js";

function AddBuild({ setBuilds, onClose }) {

  const [buildName, setBuildName] = useState("");
  const [preferredPosition, setPreferredPosition] = useState("");

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBuildAddition = async () => {
    try {
      const response = await apiFetch('/builds/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ build_name: buildName.trim(), preferred_position: preferredPosition.trim() }),
      });

      const responseText = await response.text();
      let data = null;

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = null;
        }
      }

      if (!response.ok) {
        setAlertMessage(data?.detail || `Build addition failed (${response.status}).`);
        setShowAlert(true);
        return;
      }

      const buildsListResponse = await apiFetch('/builds/me');

      if (!buildsListResponse.ok) {
        setAlertMessage('Build addition succeeded, but the builds list could not be reloaded.');
        setShowAlert(true);
        return;
      }

      setBuilds(await buildsListResponse.json());
      console.log("Build added successfully:", responseText);
      onClose();

    } catch (error) {
      console.error('Error adding build:', error);
      setAlertMessage('Unable to connect to the server. Please try again later.');
      setShowAlert(true);

    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!buildName.trim() || !preferredPosition.trim()) {
      setShowAlert(true);
      return;
    }

    setShowAlert(false);
    setAlertMessage('');
    setIsSubmitting(true);

    await handleBuildAddition();
  }

  return (
    <Container>
      {/* Header */}
      <Row>
        <Card className="hero-card mb-4">
          <div className="hero-glow hero-glow-top-right"></div>
          <div className="hero-glow hero-glow-top-left"></div>

          <Card.Body className="hero-content text-white">
            <h1 className="justify-content-center" style={{ color: "rgba(255, 102, 0, 0.95)" }}>ADD BUILD</h1>

            <p className="fw-light">Please ensure that you fill out each of the fields below</p>
          </Card.Body>
        </Card>
      </Row>

      {/* Form */}
      <Row>
        <Card className="hero-card mb-4">
          <div className="hero-glow hero-glow-top-right"></div>
          <div className="hero-glow hero-glow-top-left"></div>

          <Card.Body className="hero-content text-white">

            <Form id="AddBuild" method="post" onSubmit={handleSubmit}>
              <Row id="submissionAlert" className={"alert alert-danger " + (showAlert ? '' : 'd-none')} role="alert">
                {alertMessage}
              </Row>

              <Row className="mb-3">
                <Form.Label
                  htmlFor="buildName"
                  className="text-start"
                >
                  Build Name
                </Form.Label>

                <Form.Control
                  className="bg-dark text-white border-secondary"
                  value={buildName}
                  onChange={(e) => setBuildName(e.target.value)}
                  type="text"
                  id="buildName"
                  required
                />
              </Row>

              <Row className="mb-3">
                <Form.Label
                  htmlFor="preferredPosition"
                  className="text-start"
                >
                  Preferred Position
                </Form.Label>

                <Form.Select
                  className="bg-dark text-white border-secondary"
                  value={preferredPosition}
                  onChange={(e) => setPreferredPosition(e.target.value)}
                  id="preferredPosition"
                  required
                >
                  <option value="">Select a position</option>
                  <option value="PG">Point Guard</option>
                  <option value="SG">Shooting Guard</option>
                  <option value="SF">Small Forward</option>
                  <option value="PF">Power Forward</option>
                  <option value="C">Center</option>
                </Form.Select>
              </Row>

              <Button type="submit" className="btn btn-primary" style={{ backgroundColor: "rgba(255, 102, 0, 0.95)", borderColor: "rgba(255, 102, 0, 0.95)" }} id="confirmBuildButton" disabled={isSubmitting}>
                {isSubmitting ? 'Adding build...' : 'Add Build'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Row>
    </Container>
  );
}

export default AddBuild;