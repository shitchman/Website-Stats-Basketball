import { Card, Container, Row, Col } from "react-bootstrap";
import { BsUpload } from "react-icons/bs";

function AddGames() {

  const handleFileChange = (event) => {
    const file = event.target.files[0]; if (file) {
      console.log(file);
    }
  };


  return (
    <Container fluid className="justify-content-center mt-3">

      {/* Upload scorecard explanation */}
      <Row>
        <Col>
          <Card className="hero-card mb-4">
            <div className="hero-glow hero-glow-top-right"></div>
            <div className="hero-glow hero-glow-top-left"></div>

            <Card.Body className="hero-content text-white">
              <h1 style={{color:"rgba(255, 102, 0, 0.95)"}}>
                UPLOAD A NEW SCORECARD
              </h1>

              <p>
                Add a photo of a scorecard to save a new game.  We'll detect each player, their position and stats - then you confirm and save.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

    {/* Link to add new scorecard */}
      <Row>
        <Col>
          <Card className="hero-card mb-4">
            <div className="hero-glow hero-glow-top-right"></div>
            <div className="hero-glow hero-glow-top-left"></div>

            <Card.Body className="hero-content text-white">
              <Row className="justify-content-center">
                <Col xs={12} lg={8}>
                  <label className="scorecard-upload">
                      <input type="file" accept="image/*" onChange={handleFileChange} hidden/>

                      <div     style={{width: "64px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem", borderRadius: "1rem", backgroundColor: "rgba(255, 102, 0, 0.08)", color: "#ff6600"}}>
                          <BsUpload size={28} />
                      </div>

                      <h5 className="fw-light">
                          Click to upload box score photo
                      </h5>
                  </label>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </Container>

  );
}

export default AddGames;