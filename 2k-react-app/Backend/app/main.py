from fastapi import FastAPI, Depends;
from fastapi.middleware.cors import CORSMiddleware;

from typing import Annotated;
# import os;
from sqlalchemy.orm import Session;

from app.routers import userAccount as userAccount_router, auth as auth_router, friends as friends_router, builds as builds_router, uploads as uploads_router, games as games_router;
from app.database.database import Base, get_db, engine;

# Imports every model module so all tables/relationships are registered on Base before create_all/mapper configuration
from app.models import boxScoreImage, builds, friends, gameModes, games, playerStatline, teamStatline, userAccount;



#Sets urls which can access the backend API, this is to prevent CORS errors when the frontend tries to access the backend and restrict access to only specific frontend urls
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


#Creates a FastAPI under the name of app
app = FastAPI()


# Adds CORS middleware to the FastAPI app, allowing cross-origin requests from the specified origins. This is necessary for the frontend to communicate with the backend without running into CORS issues.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


# Adds the routers for the fast API app
app.include_router(
    userAccount_router.router,
    prefix='/userAccount',
)

app.include_router(
    auth_router.router,
    prefix='/auth',
)

app.include_router(
    friends_router.router,
    prefix='/friends',
)

app.include_router(
    builds_router.router,
    prefix='/builds',
)

app.include_router(
    uploads_router.router,
    prefix='/uploads',
)

app.include_router(
    games_router.router,
    prefix='/games',
)


#Defines all of the current routes witin the FastAPI app. Each route is associated with a specific endpoint and HTTP method, and returns a JSON response when accessed. These routes can be expanded to include more functionality as needed.
@app.get("/")
async def root():
    return {
        "message": "2K React API is running",
        "documentation": "/docs"
    }


# Defines a type alias for the database dependency, which is used in the API endpoints to inject the database session.
db_dependency = Annotated[Session, Depends(get_db)]


# Clears the database on each startup whilst in development environment. The creates the database tables based on the models defined in models.py. This ensures that the necessary tables are created in the database when the application starts.
# if os.getenv("ENVIRONMENT") != "production":
#     Base.metadata.drop_all(bind=engine)
    
Base.metadata.create_all(bind=engine)