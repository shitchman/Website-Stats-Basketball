from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Integer, String, ForeignKey;
from sqlalchemy.orm import Mapped, mapped_column, relationship;

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.userAccount import UserAccountModel
    from app.models.builds import BuildModel
    from app.models.playerStatline import PlayerStatline

#Users friends they want to track the stats of
class FriendModel(Base):
    __tablename__ = 'friends'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('user_account.id', ondelete='CASCADE'), nullable=False)
    name: Mapped[str] = mapped_column(String(20), nullable=False)
    online_ID: Mapped[str] = mapped_column(String(20), nullable=False)

    user_account: Mapped["UserAccountModel"] = relationship(back_populates="friends")
    builds: Mapped[list["BuildModel"]] = relationship(back_populates="friend", foreign_keys="BuildModel.friend_id")
    statlines: Mapped[list["PlayerStatline"]] = relationship(back_populates="friend", foreign_keys="PlayerStatline.friend_id")

