import { useState } from "react";
import { Container, Row, Card, Button, Form} from "react-bootstrap";

function AddBuild({ onClose }) {

  const [buildName, setBuildName] = useState("");
  const [preferredPosition, setPreferredPosition] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!buildName.trim() || !preferredPosition) {
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
            <h1 className="justify-content-center" style={{ color: "rgba(255, 102, 0, 0.95)"}}>ADD BUILD</h1>

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
                  Please ensure all sections are correctly filled out.
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
                    htmlFor="preferedPosition" 
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

                <Button type="submit" className="btn btn-primary" style={{ backgroundColor: "rgba(255, 102, 0, 0.95)", borderColor: "rgba(255, 102, 0, 0.95)"}} id="confirmBuildButton">Confirm</Button>
            </Form>
          </Card.Body>
        </Card>
      </Row>
    </Container>
  );
}

export default AddBuild;