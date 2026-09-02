from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

from app.models.userAccount import UserAccountModel
from app.utils.confg import settings

from fastapi import APIRouter, Cookie, HTTPException, Response



router = APIRouter()

# Configuration settings for authentication, including secret key, algorithm, and idle timeout.
SECRET_KEY = settings.secret_key
ALGORITHM = "HS256"
SESSION_IDLE_TIMEOUT_MINUTES = 10
SESSION_IDLE_TIMEOUT_SECONDS = SESSION_IDLE_TIMEOUT_MINUTES * 60


password_hash = PasswordHash.recommended()


#Creates a hashed password that will represent the users password in the database, this is to ensure that the users password is not stored in plain text and is secure
def hash_password(password: str):
    return password_hash.hash(password)


#Checks the login password against the hashed password stored in the database, returns True if the password is correct, False otherwise
def verify_password(password: str, hashed_password: str):
    return password_hash.verify(password, hashed_password)


#Creates a JWT access token for the user with the given user_id, which can be used for authentication and authorization in the application. The token includes an expiration time and is signed with a secret key.
def create_access_token(user_id: int):

    expire = datetime.now(timezone.utc) + timedelta(minutes=SESSION_IDLE_TIMEOUT_MINUTES)
    payload = { "sub": str(user_id), "exp": expire}

    return jwt.encode( payload, SECRET_KEY, algorithm=ALGORITHM )


def set_access_token_cookie(response: Response, access_token: str):
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=SESSION_IDLE_TIMEOUT_SECONDS,
    )


#Checks to make sure the user exists and that the password is correct. Upon success it will then create an access token
def authenticate_user(form, db, response: Response):
    user = db.query(UserAccountModel).filter(
        UserAccountModel.username == form.username
    ).first() #Searches for the database for a matching username and returns the user object if found, otherwise returns None

    if not user or not verify_password(form.password, user.password): #Checks if the user exists and if the password is correct
        raise HTTPException(status_code=401, detail="Invalid username or password")

    access_token = create_access_token(user.id) #Creates an access token for the user with the given user_id

    set_access_token_cookie(response, access_token)

    return {"access_token": access_token, "token_type": "bearer"}


def getCurrentUser_id(access_token: str | None = Cookie(default=None) ):
    if access_token is None:
        raise HTTPException(status_code=401, detail="Authentication Failed")

    try:
        payload = jwt.decode(access_token, settings.secret_key, algorithms=["HS256"])
        user_id = int(payload.get("sub"))

        if user_id is None:
            raise HTTPException(status_code=401, detail="Authentication Failed")

        return int(user_id)

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Authentication token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid Authentication")