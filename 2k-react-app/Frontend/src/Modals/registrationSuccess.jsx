import { Container, Row, Card, Button } from "react-bootstrap";

function RegistrationSuccess({ onClose }) {

    const handleClose = () => {
        onClose();
    };
    
    

  return (
    <Container>
      {/* Header */}
      <Row>
        <Card className="hero-card mb-4">
          <div className="hero-glow hero-glow-top-right"></div>
          <div className="hero-glow hero-glow-top-left"></div>

          <Card.Body className="hero-content text-white">
            <h1 className="justify-content-center" style={{ color: "rgba(255, 102, 0, 0.95)" }}>Successfully registered!</h1>

            <p className="fw-light">Please return to login and begin your Hoop Stats journey.</p>

            <Button type="button" variant="primary" id="registerButton" onClick={handleClose}>Continue</Button>
          </Card.Body>
        </Card>
      </Row>
    </Container>
  );
}

export default RegistrationSuccess;