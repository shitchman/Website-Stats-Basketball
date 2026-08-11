import { Container, Row, Card, Col } from "react-bootstrap";
import { useEffect } from "react";

function Stats() {

  useEffect(() => {
    document.title = "Hoop Stats - Profile";
  }, []);

  return (
    <Container fluid className="mt-3">
      {/* Profile heading */}
      <Row className="d-flex justify-content-center">
        <Col sm={12} md={11}>
          <Card className="hero-card mb-4">
            <div className="hero-glow hero-glow-top-right"></div>
            <div className="hero-glow hero-glow-top-left"></div>

            <Card.Body className="hero-content text-white">
                  <h1 style={{ color: "rgba(255, 102, 0, 0.95)" }}>Statistics Deep Dive</h1>

                  <p>Here is where you can truly crunch the numbers! <br></br> <span className="fw-light" style={{ color: "rgba(145, 148, 148, 1.0)" }}> You want to find the best version of yourself, a friend or you most successful team lineups, this is the place to do it!</span></p>
                  
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Stats;