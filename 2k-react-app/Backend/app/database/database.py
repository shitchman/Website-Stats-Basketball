from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.utils.confg import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Defined a function to get a database session, which is used as a dependency in the API endpoints. This function ensures that the database session is properly closed after use.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
