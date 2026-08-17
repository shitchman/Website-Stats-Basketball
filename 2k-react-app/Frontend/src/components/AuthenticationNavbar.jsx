import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";

function BaseAuthentication({children, setCurrentPage}) {
  return (
    <div>
        <Navbar expand="xxs" sticky="top" variant="dark" bg="success">
            <Container fluid>
                <Navbar.Brand className="me-auto" href="#" onClick={() => setCurrentPage('home')}>Hoop Stats</Navbar.Brand>
                <Nav className="ms-auto">
                    {/* ONLY FOR LARGE SCREENS */}
                    <div className="d-none d-sm-flex gap-3">
                         <Nav.Link href="#" className="text-white" onClick={() => setCurrentPage('home')}>Home</Nav.Link>
                         <Nav.Link href="#" className="text-white" onClick={() => setCurrentPage('login')}>Login</Nav.Link>
                         <Nav.Link href="#" className="text-white" onClick={() => setCurrentPage('register')}>Register</Nav.Link>
                    </div>
                    {/* SMALL SCREENS ONLY */}
                    <div className="d-sm-none" style={{ position: 'relative' }}>
                        <style>{`
                            .auth-nav-dropdown .dropdown-menu {
                                position: absolute !important;
                                top: calc(100% + 0.25rem) !important;
                                right: 0 !important;
                                left: auto !important;
                                z-index: 2000 !important;
                                min-width: 5rem !important;
                            }
                        `}</style>
                        <NavDropdown
                            title={<span style={{ color: 'white' }}>Menu</span>}
                            align="end"
                            className="auth-nav-dropdown"
                        >
                            <NavDropdown.Item href="#"  onClick={() => setCurrentPage('home')}>Home</NavDropdown.Item>
                            <NavDropdown.Item href="#" onClick={() => setCurrentPage('login')}>Login</NavDropdown.Item>
                            <NavDropdown.Item href="#" onClick={() => setCurrentPage('register')}>Register</NavDropdown.Item>
                        </NavDropdown>
                    </div>
                </Nav>
            </Container>
        </Navbar>

            <div className="mills-hero-overlay d-flex">
                <Container fluid className="mt-4">
                    {children}
                </Container>  
            </div>
    </div>
  );
}

export default BaseAuthentication;