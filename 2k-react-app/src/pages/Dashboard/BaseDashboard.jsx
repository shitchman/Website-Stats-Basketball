import { useEffect } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { BsList, BsPersonCircle } from "react-icons/bs";

function BaseDashboard({ children, setCurrentPage }) {

    useEffect(() => {
        document.title = "Hoop Stats - Dashboard";
    }, []);

    return (
        <>
            <Navbar expand="xxs" sticky="top" variant="dark" bg="dark" className="align-items-center">
                <Container fluid className="align-items-center">
                    <Nav className="align-items-center">
                        <NavDropdown id="dashboard-dropdown" className="dashboard-dropdown" title={<BsList size={28} color="white" />} align="start">
                            <NavDropdown.Item href="#" onClick={() => setCurrentPage('dashboardHome')}>
                                Dashboard
                            </NavDropdown.Item>
                            <NavDropdown.Item href="#" onClick={() => setCurrentPage('addGames')}>
                                Add Games
                            </NavDropdown.Item>
                            <NavDropdown.Item href="#" onClick={() => setCurrentPage('stats')}>
                                Stats
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>

                    <Navbar.Brand className="me-auto" href="#" onClick={() => setCurrentPage('dashboardHome')}>
                        Hoop Stats
                    </Navbar.Brand>

                    <Nav className="ms-auto align-items-center">
                        <Nav.Link href="#" className="text-white" onClick={() => setCurrentPage("profile") }>
                            <BsPersonCircle size={28} color="white" />
                        </Nav.Link>
                    </Nav>
                </Container>
            </Navbar>

            <div className="container-fluid dashboard-root text-white">
                {children}
            </div>
        </>
    );
}

export default BaseDashboard;