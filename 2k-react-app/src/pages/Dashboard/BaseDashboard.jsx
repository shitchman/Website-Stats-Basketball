import { useEffect } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { BsList, BsPersonCircle } from "react-icons/bs";

function BaseDashboard({ children, setCurrentPage, currentPage }) {

    const getPageLabel = (key) => {
        switch (key) {
            case 'dashboardHome': return 'Dashboard';
            case 'addGames': return 'Add Games';
            case 'stats': return 'Stats';
            case 'profile': return 'Profile';
            default: return 'Dashboard';
        }
    };

    useEffect(() => {
        document.title = `Hoop Stats - ${getPageLabel(currentPage)}`;
    }, [currentPage]);

    return (
        <>
            <Navbar expand="xxs" sticky="top" variant="dark" bg="dark" className="align-items-center">
                <Container fluid className="align-items-center position-relative">
                    <div className="d-flex align-items-center">
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

                        <Navbar.Text className="ms-2 text-white d-none d-sm-block">
                            {getPageLabel(currentPage)}
                        </Navbar.Text>
                    </div>

                    <Navbar.Brand className="position-absolute start-50 translate-middle-x text-center" href="#" onClick={() => setCurrentPage('dashboardHome')}>
                        Hoop Stats
                    </Navbar.Brand>

                    <Nav className="ms-auto align-items-center">
                        <Nav.Link href="#" className="text-white" onClick={() => setCurrentPage("profile") }>
                            <BsPersonCircle size={28} color="white" />
                        </Nav.Link>
                    </Nav>
                </Container>
            </Navbar>

            <div className="crowd-hero-overlay d-flex">
                <Container fluid>
                    {children}
                </Container>  
            </div>
        </>
    );
}

export default BaseDashboard;