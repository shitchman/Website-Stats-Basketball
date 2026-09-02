from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session, selectinload

from app.database.database import get_db
from app.models.boxScoreImage import BoxScoreImage
from app.models.games import Game
from app.routers.auth import getCurrentUser_id
from app.schemas.games import GameDetailOut, GameOut
from app.services.matchRemoval import delete_image_files

router = APIRouter()


# Returns every game the user has saved, newest first, with the team totals attached
@router.get("/myGames", response_model=list[GameOut])
async def get_games(
    current_user_id: int = Depends(getCurrentUser_id),
    db: Session = Depends(get_db),
):
    return (
        db.query(Game)
        .options(selectinload(Game.team_statline), selectinload(Game.statlines), selectinload(Game.build))
        .filter(Game.user_id == current_user_id)
        .order_by(Game.date_time.desc(), Game.id.desc())
        .all()
    )


# Returns a single game including every player statline recorded for it
@router.get("/myGames/{game_id}", response_model=GameDetailOut)
async def get_game(
    game_id: int,
    current_user_id: int = Depends(getCurrentUser_id),
    db: Session = Depends(get_db),
):
    game = (
        db.query(Game)
        .options(selectinload(Game.team_statline), selectinload(Game.statlines))
        .filter((Game.id == game_id) & (Game.user_id == current_user_id))
        .first()
    )

    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    return game


# Deletes a game along with its player statlines, team statline and box score images (rows and files)
@router.delete("/deleteGame/{game_id}", status_code=204, response_class=Response)
async def delete_game(
    game_id: int,
    current_user_id: int = Depends(getCurrentUser_id),
    db: Session = Depends(get_db),
):
    game = db.query(Game).filter(
        (Game.id == game_id) & (Game.user_id == current_user_id)
    ).first()

    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    images = db.query(BoxScoreImage).filter(BoxScoreImage.game_id == game_id).all()
    files_to_delete = [
        path for image in images for path in (image.original_path, image.processed_path) if path
    ]

    db.delete(game)
    db.commit()

    delete_image_files(files_to_delete)

    return Response(status_code=204)
