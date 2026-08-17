import { useState } from "react";
import { Container, Row, Card, Button, Form, Col } from "react-bootstrap";



// Need to make the user confirm their password before entering the edit profile page.
// Then need to have the users profile pre saved, this is so the user only has to change what they want and not everything.

function EditProfile({ onClose }) {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userOnlineID, setUserOnlineID] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userConfirmPassword, setUserConfirmPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim() || !userOnlineID.trim() || !userPassword.trim() || userPassword !== userConfirmPassword) {
      setShowAlert(true);
      return;
    }

    setShowAlert(false);

    onClose();
  }


  return (
    <Container>
      {/* Header */}
      <Row>
        <Card className="hero-card mb-4">
          <div className="hero-glow hero-glow-top-right"></div>
          <div className="hero-glow hero-glow-top-left"></div>

          <Card.Body className="hero-content text-white">
            <h1 className="justify-content-center" style={{ color: "rgba(255, 102, 0, 0.95)" }}>EDIT PROFILE</h1>

            <p className="fw-light">Once you have finished, click save to continue</p>
          </Card.Body>
        </Card>
      </Row>

      {/* Form */}
      <Col>
        <Card className="hero-card overflow-y-auto"> {/* overflow-y-auto adds a vertical scroll */}
          <div className="hero-glow hero-glow-bottom-right" aria-hidden="true"></div>
          <div className="hero-glow hero-glow-top-left" aria-hidden="true"></div>

          <Card.Body className="hero-content text-white">

            <Form id="editProfile" method="post" onSubmit={handleSubmit}>
              <Row id="loginAlert" className={"alert alert-danger " + (showAlert ? '' : 'd-none')} role="alert">
                Please successfully complete all sections of this form.
              </Row>
              {/* Username */}
              <Form.Group className="mb-3">
                <Form.Label htmlFor="userName" className="d-block text-start mt-2">Username</Form.Label>
                <Form.Control
                  className="bg-dark text-white border-secondary"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  type="text"
                  id="userName"
                  required
                />
              </Form.Group>
              {/* OnlineID */}
              <Form.Group className="mb-3">
                <Form.Label htmlFor="userOnlineID" className="d-block text-start mt-2">Online ID</Form.Label>
                <Form.Control
                  className="bg-dark text-white border-secondary"
                  value={userOnlineID}
                  onChange={(e) => setUserOnlineID(e.target.value)}
                  type="text"
                  id="userOnlineID"
                  required
                />
              </Form.Group>
              {/* Email */}
              <Form.Group className="mb-3">
                <Form.Label htmlFor="userEmail" className="d-block text-start">Email</Form.Label>
                <Form.Control
                  className="bg-dark text-white border-secondary"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  type="email"
                  id="userEmail"
                  required
                />
              </Form.Group>
              {/* Password */}
              <Form.Group className="mb-3">
                <Form.Label htmlFor="userPassword" className="d-block text-start">Password</Form.Label>
                <Form.Control
                  className="bg-dark text-white border-secondary"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  type="password"
                  id="userPassword"
                  maxLength={12}
                  required
                />
              </Form.Group>
              {/* Confirm Password */}
              <Form.Group className="mb-3">
                <Form.Label htmlFor="userConfirmPassword" className="d-block text-start">Confirm Password</Form.Label>
                <Form.Control
                  className="bg-dark text-white border-secondary"
                  value={userConfirmPassword}
                  onChange={(e) => setUserConfirmPassword(e.target.value)}
                  type="password"
                  id="userConfirmPassword"
                  maxLength="12"
                  required
                />
              </Form.Group>

              <Button type="submit" variant="primary" id="registerButton">Save</Button>

            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Container>
  );
}

export default EditProfile;