import { useEffect } from "react";
import { Col, Container, Row, Card, Table} from "react-bootstrap";

function DashboardHome() {

    // This will not be kept in the long term, these will be stored in python files most likely
    const teamStats = [
        { id: 1, title: "Games Tracked", value: 28 },
        { id: 2, title: "Team PPG", value: 89.5},
        { id: 3, title: "Team RPG", value: 36.2},
        { id: 4, title: "Team APG", value: 25.7 },
        { id: 5, title: "Team SPG", value: 6.3},
        { id: 6, title: "Team BPG", value: 3.4}
    ];

    const gameStats = [
        { id: 1, date: "1/1/26", build: 11, pointsFor: 11, pointsAgainst: 11, result: "W", points: 11, rebounds: 11, assists: 11, steals: 11, blocks: 11},
        { id: 2, date: "2/2/26", build: 22, pointsFor: 22, pointsAgainst: 22, result: "L", points: 22, rebounds: 22, assists: 22, steals: 22, blocks: 22},
        { id: 3, date: "3/3/26", build: 33, pointsFor: 33, pointsAgainst: 33, result: "W", points: 33, rebounds: 33, assists: 33, steals: 33, blocks: 33},
        { id: 4, date: "4/4/26", build: 44, pointsFor: 44, pointsAgainst: 44, result: "W", points: 4, rebounds: 44, assists: 44, steals: 44, blocks: 44},
        { id: 5, date: "5/5/26", build: 55, pointsFor: 55, pointsAgainst: 55, result: "W", points: 55, rebounds: 55, assists: 55, steals: 55, blocks: 55},
        { id: 6, date: "6/6/26", build: 66, pointsFor: 66, pointsAgainst: 66, result: "L", points: 66, rebounds: 66, assists: 66, steals: 66, blocks: 66},
        { id: 7, date: "7/7/26", build: 77, pointsFor: 77, pointsAgainst: 77, result: "L", points: 77, rebounds: 77, assists: 77, steals: 77, blocks: 77},
        { id: 8, date: "8/8/26", build: 88, pointsFor: 88, pointsAgainst: 88, result: "W", points: 88, rebounds: 88, assists: 88, steals: 88, blocks: 88},
        { id: 9, date: "9/9/26", build: 99, pointsFor: 99, pointsAgainst: 99, result: "W", points: 99, rebounds: 99, assists: 99, steals: 99, blocks: 99},
        { id: 10, date: "10/10/26", build: 100, pointsFor: 100, pointsAgainst: 100, result: "L", points: 100, rebounds: 100, assists: 100, steals: 100, blocks: 100}
    ];

    const friendStats = [
        { id: 1, name: "player1", ppg: 17.76, games: 410, winPercentage: 49.8},
        { id: 2, name: "player2", ppg: 16.38, games: 153, winPercentage: 46.4},
        { id: 3, name: "player3", ppg: 15.31, games: 299, winPercentage: 48.2},
        { id: 4, name: "player4", ppg: 20.12, games: 155, winPercentage: 51.3},
        { id: 5, name: "player5", ppg: 12.54, games: 73, winPercentage: 42.6},
        { id: 6, name: "player6", ppg: 7.83, games: 67, winPercentage: 50.3}
    ];

    useEffect(() => {
        document.title = "Hoop Stats - Dashboard";
    }, []);

    return (
        <Container fluid className="justify-content-center">            
            <Row className="d-flex align-items-stretch w-100 justify-content-center mx-0 max-height-row" >
                {/* Just username section */}
                <Col sm={12} md={6} xxl={5} className="mt-3 d-flex flex-column">
                    <Card className="hero-card w-100 flex-grow-1">
                        <div className="hero-glow hero-glow-bottom-right" aria-hidden="true"></div>
                        <div className="hero-glow hero-glow-top-left" aria-hidden="true"></div>

                        <Card.Body className="hero-content text-white rounded-4 w-100 flex-grow-1 p-3">
                            <Table className="dashboard-tables user-table" responsive>
                                <thead>
                                    <tr>
                                        <th colSpan={6}>
                                            <h1><span className="fw-normal" style={{ color: "rgba(145, 148, 148, 1.0)"}}>Quick stats: </span>Username</h1>
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr>
                                        <td colSpan={2}>
                                            <p className="mb-0" style={{textAlign: "left"}}>Wins</p>
                                            <h1 className="text-white">68</h1>
                                        </td>
                                        <td colSpan={2}>
                                            <p className="mb-0" style={{textAlign: "left"}}>Losses</p>
                                            <h1 className="text-white">55</h1>
                                        </td>
                                        <td colSpan={2}>
                                            <p className="mb-0" style={{textAlign: "left"}}>Win %</p>
                                            <h1 className="text-white">55.28</h1>
                                        </td>                                        
                                    </tr>

                                    <tr>
                                        <td colSpan={2}>
                                            <p className="mb-0" style={{textAlign: "left"}}>Double Doubles</p>
                                            <h1 className="text-white">30</h1>
                                        </td>
                                        <td colSpan={2}>
                                            <p className="mb-0" style={{textAlign: "left"}}>Triple Doubles</p>
                                            <h1 className="text-white">4</h1>
                                        </td>
                                        <td colSpan={2}>
                                            <p className="mb-0" style={{textAlign: "left"}}>Career High</p>
                                            <h1 className="text-white">45</h1>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td colSpan={2}>
                                            <p className="mb-0" style={{textAlign: "left"}}>PPG</p>
                                            <h1 className="text-white">14.63</h1>
                                        </td>
                                        <td colSpan={2}>
                                            <p className="mb-0" style={{textAlign: "left"}}>RPG</p>
                                            <h1 className="text-white">10.2</h1>
                                        </td>
                                        <td colSpan={2}>
                                            <p className="mb-0" style={{textAlign: "left"}}>APG</p>
                                            <h1 className="text-white">5.47</h1>
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
                {/* Just FRIENDS container */}
                <Col sm={12} md={6} xxl={5} className="mt-3 d-flex flex-column">
                    <Card className="hero-card w-100 flex-grow-1">
                        <div className="hero-glow hero-glow-bottom-right" aria-hidden="true"></div>
                        <div className="hero-glow hero-glow-top-left" aria-hidden="true"></div>

                        <Card.Body className="hero-content text-white rounded-4 w-100 flex-grow-1">
                            {/* Friends title */}
                            <h1 style={{ color: "rgba(255, 102, 0, 0.95)"}}>Friends</h1>
                            <p className="fw-light" style={{ color: "rgba(145, 148, 148, 1.0)"}}>Performance overview </p>
                            <Table className="recent-games-table dashboard-tables" responsive >
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>PPG</th>
                                        <th>Games</th>
                                        <th>W%</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {friendStats.map((stat, index) => (
                                        <tr key={stat.id || index}>
                                            <td>{stat.name}</td>
                                            <td>{stat.ppg}</td>
                                            <td>{stat.games}</td>
                                            <td><span className={stat.winPercentage > 50 ? "text-success" : "text-danger"}>{stat.winPercentage}</span></td>
                                        </tr>
                                    ))}  
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Team Stats */}
            <Row className="d-flex align-items-stretch pt-3 pb-3 justify-content-center dashed-border mt-3">
                {/* Team Stats Title */}
                <Row className="d-flex pt-3 pb-3 justify-content-center">
                    <Col xs={12} sm={8} xl={8} className="d-flex justify-content-center">
                        <div className="rounded flex-fill p-1 d-flex">
                            <Card className="hero-card w-100 h-100">
                                <div className="hero-glow hero-glow-top-right" aria-hidden="true"></div>
                                <div className="hero-glow hero-glow-bottom-left" aria-hidden="true"></div>

                                <Card.Body className="hero-content text-white w-100 h-100 p-3 d-flex flex-column">
                                    <h1 style={{ color: "rgba(255, 102, 0, 0.95)"}}>Team Insights</h1>
                                    <p className="fw-light" style={{ color: "rgba(145, 148, 148, 1.0)"}}>Total games submitted and averages for five key categories</p>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>               
                </Row>
                {/* Team Stats Data */}
                {teamStats.map((stat) => (
                    <Col xs={12} sm={4} xl={2} key={stat.id} className="d-flex align-items-stretch justify-content-center">
                        <div className="rounded flex-fill p-1 d-flex">
                            <Card className="hero-card w-100 h-100">
                                <div className="hero-glow hero-glow-top-right" aria-hidden="true"></div>
                                <div className="hero-glow hero-glow-bottom-left" aria-hidden="true"></div>

                                <Card.Body className="hero-content text-white w-100 h-100 p-3 d-flex flex-column">
                                    <p className="mb-1" style={{ color: "rgba(145, 148, 148, 1.0)", textAlign: "left" }}>{stat.title}</p>

                                    <div className="flex-grow-1 d-flex justify-content-center align-items-center">
                                        <h2 className="mb-0 text-white" style={{ color: "rgba(145, 148, 148, 1.0)" }} > {stat.value}</h2>
                                    </div>
                                </Card.Body>
                            </Card> 
                        </div>
                    </Col>
                ))}
            </Row>

            {/* Recent Games */}
            <Col className="rounded w-100 p-3 d-flex justify-content-center">
                <Card className="hero-card w-100 flex-grow-1">
                    <div className="hero-glow hero-glow-bottom-right" aria-hidden="true"></div>
                    <div className="hero-glow hero-glow-top-left" aria-hidden="true"></div>

                    <Card.Body className="hero-content text-white rounded-4 w-100 flex-grow-1 p-3">
                        <h1 style={{ color: "rgba(255, 102, 0, 0.95)"}}>Recent Games</h1>
                        <p className="fw-light" style={{ color: "rgba(145, 148, 148, 1.0)"}}>Game and Box Score summaries of your most recent games </p>

                        <Table className="recent-games-table dashboard-tables" responsive >
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Build</th>
                                    <th>PF</th>
                                    <th>PA</th>
                                    <th>W/L</th>
                                    <th>PTS</th>
                                    <th>REB</th>
                                    <th>AST</th>
                                    <th>STL</th>
                                    <th>BLK</th>
                                </tr>
                            </thead>

                            <tbody>
                                {gameStats.map((stat, index) => (
                                    <tr key={stat.id || index}>
                                        <td>{stat.date}</td>
                                        <td>{stat.build}</td>
                                        <td>{stat.pointsFor}</td>
                                        <td>{stat.pointsAgainst}</td>
                                        <td><span className={stat.result === "W" ? "text-success" : "text-danger"}>{stat.result}</span></td>
                                        <td>{stat.points}</td>
                                        <td>{stat.rebounds}</td>
                                        <td>{stat.assists}</td>
                                        <td>{stat.steals}</td>
                                        <td>{stat.blocks}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </Col>  
        </Container>
    );
}

export default DashboardHome;