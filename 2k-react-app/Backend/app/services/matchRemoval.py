from pathlib import Path

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.boxScoreImage import BoxScoreImage
from app.models.games import Game
from app.models.playerStatline import PlayerStatline


def delete_orphaned_games(db: Session) -> list[str]:
    orphaned_games = (
        db.query(Game)
        .outerjoin(PlayerStatline, PlayerStatline.game_id == Game.id)
        .group_by(Game.id)
        .having(func.count(PlayerStatline.id) == 0)
        .all()
    )

    files_to_delete: list[str] = []
    for game in orphaned_games:
        images = db.query(BoxScoreImage).filter(BoxScoreImage.game_id == game.id).all()
        for image in images:
            files_to_delete.extend(
                path for path in (image.original_path, image.processed_path) if path
            )
            db.delete(image)
        db.delete(game)

    return files_to_delete


def delete_image_files(paths: list[str]) -> None:
    for path in set(paths):
        Path(path).unlink(missing_ok=True)
