from sqlalchemy import Column, DateTime, Integer, String, ForeignKey

from app.database.database import Base


#Stores the box score images, processed and orignal
class BoxScoreImage(Base):
    __tablename__ = "box_score_images"

    id = Column(Integer, primary_key=True)
    user_id = Column(ForeignKey("user_account.id", ondelete="CASCADE"), nullable=False)
    build_id = Column(ForeignKey("builds.id", ondelete="CASCADE"), nullable=True)
    friend_build_id = Column(ForeignKey("builds.id", ondelete="CASCADE"), nullable=True)
    original_path = Column(String, nullable=False)
    processed_path = Column(String)
    created_at = Column(DateTime)
