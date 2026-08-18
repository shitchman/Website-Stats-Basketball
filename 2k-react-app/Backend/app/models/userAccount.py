from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Integer, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.friends import FriendModel
    from app.models.builds import BuildModel
    from app.models.games import Game


#Will be used for authentication and authorization of users, this will be used to create user accounts and store their information
class UserAccountModel(Base):
    __tablename__ = 'user_account'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    online_ID: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    friends: Mapped[list["FriendModel"]] = relationship( back_populates="user_account", cascade="all, delete-orphan")
    builds: Mapped[list["BuildModel"]] = relationship(back_populates="user_account", cascade="all, delete-orphan")
    games: Mapped[list["Game"]] = relationship(back_populates="user_account", cascade="all, delete-orphan")
