from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.games import Game


#Stores the box score images, processed and orignal
class BoxScoreImage(Base):
    __tablename__ = "box_score_images"

    id = Column(Integer, primary_key=True)
    user_id = Column(ForeignKey("user_account.id", ondelete="CASCADE"), nullable=False)
    game_id = Column(ForeignKey("games.id", ondelete="CASCADE"), nullable=True)
    original_path = Column(String, nullable=False)
    processed_path = Column(String)
    created_at = Column(DateTime)

    game = relationship("Game", back_populates="box_score_images")
