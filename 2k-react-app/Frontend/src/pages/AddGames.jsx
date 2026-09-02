import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { BsFillTrash3Fill, BsUpload } from "react-icons/bs";
import { useEffect, useMemo, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { apiFetch } from "../../api";
import ConfirmGame from "../Modals/ConfirmGame";
import DeleteGame from "../Modals/DeleteGame";
import { GAME_MODES, GAME_MODES_BY_ID } from "../constants/gameModes";

const POSITION_SLOTS = ["PG", "SG", "SF", "PF", "C"];

function AddGames() {
   const [showModal, setShowModal] = useState(false);
   const [showDeleteGameModal, setShowDeleteGameModal] = useState(false);
   const [selectedFile, setSelectedFile] = useState(null);
   const [scorecardPreviewUrl, setScorecardPreviewUrl] = useState(null);
   const [selectedGameMode, setSelectedGameMode] = useState("");
   const [friendsList, setFriendsList] = useState([]);
   const [currentUser, setCurrentUser] = useState(null);
   const [userBuilds, setUserBuilds] = useState([]);
   const [friendBuilds, setFriendBuilds] = useState([]);
   const [selectedBuilds, setSelectedBuilds] = useState({});
   const [roster, setRoster] = useState({});
   const [rosterInputs, setRosterInputs] = useState({});
   const [opponents, setOpponents] = useState({});

   const selectStyles = {
      control: (base, state) => ({ ...base, backgroundColor: "black", borderColor: state.isFocused ? "#ff6600" : "#555", boxShadow: state.isFocused ? "0 0 0 1px #ff6600" : "none", "&:hover": { borderColor: "#ff6600" } }),
      menu: (base) => ({ ...base, backgroundColor: "black", border: "1px solid #ff6600" }),
      option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? "#ff6600" : "black", color: state.isFocused ? "black" : "white", "&:active": { backgroundColor: "#ff6600" } }),
      singleValue: (base) => ({ ...base, color: "#ff6600" }),
      input: (base) => ({ ...base, color: "#ff6600" }),
      placeholder: (base) => ({ ...base, color: "rgba(145, 148, 148, 1)" }),
      dropdownIndicator: (base) => ({ ...base, color: "#ff6600", "&:hover": { color: "#ff6600" } }),
      clearIndicator: (base) => ({ ...base, color: "#ff6600", "&:hover": { color: "#ff6600" } }),
   };

   useEffect(() => {
      document.title = "Hoop Stats - Add Game";
   }, []);

   useEffect(() => {
      if (!selectedFile) {
         setScorecardPreviewUrl(null);
         return undefined;
      }

      const previewUrl = URL.createObjectURL(selectedFile);
      setScorecardPreviewUrl(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
   }, [selectedFile]);

   useEffect(() => {
      const loadSetupData = async () => {
         const [friendsResponse, currentUserResponse, userBuildsResponse, friendBuildsResponse] = await Promise.all([
            apiFetch("/friends/myFriends"),
            apiFetch("/userAccount/me"),
            apiFetch("/builds/myBuilds"),
            apiFetch("/builds/friendsBuilds"),
         ]);

         if (friendsResponse.ok) {
            const friends = await friendsResponse.json();
            setFriendsList(friends.map((friend) => ({
               value: friend.id,
               label: friend.name,
               name: friend.name,
               onlineId: friend.online_ID,
               ocrLabel: friend.online_ID,
            })));
         }
         if (currentUserResponse.ok) {
            setCurrentUser(await currentUserResponse.json());
         }
         if (userBuildsResponse.ok) {
            setUserBuilds(await userBuildsResponse.json());
         }
         if (friendBuildsResponse.ok) {
            setFriendBuilds(await friendBuildsResponse.json());
         }
      };

      loadSetupData();
   }, []);

   const selectedMode = selectedGameMode ? GAME_MODES_BY_ID[selectedGameMode] : null;
   const activeSlots = useMemo(() => {
      if (!selectedMode) {
         return [];
      }
      return selectedMode.usesPositions
         ? POSITION_SLOTS
         : Array.from({ length: selectedMode.playerCount }, (_, index) => `PLAYER_${index + 1}`);
   }, [selectedMode]);

   const rosterEntries = useMemo(() => activeSlots.map((slot) => ({
      player: roster[slot] ?? null,
      position: selectedMode?.usesPositions ? slot : null,
      slot,
   })), [activeSlots, roster, selectedMode]);

   const rosterOptions = useMemo(() => {
      const savedPlayers = currentUser
         ? [{ value: currentUser.id, label: currentUser.username, name: currentUser.username, onlineId: currentUser.online_ID, ocrLabel: currentUser.online_ID, isSelf: true }, ...friendsList]
         : friendsList;
      return [...savedPlayers, { value: "random-player", label: "Random Player", ocrLabel: "Random Player", isRandomPlayer: true }];
   }, [currentUser, friendsList]);

   const isRosterComplete = activeSlots.length > 0 && activeSlots.every((slot) => Boolean(roster[slot]));
   const hasOwnBuild = activeSlots.some((slot) => roster[slot]?.isSelf && selectedBuilds[slot]?.id);
   const canReviewScorecard = Boolean(selectedFile && selectedMode && isRosterComplete && hasOwnBuild);

   const handleModeChange = (event) => {
      setSelectedGameMode(event.target.value);
      setRoster({});
      setRosterInputs({});
      setSelectedBuilds({});
      setOpponents({});
   };

   const handleRosterChange = (slot, option) => {
      setRoster((previous) => ({ ...previous, [slot]: option }));
      setSelectedBuilds((previous) => ({ ...previous, [slot]: null }));
      setOpponents((previous) => ({ ...previous, [slot]: "Player" }));
   };

   const handleRosterInputChange = (slot, value) => {
      setRosterInputs((previous) => ({ ...previous, [slot]: value }));
   };

   const getRosterOptions = (slot) => {
      const search = (rosterInputs[slot] ?? "").trim().toLowerCase();
      if (!search) {
         return [];
      }
      return rosterOptions.filter((option) => [option.name, option.isRandomPlayer ? option.label : null]
         .filter(Boolean)
         .some((value) => value.toLowerCase().includes(search)));
   };

   const formatRosterOptionLabel = (option) => option.name ? `${option.name}: ${option.onlineId}` : option.label;
   const isSavedPlayer = (slot) => Boolean(roster[slot]?.isSelf || friendsList.some((friend) => friend.value === roster[slot]?.value));

   const getBuildOptions = (slot) => {
      if (!isSavedPlayer(slot)) {
         return [];
      }
      return roster[slot].isSelf
         ? userBuilds
         : friendBuilds.filter((build) => build.friend_id === roster[slot].value);
   };

   const renderBuildSelect = (slot) => {
      if (!isSavedPlayer(slot)) {
         return null;
      }
      const buildOptions = getBuildOptions(slot);
      return (
         <Col md="auto">
            <Form.Select className="scorecard-select" value={selectedBuilds[slot]?.id ?? ""} onChange={(event) => {
               const buildId = Number(event.target.value);
               setSelectedBuilds((previous) => ({ ...previous, [slot]: buildOptions.find((build) => build.id === buildId) ?? null }));
            }}>
               <option value="">Choose a build</option>
               {buildOptions.map((build) => <option key={build.id} value={build.id}>{build.build_name}</option>)}
            </Form.Select>
         </Col>
      );
   };

   const renderOpponentSelect = (slot) => {
      if (!isSavedPlayer(slot)) {
         return null;
      }
      return (
         <Col md="auto">
            <Form.Select className="scorecard-select" value={opponents[slot] ?? "Player"} onChange={(event) => setOpponents((previous) => ({ ...previous, [slot]: event.target.value }))} aria-label={`Opponent type for ${slot}`}>
               <option value="Player">Vs Player</option>
               <option value="AI">Vs AI</option>
            </Form.Select>
         </Col>
      );
   };

   const renderPlayerSelect = (slot, label) => (
      <Row key={slot} className="align-items-center g-2 mb-3">
         <Col xs={12} md={2}>
            <Form.Label className="mb-0 scorecard-label">{label}</Form.Label>
         </Col>
         <Col xs={12} md>
            <CreatableSelect
               styles={selectStyles}
               options={getRosterOptions(slot)}
               value={roster[slot] ?? null}
               onChange={(option) => handleRosterChange(slot, option)}
               inputValue={rosterInputs[slot] ?? ""}
               onInputChange={(value) => handleRosterInputChange(slot, value)}
               formatOptionLabel={formatRosterOptionLabel}
               isValidNewOption={() => false}
               isClearable
               placeholder="Search friend or random"
            />
         </Col>
         {renderBuildSelect(slot)}
         {renderOpponentSelect(slot)}
      </Row>
   );

   const handleFileChange = (event) => {
      const file = event.target.files?.[0];
      if (file) {
         setSelectedFile(file);
      }
   };

   return (
      <Container fluid className="justify-content-center mt-3">
         <Row>
            <Col>
               <Card className="hero-card mb-4">
                  <div className="hero-glow hero-glow-top-right"></div>
                  <div className="hero-glow hero-glow-top-left"></div>
                  <Card.Body className="hero-content text-white">
                     <Row className="align-items-start">
                        <Col><h1 style={{ color: "rgba(255, 102, 0, 0.95)" }}>UPLOAD A NEW SCORECARD</h1></Col>
                        <Col xs="auto">
                           <Button variant="link" className="p-0" onClick={() => setShowDeleteGameModal(true)} aria-label="Delete a saved game" title="Delete a saved game">
                              <BsFillTrash3Fill size={28} style={{ color: "rgba(255, 102, 0, 0.95)" }} />
                           </Button>
                        </Col>
                     </Row>
                     <p style={{ color: "rgba(145, 148, 148, 1)" }}>Choose a scorecard first, then select the game mode and your teammates before reviewing the box score.</p>
                  </Card.Body>
               </Card>
            </Col>
         </Row>

         <Row>
            <Col>
               <Card className="big-hero-card mb-4">
                  <Card.Body className="hero-content text-white">
                     <Row className="justify-content-center">
                        <Col xs={12} lg={8}>
                           <Form.Group controlId="gameMode" className="mb-4">
                              <Form.Label className="scorecard-label">Game Mode</Form.Label>
                              <Form.Select className="scorecard-select" value={selectedGameMode} onChange={handleModeChange}>
                                 <option value="">Choose a game mode</option>
                                 {GAME_MODES.map((gameMode) => <option key={gameMode.id} value={gameMode.id}>{gameMode.mode_name}</option>)}
                              </Form.Select>
                           </Form.Group>

                           <label className="scorecard-upload">
                              <input type="file" accept=".jpg,.jpeg,.png" onChange={handleFileChange} hidden />
                              <div className="scorecard-upload-icon"><BsUpload size={28} /></div>
                              <h5 className="fw-light">{selectedFile ? "Choose a different scorecard" : "Choose a scorecard photo"}</h5>
                           </label>

                           {scorecardPreviewUrl && (
                              <div className="scorecard-preview mt-3 mb-4">
                                 <img src={scorecardPreviewUrl} alt="Selected scorecard" />
                                 <Button variant="outline-warning" size="sm" onClick={() => setSelectedFile(null)}>Remove scorecard</Button>
                              </div>
                           )}

                           {selectedMode && selectedFile && (
                              <div className="scorecard-teammates">
                                 <p className="fw-light mb-4 scorecard-label">{selectedMode.usesPositions ? "Assign each teammate to their scorecard position." : `Select the ${selectedMode.playerCount} players in the same order they appear on the scorecard.`}</p>
                                 {activeSlots.map((slot, index) => renderPlayerSelect(slot, selectedMode.usesPositions ? `${slot}:` : `Player ${index + 1}:`))}
                                 {!hasOwnBuild && isRosterComplete && <p className="scorecard-error mb-0">Select yourself and choose your build to save this game.</p>}
                              </div>
                           )}
                        </Col>
                     </Row>
                  </Card.Body>
               </Card>
            </Col>
         </Row>

         {selectedMode && (
            <Row><Col><div className="d-flex justify-content-center mb-4">
               <Button variant="warning" size="lg" onClick={() => setShowModal(true)} disabled={!canReviewScorecard}>Review scorecard</Button>
            </div></Col></Row>
         )}

         <ConfirmGame show={showModal} onClose={() => setShowModal(false)} selectedFile={selectedFile} selectedGameMode={selectedGameMode} rosterEntries={rosterEntries} selectedBuilds={selectedBuilds} opponents={opponents} usesQuarterScores={selectedMode?.playerCount === 5} />
         <DeleteGame show={showDeleteGameModal} onClose={() => setShowDeleteGameModal(false)} />
      </Container>
   );
}

export default AddGames;
