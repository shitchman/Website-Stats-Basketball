import React, { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";

function Home() {

   useEffect(() => {
      document.title = "Hoop Stats - Home";
   }, []);

   return (
      <Container>
         <Row className="d-flex justify-content-start">

            {/* 
                - home-content refers to the index.css home-content section where the maximum text size has been capped to prevent the overflow to another column
                - text-center aligns the text in the center, as opposed to the end or the start */}

            <Col className="auth-content text-center ms-5 mt-5" style={{ flex: '0 0 390px', maxWidth: '100%', width: '390px' }}>
               <h1>Welcome to Hoop Stats</h1>
               <p className="mt-2"> The number one destination for virtual
                  <br /> basketball statistics and analysis.</p>
            </Col>
         </Row>
      </Container>
   );
}

export default Home;