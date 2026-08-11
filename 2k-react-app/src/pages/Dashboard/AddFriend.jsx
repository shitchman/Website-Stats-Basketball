import { useState } from "react";
import {  Container, Row, Card, Button, Form} from "react-bootstrap";

function AddFriend({ onClose }) {
  const [name, setName] = useState("");
  const [onlineID, setOnlineID] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !onlineID.trim()) {
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
            <h1 className="justify-content-center" style={{ color: "rgba(255, 102, 0, 0.95)"}}>ADD FRIEND</h1>

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
                  Please ensure all sections are correctly filled out.
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

                <Button type="submit" className="btn btn-primary" style={{ backgroundColor: "rgba(255, 102, 0, 0.95)", borderColor: "rgba(255, 102, 0, 0.95)"}} id="confirmFriendButton">Add Friend</Button>
            </Form>
          </Card.Body>
        </Card>
      </Row>
    </Container>
  );
}

export default AddFriend;