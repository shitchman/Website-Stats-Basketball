import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Button, Modal } from "react-bootstrap";
import { BsPencilFill, BsPlusCircleFill, BsPersonPlusFill } from "react-icons/bs";

import AddBuild from "../Modals/AddBuild";
import AddFriend from "../Modals/AddFriend";
import EditProfile from "../Modals/EditProfile";

function Profile() {

    const [activeModal, setActiveModal] = useState(null);


    useEffect(() => {
        document.title = "Hoop Stats - Profile";
    }, []);

    const builds = [
        { id: 1, name: "build1", position: "C" },
        { id: 2, name: "build2", position: "PG" },
        { id: 3, name: "build3", position: "PF" },
        { id: 4, name: "build4", position: "SG" },
        { id: 5, name: "build5", position: "SF" },
        { id: 6, name: "build6", position: "C" },
        { id: 7, name: "build7", position: "PF" },
        { id: 8, name: "build8", position: "SG" }
    ];

    const friends = [
        { id: 1, name: "friend1", onlineID: "onlineID", builds: 6 },
        { id: 2, name: "friend2", onlineID: "onlineID", builds: 3 },
        { id: 3, name: "friend3", onlineID: "onlineID", builds: 4 },
        { id: 4, name: "friend4", onlineID: "onlineID", builds: 2 },
        { id: 5, name: "friend5", onlineID: "onlineID", builds: 1 }
    ];

    return (
        <Container fluid className="mt-3">
            {/* Profile heading */}
            <Row className="d-flex justify-content-center">
                <Col sm={12} md={11}>
                    <Card className="hero-card mb-4">
                        <div className="hero-glow hero-glow-top-right"></div>
                        <div className="hero-glow hero-glow-top-left"></div>

                        <Card.Body className="hero-content text-white">
                            <Row>
                                <Col xs={10} className="large-profile-header-custom-col">
                                    <h1 style={{ color: "rgba(255, 102, 0, 0.95)" }}>Username</h1>

                                    <p className="fw-light" style={{ color: "rgba(145, 148, 148, 1.0)" }}>Joined: 01 - 02 - 26</p>
                                </Col>

                                <Col xs={2} className="large-profile-header-custom-col">
                                    <Row className="justify-content-end align-items-start g-0">
                                        <Button variant="link" className="text-decoration-none p-0 w-auto" onClick={() => setActiveModal("editProfile")}>
                                            <span className="fw-light" style={{ color: "rgba(145, 148, 148, 1.0)" }}>Edit Profile</span>
                                        </Button>
                                    </Row>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="d-flex align-items-stretch justify-content-center">
                {/* List of users 'builds' */}
                <Col sm={12} md={6} xxl={5} className="d-flex flex-column">
                    <Card className="hero-card mb-4 flex-grow-1">
                        <div className="hero-glow hero-glow-top-right"></div>
                        <div className="hero-glow hero-glow-bottom-left"></div>

                        <Card.Body className="hero-content text-white flex-grow-1">
                            <Row>
                                <Col xs={6} className="large-profile-custom-col">
                                    <h1 style={{ color: "rgba(255, 102, 0, 0.95)" }}>Builds</h1>
                                </Col>

                                <Col xs={3} className="d-flex small-profile-custom-col">
                                    <Button variant="link" className="text-decoration-none d-flex align-items-center gap-2">
                                        <span className="fw-semibold" style={{ color: "rgba(145, 148, 148, 1.0)" }}>Edit </span>
                                        <BsPencilFill size={20} style={{ color: "rgba(255, 102, 0, 0.95)" }} />
                                    </Button>
                                </Col>

                                <Col xs={3} className="d-flex small-profile-custom-col">
                                    <Button variant="link" className="text-decoration-none d-flex align-items-center gap-2" onClick={() => setActiveModal("addBuild")}>
                                        <span className="fw-semibold" style={{ color: "rgba(145, 148, 148, 1.0)" }}>Add </span>
                                        <BsPlusCircleFill size={20} style={{ color: "rgba(255, 102, 0, 0.95)" }} />
                                    </Button>
                                </Col>
                            </Row>

                            <Table className="recent-games-table dashboard-tables" responsive >
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Position</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {builds.map((stat, index) => (
                                        <tr key={stat.id || index}>
                                            <td className="w-75">{stat.name}</td>
                                            <td className="w-25">{stat.position}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
                {/* List of users friends/teammates */}
                <Col sm={12} md={6} xxl={5} className="d-flex flex-column">
                    <Card className="hero-card mb-4 flex-grow-1">
                        <div className="hero-glow hero-glow-top-right"></div>
                        <div className="hero-glow hero-glow-bottom-left"></div>

                        <Card.Body className="hero-content text-white flex-grow-1">
                            <Row>
                                <Col xs={6} className="large-profile-custom-col">
                                    <h1 style={{ color: "rgba(255, 102, 0, 0.95)" }}>Friends</h1>
                                </Col>

                                <Col xs={3} className="d-flex small-profile-custom-col">
                                    <Button variant="link" className="text-decoration-none d-flex align-items-center gap-2">
                                        <span className="fw-semibold" style={{ color: "rgba(145, 148, 148, 1.0)" }}>Edit </span>
                                        <BsPencilFill size={20} style={{ color: "rgba(255, 102, 0, 0.95)" }} />
                                    </Button>
                                </Col>

                                <Col xs={3} className="d-flex small-profile-custom-col">
                                    <Button variant="link" className="text-decoration-none d-flex align-items-center gap-2" onClick={() => setActiveModal("addFriend")}>
                                        <span className="fw-semibold" style={{ color: "rgba(145, 148, 148, 1.0)" }}>Add </span>
                                        <BsPersonPlusFill size={24} style={{ color: "rgba(255, 102, 0, 0.95)" }} />
                                    </Button>
                                </Col>
                            </Row>

                            <Table className="recent-games-table dashboard-tables" responsive >
                                <colgroup>
                                    <col style={{ width: "40%" }} />
                                    <col style={{ width: "40%" }} />
                                    <col style={{ width: "20%" }} />
                                </colgroup>

                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>OnlineID</th>
                                        <th>Builds</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {friends.map((stat, index) => (
                                        <tr key={stat.id || index}>
                                            <td>{stat.name}</td>
                                            <td>{stat.onlineID}</td>
                                            <td>{stat.builds}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            {/* 'Popouts' from the proflile page*/}
            <Modal show={activeModal !== null} onHide={() => setActiveModal(null)} centered size="lg" >
                <Modal.Body className="boomers-hero-overlay d-flex">
                    {activeModal === "addFriend" && <AddFriend onClose={() => setActiveModal(null)} />}
                    {activeModal === "addBuild" && <AddBuild onClose={() => setActiveModal(null)} />}
                    {activeModal === "editProfile" && <EditProfile onClose={() => setActiveModal(null)} />}
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default Profile;