import React, { useState, useEffect } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { apiFetch } from "../../api.js";

function Login({ setCurrentPage, setUser }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        document.title = "Hoop Stats - Login";
    }, []);


    const getErrorMessage = (data, fallbackMessage) => {
        if (typeof data?.detail === 'string') {
            return data.detail;
        }

        if (Array.isArray(data?.detail)) {
            const validationMessage = data.detail.map((error) => error?.msg).filter(Boolean).join(' ');

            return validationMessage || fallbackMessage;
        }
        return fallbackMessage;
    };

    const handleLogin = async () => {
        try {
            const response = await apiFetch('/userAccount/login', {
                method: 'POST',
                body: JSON.stringify({ username: username.trim(), password: password.trim() }),
            });

            const responseText = await response.text();
            let data = null;

            if (responseText) {
                try {
                    data = JSON.parse(responseText);
                } catch {
                    data = null;
                }
            }

            if (!response.ok) {
                setAlertMessage(getErrorMessage(data, `Login failed (${response.status}).`));
                setShowAlert(true);
                return;
            }

            const currentUserResponse = await apiFetch('/userAccount/me');
            if (!currentUserResponse.ok) {
                setAlertMessage('Login succeeded, but the current user could not be loaded.');
                setShowAlert(true);
                return;
            }

            setUser(await currentUserResponse.json());
            setCurrentPage('dashboardHome');

        } catch (error) {
            console.error('Error during login:', error);
            setAlertMessage('Unable to connect to the server. Please try again.');
            setShowAlert(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) {
            return;
        }

        if (!username.trim() || !password.trim()) {
            setAlertMessage('Please enter both your username and password.');
            setShowAlert(true);
            return;
        }

        setShowAlert(false);
        setAlertMessage('');
        setIsSubmitting(true);

        await handleLogin();
    };

    return (
        <Container>
            <Row>
                <Col className="auth-content ms-5 mt-5" style={{ flex: '0 0 390px', maxWidth: '100%', width: '390px' }}>
                    <h1>Login</h1>
                    <Form id="LoginForm" method="post" onSubmit={handleSubmit}>
                        <Row id="loginAlert" className={"alert alert-danger " + (showAlert ? '' : 'd-none')} role="alert" aria-live="polite">
                            {alertMessage}
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

                        <Button type="submit" className="btn btn-primary" id="loginButton" disabled={isSubmitting}>
                            {isSubmitting ? 'Logging in...' : 'Login'}
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default Login;