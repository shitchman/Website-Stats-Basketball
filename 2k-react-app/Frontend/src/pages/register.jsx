import React, { useState, useEffect } from "react";
import { Button, Col, Container, Form, Row, Modal } from "react-bootstrap";
import RegistrationSuccess from "../Modals/registrationSuccess";

function Register({ setCurrentPage }) {
    const [username, setUsername] = useState("");
    const [onlineID, setOnlineID] = useState(""); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showAlert, setShowAlert] = useState(false);

    const [showModal, setShowModal] = useState(false);

    const handleRegistrationSuccessClose = () => {
        setShowModal(false);
        setCurrentPage('login');
    };
    
    useEffect(() => {
                    document.title = "Hoop Stats - Register";
                }, []);

   const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !onlineID.trim() || !email.trim() || !password.trim() || password !== confirmPassword) {
            setShowAlert(true);
            return;
        }

        setShowAlert(false);

        const response = await fetch('http://localhost:8000/userAccount/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',},
            body: JSON.stringify({ username: username.trim(), password: password.trim(), email: email.trim(), online_ID: onlineID.trim()}),
        });

        const data = await response.json();

        if (!response.ok) {
            setShowAlert(true);
            console.error('FastAPI error:', data);
            return;
        }

        console.log("User registered successfully:", data);
        setShowModal(true);
    };

    return (
        <Container>
            <Row>
                <Col className="auth-content ms-5 mt-5" style={{ flex: '0 0 390px', maxWidth: '100%', width: '390px' }}>
                    <h1>Create User</h1>
                    <Form id="registerForm" method="post" onSubmit={handleSubmit}>
                        <Row id="loginAlert" className={"alert alert-danger " + (showAlert ? '' : 'd-none')} role="alert">
                            Please complete all sections of this form.
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="username" className="d-block text-start mt-2">Username</Form.Label>
                            <Form.Control 
                                className="bg-dark text-white border-secondary" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)} 
                                type="text" 
                                id="username" 
                                required 
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="onlineID" className="d-block text-start mt-2">Online ID</Form.Label>
                            <Form.Control 
                                className="bg-dark text-white border-secondary" 
                                value={onlineID}
                                onChange={(e) => setOnlineID(e.target.value)} 
                                type="text" 
                                id="onlineID" 
                                required 
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="email" className="d-block text-start">Email</Form.Label>
                            <Form.Control 
                                className="bg-dark text-white border-secondary" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} 
                                type="email" 
                                id="email" 
                                required 
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="password" className="d-block text-start">Password</Form.Label>
                            <Form.Control 
                                className="bg-dark text-white border-secondary" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}                                
                                type="password" 
                                id="password" 
                                maxLength={12} 
                                required 
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="confirm_password" className="d-block text-start">Confirm Password</Form.Label>
                            <Form.Control 
                                className="bg-dark text-white border-secondary"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                type="password" 
                                id="confirm_password" 
                                maxLength="12" 
                                required 
                            />
                        </Form.Group>

                        <Button type="submit" variant="primary" id="registerButton">Register</Button>

                    </Form>
                </Col>
            </Row>

            <Modal show={showModal} onHide={handleRegistrationSuccessClose} centered size="lg"  >
                <Modal.Body className="boomers-hero-overlay d-flex">
                    {<RegistrationSuccess onClose={handleRegistrationSuccessClose}/>}
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default Register;