import React, { useState, useEffect } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";

function Register({ setCurrentPage }) {
    const [gender, setGender] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    
    useEffect(() => {
                    document.title = "Hoop Stats - Register";
                }, []);

   const handleSubmit = async (e) => {
        e.preventDefault();
        if (!gender || !username.trim() || !email.trim() || !password.trim() || password !== confirmPassword) {
            setShowAlert(true);
            return;
        }

        setShowAlert(false);
        // TODO: replace with real authentication API call
        // Example:
        // const res = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ username, password }) })
        // if (res.ok) setCurrentPage('dashboardHome')

        // Simulate successful register and navigate
        setCurrentPage('dashboardHome');
    }
    
    return (
        <Container>
            <Row>
                <Col className="auth-content ms-5 mt-5" style={{ flex: '0 0 390px', maxWidth: '100%', width: '390px' }}>
                    <h1>Create User</h1>
                    <Form id="registerForm" method="post" onSubmit={handleSubmit}>
                        <Row id="loginAlert" className={"alert alert-danger " + (showAlert ? '' : 'd-none')} role="alert">
                            Please complete all sections of this form.
                        </Row>

                        <Form.Group>
                            <Form.Check
                                inline
                                name="gender"
                                value="male"
                                onChange={(e) => setGender(e.target.value)}
                                type="radio"
                                label="Male"
                            />

                            <Form.Check
                                inline
                                className=""
                                name="gender"
                                value="female"
                                onChange={(e) => setGender(e.target.value)}
                                type="radio"
                                label="Female"
                            />
                            <Form.Check
                                inline
                                name="gender"
                                value="other"
                                onChange={(e) => setGender(e.target.value)}
                                type="radio"
                                label="Other"
                            />
                        </Form.Group>

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

        </Container>
    );
}

export default Register;