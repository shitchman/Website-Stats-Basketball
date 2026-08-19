import { Card, Container, Row, Col, Modal } from "react-bootstrap";
import { BsUpload } from "react-icons/bs";
import { useEffect, useState } from "react";
import BoxScoreCropper from "../components/BoxScoreCropper";
import api from "../../api";

function AddGames() {

   // Changes the document title when this page is loaded
   useEffect(() => {
      document.title = "Hoop Stats - Add Game";
   }, []);

   const [showModal, setShowModal] = useState(false);

   const [selectedFile, setSelectedFile] = useState(null);
   const [previewUrl, setPreviewUrl] = useState(null);
   const [imageUrl, setImageUrl] = useState(null);

   const handleFileChange = (event) => {
      const file = event.target.files?.[0];
      if (!file) {
         return;
      }

      setSelectedFile(file);
      setImageUrl(URL.createObjectURL(file));
      setShowModal(true);
   };

   const handleCrop = async (cropArea) => {
      if (!selectedFile) {
         return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("crop_x", cropArea.x);
      formData.append("crop_y", cropArea.y);
      formData.append("crop_width", cropArea.width);
      formData.append("crop_height", cropArea.height);

      try {
         const response = await api.post("/api/upload", formData);
         console.log("Python crop confirmation:", response.data);
      } catch (error) {
         console.error("Python crop upload failed:", error);
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
                     <h1 style={{ color: "rgba(255, 102, 0, 0.95)" }}>
                        UPLOAD A NEW SCORECARD
                     </h1>

                     <p>
                        Add a photo of a scorecard to save a new game.  We'll detect each player, their position and stats - then you confirm and save.
                     </p>
                  </Card.Body>
               </Card>
            </Col>
         </Row>

         {/* Link to upload photo of new scorecard */}
         <Row>
            <Col>
               <Card className="hero-card mb-4">
                  <div className="hero-glow hero-glow-top-right"></div>
                  <div className="hero-glow hero-glow-top-left"></div>
                  <div className="hero-glow hero-glow-bottom-right"></div>
                  <div className="hero-glow hero-glow-bottom-left"></div>

                  <Card.Body className="hero-content text-white">
                     <Row className="justify-content-center">
                        <Col xs={12} lg={8}>
                           <label className="scorecard-upload">
                              <input type="file" accept=".jpg, .jpeg, .png" onChange={handleFileChange} hidden />

                              <div style={{ width: "64px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem", borderRadius: "1rem", backgroundColor: "rgba(255, 102, 0, 0.08)", color: "#ff6600" }}>
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

         {/* 'Popouts' from the scorecard upload page*/}
         <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" >
            <Modal.Header closeButton>
               Review scorecard upload image
            </Modal.Header>

            <Modal.Body className="boomers-hero-overlay d-flex" >
               <Container>
                  {/* Header */}
                  <Row>
                     <Card className="hero-card mb-4">
                        <div className="hero-glow hero-glow-top-right"></div>
                        <div className="hero-glow hero-glow-top-left"></div>

                        <Card.Body className="hero-content text-white">
                           <h1 className="justify-content-center" style={{ color: "rgba(255, 102, 0, 0.95)" }}>REVIEW SCORECARD UPLOAD</h1>

                           <p className="fw-light">Good Luck Soldier!</p>
                        </Card.Body>
                     </Card>
                  </Row>

                  {/* Image to edit */}
                  <Row>
                     <Card className="big-hero-card mb-4">
                        <div className="hero-glow hero-glow-top-right"></div>
                        <div className="hero-glow hero-glow-top-left"></div>

                        <Card.Body className="hero-content text-white">

                           {imageUrl && (<BoxScoreCropper imageUrl={imageUrl} onCrop={handleCrop} />)}

                        </Card.Body>
                     </Card>
                  </Row>
               </Container>
            </Modal.Body>
         </Modal>
      </Container>

   );
}

export default AddGames;