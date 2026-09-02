from typing import TYPE_CHECKING

from sqlalchemy.orm import Mapped, mapped_column, relationship;
from sqlalchemy import ForeignKey, Integer, UniqueConstraint;

from app.database.database import Base;

if TYPE_CHECKING:
    from app.models.games import Game


#Stores the combined totals row of a game's box score, using the same stat columns as PlayerStatline
class TeamStatline(Base):

    __tablename__ = 'team_statlines'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    game_id: Mapped[int] = mapped_column(Integer, ForeignKey('games.id', ondelete='CASCADE'), nullable=False)

    points: Mapped[int] = mapped_column(Integer, nullable=False)
    rebounds: Mapped[int] = mapped_column(Integer, nullable=False)
    assists: Mapped[int] = mapped_column(Integer, nullable=False)
    steals: Mapped[int] = mapped_column(Integer, nullable=False)
    blocks: Mapped[int] = mapped_column(Integer, nullable=False)
    fouls: Mapped[int] = mapped_column(Integer, nullable=False)
    turnovers: Mapped[int] = mapped_column(Integer, nullable=False)
    field_goals_made: Mapped[int] = mapped_column(Integer, nullable=False)
    field_goals_attempted: Mapped[int] = mapped_column(Integer, nullable=False)
    three_pointers_made: Mapped[int] = mapped_column(Integer, nullable=False)
    three_pointers_attempted: Mapped[int] = mapped_column(Integer, nullable=False)
    free_throws_made: Mapped[int] = mapped_column(Integer, nullable=False)
    free_throws_attempted: Mapped[int] = mapped_column(Integer, nullable=False)

    game: Mapped["Game"] = relationship(back_populates="team_statline")

    __table_args__ = (
        UniqueConstraint("game_id", name="unique_team_statline_per_game"),
    )
