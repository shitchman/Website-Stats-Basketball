from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.routers.auth import getCurrentUser_id
from app.database.database import get_db
from app.schemas.friends import FriendCreate, FriendOut
from app.models.friends import FriendModel



router = APIRouter();


#Returns all friends of the current user based on the access token in the request
@router.get("/me", response_model=list[FriendOut])
async def get_friends(
    current_user_id: int = Depends(getCurrentUser_id),
    db: Session = Depends(get_db)
):
    friends = db.query(FriendModel).filter(
        (FriendModel.user_id == current_user_id)
    ).all()

    return friends


#Adds a new friend to the current user's friend list and returns the created friend
@router.post("/", response_model=FriendOut)
async def create_friend( friend: FriendCreate, current_user_id: int = Depends(getCurrentUser_id), db: Session = Depends(get_db)):

    new_friend = FriendModel( user_id=current_user_id, name=friend.name, online_ID=friend.online_ID)

    db.add(new_friend)
    db.commit()
    db.refresh(new_friend)

    return new_friend