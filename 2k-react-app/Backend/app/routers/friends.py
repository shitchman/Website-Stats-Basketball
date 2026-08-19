from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.routers.auth import getCurrentUser_id
from app.database.database import get_db
from app.schemas.friends import FriendCreate, FriendOut, FriendUpdate
from app.models.friends import FriendModel
from app.models.builds import BuildModel



router = APIRouter();


#Returns all friends of the current user
@router.get("/myFriends", response_model=list[FriendOut])
async def get_friends(current_user_id: int = Depends(getCurrentUser_id),db: Session = Depends(get_db)):
    
    friends = db.query(FriendModel, func.count(BuildModel.id).label("friendBuildCount")).outerjoin( BuildModel, BuildModel.friend_id == FriendModel.id).filter( FriendModel.user_id == current_user_id).group_by(FriendModel.id).all()

    return [
        {
            "id": friend.id,
            "user_id": friend.user_id,
            "name": friend.name,
            "online_ID": friend.online_ID,
            "friendBuildCount": friend_build_count,
        }
        for friend, friend_build_count in friends
    ]


#Adds a new friend to the current user's friend list and returns the created friend
@router.post("/addNewFriend", response_model=FriendOut)
async def create_friend( friend: FriendCreate, current_user_id: int = Depends(getCurrentUser_id), db: Session = Depends(get_db)):

    new_friend = FriendModel( user_id=current_user_id, name=friend.name, online_ID=friend.online_ID)

    db.add(new_friend)
    db.commit()
    db.refresh(new_friend)

    return new_friend


#Updatesan existing friend in the current user's friend list and returns the updated friend
@router.patch("/updateFriend", response_model=FriendOut)
async def update_friend( updates: FriendUpdate, friend_id: int, current_user_id: int = Depends(getCurrentUser_id), db: Session = Depends(get_db)):

    friend = db.query(FriendModel).filter((FriendModel.id == friend_id) & (FriendModel.user_id == current_user_id)).first()

    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")

    if updates.name is not None:
        friend.name = updates.name
    if updates.online_ID is not None:
        friend.online_ID = updates.online_ID

    db.commit()
    db.refresh(friend)

    return friend





