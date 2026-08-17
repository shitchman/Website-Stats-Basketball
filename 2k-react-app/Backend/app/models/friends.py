from sqlalchemy import CheckConstraint, Integer, String, ForeignKey;
from sqlalchemy.orm import Mapped, mapped_column, relationship;

from app.database.database import Base

#Users friends they want to track the stats of
class Friend(Base):
    __tablename__ = 'friends'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('user_account.id', ondelete='CASCADE'), nullable=False)
    name: Mapped[str] = mapped_column(String(20), nullable=False)
    online_ID: Mapped[str] = mapped_column(String(20), nullable=False)

    user_account: Mapped["UserAccountModel"] = relationship(back_populates="friends")
    statlines: Mapped[list["PlayerStatline"]] = relationship(back_populates="friend", foreign_keys="PlayerStatline.friend_id")
    games: Mapped[list["Game"]] = relationship(back_populates="friend", foreign_keys="Game.friend_id")

    __table_args__ = (
        CheckConstraint(
            """
            (user_id IS NOT NULL AND name IS NOT NULL AND online_ID IS NOT NULL)
            """,
            name="friend_user_info_check"
        ),
    )

