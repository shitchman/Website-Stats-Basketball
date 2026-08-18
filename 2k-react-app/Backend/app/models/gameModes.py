from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Integer, String;
from sqlalchemy.orm import Mapped, mapped_column, relationship;

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.games import Game

#Will have the different game modes that the user can choose form when playing
class GameModes(Base):
    __tablename__ = 'game_modes'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, nullable=False)
    mode_name: Mapped[str] = mapped_column(String(20), nullable=False) #Will be selected from a dropdown menu of game modes including: 3v3 Park, 5v5 Park, 3v3 Pro-Am, 5v5 Pro-Am, Rec Center, etc

    games: Mapped[list["Game"]] = relationship( back_populates="game_mode")

    __table_args__ = (
        CheckConstraint(
            """
            (mode_name IS NOT NULL)
            """,
            name="game_mode_name_check"
        ),
    )
