from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Integer, String, DateTime, ForeignKey;
from sqlalchemy.orm import Mapped, mapped_column, relationship;

from app.database.database import Base

from datetime import datetime;

if TYPE_CHECKING:
    from app.models.boxScoreImage import BoxScoreImage
    from app.models.builds import BuildModel
    from app.models.playerStatline import PlayerStatline
    from app.models.userAccount import UserAccountModel
    from app.models.gameModes import GameModes
    from app.models.teamStatline import TeamStatline


#Will store information about the games that the user has played, including the build that was used, the game mode, and the date and time of the game
class Game(Base):
    __tablename__ = 'games'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('user_account.id', ondelete='CASCADE'), nullable=False)
    game_mode_id: Mapped[int] = mapped_column(Integer, ForeignKey('game_modes.id', ondelete='CASCADE'), nullable=False)
    build_id: Mapped[int] = mapped_column(Integer, ForeignKey('builds.id', ondelete='SET NULL'), nullable=True)
    date_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False) #Will be selected from a date picker

    result: Mapped[str] = mapped_column(String(1), nullable=False)

    points_for: Mapped[int] = mapped_column(Integer, nullable=False)
    q1_points_for: Mapped[int] = mapped_column(Integer, nullable=False)
    q2_points_for: Mapped[int] = mapped_column(Integer, nullable=False)
    q3_points_for: Mapped[int] = mapped_column(Integer, nullable=False)
    q4_points_for: Mapped[int] = mapped_column(Integer, nullable=False)

    points_against: Mapped[int] = mapped_column(Integer, nullable=False)
    q1_points_against: Mapped[int] = mapped_column(Integer, nullable=False)
    q2_points_against: Mapped[int] = mapped_column(Integer, nullable=False)
    q3_points_against: Mapped[int] = mapped_column(Integer, nullable=False)
    q4_points_against: Mapped[int] = mapped_column(Integer, nullable=False)
    

    user_account: Mapped["UserAccountModel"] = relationship(back_populates="games")
    build: Mapped["BuildModel"] = relationship(back_populates="games", foreign_keys=[build_id])
    game_mode: Mapped["GameModes"] = relationship(back_populates="games")
    statlines: Mapped[list["PlayerStatline"]] = relationship( back_populates="game", cascade="all, delete-orphan")
    team_statline: Mapped["TeamStatline"] = relationship(back_populates="game", cascade="all, delete-orphan", uselist=False)
    box_score_images: Mapped[list["BoxScoreImage"]] = relationship(back_populates="game", cascade="all, delete-orphan")

    @property
    def build_name(self) -> str | None:
        return self.build.build_name if self.build else None

    # The statline that belongs to the user themselves rather than a friend they played with
    @property
    def user_statline(self) -> "PlayerStatline | None":
        return next((statline for statline in self.statlines if statline.build_id is not None), None)
    

    __table_args__ = (
        CheckConstraint(
            """
            game_mode_id IS NOT NULL AND user_id IS NOT NULL AND date_time IS NOT NULL AND result IS NOT NULL
            AND points_for IS NOT NULL AND q1_points_for IS NOT NULL AND q2_points_for IS NOT NULL
            AND q3_points_for IS NOT NULL AND q4_points_for IS NOT NULL AND points_against IS NOT NULL
            AND q1_points_against IS NOT NULL AND q2_points_against IS NOT NULL
            AND q3_points_against IS NOT NULL AND q4_points_against IS NOT NULL
            """,
            name="game_info_check"
        ),
    )
