from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = 'sqlite:///./myDatabase.db'

engine = create_engine(DATABASE_URL, connect_args={'check_same_thread': False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Defined a function to get a database session, which is used as a dependency in the API endpoints. This function ensures that the database session is properly closed after use.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
