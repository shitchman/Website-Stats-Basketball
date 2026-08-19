import { Container, Row, Card, Form, Button } from "react-bootstrap";
import { useState, useEffect } from "react";

import { apiFetch } from "../../api.js";

function EditBuild({ setBuilds, onClose }) {
    const [builds, setBuildsList] = useState([]);
    const [selectedBuildId, setSelectedBuildId] = useState("");
    const [buildName, setBuildName] = useState("");
    const [preferredPosition, setPreferredPosition] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadBuilds = async () => {
            const response = await apiFetch('/builds/myBuilds');
            if (response.ok) {
                setBuildsList(await response.json());
            }
        };

        loadBuilds();
    }, []);

    const handleBuildSelection = (event) => {
        const buildId = Number(event.target.value);
        const selected = builds.find((build) => build.id === buildId);

        setSelectedBuildId(buildId || "");

        if (!selected) { 
            setBuildName(""); 
            setPreferredPosition("");
            return;
        }

        setBuildName(selected.build_name ?? "");
        setPreferredPosition(selected.preferred_position ?? "");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedBuildId) {
            setAlertMessage("Please select a build to edit.");
            setShowAlert(true);
            return;
        }

        if (!buildName.trim() || !preferredPosition.trim()) {
            setAlertMessage("Please complete the build name and preferred position.");
            setShowAlert(true);
            return;
        }

        setShowAlert(false);
        setAlertMessage("");
        setIsSubmitting(true);

        try {
            const response = await apiFetch(`/builds/updateUserBuild?build_id=${selectedBuildId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    build_name: buildName.trim(),
                    preferred_position: preferredPosition.trim(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.detail || `Update failed (${response.status}).`);
            }

            const refreshedBuildsResponse = await apiFetch('/builds/myBuilds');
            if (refreshedBuildsResponse.ok) {
                const updatedBuilds = await refreshedBuildsResponse.json();
                setBuildsList(updatedBuilds);
                if (setBuilds) {
                    setBuilds(updatedBuilds);
                }
            }
            onClose();
        } catch (error) {
            console.error('Error updating build:', error);
            setAlertMessage(error.message || 'Unable to update the build. Please try again later.');
            setShowAlert(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container>
            <Row>
                <Card className="hero-card mb-4">
                    <div className="hero-glow hero-glow-top-right"></div>
                    <div className="hero-glow hero-glow-top-left"></div>

                    <Card.Body className="hero-content text-white">
                        <h1 className="justify-content-center" style={{ color: "rgba(255, 102, 0, 0.95)" }}>Edit Builds</h1>
                        <p className="fw-light">Select a build to begin editing. Once you have finished, click save to continue.</p>
                    </Card.Body>
                </Card>
            </Row>

            <Row>
                <Card className="hero-card mb-4">
                    <div className="hero-glow hero-glow-top-right"></div>
                    <div className="hero-glow hero-glow-top-left"></div>

                    <Card.Body className="hero-content text-white">
                        <Form id="editBuildForm" method="post" onSubmit={handleSubmit}>
                            <Row id="submissionAlert" className={"alert alert-danger " + (showAlert ? '' : 'd-none')} role="alert">
                                {alertMessage}
                            </Row>

                            <Row className="mb-3">
                                <Form.Label htmlFor="selectedBuild" className="text-start">Build</Form.Label>
                                <Form.Select
                                    className="bg-dark text-white border-secondary"
                                    value={selectedBuildId}
                                    onChange={handleBuildSelection}
                                    id="selectedBuild"
                                    required
                                >
                                    <option value="">Select a build</option>
                                    {builds.map((build) => (
                                        <option key={build.id} value={build.id}>
                                            {build.build_name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Row>

                            <Row className="mb-3">
                                <Form.Label htmlFor="buildName" className="text-start">Build Name</Form.Label>
                                <Form.Control
                                    className="bg-dark text-white border-secondary"
                                    value={buildName}
                                    onChange={(e) => setBuildName(e.target.value)}
                                    type="text"
                                    id="buildName"
                                    disabled={!selectedBuildId}
                                />
                            </Row>

                            <Row className="mb-3">
                                <Form.Label htmlFor="preferredPosition" className="text-start">
                                    Preferred Position
                                </Form.Label>

                                <Form.Select
                                    className="bg-dark text-white border-secondary"
                                    value={preferredPosition}
                                    onChange={(e) => setPreferredPosition(e.target.value)}
                                    id="preferredPosition"
                                    disabled={!selectedBuildId}
                                >
                                    <option value="">Select a position</option>
                                    <option value="PG">Point Guard</option>
                                    <option value="SG">Shooting Guard</option>
                                    <option value="SF">Small Forward</option>
                                    <option value="PF">Power Forward</option>
                                    <option value="C">Center</option>
                                </Form.Select>
                            </Row>

                            <Button
                                type="submit"
                                className="btn btn-primary"
                                style={{ backgroundColor: "rgba(255, 102, 0, 0.95)", borderColor: "rgba(255, 102, 0, 0.95)" }}
                                disabled={isSubmitting || !selectedBuildId}
                            >
                                {isSubmitting ? 'Saving build...' : 'Save Changes'}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Row>
        </Container>
    );
}

export default EditBuild;