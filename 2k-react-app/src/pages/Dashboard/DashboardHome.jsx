import { useEffect } from "react";
import { Col, Container, Row, Card} from "react-bootstrap";

function DashboardHome() {

    // This will not be kept in the long term
    const playerStats = [
    { id: 1, title: "Games Tracked", value: 28 },
    { id: 2, title: "Team PPG", value: 12},
    { id: 3, title: "Team RPG", value: 28},
    { id: 4, title: "Team APG", value: 28 },
    { id: 5, title: "Team SPG", value: 12},
    { id: 6, title: "Team BPG", value: 28}
];

    useEffect(() => {
        document.title = "Hoop Stats - Dashboard";
    }, []);

    return (
        <Container fluid className="pb-3">
            <Row className="d-flex align-items-stretch">
                {/* Just username section */}
                <Col md={6} className="mt-3 d-flex">

                    <Card className="hero-card w-100 h-100">
                        <div className="hero-glow hero-glow-bottom-right" aria-hidden="true"></div>
                        <div className="hero-glow hero-glow-top-left" aria-hidden="true"></div>

                        <Card.Body className="hero-content text-white rounded-4 w-100 h-100 p-3">
                                <Row>
                                    <h1>TheEvasiveSloth</h1>
                                </Row>
                                <Row>
                                    <Col>
                                        <p>Wins</p>
                                        <h5>68</h5>
                                    </Col>
                                    <Col>
                                        <p>Loses</p>
                                        <h5>55</h5>
                                    </Col>
                                    <Col>
                                        <p>Win %</p>
                                        <h5>55.28%</h5>
                                </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <p>Career High Points</p>
                                        <h5>36</h5>
                                    </Col>
                                    <Col>
                                        <p>PPG</p>
                                        <h5>14.63</h5>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <p>Triple Doubles</p>
                                        <h5>4</h5>
                                    </Col>
                                    <Col>
                                        <p>Double Doubles</p>
                                        <h5>30</h5>
                                </Col>
                                </Row>
                            {/* </div> */}
                        </Card.Body>
                    </Card>
                </Col>
                {/* Just FRIENDS container */}
                <Col md={6} className="mt-3 d-flex">

                    <Card className="hero-card w-100 h-100">
                        <div className="hero-glow hero-glow-bottom-right" aria-hidden="true"></div>
                        <div className="hero-glow hero-glow-top-left" aria-hidden="true"></div>

                        <Card.Body className="hero-content text-white rounded-4 w-100 h-100 p-3">
                            <Row>
                                <Col>
                                    <h1>Friends</h1>
                                </Col>
                                <Col>
                                    <h1>PPG</h1>
                                </Col>
                                <Col>
                                    <h1>Win %</h1>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <h1>Joel</h1>
                                </Col>
                                <Col>
                                    <h1>20.27</h1>
                                </Col>
                                <Col>
                                    <h1>71.3%</h1>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <h1>Dominic</h1>
                                </Col>
                                <Col>
                                    <h1>13.62</h1>
                                </Col>
                                <Col>
                                    <h1>58.3%</h1>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <h1>Tom</h1>
                                </Col>
                                <Col>
                                    <h1>17.89</h1>
                                </Col>
                                <Col>
                                    <h1>78.3%</h1>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <h1>Noah</h1>
                                </Col>
                                <Col>
                                    <h1>16.38</h1>
                                </Col>
                                <Col>
                                    <h1>52.7%</h1>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <h1>Caleb</h1>
                                </Col>
                                <Col>
                                    <h1>12.73</h1>
                                </Col>
                                <Col>
                                    <h1>38.94%</h1>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Team Stats */}
            <Row className="d-flex align-items-stretch pt-3 pb-3">
                {playerStats.map((stat) => (
                    <Col xs={4} md={2} key={stat.id} className="mb-3">
                        <div className="bg-dark rounded h-100 p-1">
                            <p className="mb-1">{stat.title}</p>
                            <h2 className="mb-0">{stat.value}</h2>
                        </div>
                    </Col>
                ))}
            </Row>

            {/* Recent Games */}
            <Col className="bg-dark rounded w-100 p-3">
                {/* Headings */}
                <Row>
                    <Col>
                        Date
                    </Col>
                    <Col>
                        Build
                    </Col>
                    <Col>
                        PF
                    </Col>
                    <Col>
                        PA
                    </Col>
                    <Col>
                        Result
                    </Col>
                    <Col>
                        PTS
                    </Col>
                    <Col>
                        REB
                    </Col>
                    <Col>
                        AST
                    </Col>
                    <Col>
                        STL
                    </Col>
                    <Col>
                        BLK
                    </Col>
                </Row>
                {/* Game 1 */}
                <Row>
                    <Col>
                        Date
                    </Col>
                    <Col>
                        Build
                    </Col>
                    <Col>
                        PF
                    </Col>
                    <Col>
                        PA
                    </Col>
                    <Col>
                        Result
                    </Col>
                    <Col>
                        PTS
                    </Col>
                    <Col>
                        REB
                    </Col>
                    <Col>
                        AST
                    </Col>
                    <Col>
                        STL
                    </Col>
                    <Col>
                        BLK
                    </Col>
                </Row>
                {/* Game 2 */}
                <Row>
                    <Col>
                        Date
                    </Col>
                    <Col>
                        Build
                    </Col>
                    <Col>
                        PF
                    </Col>
                    <Col>
                        PA
                    </Col>
                    <Col>
                        Result
                    </Col>
                    <Col>
                        PTS
                    </Col>
                    <Col>
                        REB
                    </Col>
                    <Col>
                        AST
                    </Col>
                    <Col>
                        STL
                    </Col>
                    <Col>
                        BLK
                    </Col>
                </Row>
                {/* Game 3 */}
                <Row>
                    <Col>
                        Date
                    </Col>
                    <Col>
                        Build
                    </Col>
                    <Col>
                        PF
                    </Col>
                    <Col>
                        PA
                    </Col>
                    <Col>
                        Result
                    </Col>
                    <Col>
                        PTS
                    </Col>
                    <Col>
                        REB
                    </Col>
                    <Col>
                        AST
                    </Col>
                    <Col>
                        STL
                    </Col>
                    <Col>
                        BLK
                    </Col>
                </Row>
                {/* Game 4 */}
                <Row>
                    <Col>
                        Date
                    </Col>
                    <Col>
                        Build
                    </Col>
                    <Col>
                        PF
                    </Col>
                    <Col>
                        PA
                    </Col>
                    <Col>
                        Result
                    </Col>
                    <Col>
                        PTS
                    </Col>
                    <Col>
                        REB
                    </Col>
                    <Col>
                        AST
                    </Col>
                    <Col>
                        STL
                    </Col>
                    <Col>
                        BLK
                    </Col>
                </Row>
                {/* Game 5 */}
                <Row>
                    <Col>
                        Date
                    </Col>
                    <Col>
                        Build
                    </Col>
                    <Col>
                        PF
                    </Col>
                    <Col>
                        PA
                    </Col>
                    <Col>
                        Result
                    </Col>
                    <Col>
                        PTS
                    </Col>
                    <Col>
                        REB
                    </Col>
                    <Col>
                        AST
                    </Col>
                    <Col>
                        STL
                    </Col>
                    <Col>
                        BLK
                    </Col>
                </Row>
                {/* Game 6 */}
                <Row>
                    <Col>
                        Date
                    </Col>
                    <Col>
                        Build
                    </Col>
                    <Col>
                        PF
                    </Col>
                    <Col>
                        PA
                    </Col>
                    <Col>
                        Result
                    </Col>
                    <Col>
                        PTS
                    </Col>
                    <Col>
                        REB
                    </Col>
                    <Col>
                        AST
                    </Col>
                    <Col>
                        STL
                    </Col>
                    <Col>
                        BLK
                    </Col>
                </Row>
                {/* Game 7 */}
                <Row>
                    <Col>
                        Date
                    </Col>
                    <Col>
                        Build
                    </Col>
                    <Col>
                        PF
                    </Col>
                    <Col>
                        PA
                    </Col>
                    <Col>
                        Result
                    </Col>
                    <Col>
                        PTS
                    </Col>
                    <Col>
                        REB
                    </Col>
                    <Col>
                        AST
                    </Col>
                    <Col>
                        STL
                    </Col>
                    <Col>
                        BLK
                    </Col>
                </Row>
                {/* Game 8 */}
                <Row>
                    <Col>
                        Date
                    </Col>
                    <Col>
                        Build
                    </Col>
                    <Col>
                        PF
                    </Col>
                    <Col>
                        PA
                    </Col>
                    <Col>
                        Result
                    </Col>
                    <Col>
                        PTS
                    </Col>
                    <Col>
                        REB
                    </Col>
                    <Col>
                        AST
                    </Col>
                    <Col>
                        STL
                    </Col>
                    <Col>
                        BLK
                    </Col>
                </Row>
                {/* Game 9 */}
                <Row>
                    <Col>
                        Date
                    </Col>
                    <Col>
                        Build
                    </Col>
                    <Col>
                        PF
                    </Col>
                    <Col>
                        PA
                    </Col>
                    <Col>
                        Result
                    </Col>
                    <Col>
                        PTS
                    </Col>
                    <Col>
                        REB
                    </Col>
                    <Col>
                        AST
                    </Col>
                    <Col>
                        STL
                    </Col>
                    <Col>
                        BLK
                    </Col>
                </Row>
                {/* Game 10 */}
                <Row>
                    <Col>
                        Date
                    </Col>
                    <Col>
                        Build
                    </Col>
                    <Col>
                        PF
                    </Col>
                    <Col>
                        PA
                    </Col>
                    <Col>
                        Result
                    </Col>
                    <Col>
                        PTS
                    </Col>
                    <Col>
                        REB
                    </Col>
                    <Col>
                        AST
                    </Col>
                    <Col>
                        STL
                    </Col>
                    <Col>
                        BLK
                    </Col>
                </Row>
                
            </Col>  
        </Container>
    );
}

export default DashboardHome;