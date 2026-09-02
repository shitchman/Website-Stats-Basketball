import { Button, Card, Col, Container, Form, Modal, Row, Spinner, Table } from "react-bootstrap";
import { GAME_MODE_NAMES } from "../constants/gameModes";
import { BsFillTrash3Fill } from "react-icons/bs";
import { useEffect, useState } from "react";
import { apiFetch } from "../../api";
import Select from "react-select";


const DATE_DAYS = Array.from({ length: 31 }, (_, index) => index + 1);
const DATE_MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);
const DATE_YEARS = Array.from({ length: 2 }, (_, index) => 2026 + index);
const EMPTY_DATE = { day: "", month: "", year: "" };
const getDefaultDate = () => {
   const today = new Date();
   const year = today.getFullYear();
   if (!DATE_YEARS.includes(year)) {
      return EMPTY_DATE;
   }
   return { day: today.getDate(), month: today.getMonth() + 1, year };
};
const dateSelectStyles = {
   control: (base, state) => ({ ...base, minHeight: "38px", backgroundColor: "#000", borderColor: state.isFocused ? "#ff6600" : "#555", boxShadow: state.isFocused ? "0 0 0 1px #ff6600" : "none", "&:hover": { borderColor: "#ff6600" } }),
   menu: (base) => ({ ...base, backgroundColor: "#000", border: "1px solid #ff6600" }),
   menuPortal: (base) => ({ ...base, zIndex: 9999 }),
   option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? "#ff6600" : "#000", color: state.isFocused ? "#000" : "#ff6600", "&:active": { backgroundColor: "#ff6600" } }),
   singleValue: (base) => ({ ...base, color: "#ff6600" }),
   placeholder: (base) => ({ ...base, color: "rgba(145, 148, 148, 1)" }),
   dropdownIndicator: (base) => ({ ...base, color: "#ff6600", "&:hover": { color: "#ff6600" } }),
};


function DeleteGame({ show, onClose, onGameDeleted }) {

   const [date, setDate] = useState(EMPTY_DATE);
   const [games, setGames] = useState([]);
   const [isLoadingGames, setIsLoadingGames] = useState(false);
   const [deletingGameId, setDeletingGameId] = useState(null);
   const [error, setError] = useState("");

   const selectedDate = date.day && date.month && date.year
      ? `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`
      : "";

   const handleDatePartChange = (part, value) => {
      setDate((previous) => ({ ...previous, [part]: value }));
   };

   useEffect(() => {
      if (!show) {
         setDate(getDefaultDate());
         setGames([]);
         setIsLoadingGames(false);
         setDeletingGameId(null);
         setError("");
      }
   }, [show]);

   // Games are filtered client side because the date is only usable once all three parts are chosen
   useEffect(() => {
      if (!show || !selectedDate) {
         setGames([]);
         return;
      }

      let cancelled = false;

      const loadGames = async () => {
         setIsLoadingGames(true);
         setError("");

         try {
            const response = await apiFetch("/games/myGames");
            if (!response.ok) {
               throw new Error("Could not load games.");
            }

            const data = await response.json();
            if (!cancelled) {
               setGames(data.filter((game) => String(game.date_time).slice(0, 10) === selectedDate));
            }
         } catch (loadError) {
            if (!cancelled) {
               setGames([]);
               setError("Could not load your games. Please try again.");
               console.error("Could not load games:", loadError);
            }
         } finally {
            if (!cancelled) {
               setIsLoadingGames(false);
            }
         }
      };

      loadGames();

      return () => {
         cancelled = true;
      };
   }, [show, selectedDate]);

   const handleDelete = async (gameId) => {
      setDeletingGameId(gameId);
      setError("");

      try {
         const response = await apiFetch(`/games/deleteGame/${gameId}`, { method: "DELETE" });
         if (!response.ok) {
            throw new Error("Delete failed.");
         }

         setGames((previous) => previous.filter((game) => game.id !== gameId));
         onGameDeleted?.(gameId);
      } catch (deleteError) {
         setError("Could not delete that game. Please try again.");
         console.error("Could not delete game:", deleteError);
      } finally {
         setDeletingGameId(null);
      }
   };

   return (
      <Modal show={show} onHide={onClose} centered size="lg">

         <Modal.Body className="boomers-hero-overlay d-flex">
            <Container>
               {/* Header */}
               <Row>
                  <Card className="hero-card mb-4">
                     <div className="hero-glow hero-glow-top-right"></div>
                     <div className="hero-glow hero-glow-top-left"></div>

                     <Card.Body className="hero-content text-white">
                        <h1 className="justify-content-center" style={{ color: "rgba(255, 102, 0, 0.95)" }}>DELETE GAME</h1>

                        <p className="fw-light">WARNING: This action cannot be undone.<br></br> Select the date the game took place and then delete the specifc game from the list below</p>

                        <Row className="g-3">
                           <Form.Group as={Col} md={6} controlId="gameDate">
                                       <Form.Label>Date</Form.Label>
                                       <div className="date-select-group">
                                          <Select className="date-select" styles={dateSelectStyles} menuPortalTarget={document.body}menuPosition="fixed" value={date.day ? { value: date.day, label: date.day } : null} onChange={(option) => handleDatePartChange("day", option?.value ?? "")} options={DATE_DAYS.map((day) => ({ value: day, label: day }))} placeholder="Day" maxMenuHeight={152} aria-label="Day" />
                                          <Select className="date-select" styles={dateSelectStyles} menuPortalTarget={document.body}menuPosition="fixed" value={date.month ? { value: date.month, label: date.month } : null} onChange={(option) => handleDatePartChange("month", option?.value ?? "")} options={DATE_MONTHS.map((month) => ({ value: month, label: month }))} placeholder="Month" maxMenuHeight={152} aria-label="Month" />
                                          <Select className="date-select" styles={dateSelectStyles} menuPortalTarget={document.body}menuPosition="fixed" value={date.year ? { value: date.year, label: date.year } : null} onChange={(option) => handleDatePartChange("year", option?.value ?? "")} options={DATE_YEARS.map((year) => ({ value: year, label: year }))} placeholder="Year" maxMenuHeight={152} aria-label="Year" />
                                       </div>
                                       {selectedDate && <Form.Text className="date-selection-preview">Selected: {selectedDate}</Form.Text>}
                                    </Form.Group>
                        </Row>
                     </Card.Body>
                  </Card>
               </Row>

               {/* Games saved on the selected date */}
               <Row>
                  <Card className="hero-card mb-4">
                     <div className="hero-glow hero-glow-top-right"></div>
                     <div className="hero-glow hero-glow-top-left"></div>

                     <Card.Body className="hero-content text-white">
                        {error && <p style={{ color: "#ff8a80" }}>{error}</p>}

                        {!selectedDate && (
                           <p className="fw-light mb-0" style={{ color: "rgba(145, 148, 148, 1.0)" }}>
                              Choose a day, month and year to see the games saved for that date.
                           </p>
                        )}

                        {selectedDate && isLoadingGames && (
                           <div className="d-flex align-items-center gap-2">
                              <Spinner animation="border" variant="warning" size="sm" />
                              <span className="fw-light">Loading games...</span>
                           </div>
                        )}

                        {selectedDate && !isLoadingGames && !error && games.length === 0 && (
                           <p className="fw-light mb-0" style={{ color: "rgba(145, 148, 148, 1.0)" }}>
                              No games were saved on {selectedDate}.
                           </p>
                        )}

                        {selectedDate && !isLoadingGames && games.length > 0 && (
                           <Table striped bordered hover responsive variant="dark" className="text-center align-middle">
                              <thead>
                                 <tr>
                                    <th>Game Mode</th>
                                    <th>Build</th>
                                    <th>W/L</th>
                                    <th>PF</th>
                                    <th>PA</th>
                                    <th>PTS</th>
                                    <th>REB</th>
                                    <th>AST</th>
                                    <th>Delete</th>
                                 </tr>
                              </thead>

                              <tbody>
                                 {games.map((game) => (
                                    <tr key={game.id}>
                                       <td>{GAME_MODE_NAMES[game.game_mode_id] ?? game.game_mode_id}</td>
                                       <td>{game.build_name ?? "-"}</td>
                                       <td>
                                          <span className={game.result === "W" ? "text-success" : "text-danger"}>{game.result}</span>
                                       </td>
                                       <td>{game.points_for}</td>
                                       <td>{game.points_against}</td>
                                       <td>{game.user_statline?.points ?? "-"}</td>
                                       <td>{game.user_statline?.rebounds ?? "-"}</td>
                                       <td>{game.user_statline?.assists ?? "-"}</td>
                                       <td>
                                          <Button
                                             variant="link"
                                             className="p-0 d-inline-flex align-items-center justify-content-center"
                                             onClick={() => handleDelete(game.id)}
                                             disabled={deletingGameId === game.id}
                                             aria-label={`Delete game ${game.id}`}
                                             title="Delete this game and all of its saved stats"
                                          >
                                             {deletingGameId === game.id
                                                ? <Spinner animation="border" variant="danger" size="sm" />
                                                : <BsFillTrash3Fill size={20} style={{ color: "#dc3545" }} />}
                                          </Button>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </Table>
                        )}
                     </Card.Body>
                  </Card>
               </Row>
            </Container>
         </Modal.Body>
      </Modal>
   );
}

export default DeleteGame;