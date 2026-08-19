from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.routers.auth import getCurrentUser_id
from app.database.database import get_db
from app.schemas.friends import FriendCreate, FriendOut, FriendUpdate
from app.models.friends import FriendModel
from app.models.builds import BuildModel
from app.models.boxScoreImage import BoxScoreImage
from app.models.games import Game
from app.models.playerStatline import PlayerStatline

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


# Deletes a friend and the friend's builds and statlines.
@router.delete("/deleteFriend", status_code=204, response_class=Response)
async def delete_friend(friend_id: int, current_user_id: int = Depends(getCurrentUser_id), db: Session = Depends(get_db)):
    friend = db.query(FriendModel).filter((FriendModel.id == friend_id) & (FriendModel.user_id == current_user_id)).first()

    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")

    friend_build_ids = {
        build.id for build in db.query(BuildModel).filter(BuildModel.friend_id == friend_id).all()
    }

    attached_games = db.query(Game).filter(or_(Game.friend_id == friend_id, Game.friend_build_id.in_(friend_build_ids))).all()
    attached_images = db.query(BoxScoreImage).filter(BoxScoreImage.friend_build_id.in_(friend_build_ids)).all()

    surviving_build_ids = {
        reference_id
        for item in [*attached_games, *attached_images]
        for reference_id in (item.build_id, item.friend_build_id)
        if reference_id is not None and reference_id not in friend_build_ids
    }
    surviving_build_ids = {
        row.id for row in db.query(BuildModel.id).filter(BuildModel.id.in_(surviving_build_ids)).all()
    }

    files_to_delete = []
    for image in attached_images:
        other_build_id = image.build_id
        if other_build_id not in surviving_build_ids:
            files_to_delete.extend(
                path for path in (image.original_path, image.processed_path)
                if path
            )
            db.delete(image)

    for game in attached_games:
        other_build_id = game.build_id
        if other_build_id not in surviving_build_ids:
            db.delete(game)

    if friend_build_ids:
        db.query(PlayerStatline).filter(PlayerStatline.friend_build_id.in_(friend_build_ids)).delete(synchronize_session=False)
        db.query(BuildModel).filter(BuildModel.id.in_(friend_build_ids)).delete(synchronize_session=False)

    db.delete(friend)
    db.commit()

    for path in set(files_to_delete):
        Path(path).unlink(missing_ok=True)

    return Response(status_code=204)





