from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Integer, String, DateTime, ForeignKey;
from sqlalchemy.orm import Mapped, mapped_column, relationship;

from app.database.database import Base

from datetime import datetime;

if TYPE_CHECKING:
    from app.models.friends import FriendModel
    from app.models.builds import BuildModel
    from app.models.playerStatline import PlayerStatline
    from app.models.userAccount import UserAccountModel
    from app.models.gameModes import GameModes


#Will store information about the games that the user has played, including the build that was used, the game mode, and the date and time of the game
class Game(Base):
    __tablename__ = 'games'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('user_account.id', ondelete='CASCADE'), nullable=True)
    game_mode_id: Mapped[int] = mapped_column(Integer, ForeignKey('game_modes.id', ondelete='CASCADE'), nullable=False)
    build_id: Mapped[int] = mapped_column(Integer, ForeignKey('builds.id', ondelete='CASCADE'), nullable=True)
    friend_id: Mapped[int] = mapped_column(Integer, ForeignKey('friends.id', ondelete='CASCADE'), nullable=True)
    friend_build_id: Mapped[int] = mapped_column(Integer, ForeignKey('builds.id', ondelete='CASCADE'), nullable=True)
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
    game_mode: Mapped["GameModes"] = relationship(back_populates="games")
    statlines: Mapped[list["PlayerStatline"]] = relationship( back_populates="game", cascade="all, delete-orphan")
    friend: Mapped["FriendModel"] = relationship(back_populates="games", foreign_keys=[friend_id])
    build: Mapped["BuildModel"] = relationship(back_populates="games", foreign_keys=[build_id])
    friend_build: Mapped["BuildModel"] = relationship(back_populates="friend_games", foreign_keys=[friend_build_id])

    __table_args__ = (
        CheckConstraint(
            """
            (game_mode_id IS NOT NULL AND user_id IS NOT NULL AND build_id IS NOT NULL AND date_time IS NOT NULL AND result IS NOT NULL AND points_for IS NOT NULL AND q1_points_for IS NOT NULL AND q2_points_for IS NOT NULL AND q3_points_for IS NOT NULL AND q4_points_for IS NOT NULL AND points_against IS NOT NULL AND q1_points_against IS NOT NULL AND q2_points_against IS NOT NULL AND q3_points_against IS NOT NULL AND q4_points_against IS NOT NULL)

            OR

            (game_mode_id IS NOT NULL AND friend_id IS NOT NULL AND friend_build_id IS NOT NULL AND date_time IS NOT NULL AND result IS NOT NULL AND points_for IS NOT NULL AND q1_points_for IS NOT NULL AND q2_points_for IS NOT NULL AND q3_points_for IS NOT NULL AND q4_points_for IS NOT NULL AND points_against IS NOT NULL AND q1_points_against IS NOT NULL AND q2_points_against IS NOT NULL AND q3_points_against IS NOT NULL AND q4_points_against IS NOT NULL)
            """,
            name="game_info_check"
        ),
    )
