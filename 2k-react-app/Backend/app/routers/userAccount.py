from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.routers.auth import authenticate_user, hash_password, getCurrentUser_id
from app.database.database import get_db
from app.schemas.userAccount import UserAccountCreate, UserAccountOut, LoginRequest, LoginResponse
from app.models.userAccount import UserAccountModel



router = APIRouter();

#GET /users (returns a list of all user accounts)
@router.get("/", response_model=list[UserAccountOut])
async def get_user_account(
    db: Session = Depends(get_db)
):
    user_accounts = db.query(UserAccountModel).all()

    return user_accounts


@router.get("/me")
def get_current_user( current_user_id: int = Depends(getCurrentUser_id), db: Session = Depends(get_db)):

    user = ( db.query(UserAccountModel).filter(UserAccountModel.id == current_user_id).first())

    if not user:
        raise HTTPException( status_code=404, detail="User not found")

    return user



@router.post("/", response_model=UserAccountOut)
async def create_user_account(user_account: UserAccountCreate, db: Session = Depends(get_db)):

    hashed_password = hash_password(user_account.password)

    new_user_account = UserAccountModel(
        username=user_account.username,
        email=user_account.email,
        online_ID=user_account.online_ID,
        password=hashed_password)
    db.add(new_user_account)
    db.commit()
    db.refresh(new_user_account)

    return new_user_account


@router.post("/login", response_model=LoginResponse)
async def login( form: LoginRequest, response: Response, db: Session = Depends(get_db),):
    return authenticate_user(form, db, response)


@router.post("/logout")
def logout(response: Response):

    response.delete_cookie( key="access_token" )

    return { "message": "Logged out" }