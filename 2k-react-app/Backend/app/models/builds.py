from sqlalchemy import CheckConstraint, Integer, String, ForeignKey;
from sqlalchemy.orm import Mapped, mapped_column, relationship;

from app.database.database import Base


#Stores individual build information
class Builds(Base):
    __tablename__ = 'builds'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('user_account.id', ondelete='CASCADE'), nullable=True)
    friend_id: Mapped[int] = mapped_column(Integer, ForeignKey('friends.id', ondelete='CASCADE'), nullable=True)
    name: Mapped[str] = mapped_column(String(20), nullable=False)
    preferred_position: Mapped[str] = mapped_column(String(15), nullable=False) #Will be selected from a dropdown menu of positions

    user_account: Mapped["UserAccountModel"] = relationship(back_populates="builds")
    statlines: Mapped[list["PlayerStatline"]] = relationship(back_populates="builds", foreign_keys="PlayerStatline.build_id")
    friend_statlines: Mapped[list["PlayerStatline"]] = relationship(back_populates="friend_build", foreign_keys="PlayerStatline.friend_build_id")
    games: Mapped[list["Game"]] = relationship(back_populates="build", foreign_keys="Game.build_id")
    friend_games: Mapped[list["Game"]] = relationship(back_populates="friend_build", foreign_keys="Game.friend_build_id")

    __table_args__ = (
        CheckConstraint(
            """
            (user_id IS NOT NULL AND name IS NOT NULL AND preferred_position IS NOT NULL)
            OR
            (friend_id IS NOT NULL AND name IS NOT NULL AND preferred_position IS NOT NULL)
            """,
            name="build_user_info_check"
        ),
    )

