from sqlalchemy import Column, DateTime, DateTime, Integer, String, ForeignKey

from app.database.database import Base


#Stores the box score images, processed and orignal
class BoxScoreImage(Base):
    __tablename__ = "box_score_images"

    id = Column(Integer, primary_key=True)
    user_id = Column(ForeignKey("user_account.id"), nullable=False)
    original_path = Column(String, nullable=False)
    processed_path = Column(String)
    created_at = Column(DateTime)
