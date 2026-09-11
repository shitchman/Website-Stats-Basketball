from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.routers.auth import authenticate_user, create_access_token, getCurrentUser_id, hash_password, set_access_token_cookie, verify_password
from app.database.database import get_db
from app.schemas.userAccount import UserAccountCreate, UserAccountOut, LoginRequest, LoginResponse, PasswordConfirmRequest, UserAccountUpdate
from app.models.userAccount import UserAccountModel
from app.models.boxScoreImage import BoxScoreImage
from app.models.games import Game
from app.services.matchRemoval import delete_image_files



router = APIRouter();



#Returns all user accounts in the database
@router.get("/", response_model=list[UserAccountOut])
async def get_user_account(
    db: Session = Depends(get_db)
):
    user_accounts = db.query(UserAccountModel).all()

    return user_accounts

#Returns the current user account based on the access token in the request
@router.get("/me")
def get_current_user( current_user_id: int = Depends(getCurrentUser_id), db: Session = Depends(get_db)):

    user = ( db.query(UserAccountModel).filter(UserAccountModel.id == current_user_id).first())

    if not user:
        raise HTTPException( status_code=404, detail="User not found")

    return user



#Adds a new user account to the database and returns the created user account
@router.post("/", response_model=UserAccountOut)
async def create_user_account(user_account: UserAccountCreate, db: Session = Depends(get_db)):

    hashed_password = hash_password(user_account.password)

    new_user_account = UserAccountModel( username=user_account.username, email=user_account.email, online_ID=user_account.online_ID, password=hashed_password)
    
    db.add(new_user_account)
    db.commit()
    db.refresh(new_user_account)

    return new_user_account

#Verifies the current user's password against the one stored in the database, used before allowing profile edits
@router.post("/verify-password")
async def verify_current_password( payload: PasswordConfirmRequest, current_user_id: int = Depends(getCurrentUser_id), db: Session = Depends(get_db),):

    user = db.query(UserAccountModel).filter(UserAccountModel.id == current_user_id).first()

    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    return {"verified": True}

#Logs in a user and returns a JWT access token in the response cookies
@router.post("/login", response_model=LoginResponse)
async def login( form: LoginRequest, response: Response, db: Session = Depends(get_db),):
    return authenticate_user(form, db, response)

#Renews the current user's session after recent activity in the application
@router.post("/session/refresh")
def refresh_session(response: Response, current_user_id: int = Depends(getCurrentUser_id)):
    access_token = create_access_token(current_user_id)
    set_access_token_cookie(response, access_token)

    return {"message": "Session refreshed"}

#Logs out a user by deleting the JWT access token cookie
@router.post("/logout")
def logout(response: Response):

    response.delete_cookie( key="access_token" )

    return { "message": "Logged out" }



#Updates the current user's profile fields, only hashing/replacing the password if a new one is supplied
@router.patch("/me", response_model=UserAccountOut)
async def update_current_user( updates: UserAccountUpdate, current_user_id: int = Depends(getCurrentUser_id), db: Session = Depends(get_db),):

    user = db.query(UserAccountModel).filter(UserAccountModel.id == current_user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if updates.username is not None:
        user.username = updates.username

    if updates.email is not None:
        user.email = updates.email

    if updates.online_ID is not None:
        user.online_ID = updates.online_ID

    if updates.password is not None:
        user.password = hash_password(updates.password)

    db.commit()
    db.refresh(user)

    return user


#Permanently deletes the current user's account along with all associated games, builds and friends
@router.delete("/me", status_code=204, response_class=Response)
async def delete_current_user( response: Response, current_user_id: int = Depends(getCurrentUser_id), db: Session = Depends(get_db),):

    user = db.query(UserAccountModel).filter(UserAccountModel.id == current_user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    game_ids = [game_id for (game_id,) in db.query(Game.id).filter(Game.user_id == current_user_id).all()]
    images = db.query(BoxScoreImage).filter(BoxScoreImage.game_id.in_(game_ids)).all()
    files_to_delete = [
        path for image in images for path in (image.original_path, image.processed_path) if path
    ]

    db.delete(user)
    db.commit()

    delete_image_files(files_to_delete)
    response.delete_cookie(key="access_token")

    return Response(status_code=204)