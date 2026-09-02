import asyncio
import io
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from app.services.imageCleanup import (_utc_now_iso, _clamp_crop_area, _crop_to_bytes, _rectify_perspective_crop, _run_parsing_job, _verify_ocr_runtime, PROCESSED_STORAGE_PATH, JOBS, JOBS_LOCK)

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from PIL import Image
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.boxScoreImage import BoxScoreImage
from app.models.builds import BuildModel
from app.models.friends import FriendModel
from app.models.games import Game
from app.models.playerStatline import PlayerStatline
from app.models.teamStatline import TeamStatline
from app.routers.auth import getCurrentUser_id
from app.schemas.games import ConfirmGameRequest

router = APIRouter()
POSITION_SLOTS = {"PG", "SG", "SF", "PF", "C"}
GAME_MODE_RULES = {
    1: {"player_count": 5, "uses_positions": True, "include_free_throws": True},
    2: {"player_count": 2, "uses_positions": False, "include_free_throws": False},
    3: {"player_count": 3, "uses_positions": False, "include_free_throws": False},
    4: {"player_count": 3, "uses_positions": False, "include_free_throws": False},
    5: {"player_count": 5, "uses_positions": True, "include_free_throws": True},
    6: {"player_count": 1, "uses_positions": False, "include_free_throws": False},
    7: {"player_count": 2, "uses_positions": False, "include_free_throws": False},
    8: {"player_count": 3, "uses_positions": False, "include_free_throws": False},
    9: {"player_count": 1, "uses_positions": False, "include_free_throws": False},
    10: {"player_count": 2, "uses_positions": False, "include_free_throws": False},
    11: {"player_count": 3, "uses_positions": False, "include_free_throws": False},
}


def _parse_expected_players(raw_value: str | None) -> list[str]:
    if not raw_value:
        return []
    candidates = re.split(r"[,\n;]+", raw_value)
    return [cleaned for candidate in candidates if (cleaned := candidate.strip())]

# Uploads router for handling game image uploads and OCR processing.
    runtime = _verify_ocr_runtime()
    if not runtime["ready"]:
        raise HTTPException(status_code=503, detail=runtime)

    return runtime


@router.post("/uploadGame")
async def upload_image(
    file: UploadFile = File(...),
    crop_x: float = Form(...),
    crop_y: float = Form(...),
    crop_width: float = Form(...),
    crop_height: float = Form(...),
    game_mode_id: int = Form(...),
):
    image_bytes = await file.read()
    confirmation = {
        "message": "Box score crop received by Python",
        "filename": file.filename,
        "content_type": file.content_type,
        "image_size_bytes": len(image_bytes),
        "crop_area": {
            "x": crop_x,
            "y": crop_y,
            "width": crop_width,
            "height": crop_height,
        },
        "game_mode_id": game_mode_id,
    }
    print(f"Box score crop received: {confirmation}")

    return confirmation

#Initiates the upload process for a game, including cropping the box score and team scores from the uploaded image. The job is queued for background processing.
@router.post("/uploadGame/start")
async def start_upload_job(
    file: UploadFile = File(...),
    game_mode_id: int = Form(...),
    box_crop_x: int = Form(...),
    box_crop_y: int = Form(...),
    box_crop_width: int = Form(...),
    box_crop_height: int = Form(...),
    expected_players: str | None = Form(default=None),
):
    mode_rules = GAME_MODE_RULES.get(game_mode_id)
    if not mode_rules:
        raise HTTPException(status_code=422, detail="Unsupported game mode.")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid image uploaded: {exc}") from exc

    box_crop = _clamp_crop_area(
        {
            "x": box_crop_x,
            "y": box_crop_y,
            "width": box_crop_width,
            "height": box_crop_height,
        },
        image.width,
        image.height,
    )

    box_score_bytes = _rectify_perspective_crop(_crop_to_bytes(image, box_crop))
    expected_player_names = _parse_expected_players(expected_players)
    if len(expected_player_names) != mode_rules["player_count"]:
        raise HTTPException(status_code=422, detail="The selected game mode has an invalid player count.")

    job_id = str(uuid.uuid4())
    now = _utc_now_iso()

    async with JOBS_LOCK:
        JOBS[job_id] = {
            "job_id": job_id,
            "status": "queued",
            "progress": 5,
            "message": "Job queued",
            "created_at": now,
            "updated_at": now,
            "game_mode_id": game_mode_id,
            "original_filename": file.filename or "upload.jpg",
            "original_content_type": file.content_type or "image/jpeg",
            "original_image_bytes": image_bytes,
            "temporary_crops": {
                "box_score": box_score_bytes,
            },
            "expected_player_names": expected_player_names,
            "player_count": mode_rules["player_count"],
            "uses_positions": mode_rules["uses_positions"],
            "include_free_throws": mode_rules["include_free_throws"],
            "result": None,
            "error": None,
        }

    asyncio.create_task(_run_parsing_job(job_id))

    return {
        "job_id": job_id,
        "status": "queued",
        "progress": 5,
        "message": "Upload accepted. Parsing started in background.",
    }

#Returns the status of the selected upload job, including progress and any results if the job is completed. If the job is not found, a 404 error is returned.
@router.get("/uploadGame/jobs/{job_id}")
async def get_upload_job_status(job_id: str):
    async with JOBS_LOCK:
        job = JOBS.get(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    response = {
        "job_id": job["job_id"],
        "status": job["status"],
        "progress": job["progress"],
        "message": job["message"],
        "created_at": job["created_at"],
        "updated_at": job["updated_at"],
        "error": job.get("error"),
    }

    if job["status"] == "completed":
        response["result"] = job.get("result")

    return response

#Deletes the selected upload job, discarding any temporary data associated with it. If the job is not found, a 404 error is returned.
@router.delete("/uploadGame/jobs/{job_id}")
async def cancel_upload_job(job_id: str):
    async with JOBS_LOCK:
        job = JOBS.get(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found.")
        JOBS.pop(job_id, None)

    return {
        "message": "Job cancelled and temporary data discarded.",
        "job_id": job_id,
    }

# Validates that every build/friend referenced in the confirm payload actually belongs to the current user, preventing statlines being attached to another user's data.
def _validate_statline_ownership(
    payload: ConfirmGameRequest,
    current_user_id: int,
    db: Session,
) -> None:
    own_build = db.query(BuildModel).filter(
        (BuildModel.id == payload.build_id) & (BuildModel.user_id == current_user_id)
    ).first()
    if not own_build:
        raise HTTPException(status_code=404, detail="Selected build was not found.")

    for statline in payload.statlines:
        if statline.is_self:
            build = db.query(BuildModel).filter(
                (BuildModel.id == statline.build_id) & (BuildModel.user_id == current_user_id)
            ).first()
            if not build:
                raise HTTPException(status_code=404, detail=f"Build for position {statline.position} was not found.")
        else:
            friend = db.query(FriendModel).filter(
                (FriendModel.id == statline.friend_id) & (FriendModel.user_id == current_user_id)
            ).first()
            if not friend:
                raise HTTPException(status_code=404, detail=f"Friend for position {statline.position} was not found.")

            friend_build = db.query(BuildModel).filter(
                (BuildModel.id == statline.friend_build_id) & (BuildModel.friend_id == statline.friend_id)
            ).first()
            if not friend_build:
                raise HTTPException(status_code=404, detail=f"Friend build for position {statline.position} was not found.")


def _validate_statline_shape(payload: ConfirmGameRequest, job: dict) -> None:
    expected_player_count = len(job.get("expected_player_names") or [])
    if len(payload.statlines) > expected_player_count:
        raise HTTPException(status_code=422, detail="Too many player statlines were submitted for this game mode.")

    uses_positions = job.get("uses_positions", False)
    positions = [statline.position for statline in payload.statlines]
    if uses_positions:
        if any(position not in POSITION_SLOTS for position in positions):
            raise HTTPException(status_code=422, detail="This game mode requires PG, SG, SF, PF, or C positions.")
        if len(set(positions)) != len(positions):
            raise HTTPException(status_code=422, detail="Each position can only be used once per game.")
    elif any(position is not None for position in positions):
        raise HTTPException(status_code=422, detail="This game mode does not use player positions.")


# Confirms the selected upload job: persists the original image, creates the game record, and saves each player's statline. If the job is not found or not ready for confirmation, appropriate errors are returned.
@router.post("/uploadGame/jobs/{job_id}/confirm")
async def confirm_upload_job(
    job_id: str,
    payload: ConfirmGameRequest,
    current_user_id: int = Depends(getCurrentUser_id),
    db: Session = Depends(get_db),
):
    async with JOBS_LOCK:
        job = JOBS.get(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    if job["status"] != "completed":
        raise HTTPException(status_code=409, detail="Job is not ready for confirmation.")

    _validate_statline_shape(payload, job)
    _validate_statline_ownership(payload, current_user_id, db)

    PROCESSED_STORAGE_PATH.mkdir(parents=True, exist_ok=True)
    source_name = Path(job["original_filename"]).name
    extension = Path(source_name).suffix or ".png"
    output_filename = f"{job_id}_original{extension}"
    output_path = PROCESSED_STORAGE_PATH / output_filename

    with open(output_path, "wb") as output_file:
        output_file.write(job["original_image_bytes"])

    new_game = Game(
        user_id=current_user_id,
        game_mode_id=job["game_mode_id"],
        build_id=payload.build_id,
        date_time=datetime.combine(payload.date_time, datetime.min.time(), tzinfo=timezone.utc),
        result=payload.result,
        points_for=payload.points_for,
        q1_points_for=payload.q1_points_for,
        q2_points_for=payload.q2_points_for,
        q3_points_for=payload.q3_points_for,
        q4_points_for=payload.q4_points_for,
        points_against=payload.points_against,
        q1_points_against=payload.q1_points_against,
        q2_points_against=payload.q2_points_against,
        q3_points_against=payload.q3_points_against,
        q4_points_against=payload.q4_points_against,
    )
    db.add(new_game)
    db.flush()

    for statline in payload.statlines:
        db.add(PlayerStatline(
            game_id=new_game.id,
            build_id=statline.build_id,
            friend_id=statline.friend_id,
            friend_build_id=statline.friend_build_id,
            points=statline.points,
            rebounds=statline.rebounds,
            assists=statline.assists,
            steals=statline.steals,
            blocks=statline.blocks,
            fouls=statline.fouls,
            turnovers=statline.turnovers,
            field_goals_made=statline.field_goals_made,
            field_goals_attempted=statline.field_goals_attempted,
            three_pointers_made=statline.three_pointers_made,
            three_pointers_attempted=statline.three_pointers_attempted,
            free_throws_made=statline.free_throws_made,
            free_throws_attempted=statline.free_throws_attempted,
            position=statline.position,
            opponent=statline.opponent,
        ))

    db.add(TeamStatline(
        game_id=new_game.id,
        **payload.team_statline.model_dump(),
    ))

    db.add(BoxScoreImage(
        user_id=current_user_id,
        game_id=new_game.id,
        original_path=str(output_path),
        created_at=datetime.now(timezone.utc),
    ))

    db.commit()

    async with JOBS_LOCK:
        JOBS.pop(job_id, None)

    return {
        "message": "Game confirmed and saved.",
        "game_id": new_game.id,
        "saved_original_image": str(output_path),
    }






