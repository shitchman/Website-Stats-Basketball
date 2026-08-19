import { Container, Row, Col, Card } from "react-bootstrap";
import { useEffect } from "react";

function Stats() {

   useEffect(() => {
      document.title = "Hoop Stats - Profile";
   }, []);

   return (
      <Container fluid className="mt-3">
         {/* Stats Heading */}
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

         {/* Data Options */}
         <Row className="d-flex justify-content-center">
            <Col sm={12} md={11}>
               <Card className="hero-card mb-4">
                  <div className="hero-glow hero-glow-top-right"></div>
                  <div className="hero-glow hero-glow-top-left"></div>

                  <Card.Body className="hero-content text-white">
                     <Col xs={10} className="large-profile-header-custom-col">
                        <h3 style={{ color: "rgba(255, 102, 0, 0.95)" }}>DATA OPTIONS</h3>

                        <p className="fw-light" style={{ color: "rgba(145, 148, 148, 1.0)" }}>OPTIONS: USER - Build - Result - Match Up - Position - Season - Ball Handler - Friends <br></br>The USER is required, this is where you can either choose yourself or a friend to be the main targer of the enquiry<br></br>All of these will appear as dropdown options with the default set to ALL except user, that will be the users' online ID</p>
                     </Col>
                  </Card.Body>
               </Card>
            </Col>
         </Row>

         {/* Statistic Output */}
         <Row className="d-flex justify-content-center">
            <Col sm={12} md={11}>
               <Card className="hero-card mb-4">
                  <div className="hero-glow hero-glow-top-right"></div>
                  <div className="hero-glow hero-glow-top-left"></div>

                  <Card.Body className="hero-content text-white">
                     <Col xs={10} className="large-profile-header-custom-col">
                        <h3 style={{ color: "rgba(255, 102, 0, 0.95)" }}>Statistics</h3>

                        <p className="fw-light" style={{ color: "rgba(145, 148, 148, 1.0)" }}>This will display the averages for all of the selected criteria, the more specific the users request the less data is needed.<br></br>Should the user leave everything to the default options a massive spreadsheet will appear</p>
                     </Col>
                  </Card.Body>
               </Card>
            </Col>
         </Row>

         {/* 'USER' box scores */}
         <Row className="d-flex justify-content-center">
            <Col sm={12} md={11}>
               <Card className="hero-card mb-4">
                  <div className="hero-glow hero-glow-top-right"></div>
                  <div className="hero-glow hero-glow-top-left"></div>

                  <Card.Body className="hero-content text-white">
                     <Col xs={10} className="large-profile-header-custom-col">
                        <h3 style={{ color: "rgba(255, 102, 0, 0.95)" }}>Box Scores</h3>

                        <p className="fw-light" style={{ color: "rgba(145, 148, 148, 1.0)" }}>All of the box scores that fit the criteria will appear below.<br></br>This will only have the line from the game for the chosen USER (target of request).<br></br>If the user selects a specific game then the full box score will present itself as a popout (Modal)</p>
                     </Col>
                  </Card.Body>
               </Card>
            </Col>
         </Row>
      </Container>
   );
}

export default Stats;