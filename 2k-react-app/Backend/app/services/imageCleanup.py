import asyncio
import base64
import importlib
import io
import os
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Awaitable, Callable

import cv2
import numpy as np
from PIL import Image

PROCESSED_STORAGE_PATH = Path(__file__).resolve().parent.parent / "storage" / "processed"
JOBS = {}
JOBS_LOCK = asyncio.Lock()

_PYTESSERACT_MODULE = None


POSITION_ROW_LABELS = ["PG", "SG", "SF", "PF", "C"]

BASE_TEMPLATE_COLUMNS = ["PLAYER", "PTS", "REB", "AST", "STL", "BLK", "FOULS", "TO", "FGM", "FGA", "3PM", "3PA"]

_SINGLE_COLUMN_FRACTION = 0.091
_SPLIT_COLUMN_FRACTION = 0.12
BASE_PHYSICAL_COLUMNS = [
    {"columns": ("PTS",), "kind": "single", "fraction": _SINGLE_COLUMN_FRACTION},
    {"columns": ("REB",), "kind": "single", "fraction": _SINGLE_COLUMN_FRACTION},
    {"columns": ("AST",), "kind": "single", "fraction": _SINGLE_COLUMN_FRACTION},
    {"columns": ("STL",), "kind": "single", "fraction": _SINGLE_COLUMN_FRACTION},
    {"columns": ("BLK",), "kind": "single", "fraction": _SINGLE_COLUMN_FRACTION},
    {"columns": ("FOULS",), "kind": "single", "fraction": _SINGLE_COLUMN_FRACTION},
    {"columns": ("TO",), "kind": "single", "fraction": _SINGLE_COLUMN_FRACTION},
    {"columns": ("FGM", "FGA"), "kind": "split", "fraction": _SPLIT_COLUMN_FRACTION},
    {"columns": ("3PM", "3PA"), "kind": "split", "fraction": _SPLIT_COLUMN_FRACTION},
]
FREE_THROW_PHYSICAL_COLUMN = {"columns": ("FTM", "FTA"), "kind": "split", "fraction": _SPLIT_COLUMN_FRACTION}


def _template_columns(include_free_throws: bool) -> list[str]:
    return [*BASE_TEMPLATE_COLUMNS, "FTM", "FTA"] if include_free_throws else BASE_TEMPLATE_COLUMNS


def _physical_columns(include_free_throws: bool) -> list[dict]:
    return [*BASE_PHYSICAL_COLUMNS, FREE_THROW_PHYSICAL_COLUMN] if include_free_throws else BASE_PHYSICAL_COLUMNS

# DELETE THIS ONCE THE OCR IS WORKING PROPERLY
def _template_grid_debug_enabled() -> bool:
    return os.getenv("OCR_TEMPLATE_GRID_DEBUG", "").strip().lower() == "true"

#Module for handling image cleanup and OCR preprocessing.
def _resolve_tesseract_cmd() -> str | None:
    configured_cmd = os.getenv("TESSERACT_CMD")
    if configured_cmd:
        return configured_cmd

    return shutil.which("tesseract")

#Resolves the Tesseract command to be used by pytesseract.
def _get_pytesseract_module():
    global _PYTESSERACT_MODULE

    if _PYTESSERACT_MODULE is None:
        try:
            _PYTESSERACT_MODULE = importlib.import_module("pytesseract")
        except ModuleNotFoundError as exc:
            raise RuntimeError(
                "Python package 'pytesseract' is missing. Install Backend requirements to enable OCR."
            ) from exc

        resolved_cmd = _resolve_tesseract_cmd()
        if resolved_cmd:
            _PYTESSERACT_MODULE.pytesseract.tesseract_cmd = resolved_cmd

    return _PYTESSERACT_MODULE

#Verifies that the OCR runtime is ready by checking for the presence of the Tesseract executable and its version.
def _verify_ocr_runtime() -> dict:
    pytesseract = _get_pytesseract_module()
    resolved_cmd = _resolve_tesseract_cmd()

    if not resolved_cmd:
        return {
            "ready": False,
            "message": "Tesseract executable was not found on PATH and TESSERACT_CMD is not set.",
            "tesseract_cmd": None,
            "version": None,
        }

    try:
        pytesseract.pytesseract.tesseract_cmd = resolved_cmd
        version = str(pytesseract.get_tesseract_version())
    except Exception as exc:
        return {
            "ready": False,
            "message": f"Tesseract was resolved but could not be executed: {exc}",
            "tesseract_cmd": resolved_cmd,
            "version": None,
        }

    return {
        "ready": True,
        "message": "OCR runtime is ready.",
        "tesseract_cmd": resolved_cmd,
        "version": version,
    }

#Returns the current UTC time in ISO 8601 format.
def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()



#Clamps the crop area to ensure it is within the image boundaries.
def _clamp_crop_area(crop_area: dict, image_width: int, image_height: int) -> dict:
    x = max(0, min(crop_area["x"], image_width - 1))
    y = max(0, min(crop_area["y"], image_height - 1))
    width = max(1, min(crop_area["width"], image_width - x))
    height = max(1, min(crop_area["height"], image_height - y))

    return {
        "x": x,
        "y": y,
        "width": width,
        "height": height,
    }

#Crops the given image to the specified crop area and returns the cropped image as bytes in PNG format.
def _crop_to_bytes(image: Image.Image, crop_area: dict) -> bytes:
    crop_box = (
        crop_area["x"],
        crop_area["y"],
        crop_area["x"] + crop_area["width"],
        crop_area["y"] + crop_area["height"],
    )
    cropped = image.crop(crop_box)
    output = io.BytesIO()
    cropped.save(output, format="PNG")
    return output.getvalue()


def _order_corners(corners: np.ndarray) -> np.ndarray:
    points = corners.reshape(4, 2).astype(np.float32)
    sums = points.sum(axis=1)
    differences = np.diff(points, axis=1).reshape(-1)

    return np.array(
        [
            points[np.argmin(sums)],
            points[np.argmin(differences)],
            points[np.argmax(sums)],
            points[np.argmax(differences)],
        ],
        dtype=np.float32,
    )


def _rectify_perspective_crop(image_bytes: bytes) -> bytes:
    encoded = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
    if image is None:
        return image_bytes

    height, width = image.shape[:2]
    if width < 2 or height < 2:
        return image_bytes

    grayscale = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(grayscale, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 150)
    edges = cv2.morphologyEx(
        edges,
        cv2.MORPH_CLOSE,
        cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5)),
    )
    contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

    minimum_area = width * height * 0.2
    table_corners = None
    for contour in sorted(contours, key=cv2.contourArea, reverse=True):
        if cv2.contourArea(contour) < minimum_area:
            break
        perimeter = cv2.arcLength(contour, True)
        corners = cv2.approxPolyDP(contour, 0.02 * perimeter, True)
        if len(corners) == 4 and cv2.isContourConvex(corners):
            table_corners = _order_corners(corners)
            break

    if table_corners is None:
        return image_bytes

    top_left, top_right, bottom_right, bottom_left = table_corners
    output_width = round(max(
        np.linalg.norm(bottom_right - bottom_left),
        np.linalg.norm(top_right - top_left),
    ))
    output_height = round(max(
        np.linalg.norm(top_right - bottom_right),
        np.linalg.norm(top_left - bottom_left),
    ))
    if output_width < 2 or output_height < 2:
        return image_bytes

    destination = np.array(
        [
            [0, 0],
            [output_width - 1, 0],
            [output_width - 1, output_height - 1],
            [0, output_height - 1],
        ],
        dtype=np.float32,
    )
    transform = cv2.getPerspectiveTransform(table_corners, destination)
    rectified = cv2.warpPerspective(image, transform, (output_width, output_height))
    success, result = cv2.imencode(".png", rectified)
    return result.tobytes() if success else image_bytes



def _png_bytes_to_data_url(image_bytes: bytes) -> str:
    encoded = base64.b64encode(image_bytes).decode("ascii")
    return f"data:image/png;base64,{encoded}"

#Normalizes the confidence value to a float between 0.0 and 1.0.
def _normalize_confidence(value) -> float:
    try:
        confidence = float(value)
    except (TypeError, ValueError):
        return 0.35

    if confidence < 0:
        return 0.35

    return round(min(confidence, 100.0) / 100.0, 2)

#Calculates the average confidence from a list of confidence values.
def _average_confidence(values: list[float]) -> float:
    if not values:
        return 0.2
    return round(sum(values) / len(values), 2)



##Builds a cell dictionary with the given value and confidence values.
def _build_cell(value, confidence_values: list[float]) -> dict:
    return {
        "value": value,
        "confidence": _average_confidence(confidence_values),
    }

##Default box score rows. Only returned when the crop is unusable (e.g. failed to decode).
def _template_row_labels(player_count: int) -> list[str]:
    player_labels = POSITION_ROW_LABELS if player_count == 5 else [f"Player {index + 1}" for index in range(player_count)]
    return [*player_labels, "TOTALS"]


def _fallback_box_score_rows(player_count: int, include_free_throws: bool) -> list[dict]:
    row_labels = _template_row_labels(player_count)
    template_columns = _template_columns(include_free_throws)
    player_rows = [
        {
            "PLAYER": {"value": label, "confidence": 0.2},
            **{column: {"value": "", "confidence": 0.2} for column in template_columns[1:]},
        }
        for label in row_labels[:-1]
    ]
    totals_row = {
        "PLAYER": {"value": "Totals"},
        **{column: {"value": ""} for column in template_columns[1:]},
    }
    return [*player_rows, totals_row]

#Turns a list of fractions into normalized cumulative boundary points from 0.0 to 1.0.
def _cumulative_boundaries(fractions: list[float]) -> list[float]:
    total = sum(fractions) or 1.0
    boundaries = [0.0]
    for fraction in fractions:
        boundaries.append(boundaries[-1] + fraction / total)
    boundaries[-1] = 1.0
    return boundaries

# DELETE THIS ONCE THE OCR IS WORKING PROPERLY
def _build_template_grid_preview(box_score_bytes: bytes, player_count: int, include_free_throws: bool) -> bytes | None:
    encoded = np.frombuffer(box_score_bytes, dtype=np.uint8)
    image = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
    if image is None:
        return None

    height, width = image.shape[:2]
    row_labels = _template_row_labels(player_count)
    row_fractions = [1 / len(row_labels)] * len(row_labels)
    physical_columns = _physical_columns(include_free_throws)
    column_fractions = [column["fraction"] for column in physical_columns]
    if height < len(row_fractions) or width < len(column_fractions):
        return None

    preview = image.copy()
    row_boundaries = _cumulative_boundaries(row_fractions)
    column_boundaries = _cumulative_boundaries(column_fractions)
    line_thickness = max(1, round(min(width, height) / 250))
    font_scale = max(0.35, min(width, height) / 650)
    label_thickness = max(1, line_thickness)

    for boundary in row_boundaries:
        y = min(height - 1, round(height * boundary))
        cv2.line(preview, (0, y), (width - 1, y), (0, 255, 255), line_thickness)

    for boundary in column_boundaries:
        x = min(width - 1, round(width * boundary))
        cv2.line(preview, (x, 0), (x, height - 1), (0, 255, 255), line_thickness)

    for row_index, row_label in enumerate(row_labels):
        y0 = round(height * row_boundaries[row_index])
        y1 = round(height * row_boundaries[row_index + 1])
        label_y = min(height - 4, y0 + max(14, round((y1 - y0) * 0.28)))
        cv2.putText(
            preview,
            row_label,
            (4, label_y),
            cv2.FONT_HERSHEY_SIMPLEX,
            font_scale,
            (0, 0, 0),
            label_thickness + 2,
            cv2.LINE_AA,
        )
        cv2.putText(
            preview,
            row_label,
            (4, label_y),
            cv2.FONT_HERSHEY_SIMPLEX,
            font_scale,
            (255, 255, 255),
            label_thickness,
            cv2.LINE_AA,
        )

    for column_index, column_def in enumerate(physical_columns):
        x0 = round(width * column_boundaries[column_index])
        x1 = round(width * column_boundaries[column_index + 1])
        label = "/".join(column_def["columns"])
        label_x = x0 + max(3, round((x1 - x0) * 0.05))
        label_y = min(height - 4, max(14, round(height * 0.06)))
        cv2.putText(
            preview,
            label,
            (label_x, label_y),
            cv2.FONT_HERSHEY_SIMPLEX,
            font_scale,
            (0, 0, 0),
            label_thickness + 2,
            cv2.LINE_AA,
        )
        cv2.putText(
            preview,
            label,
            (label_x, label_y),
            cv2.FONT_HERSHEY_SIMPLEX,
            font_scale,
            (0, 255, 255),
            label_thickness,
            cv2.LINE_AA,
        )

    success, result = cv2.imencode(".png", preview)
    return result.tobytes() if success else None

#Builds named OCR candidates from each stage of the existing cell preprocessing pipeline.
def _preprocess_cell_for_ocr(cell_bgr: np.ndarray) -> list[tuple[str, Image.Image]]:
    original_rgb = cv2.cvtColor(cell_bgr, cv2.COLOR_BGR2RGB)
    grayscale = cv2.cvtColor(cell_bgr, cv2.COLOR_BGR2GRAY)
    upscaled = cv2.resize(grayscale, None, fx=3.0, fy=3.0, interpolation=cv2.INTER_CUBIC)
    blurred = cv2.GaussianBlur(upscaled, (3, 3), 0)
    _, binary = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
    return [
        ("original", Image.fromarray(original_rgb)),
        ("grayscale", Image.fromarray(grayscale)),
        ("upscaled", Image.fromarray(upscaled)),
        ("blurred", Image.fromarray(blurred)),
        ("binary", Image.fromarray(binary)),
    ]

#Returns whether OCR text can be parsed as the expected physical cell kind.
def _is_valid_ocr_candidate(text: str, cell_kind: str) -> bool:
    if cell_kind == "single":
        return _parse_numeric_cell_value(text) != ""

    made_value, attempted_value = _parse_split_cell_value(text)
    return "/" in text and made_value != "" and attempted_value != ""

#Runs OCR at every preprocessing stage and returns the highest-confidence valid result.
async def _ocr_cell(
    cell_bgr: np.ndarray,
    whitelist: str,
    psm: int,
    cell_kind: str,
    progress_callback: Callable[[str], Awaitable[None]] | None = None,
) -> tuple[str, float]:
    if cell_bgr.size == 0:
        return "", 0.2

    pytesseract = _get_pytesseract_module()
    config = f"--oem 3 --psm {psm} -c tessedit_char_whitelist={whitelist}"
    best_text = ""
    best_confidence = 0.2

    for variant_name, image in _preprocess_cell_for_ocr(cell_bgr):
        data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT, config=config)
        texts = []
        confidences = []
        for text, conf in zip(data.get("text", []), data.get("conf", [])):
            cleaned = (text or "").strip()
            if not cleaned:
                continue
            texts.append(cleaned)
            confidences.append(_normalize_confidence(conf))

        candidate_text = "".join(texts)
        candidate_confidence = _average_confidence(confidences)
        if (
            _is_valid_ocr_candidate(candidate_text, cell_kind)
            and (not best_text or candidate_confidence > best_confidence)
        ):
            best_text = candidate_text
            best_confidence = candidate_confidence

            if progress_callback is not None:
                await progress_callback(variant_name)

    return best_text, best_confidence

#Parses an OCR'd numeric cell into an int, or an empty string if no digits were recognized.
def _parse_numeric_cell_value(text: str):
    digits = "".join(character for character in text if character.isdigit())
    return int(digits) if digits else ""

#Parses an OCR'd "made/attempted" cell (e.g. "5/10") into a (made, attempted) tuple of ints, or
#empty strings for whichever side had no recognizable digits.
def _parse_split_cell_value(text: str) -> tuple:
    made_text, _, attempted_text = text.partition("/")
    return _parse_numeric_cell_value(made_text), _parse_numeric_cell_value(attempted_text)


def _validate_box_score_rows(rows: list[dict], include_free_throws: bool) -> list[dict]:
    def add_error(row: dict, columns: tuple[str, ...], message: str) -> None:
        for column in columns:
            row[column].setdefault("validation_errors", []).append(message)

    for row in rows:
        for cell in row.values():
            cell.pop("validation_errors", None)

        if row.get("PLAYER", {}).get("value") == "Totals":
            continue

        values = {column: row.get(column, {}).get("value") for column in _template_columns(include_free_throws)[1:]}

        comparisons = [
            ("3PM", "FGM", "3PM cannot exceed FGM"),
            ("3PA", "FGA", "3PA cannot exceed FGA"),
            ("FGM", "FGA", "FGM cannot exceed FGA"),
            ("3PM", "3PA", "3PM cannot exceed 3PA"),
        ]
        if include_free_throws:
            comparisons.append(("FTM", "FTA", "FTM cannot exceed FTA"))
        for left_column, right_column, message in comparisons:
            left_value = values[left_column]
            right_value = values[right_column]
            if isinstance(left_value, int) and isinstance(right_value, int) and left_value > right_value:
                add_error(row, (left_column, right_column), message)

        fouls = values["FOULS"]
        if isinstance(fouls, int) and fouls > 6:
            add_error(row, ("FOULS",), "FOULS cannot exceed 6")

        scoring_columns = ("PTS", "FGM", "3PM", "FTM") if include_free_throws else ("PTS", "FGM", "3PM")
        if all(isinstance(values[column], int) for column in scoring_columns):
            expected_points = 2 * (values["FGM"] - values["3PM"]) + 3 * values["3PM"]
            if include_free_throws:
                expected_points += values["FTM"]
            if values["PTS"] != expected_points:
                add_error(row, scoring_columns, f"PTS should be {expected_points} from the shooting totals")

    return rows

#Splits the box score crop into a fixed row/column grid (matching the known Rec Center layout) and
#runs OCR on each cell independently, instead of trying to dynamically detect rows/columns of text.
async def _parse_box_score_template(
    box_score_bytes: bytes,
    expected_player_names: list[str] | None = None,
    player_count: int = 5,
    include_free_throws: bool = True,
    progress_callback: Callable[[str], Awaitable[None]] | None = None,
) -> dict:
    row_labels = _template_row_labels(player_count)
    row_fractions = [1 / len(row_labels)] * len(row_labels)
    template_columns = _template_columns(include_free_throws)
    physical_columns = _physical_columns(include_free_throws)
    encoded = np.frombuffer(box_score_bytes, dtype=np.uint8)
    image = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
    if image is None:
        return {"columns": template_columns, "rows": _fallback_box_score_rows(player_count, include_free_throws)}

    height, width = image.shape[:2]
    if height < len(row_fractions) or width < len(physical_columns):
        return {"columns": template_columns, "rows": _fallback_box_score_rows(player_count, include_free_throws)}

    row_boundaries = _cumulative_boundaries(row_fractions)
    column_boundaries = _cumulative_boundaries([column["fraction"] for column in physical_columns])
    names = [name.strip() for name in (expected_player_names or []) if name and name.strip()]

    rows_output = []
    for row_index, row_label in enumerate(row_labels):
        y0 = round(height * row_boundaries[row_index])
        y1 = round(height * row_boundaries[row_index + 1])
        row_image = image[y0:y1, :]

        if row_label == "TOTALS":
            rows_output.append({
                "PLAYER": {"value": "Totals"},
                **{column: {"value": ""} for column in template_columns[1:]},
            })
            continue

        player_name = names[row_index] if row_index < len(names) else ""
        row_cells = {"PLAYER": _build_cell(player_name or row_label, [1.0] if player_name else [0.2])}

        for column_index, column_def in enumerate(physical_columns):
            x0 = round(width * column_boundaries[column_index])
            x1 = round(width * column_boundaries[column_index + 1])
            cell_image = row_image[:, x0:x1]
            kind = column_def["kind"]

            if kind == "single":
                key = column_def["columns"][0]
                text, confidence = await _ocr_cell(
                    cell_image,
                    whitelist="0123456789",
                    psm=7,
                    cell_kind="single",
                    progress_callback=progress_callback,
                )
                value = _parse_numeric_cell_value(text)
                row_cells[key] = _build_cell(value, [confidence] if value != "" else [0.2])
                continue

            # kind == "split": one physical column holds "made/attempted" (e.g. "5/10").
            made_key, attempted_key = column_def["columns"]
            text, confidence = await _ocr_cell(
                cell_image,
                whitelist="0123456789/",
                psm=7,
                cell_kind="split",
                progress_callback=progress_callback,
            )
            made_value, attempted_value = _parse_split_cell_value(text)
            row_cells[made_key] = _build_cell(made_value, [confidence] if made_value != "" else [0.2])
            row_cells[attempted_key] = _build_cell(attempted_value, [confidence] if attempted_value != "" else [0.2])

        rows_output.append(row_cells)
    return {"columns": template_columns, "rows": _validate_box_score_rows(rows_output, include_free_throws)}

#Sets the state of the specified job.
async def _set_job_state(job_id: str, **changes) -> None:
    async with JOBS_LOCK:
        job = JOBS.get(job_id)
        if not job:
            return
        job.update(changes)
        job["updated_at"] = _utc_now_iso()

#Runs the parsing job for the given job ID.
async def _run_parsing_job(job_id: str) -> None:
    try:
        ocr_runtime = _verify_ocr_runtime()
        if not ocr_runtime["ready"]:
            raise RuntimeError(ocr_runtime["message"])

        await _set_job_state(job_id, status="processing", progress=20, message="Preparing box score crop")

        async with JOBS_LOCK:
            job = JOBS.get(job_id)
            if not job or job.get("status") == "cancelled":
                return
            box_score_bytes = job["temporary_crops"]["box_score"]
            player_count = job.get("player_count", 5)
            include_free_throws = job.get("include_free_throws", True)

        await asyncio.sleep(0.3)
        await _set_job_state(job_id, progress=50, message="Running OCR against the box score template")
        expected_player_names = job.get("expected_player_names") or []
        completed_variants = 0
        last_reported_progress = 50
        total_variants = player_count * len(_physical_columns(include_free_throws)) * 5

        async def report_variant_progress(variant_name: str) -> None:
            nonlocal completed_variants, last_reported_progress
            completed_variants += 1
            progress = 50 + (completed_variants * 45 // total_variants)
            if progress <= last_reported_progress:
                return

            last_reported_progress = progress
            await _set_job_state(
                job_id,
                progress=progress,
                message=f"Running {variant_name} OCR variant",
            )
            await asyncio.sleep(0)

        box_score_result = await _parse_box_score_template(
            box_score_bytes,
            expected_player_names,
            player_count,
            include_free_throws,
            progress_callback=report_variant_progress,
        )
         # Delete this once the OCR is working properly
        final_crops = {
            "box_score": {
                "mime_type": "image/png",
                "data_url": _png_bytes_to_data_url(box_score_bytes),
            },
        }

        if _template_grid_debug_enabled():
            try:
                template_grid_bytes = _build_template_grid_preview(box_score_bytes, player_count, include_free_throws)
            except Exception:
                template_grid_bytes = None
            if template_grid_bytes is not None:
                final_crops["template_grid"] = {
                    "mime_type": "image/png",
                    "data_url": _png_bytes_to_data_url(template_grid_bytes),
                }

        await asyncio.sleep(0.3)
        await _set_job_state(
            job_id,
            status="completed",
            progress=100,
            message="Structured data ready for confirmation",
            result={
                "box_score": box_score_result,
               #  "final_crops": {
               #      "box_score": {
               #          "mime_type": "image/png",
               #          "data_url": _png_bytes_to_data_url(box_score_bytes),
               #      },
               #  },

               # Delete this once the OCR is working properly
               "final_crops": final_crops,
            },
        )

        async with JOBS_LOCK:
            job = JOBS.get(job_id)
            if job:
                # Crop bytes are temporary and discarded once parsing is complete.
                job["temporary_crops"] = {}
                job["updated_at"] = _utc_now_iso()

    except Exception as exc:
        await _set_job_state(
            job_id,
            status="failed",
            message="Parsing failed",
            error=str(exc),
        )
