import React, { useState, useEffect } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";

function Login({ setCurrentPage }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
            document.title = "Hoop Stats - Login";
        }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setShowAlert(true);
            return;
        }

        setShowAlert(false);
        // TODO: replace with real authentication API call
        // Example:
        // const res = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ username, password }) })
        // if (res.ok) setCurrentPage('dashboardHome')

        // Simulate successful login and navigate
        setCurrentPage('dashboardHome');
    };

    return (
        
        <Container>
            <Row>                
                <Col className="auth-content ms-5 mt-5" style={{ flex: '0 0 390px', maxWidth: '100%', width: '390px' }}>
                    <h1>Login</h1>
                    <Form id="LoginForm" method="post" onSubmit={handleSubmit}>
                        <Row id="loginAlert" className={"alert alert-danger " + (showAlert ? '' : 'd-none')} role="alert">
                            Please enter a valid username and password.
                        </Row>

                        <Row className="mb-3">
                            <Form.Label htmlFor="username" className="text-start">Username</Form.Label>
                            <Form.Control
                                className="bg-dark text-white border-secondary"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                type="text"
                                id="username"
                                required
                            />
                        </Row>

                        <Row className="mb-3">
                            <Form.Label htmlFor="password" className="text-start">Password</Form.Label>
                            <Form.Control
                                className="bg-dark text-white border-secondary"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                id="password"
                                required
                            />
                        </Row>

                        <Button type="submit" className="btn btn-primary" id="loginButton">Login</Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default Login;