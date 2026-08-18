import { useState } from "react";
import { Container, Row, Card, Button, Form } from "react-bootstrap";

import { apiFetch } from "../../api.js";


function AddFriend({ setFriends, onClose }) {
  const [name, setName] = useState("");
  const [onlineID, setOnlineID] = useState("");
  
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFriendAddition = async () => {
    try {
      const response = await apiFetch('/friends/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',},
      body: JSON.stringify({ name: name.trim(), online_ID: onlineID.trim()}),
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
      setAlertMessage(data?.detail || `Friend addition failed (${response.status}).`);
      setShowAlert(true);
      return;
    }

    const friendsListResponse = await apiFetch('/friends/me');
    
    if (!friendsListResponse.ok) {
      setAlertMessage('Friend addition succeeded, but the friends list could not be reloaded.');
      setShowAlert(true);
      return;
    }
    
    setFriends(await friendsListResponse.json());
    console.log("Friend added successfully:", responseText);
    onClose();

  } catch (error) {
    console.error('Error adding friend:', error);
    setAlertMessage('Unable to connect to the server. Please try again later.');
    setShowAlert(true);
    
  } finally {
    setIsSubmitting(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }

    if (!name.trim() || !onlineID.trim()) {
      setAlertMessage('Please enter both your name and online ID.');
      setShowAlert(true);
      return;
    }

    setShowAlert(false);
    setAlertMessage('');
    setIsSubmitting(true);

    await handleFriendAddition();
  };

  return (
    <Container>
      {/* Header */}
      <Row>
        <Card className="hero-card mb-4">
          <div className="hero-glow hero-glow-top-right"></div>
          <div className="hero-glow hero-glow-top-left"></div>

          <Card.Body className="hero-content text-white">
            <h1 className="justify-content-center" style={{ color: "rgba(255, 102, 0, 0.95)" }}>ADD FRIEND</h1>

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

            <Form id="AddFriend" method="post" onSubmit={handleSubmit}>
              <Row id="submissionAlert" className={"alert alert-danger " + (showAlert ? '' : 'd-none')} role="alert">
                {alertMessage}
              </Row>

              <Row className="mb-3">
                <Form.Label
                  htmlFor="name"
                  className="text-start"
                >
                  Name
                </Form.Label>

                <Form.Control
                  className="bg-dark text-white border-secondary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  id="name"
                  required
                />
              </Row>

              <Row className="mb-3">
                <Form.Label
                  htmlFor="onlineID"
                  className="text-start"
                >
                  Online ID
                </Form.Label>

                <Form.Control
                  className="bg-dark text-white border-secondary"
                  value={onlineID}
                  onChange={(e) => setOnlineID(e.target.value)}
                  type="text"
                  id="onlineID"
                  required
                />
              </Row>

              <Button type="submit" className="btn btn-primary" style={{ backgroundColor: "rgba(255, 102, 0, 0.95)", borderColor: "rgba(255, 102, 0, 0.95)" }} id="confirmFriendButton" disabled={isSubmitting}>
                {isSubmitting ? 'Adding friend...' : 'Add Friend'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Row>
    </Container>
  );
}

export default AddFriend;