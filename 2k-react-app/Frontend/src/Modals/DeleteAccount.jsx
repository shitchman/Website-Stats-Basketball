import { useState } from "react";
import { Container, Row, Card, Button, Col } from "react-bootstrap";

import { apiFetch } from "../../api.js";

function DeleteAccount({ onClose, onDeleted }) {
   const [showAlert, setShowAlert] = useState(false);
   const [alertMessage, setAlertMessage] = useState('');

   const [isDeleting, setIsDeleting] = useState(false);

   const handleDelete = async () => {
      setShowAlert(false);
      setAlertMessage('');
      setIsDeleting(true);

      try {
         const response = await apiFetch('/userAccount/me', { method: 'DELETE' });

         if (!response.ok) {
            const data = await response.json().catch(() => null);
            setAlertMessage(data?.detail || `Account deletion failed (${response.status}).`);
            setShowAlert(true);
            return;
         }

         onDeleted();

      } catch (error) {
         console.error('Error deleting account:', error);
         setAlertMessage('Unable to connect to the server. Please try again later.');
         setShowAlert(true);

      } finally {
         setIsDeleting(false);
      }
   };

   return (
      <Container>
         <Col>
            <Card className="hero-card overflow-y-auto">
               <div className="hero-glow hero-glow-bottom-right" aria-hidden="true"></div>
               <div className="hero-glow hero-glow-top-left" aria-hidden="true"></div>

               <Card.Body className="hero-content text-white">
                  <h1 className="justify-content-center" style={{ color: "rgba(255, 102, 0, 0.95)" }}>Are you sure you want to delete this account?</h1>

                  <p className="fw-light">This action cannot be undone. All of your games, builds and friends will be permanently deleted.</p>

                  {showAlert && (
                     <Row id="deleteAccountAlert" className="alert alert-danger" role="alert">
                        {alertMessage}
                     </Row>
                  )}

                  <div className="d-flex justify-content-between mt-3">
                     <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
                        Cancel
                     </Button>

                     <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? 'Deleting...' : 'Delete'}
                     </Button>
                  </div>
               </Card.Body>
            </Card>
         </Col>
      </Container>
   );
}

export default DeleteAccount;
