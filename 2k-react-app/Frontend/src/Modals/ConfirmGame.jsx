import { useEffect, useMemo, useState } from "react";
import { Badge, Card, Col, Container, Form, Modal, ProgressBar, Row, Table } from "react-bootstrap";
import Select from "react-select";
import api from "../../api";

import BoxScoreCropper from "../components/BoxScoreCropper";

const DATE_DAYS = Array.from({ length: 31 }, (_, index) => index + 1);
const DATE_MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);
const DATE_YEARS = Array.from({ length: 2 }, (_, index) => 2026 + index);
const EMPTY_DATE = { day: "", month: "", year: "" };
const dateSelectStyles = {
   control: (base, state) => ({ ...base, minHeight: "38px", backgroundColor: "#000", borderColor: state.isFocused ? "#ff6600" : "#555", boxShadow: state.isFocused ? "0 0 0 1px #ff6600" : "none", "&:hover": { borderColor: "#ff6600" } }),
   menu: (base) => ({ ...base, backgroundColor: "#000", border: "1px solid #ff6600" }),
   option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? "#ff6600" : "#000", color: state.isFocused ? "#000" : "#ff6600", "&:active": { backgroundColor: "#ff6600" } }),
   singleValue: (base) => ({ ...base, color: "#ff6600" }),
   placeholder: (base) => ({ ...base, color: "rgba(145, 148, 148, 1)" }),
   dropdownIndicator: (base) => ({ ...base, color: "#ff6600", "&:hover": { color: "#ff6600" } }),
};

// Defaults the date picker to today, falling back to blank if today falls outside the selectable year range
const getDefaultDate = () => {
   const today = new Date();
   const year = today.getFullYear();
   if (!DATE_YEARS.includes(year)) {
      return EMPTY_DATE;
   }
   return { day: today.getDate(), month: today.getMonth() + 1, year };
};
const EMPTY_QUARTER_SCORES = {
   q1PointsFor: "",
   q2PointsFor: "",
   q3PointsFor: "",
   q4PointsFor: "",
   q1PointsAgainst: "",
   q2PointsAgainst: "",
   q3PointsAgainst: "",
   q4PointsAgainst: "",
};

function ConfirmGame({ show, onClose, selectedFile, selectedGameMode, rosterEntries, selectedBuilds, opponents, usesQuarterScores }) {

   const [imageUrl, setImageUrl] = useState(null);
   const [cropStep, setCropStep] = useState("select_box_score");
   const [boxScoreCropArea, setBoxScoreCropArea] = useState(null);
   const [boxScorePreviewUrl, setBoxScorePreviewUrl] = useState(null);
   const [jobId, setJobId] = useState(null);
   const [jobStatus, setJobStatus] = useState(null);
   const [jobProgress, setJobProgress] = useState(0);
   const [jobMessage, setJobMessage] = useState("");
   const [jobError, setJobError] = useState("");
   const [ocrResult, setOcrResult] = useState(null);
   const [isSubmittingJob, setIsSubmittingJob] = useState(false);

   const resetModalState = () => {
      [imageUrl, boxScorePreviewUrl].forEach((url) => {
         if (url) {
            URL.revokeObjectURL(url);
         }
      });

      setImageUrl(null);
      setCropStep("select_box_score");
      setBoxScoreCropArea(null);
      setBoxScorePreviewUrl(null);
      setJobId(null);
      setJobStatus(null);
      setJobProgress(0);
      setJobMessage("");
      setJobError("");
      setOcrResult(null);
      setIsSubmittingJob(false);
      setGameDetails({
         date: getDefaultDate(),
         pointsFor: "",
         pointsAgainst: "",
      });
      setQuarterScores(EMPTY_QUARTER_SCORES);
   };

   useEffect(() => {
      if (!selectedFile) {
         return;
      }

      resetModalState();
      setImageUrl(URL.createObjectURL(selectedFile));
   }, [selectedFile]);

   const [gameDetails, setGameDetails] = useState({
      date: getDefaultDate(),
      pointsFor: "",
      pointsAgainst: "",
   });
   const [quarterScores, setQuarterScores] = useState(EMPTY_QUARTER_SCORES);

   const handleGameDetailChange = (field, value) => {
      setGameDetails((previous) => ({ ...previous, [field]: value }));
   };

   const handleQuarterScoreChange = (field, value) => {
      setQuarterScores((previous) => ({ ...previous, [field]: value }));
   };

   const handleDatePartChange = (part, value) => {
      setGameDetails((previous) => ({
         ...previous,
         date: { ...previous.date, [part]: value },
      }));
   };

   const selectedDate = gameDetails.date.day && gameDetails.date.month && gameDetails.date.year
      ? `${gameDetails.date.year}-${String(gameDetails.date.month).padStart(2, "0")}-${String(gameDetails.date.day).padStart(2, "0")}`
      : "";

   const createCropPreview = (sourceImageUrl, cropArea) => new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
         const canvas = document.createElement("canvas");
         canvas.width = cropArea.width;
         canvas.height = cropArea.height;
         const context = canvas.getContext("2d");

         if (!context) {
            reject(new Error("Could not create canvas context for crop preview."));
            return;
         }

         context.drawImage(image, cropArea.x, cropArea.y, cropArea.width, cropArea.height, 0, 0, cropArea.width, cropArea.height);
         canvas.toBlob((blob) => {
            if (!blob) {
               reject(new Error("Could not generate crop preview image."));
               return;
            }
            resolve(URL.createObjectURL(blob));
         }, "image/png");
      };

      image.onerror = () => reject(new Error("Could not load selected image for preview."));
      image.src = sourceImageUrl;
   });

   const handleBoxScoreCrop = async (cropArea) => {
      if (!selectedFile || !imageUrl) {
         return;
      }

      try {
         if (boxScorePreviewUrl) {
            URL.revokeObjectURL(boxScorePreviewUrl);
         }
         const previewUrl = await createCropPreview(imageUrl, cropArea);
         setBoxScoreCropArea(cropArea);
         setBoxScorePreviewUrl(previewUrl);
         setCropStep("confirm_box_score");
      } catch (error) {
         setJobError("Could not create box score preview.");
         console.error("Could not create box score preview:", error);
      }
   };

   const submitConfirmedCrops = async () => {
      if (!selectedFile || !boxScoreCropArea) {
         return;
      }

      try {
         setIsSubmittingJob(true);
         setJobError("");
         setCropStep("processing");

         const formData = new FormData();
         formData.append("file", selectedFile);
         formData.append("game_mode_id", selectedGameMode);
         formData.append("box_crop_x", boxScoreCropArea.x);
         formData.append("box_crop_y", boxScoreCropArea.y);
         formData.append("box_crop_width", boxScoreCropArea.width);
         formData.append("box_crop_height", boxScoreCropArea.height);
         formData.append("expected_players", rosterEntries.map(({ player }) => player?.ocrLabel ?? player?.label).filter(Boolean).join(","));

         const response = await api.post("/uploads/uploadGame/start", formData);
         setJobId(response.data.job_id);
         setJobStatus(response.data.status);
         setJobProgress(response.data.progress || 0);
         setJobMessage(response.data.message || "Processing started.");
      } catch (error) {
         setJobError("Could not start processing. Please try again.");
         setCropStep("confirm_box_score");
         console.error("Python crop upload failed:", error);
      } finally {
         setIsSubmittingJob(false);
      }
   };

   // All selected players are reviewable; random-player rows are excluded only from saving.
   const visibleBoxScoreRowIndices = useMemo(() => {
      const rows = ocrResult?.box_score?.rows;
      if (!rows?.length) {
         return [];
      }

      const totalsRowIndex = rows.length - 1;
      const playerIndices = rosterEntries
         .map((entry, index) => (index < totalsRowIndex && entry.player ? index : null))
         .filter((index) => index !== null);

      return [...playerIndices, totalsRowIndex];
   }, [ocrResult, rosterEntries]);

   // Fills the (OCR-blank) totals row with the sum of the tracked player rows, without overwriting values the user already entered
   const populateTotalsRow = (result) => {
      const rows = result?.box_score?.rows;
      if (!rows || rows.length < 2) {
         return result;
      }

      const totalsRowIndex = rows.length - 1;
      const playerRows = rows.slice(0, totalsRowIndex);
      const sumColumn = (column) => playerRows.reduce((sum, row) => {
         const value = Number(row[column]?.value);
         return sum + (Number.isFinite(value) ? value : 0);
      }, 0);

      const filledTotalsRow = Object.fromEntries(Object.entries(rows[totalsRowIndex]).map(([column, cell]) => {
         if (column === "PLAYER" || String(cell.value ?? "").trim() !== "") {
            return [column, cell];
         }
         return [column, { ...cell, value: sumColumn(column) }];
      }));

      const updatedRows = rows.map((row, index) => (index === totalsRowIndex ? filledTotalsRow : row));
      return { ...result, box_score: { ...result.box_score, rows: updatedRows } };
   };

   useEffect(() => {
      if (!jobId || cropStep !== "processing") {
         return;
      }

      let cancelled = false;
      const intervalId = setInterval(async () => {
         try {
            const response = await api.get(`/uploads/uploadGame/jobs/${jobId}`);
            const job = response.data;
            if (cancelled) {
               return;
            }
            setJobStatus(job.status);
            setJobProgress(job.progress || 0);
            setJobMessage(job.message || "Processing");

            if (job.status === "completed") {
               setOcrResult(populateTotalsRow(job.result) || null);
               setCropStep("review_ocr");
               clearInterval(intervalId);
            } else if (job.status === "failed") {
               setJobError(job.error || "Processing failed.");
               clearInterval(intervalId);
            }
         } catch (error) {
            if (!cancelled) {
               setJobError("Could not fetch job status.");
            }
            clearInterval(intervalId);
         }
      }, 700);

      return () => {
         cancelled = true;
         clearInterval(intervalId);
      };
   }, [jobId, cropStep]);

   const validateOcrRows = (rows) => rows.map((row, rowIndex) => {
      const validatedRow = Object.fromEntries(Object.entries(row).map(([column, cell]) => [
         column,
         { ...cell, validation_errors: undefined },
      ]));

      const values = Object.fromEntries(Object.entries(validatedRow).map(([column, cell]) => {
         const text = String(cell.value ?? "").trim();
         return [column, /^\d+$/.test(text) ? Number(text) : null];
      }));
      const includesFreeThrows = Object.hasOwn(validatedRow, "FTM") && Object.hasOwn(validatedRow, "FTA");
      const addError = (columns, message) => columns.forEach((column) => {
         validatedRow[column] = {
            ...validatedRow[column],
            validation_errors: [...(validatedRow[column].validation_errors || []), message],
         };
      });

      const comparisons = [["3PM", "FGM", "3PM cannot exceed FGM"], ["3PA", "FGA", "3PA cannot exceed FGA"], ["FGM", "FGA", "FGM cannot exceed FGA"], ["3PM", "3PA", "3PM cannot exceed 3PA"]];
      if (includesFreeThrows) {
         comparisons.push(["FTM", "FTA", "FTM cannot exceed FTA"]);
      }

      comparisons
         .forEach(([leftColumn, rightColumn, message]) => {
            if (values[leftColumn] !== null && values[rightColumn] !== null && values[leftColumn] > values[rightColumn]) {
               addError([leftColumn, rightColumn], message);
            }
         });

      if (rowIndex !== rows.length - 1 && values.FOULS !== null && values.FOULS > 6) {
         addError(["FOULS"], "FOULS cannot exceed 6");
      }

      const scoringColumns = includesFreeThrows ? ["PTS", "FGM", "3PM", "FTM"] : ["PTS", "FGM", "3PM"];
      if (scoringColumns.every((column) => values[column] !== null)) {
         const expectedPoints = 2 * (values.FGM - values["3PM"]) + 3 * values["3PM"] + (includesFreeThrows ? values.FTM : 0);
         if (values.PTS !== expectedPoints) {
            addError(scoringColumns, `PTS should be ${expectedPoints} from the shooting totals`);
         }
      }

      return validatedRow;
   });

   const handleOcrCellChange = (rowIndex, column, value) => {
      setOcrResult((previousResult) => {
         const updatedRows = previousResult.box_score.rows.map((row, index) => index === rowIndex
            ? { ...row, [column]: { value } }
            : row);
         return { ...previousResult, box_score: { ...previousResult.box_score, rows: validateOcrRows(updatedRows) } };
      });
   };

   const overallConfidence = useMemo(() => {
      if (!ocrResult) {
         return null;
      }

      const confidenceValues = [];
      [ocrResult.box_score].forEach((table) => {
         if (!table?.rows) {
            return;
         }
         table.rows.forEach((row) => {
            Object.values(row).forEach((cell) => {
               if (typeof cell?.confidence === "number") {
                  confidenceValues.push(cell.confidence);
               }
            });
         });
      });

      if (!confidenceValues.length) {
         return null;
      }

      const total = confidenceValues.reduce((sum, value) => sum + value, 0);
      return (total / confidenceValues.length).toFixed(2);
   }, [ocrResult]);

   const renderConfidenceBadge = (confidence) => {
      if (typeof confidence !== "number") {
         return <Badge bg="secondary">n/a</Badge>;
      }

      if (confidence < 0.8) {
         return <Badge bg="danger">{confidence}</Badge>;
      }

      if (confidence < 0.9) {
         return <Badge bg="warning" text="dark">{confidence}</Badge>;
      }

      return <Badge bg="success">{confidence}</Badge>;
   };

   const boxScoreTotalPoints = useMemo(() => {
      const rows = ocrResult?.box_score?.rows;
      if (!rows || rows.length < 2) {
         return null;
      }

      const value = Number(rows[rows.length - 1].PTS?.value);
      return Number.isFinite(value) ? value : 0;
   }, [ocrResult]);

   const sumQuarterPoints = (prefix) => ["q1", "q2", "q3", "q4"].reduce(
      (sum, quarter) => sum + (Number(quarterScores[`${quarter}${prefix}`]) || 0), 0
   );
   const quarterPointsForTotal = sumQuarterPoints("PointsFor");
   const quarterPointsAgainstTotal = sumQuarterPoints("PointsAgainst");
   const totalPointsFor = usesQuarterScores ? quarterPointsForTotal : Number(gameDetails.pointsFor) || 0;
   const totalPointsAgainst = usesQuarterScores ? quarterPointsAgainstTotal : Number(gameDetails.pointsAgainst) || 0;
   const gameResult = totalPointsFor > totalPointsAgainst
      ? "W"
      : totalPointsFor < totalPointsAgainst
         ? "L"
         : "";

   const gameDetailErrors = useMemo(() => {
      const errors = [];

      if (!selectedDate) {
         errors.push("Select the date the game was played.");
      }
      if (!gameResult) {
         errors.push(usesQuarterScores ? "Enter quarter scores so the result can be determined." : "Enter the final scores so the result can be determined.");
      }
      if (boxScoreTotalPoints !== null && totalPointsFor !== boxScoreTotalPoints) {
         errors.push(`${usesQuarterScores ? "Quarter points for" : "Points for"} (${totalPointsFor}) must equal the player total (${boxScoreTotalPoints}).`);
      }
      return errors;
   }, [gameDetails, selectedDate, quarterScores, usesQuarterScores, gameResult, boxScoreTotalPoints, quarterPointsForTotal, quarterPointsAgainstTotal]);

   const buildGameConfirmationPayload = () => {
      const rows = ocrResult?.box_score?.rows;
      if (!rows) {
         return null;
      }

      // The last row is the (now user-editable) totals row, used directly as the team statline
      const totalsRow = rows[rows.length - 1];
      const totalsValue = (column) => {
         const value = Number(totalsRow[column]?.value);
         return Number.isFinite(value) ? value : 0;
      };

      const teamStatline = {
         points: totalsValue("PTS"),
         rebounds: totalsValue("REB"),
         assists: totalsValue("AST"),
         steals: totalsValue("STL"),
         blocks: totalsValue("BLK"),
         fouls: totalsValue("FOULS"),
         turnovers: totalsValue("TO"),
         field_goals_made: totalsValue("FGM"),
         field_goals_attempted: totalsValue("FGA"),
         three_pointers_made: totalsValue("3PM"),
         three_pointers_attempted: totalsValue("3PA"),
         free_throws_made: totalsValue("FTM"),
         free_throws_attempted: totalsValue("FTA"),
      };

      let ownBuildId = null;
      const statlines = [];

      rosterEntries.forEach(({ player, position, slot }, index) => {
         const row = rows[index];
         if (!player || player.isRandomPlayer || !row) {
            return;
         }

         const build = selectedBuilds[slot];
         const opponent = opponents?.[slot] ?? "Player";
         const stats = {
            points: Number(row.PTS?.value) || 0,
            rebounds: Number(row.REB?.value) || 0,
            assists: Number(row.AST?.value) || 0,
            steals: Number(row.STL?.value) || 0,
            blocks: Number(row.BLK?.value) || 0,
            fouls: Number(row.FOULS?.value) || 0,
            turnovers: Number(row.TO?.value) || 0,
            field_goals_made: Number(row.FGM?.value) || 0,
            field_goals_attempted: Number(row.FGA?.value) || 0,
            three_pointers_made: Number(row["3PM"]?.value) || 0,
            three_pointers_attempted: Number(row["3PA"]?.value) || 0,
            free_throws_made: Number(row.FTM?.value) || 0,
            free_throws_attempted: Number(row.FTA?.value) || 0,
         };

         if (player.isSelf) {
            ownBuildId = build?.id ?? null;
            statlines.push({ position, is_self: true, build_id: build?.id ?? null, opponent, ...stats });
         } else {
            statlines.push({ position, is_self: false, friend_id: player.value, friend_build_id: build?.id ?? null, opponent, ...stats });
         }
      });

      if (!ownBuildId) {
         return null;
      }

      return {
         build_id: ownBuildId,
         date_time: selectedDate,
         result: gameResult,
         points_for: totalPointsFor,
         q1_points_for: usesQuarterScores ? Number(quarterScores.q1PointsFor) || 0 : totalPointsFor,
         q2_points_for: usesQuarterScores ? Number(quarterScores.q2PointsFor) || 0 : 0,
         q3_points_for: usesQuarterScores ? Number(quarterScores.q3PointsFor) || 0 : 0,
         q4_points_for: usesQuarterScores ? Number(quarterScores.q4PointsFor) || 0 : 0,
         points_against: totalPointsAgainst,
         q1_points_against: usesQuarterScores ? Number(quarterScores.q1PointsAgainst) || 0 : totalPointsAgainst,
         q2_points_against: usesQuarterScores ? Number(quarterScores.q2PointsAgainst) || 0 : 0,
         q3_points_against: usesQuarterScores ? Number(quarterScores.q3PointsAgainst) || 0 : 0,
         q4_points_against: usesQuarterScores ? Number(quarterScores.q4PointsAgainst) || 0 : 0,
         box_score_total_points: boxScoreTotalPoints ?? 0,
         team_statline: teamStatline,
         statlines,
      };
   };

   const canConfirmSave = gameDetailErrors.length === 0 && Boolean(buildGameConfirmationPayload());

   const handleConfirmSave = async () => {
      if (!jobId) {
         return;
      }

      const payload = buildGameConfirmationPayload();
      if (!payload) {
         setJobError("Could not build the game record. Make sure your own build is selected.");
         return;
      }

      try {
         await api.post(`/uploads/uploadGame/jobs/${jobId}/confirm`, payload);
         onClose();
         resetModalState();
      } catch (error) {
         setJobError(error.response?.data?.detail || "Could not confirm and save the game.");
         console.error("Confirm save failed:", error);
      }
   };

   const renderStructuredTable = (title, tableData, visibleRowIndices) => {
      if (!tableData?.columns?.length || !tableData?.rows?.length) {
         return null;
      }

      const totalsRowIndex = tableData.rows.length - 1;
      const rowIndicesToRender = visibleRowIndices ?? tableData.rows.map((_, index) => index);

      return (
         <div className="mb-4">
            <h5 style={{ color: "#ff6600" }}>{title}</h5>

            <Table striped bordered hover responsive variant="dark" className="ocr-review-table">
               <colgroup>
                  {tableData.columns.map((column) => (
                     <col key={column} className={column.toUpperCase() === "PLAYER" ? "ocr-player-column" : "ocr-stat-column"} />
                  ))}
               </colgroup>
               <thead>
                  <tr>
                     {tableData.columns.map((column) => (
                        <th key={column}>{column.toUpperCase()}</th>
                     ))}
                  </tr>
               </thead>

               <tbody>
                  {rowIndicesToRender.map((rowIndex) => {
                     const row = tableData.rows[rowIndex];
                     const isTotalsRow = rowIndex === totalsRowIndex;

                     return (
                        <tr key={`${title}-row-${rowIndex}`} className={isTotalsRow ? "ocr-totals-row" : undefined}>
                           {tableData.columns.map((column) => {
                              const cell = row[column] || {};
                              const validationErrors = cell.validation_errors || [];
                              const isPlayerColumn = column.toUpperCase() === "PLAYER";

                              return (
                                 <td key={`${title}-${rowIndex}-${column}`}>
                                    {isPlayerColumn ? (
                                       <span>{String(cell.value ?? "")}</span>
                                    ) : (
                                       <>
                                          <Form.Control
                                             className={`ocr-cell-input${validationErrors.length ? " is-invalid" : ""}`}
                                             value={String(cell.value ?? "")}
                                             onChange={(event) => handleOcrCellChange(rowIndex, column, event.target.value)}
                                             aria-label={`${column} value for row ${rowIndex + 1}`}
                                             aria-invalid={validationErrors.length > 0}
                                             title={validationErrors.join("; ")}
                                          />
                                          {typeof cell.confidence === "number" && (
                                             <small className="ocr-confidence">CL: {renderConfidenceBadge(cell.confidence)}</small>
                                          )}
                                          {validationErrors.length > 0 && (
                                             <small className="ocr-validation-error">{validationErrors.join("; ")}</small>
                                          )}
                                       </>
                                    )}
                                 </td>
                              );
                           })}
                        </tr>
                     );
                  })}
               </tbody>
            </Table>
         </div>
      );
   };

   return (
      <Modal show={show} onHide={() => {
         if (jobId && (cropStep === "processing" || cropStep === "review_ocr")) {
            api.delete(`/uploads/uploadGame/jobs/${jobId}`).catch(() => { });
         }
         onClose();
         resetModalState();
      }} centered size="lg">
         <Modal.Header closeButton>
            Review scorecard upload image
         </Modal.Header>


         <Modal.Body className="boomers-hero-overlay d-flex">
            <Container>

               {/* Header */}
               <Row>
                  <Card className="hero-card mb-4">
                     <div className="hero-glow hero-glow-top-right"></div>
                     <div className="hero-glow hero-glow-top-left"></div>

                     <Card.Body className="hero-content text-white">
                        <h1 className="justify-content-center" style={{ color: "rgba(255, 102, 0, 0.95)" }}>REVIEW SCORECARD UPLOAD</h1>

                        <p className="fw-light">To crop the image, click and hold down your mouse, then drag from one corner to its opposite, creating a box.</p>
                     </Card.Body>
                  </Card>
               </Row>

               <Row>
                  <Card className="big-hero-card mb-4">
                     <div className="hero-glow hero-glow-top-right"></div>
                     <div className="hero-glow hero-glow-top-left"></div>

                     <Card.Body className="hero-content text-white">

                        {imageUrl && cropStep === "select_box_score" && (
                           <BoxScoreCropper
                              imageUrl={imageUrl}
                              onCrop={handleBoxScoreCrop}
                              instructionText="Crop your teams box score, not including the header row. This crop is inclusive of the points column through to the 3PM/3PA (or FTM/FTA depending on game mode)."
                              confirmButtonText="Confirm Box Score Crop"
                           />
                        )}

                        {/* Box score confirmation */}
                        {cropStep === "confirm_box_score" && boxScorePreviewUrl && (
                           <div>
                              <p className="fw-light">Confirm box score crop selection:</p>
                              <img src={boxScorePreviewUrl} alt="Box score crop preview" style={{ maxWidth: "100%", borderRadius: "0.5rem" }} />

                              <div className="mt-3 d-flex justify-content-between">
                                 <button type="button" className="btn btn-outline-warning" onClick={() => setCropStep("select_box_score")}>
                                    Re-crop Box Score
                                 </button>

                                 <button type="button" className="btn btn-warning" onClick={submitConfirmedCrops}>
                                    {isSubmittingJob ? "Starting..." : "Confirm Box Score Crop"}
                                 </button>
                              </div>
                           </div>
                        )}

                        {/* OCR working */}
                        {cropStep === "processing" && (
                           <div>
                              <p className="fw-light mb-2">Converting confirmed crops into structured tables...</p>
                              <ProgressBar now={jobProgress} label={`${jobProgress}%`} variant="warning" animated />
                              <p className="mt-3 mb-0">Status: {jobStatus || "starting"}</p>
                              <p className="fw-light">{jobMessage || "Please wait while we process your upload."}</p>
                              {jobError && <p style={{ color: "#ff8a80" }}>{jobError}</p>}
                           </div>
                        )}

                        {/* Review OCR output */}
                        {cropStep === "review_ocr" && ocrResult && (
                           <div>
                              <p className="fw-light">OCR and parsing complete. Please review detected values before final save.</p>
                              {overallConfidence && (
                                 <p>
                                    Overall confidence: {renderConfidenceBadge(Number(overallConfidence))}
                                 </p>
                              )}

                              <div className="mb-4 game-details-panel">
                                 <h5 style={{ color: "#ff6600" }}>Game Details</h5>

                                 <Row className="g-3">
                                    <Form.Group as={Col} md={6} controlId="gameDate">
                                       <Form.Label>Date</Form.Label>
                                       <div className="date-select-group">
                                          <Select className="date-select" styles={dateSelectStyles} value={gameDetails.date.day ? { value: gameDetails.date.day, label: gameDetails.date.day } : null} onChange={(option) => handleDatePartChange("day", option?.value ?? "")} options={DATE_DAYS.map((day) => ({ value: day, label: day }))} placeholder="Day" maxMenuHeight={152} aria-label="Day" />
                                          <Select className="date-select" styles={dateSelectStyles} value={gameDetails.date.month ? { value: gameDetails.date.month, label: gameDetails.date.month } : null} onChange={(option) => handleDatePartChange("month", option?.value ?? "")} options={DATE_MONTHS.map((month) => ({ value: month, label: month }))} placeholder="Month" maxMenuHeight={152} aria-label="Month" />
                                          <Select className="date-select" styles={dateSelectStyles} value={gameDetails.date.year ? { value: gameDetails.date.year, label: gameDetails.date.year } : null} onChange={(option) => handleDatePartChange("year", option?.value ?? "")} options={DATE_YEARS.map((year) => ({ value: year, label: year }))} placeholder="Year" maxMenuHeight={152} aria-label="Year" />
                                       </div>
                                       {selectedDate && <Form.Text className="date-selection-preview">Selected: {selectedDate}</Form.Text>}
                                    </Form.Group>

                                    <Form.Group as={Col} md={6} controlId="gameResult">
                                       <Form.Label>Result</Form.Label>
                                       <Form.Control className="scorecard-input" value={gameResult === "W" ? "Win" : gameResult === "L" ? "Loss" : usesQuarterScores ? "Enter quarter scores" : "Enter final scores"} readOnly />
                                    </Form.Group>
                                 </Row>

                                 {usesQuarterScores ? (
                                    <>
                                       <Row className="g-3 mt-1">
                                          <Form.Group as={Col} md={3} controlId="pointsFor">
                                             <Form.Label>Points For{boxScoreTotalPoints !== null ? ` (${boxScoreTotalPoints})` : ""}</Form.Label>
                                             <Form.Control className="scorecard-input" type="number" value={totalPointsFor} readOnly />
                                          </Form.Group>
                                          {["q1PointsFor", "q2PointsFor", "q3PointsFor", "q4PointsFor"].map((field, index) => (
                                             <Form.Group as={Col} md={2} controlId={field} key={field}>
                                                <Form.Label>Q{index + 1}</Form.Label>
                                                <Form.Control className="scorecard-input" type="number" value={quarterScores[field]} onChange={(event) => handleQuarterScoreChange(field, event.target.value)} min="0" inputMode="numeric" />
                                             </Form.Group>
                                          ))}
                                       </Row>
                                       <Row className="g-3 mt-1">
                                          <Form.Group as={Col} md={3} controlId="pointsAgainst">
                                             <Form.Label>Points Against</Form.Label>
                                             <Form.Control className="scorecard-input" type="number" value={totalPointsAgainst} readOnly />
                                          </Form.Group>
                                          {["q1PointsAgainst", "q2PointsAgainst", "q3PointsAgainst", "q4PointsAgainst"].map((field, index) => (
                                             <Form.Group as={Col} md={2} controlId={field} key={field}>
                                                <Form.Label>Q{index + 1}</Form.Label>
                                                <Form.Control className="scorecard-input" type="number" value={quarterScores[field]} onChange={(event) => handleQuarterScoreChange(field, event.target.value)} min="0" inputMode="numeric" />
                                             </Form.Group>
                                          ))}
                                       </Row>
                                    </>
                                 ) : (
                                    <Row className="g-3 mt-1">
                                       <Form.Group as={Col} md={6} controlId="pointsFor">
                                          <Form.Label>Points For{boxScoreTotalPoints !== null ? ` (${boxScoreTotalPoints})` : ""}</Form.Label>
                                          <Form.Control className="scorecard-input" type="number" value={gameDetails.pointsFor} onChange={(event) => handleGameDetailChange("pointsFor", event.target.value)} min="0" inputMode="numeric" />
                                       </Form.Group>
                                       <Form.Group as={Col} md={6} controlId="pointsAgainst">
                                          <Form.Label>Points Against</Form.Label>
                                          <Form.Control className="scorecard-input" type="number" value={gameDetails.pointsAgainst} onChange={(event) => handleGameDetailChange("pointsAgainst", event.target.value)} min="0" inputMode="numeric" />
                                       </Form.Group>
                                    </Row>
                                 )}

                                 {gameDetailErrors.length > 0 && (
                                    <ul className="mt-3 mb-0" style={{ color: "#ff8a80" }}>
                                       {gameDetailErrors.map((error) => (
                                          <li key={error}>{error}</li>
                                       ))}
                                    </ul>
                                 )}
                              </div>

                              {boxScorePreviewUrl && (
                                 <div className="mb-4">
                                    <h5 style={{ color: "#ff6600" }}>Cropped Scorecard</h5>
                                    <img src={boxScorePreviewUrl} alt="Confirmed box score crop" className="img-fluid w-100" />
                                 </div>
                              )}

                              {ocrResult.final_crops?.template_grid?.data_url && (
                                 <div className="mb-4">
                                    <h5 style={{ color: "#ff6600" }}>OCR Template Grid</h5>
                                    <img
                                       src={ocrResult.final_crops.template_grid.data_url}
                                       alt="Box score crop with OCR row and column boundaries"
                                       className="img-fluid w-100"
                                    />
                                 </div>
                              )}

                              {renderStructuredTable("Box Score", ocrResult.box_score, visibleBoxScoreRowIndices)}

                              {jobError && <p style={{ color: "#ff8a80" }}>{jobError}</p>}

                              <div className="mt-3 d-flex justify-content-between">
                                 <button type="button" className="btn btn-outline-warning" onClick={() => {
                                    if (jobId) {
                                       api.delete(`/uploads/uploadGame/jobs/${jobId}`).catch(() => { });
                                    }
                                    onClose();
                                    resetModalState();
                                 }}>
                                    Discard Job
                                 </button>

                                 <button type="button" className="btn btn-warning" onClick={handleConfirmSave} disabled={!canConfirmSave || !jobId}>
                                    Confirm and Save Original Image
                                 </button>
                              </div>
                           </div>
                        )}
                     </Card.Body>
                  </Card>
               </Row>
            </Container>
         </Modal.Body>
      </Modal>
   );
}

export default ConfirmGame;
