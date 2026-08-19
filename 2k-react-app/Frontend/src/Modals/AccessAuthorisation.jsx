import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { useState } from "react";

import { apiFetch } from "../../api.js";

function AccessAuthorisation({ user, onClose, onVerified }) {
   const [userConfirmPassword, setUserConfirmPassword] = useState("");

   const [showAlert, setShowAlert] = useState(false);
   const [alertMessage, setAlertMessage] = useState('');

   const [isSubmitting, setIsSubmitting] = useState(false);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setShowAlert(false);
      setAlertMessage('');
      setIsSubmitting(true);

      try {
         const response = await apiFetch('/userAccount/verify-password', {
            method: 'POST',
            body: JSON.stringify({ password: userConfirmPassword }),
         });

         if (!response.ok) {
            setAlertMessage('Incorrect password. Please try again.');
            setShowAlert(true);
            return;
         }

         onVerified();

      } catch (error) {
         console.error('Error verifying password:', error);
         setAlertMessage('Unable to connect to the server. Please try again later.');
         setShowAlert(true);

      } finally {
         setIsSubmitting(false);
      }
   };


   return (
      <Container>

        /* Form */
         <Col>
            <Card className="hero-card overflow-y-auto">
               <div className="hero-glow hero-glow-bottom-right" aria-hidden="true"></div>
               <div className="hero-glow hero-glow-top-left" aria-hidden="true"></div>

               <Card.Body className="hero-content text-white">

                  <Form id="editProfile" method="post" onSubmit={handleSubmit}>
                     <Row id="loginAlert" className={"alert alert-danger " + (showAlert ? '' : 'd-none')} role="alert">
                        {alertMessage || 'Confirm your password to continue.'}
                     </Row>

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

                     <Button type="submit" variant="primary" id="registerButton" disabled={isSubmitting}>
                        {isSubmitting ? 'Confirming password match...' : 'Confirm'}
                     </Button>

                  </Form>
               </Card.Body>
            </Card>
         </Col>
      </Container>
   );
}

export default AccessAuthorisation;