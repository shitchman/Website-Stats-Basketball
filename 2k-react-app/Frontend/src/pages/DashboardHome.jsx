import React, { useEffect, useState } from "react";
import { Col, Container, Row, Card, Table, Dropdown } from "react-bootstrap";
import { apiFetch } from "../../api.js";
import { GAME_MODES } from "../constants/gameModes";


function DashboardHome({ user }) {

   const [games, setGames] = useState([]);
   const [selectedGameMode, setSelectedGameMode] = useState(1); // Rec Center

   useEffect(() => {
      const loadGames = async () => {
         const response = await apiFetch("/games/myGames");

         if (response.ok) {
            setGames(await response.json());
         }
      };

      loadGames();
   }, []);


   const selectedGames = games.filter((game) => game.game_mode_id === selectedGameMode && game.user_statline);
   const playedGameModes = GAME_MODES.filter((mode) => games.some((game) => game.game_mode_id === mode.id));

   const displayedGameMode = playedGameModes.find((mode) => mode.id === selectedGameMode) ?? playedGameModes[0];

   const totalWins = selectedGames.filter((game) => game.result === "W").length;
   const totalLosses = selectedGames.filter((game) => game.result === "L").length;
   const winPercentage = selectedGames.length > 0 ? ((totalWins / selectedGames.length) * 100).toFixed(2) : "0.00";

   const qualifyingStatCount = (statline) =>
      [
         statline.points,
         statline.rebounds,
         statline.assists,
         statline.steals,
         statline.blocks,
      ].filter((stat) => stat >= 10).length;

   const doubleDoubles = selectedGames.filter((game) => qualifyingStatCount(game.user_statline) === 2).length;
   const tripleDoublesPlus = selectedGames.filter((game) => qualifyingStatCount(game.user_statline) >= 3).length;
   const careerHighPoints = Math.max(0, ...selectedGames.map((game) => game.user_statline.points));

   const averageStat = (statName) =>
      selectedGames.length > 0
         ? (
            selectedGames.reduce(
               (total, game) => total + game.user_statline[statName],
               0
            ) / selectedGames.length
         ).toFixed(2)
         : "0.00";

   const pointsPerGame = averageStat("points");
   const reboundsPerGame = averageStat("rebounds");
   const assistsPerGame = averageStat("assists");

   // This will not be kept in the long term, these will be stored in python files most likely
   // Filter for selected game mode games that contain a team_statline
   const teamStats = selectedGames.filter((game) => game.team_statline);

   const averageTeamStat = (statName) =>
      teamStats.length > 0
         ? (
            teamStats.reduce(
               (total, game) => total + (game.team_statline[statName] || 0),
               0
            ) / teamStats.length
         ).toFixed(1)
         : "0.0";

   const teamStatsData = [
      { id: 1, title: "Games Tracked", value: teamStats.length },
      { id: 2, title: "Team PPG", value: averageTeamStat("points") },
      { id: 3, title: "Team RPG", value: averageTeamStat("rebounds") },
      { id: 4, title: "Team APG", value: averageTeamStat("assists") },
      { id: 5, title: "Team SPG", value: averageTeamStat("steals") },
      { id: 6, title: "Team BPG", value: averageTeamStat("blocks") },
   ];

   // Get the 10 most recent games for the selected game mode
   const recentGames = selectedGames.slice(0, 10);

   // Friends Containter data
   const [friendStats, setFriendStats] = useState([]);

   useEffect(() => {
      const loadFriendStats = async () => {
         if (!selectedGameMode) return;

         const response = await apiFetch(`/friends/friendDashboardStats?game_mode_id=${selectedGameMode}`);
         if (response.ok) {
            setFriendStats(await response.json());
         } else {
            setFriendStats([]);
         }
      };
      loadFriendStats();
   }, [selectedGameMode]);

   const sortedFriendStats = [...friendStats].sort((a, b) => {
      if (b.games_played !== a.games_played) {
         return b.games_played - a.games_played;
      }
      return b.ppg - a.ppg; // tie-breaker: higher PPG
   });



   // Document title
   useEffect(() => {
      document.title = "Hoop Stats - Dashboard";
   }, []);



   return (
      <Container fluid className="justify-content-center">
         <Row className="d-flex align-items-stretch w-100 justify-content-center mx-0 max-height-row" >
            {/* Dashboard Game mode header */}
            <Row className="d-flex pt-3 pb-3 justify-content-center">
               <Col xs={12} sm={8} xl={8} className="d-flex justify-content-center">
                  <div className="rounded flex-fill p-1 d-flex">
                     <Card className="hero-card game-mode-card w-100 h-100">
                        <div className="hero-glow-clip" aria-hidden="true">
                           <div className="hero-glow hero-glow-top-right"></div>
                           <div className="hero-glow hero-glow-bottom-left"></div>
                        </div>

                        <Card.Body className="hero-content text-white w-100 h-100 p-3 d-flex flex-column">
                           <span>
                              <h1 className="fw-normal" style={{ color: "rgba(145, 148, 148, 1.0)" }}>
                                 Game Mode: {" "}
                                 <Dropdown as="span" className="game-mode-dropdown">
                                    <Dropdown.Toggle as="span" className="fw-semibold p-0 border-0" style={{ color: "rgba(255, 102, 0, 0.95)", cursor: "pointer" }}>
                                       {displayedGameMode?.mode_name ?? "No games played"}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                       {playedGameModes.map((mode) => (
                                          <Dropdown.Item
                                             key={mode.id}
                                             active={mode.id === displayedGameMode?.id}
                                             onClick={() => setSelectedGameMode(mode.id)}
                                          >
                                             {mode.mode_name}
                                          </Dropdown.Item>
                                       ))}
                                    </Dropdown.Menu>
                                 </Dropdown>
                              </h1>
                           </span>

                        </Card.Body>
                     </Card>
                  </div>
               </Col>
            </Row>
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
                                 <h1><span className="fw-normal" style={{ color: "rgba(145, 148, 148, 1.0)" }}>Quick stats: </span>{user?.username ?? "Loading..."}</h1>
                              </th>
                           </tr>
                        </thead>

                        <tbody>
                           <tr>
                              <td colSpan={2}>
                                 <p className="mb-0" style={{ textAlign: "left" }}>Wins</p>
                                 <h1 className="text-white">{totalWins}</h1>
                              </td>
                              <td colSpan={2}>
                                 <p className="mb-0" style={{ textAlign: "left" }}>Losses</p>
                                 <h1 className="text-white">{totalLosses}</h1>
                              </td>
                              <td colSpan={2}>
                                 <p className="mb-0" style={{ textAlign: "left" }}>Win %</p>
                                 <h1 className="text-white">{winPercentage}</h1>
                              </td>
                           </tr>

                           <tr>
                              <td colSpan={2}>
                                 <p className="mb-0" style={{ textAlign: "left" }}>Double Doubles</p>
                                 <h1 className="text-white">{doubleDoubles}</h1>
                              </td>
                              <td colSpan={2}>
                                 <p className="mb-0" style={{ textAlign: "left" }}>Triple Doubles</p>
                                 <h1 className="text-white">{tripleDoublesPlus}</h1>
                              </td>
                              <td colSpan={2}>
                                 <p className="mb-0" style={{ textAlign: "left" }}>Career High</p>
                                 <h1 className="text-white">{careerHighPoints}</h1>
                              </td>
                           </tr>

                           <tr>
                              <td colSpan={2}>
                                 <p className="mb-0" style={{ textAlign: "left" }}>PPG</p>
                                 <h1 className="text-white">{pointsPerGame}</h1>
                              </td>
                              <td colSpan={2}>
                                 <p className="mb-0" style={{ textAlign: "left" }}>RPG</p>
                                 <h1 className="text-white">{reboundsPerGame}</h1>
                              </td>
                              <td colSpan={2}>
                                 <p className="mb-0" style={{ textAlign: "left" }}>APG</p>
                                 <h1 className="text-white">{assistsPerGame}</h1>
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

                     <Row>
                        <Col>
                           <h1 className="fw-semibold" style={{ color: "rgba(255, 102, 0, 0.95)" }}>Friends</h1>

                        </Col>
                     </Row>
                     <p className="fw-light" style={{ color: "rgba(145, 148, 148, 1.0)" }}>Performance overview </p>

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
                           {friendStats.length > 0 ? (
                              sortedFriendStats.map((stat) => (
                                 <tr key={stat.id}>
                                    <td>{stat.name}</td>
                                    <td>{Number(stat.ppg).toFixed(2)}</td>
                                    <td>{stat.games_played}</td>
                                    <td>
                                       <span className={stat.win_percentage >= 50 ? "text-success" : "text-danger"}>
                                          {Number(stat.win_percentage).toFixed(1)}%
                                       </span>
                                    </td>
                                 </tr>
                              ))
                           ) : (
                              <tr>
                                 <td colSpan={4} className="text-center text-muted py-3">
                                    No friend games found for this game mode
                                 </td>
                              </tr>
                           )}
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
                           <h1 style={{ color: "rgba(255, 102, 0, 0.95)" }}>Team Insights</h1>
                           <p className="fw-light" style={{ color: "rgba(145, 148, 148, 1.0)" }}>Total games submitted and averages for five key categories</p>
                        </Card.Body>
                     </Card>
                  </div>
               </Col>
            </Row>
            {/* Team Stats Data */}
            {teamStatsData.map((stat) => (
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
                  <h1 style={{ color: "rgba(255, 102, 0, 0.95)" }}>Recent Games</h1>
                  <p className="fw-light" style={{ color: "rgba(145, 148, 148, 1.0)" }}>Game and Box Score summaries of your most recent games </p>

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
                        {recentGames.length > 0 ? (
                           recentGames.map((game) => (
                              <tr key={game.id}>
                                 <td>{new Date(game.date_time).toLocaleDateString()}</td>
                                 <td>{game.build_name ?? "—"}</td>
                                 <td>{game.points_for}</td>
                                 <td>{game.points_against}</td>
                                 <td>
                                    <span className={game.result === "W" ? "text-success" : "text-danger"}>
                                       {game.result}
                                    </span>
                                 </td>
                                 <td>{game.user_statline?.points ?? 0}</td>
                                 <td>{game.user_statline?.rebounds ?? 0}</td>
                                 <td>{game.user_statline?.assists ?? 0}</td>
                                 <td>{game.user_statline?.steals ?? 0}</td>
                                 <td>{game.user_statline?.blocks ?? 0}</td>
                              </tr>
                           )) 
                        ) : (
                           <tr>
                              <td colSpan={10} className="text-center text-muted py-3">
                                 No games found for this game mode
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </Table>
               </Card.Body>
            </Card>
         </Col>
      </Container>
   );
}

export default DashboardHome;