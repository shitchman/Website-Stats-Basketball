from sqlalchemy.orm import Mapped, mapped_column, relationship;
from sqlalchemy import Integer, String, ForeignKey, CheckConstraint;

from app.database.database import Base;

#Defines what will be stored for each relevant player from each game
class PlayerStatline(Base):

    __tablename__ = 'player_statlines'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    game_id: Mapped[int] = mapped_column(Integer, ForeignKey('games.id', ondelete='CASCADE'), nullable=False)
    build_id: Mapped[int] = mapped_column(Integer, ForeignKey('builds.id', ondelete='CASCADE'), nullable=False)
    friend_id: Mapped[int] = mapped_column(Integer, ForeignKey('friends.id'), nullable=True)
    friend_build_id: Mapped[int] = mapped_column(Integer, ForeignKey('builds.id'), nullable=True)

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
    position: Mapped[str] = mapped_column(String(10), nullable=True) #Might be used
    opponent: Mapped[str] = mapped_column(String(50), nullable=True) #Might be used

    game: Mapped["Game"] = relationship(back_populates="statlines")
    builds: Mapped["Builds"] = relationship(back_populates="statlines", foreign_keys=[build_id])
    friend_build: Mapped["Builds"] = relationship(back_populates="friend_statlines", foreign_keys=[friend_build_id])
    friend: Mapped["Friend"] = relationship(back_populates="statlines", foreign_keys=[friend_id])

    __table_args__ = (
        CheckConstraint(
            """
            (build_id IS NOT NULL AND friend_id IS NULL AND friend_build_id IS NULL)
            OR
            (build_id IS NULL AND friend_id IS NOT NULL AND friend_build_id IS NOT NULL)
            """,
            name="statline_player_type_check"
        ),
    )

