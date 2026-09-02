from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import case, func, or_
from sqlalchemy.orm import Session

from app.models.games import Game
from app.routers.auth import getCurrentUser_id
from app.database.database import get_db
from app.schemas.friends import FriendCreate, FriendOut, FriendUpdate, FriendDashboardStats
from app.models.friends import FriendModel
from app.models.builds import BuildModel
from app.models.playerStatline import PlayerStatline
from app.services.matchRemoval import delete_image_files, delete_orphaned_games

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


#Returns the friends stats for the dashboard
@router.get("/friendDashboardStats", response_model=list[FriendDashboardStats])
async def get_friend_stats(game_mode_id: int | None = None, current_user_id: int = Depends(getCurrentUser_id), db: Session = Depends(get_db)):
   query = (db.query(
      FriendModel.id.label("id"),
      FriendModel.name.label("name"),
      func.avg(PlayerStatline.points).label("ppg"),
      func.count(func.distinct(PlayerStatline.game_id)).label("games_played"),
      func.sum(case((Game.result == "W", 1), else_=0)).label("wins"),
   )
   .join(PlayerStatline, PlayerStatline.friend_id == FriendModel.id)
   .join(Game, Game.id == PlayerStatline.game_id)
   .filter(FriendModel.user_id == current_user_id, Game.user_id == current_user_id,)
)
   if game_mode_id is not None:
    query = query.filter(Game.game_mode_id == game_mode_id)

   rows = query.group_by(FriendModel.id, FriendModel.name).all()

   return [
      {
         "id": row.id,
         "name": row.name,
         "ppg": round(row.ppg, 2) if row.ppg is not None else 0.0,
         "games_played": row.games_played,
         "win_percentage": round((row.wins or 0) / row.games_played * 100, 2) if row.games_played else 0.0,
      }
      for row in rows
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


# Deletes a friend, the friend's builds, and their participation statlines.
@router.delete("/deleteFriend", status_code=204, response_class=Response)
async def delete_friend(friend_id: int, current_user_id: int = Depends(getCurrentUser_id), db: Session = Depends(get_db)):
    friend = db.query(FriendModel).filter((FriendModel.id == friend_id) & (FriendModel.user_id == current_user_id)).first()

    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")

    friend_build_ids = {
        build.id for build in db.query(BuildModel).filter(BuildModel.friend_id == friend_id).all()
    }

    statline_filter = PlayerStatline.friend_id == friend_id
    if friend_build_ids:
        statline_filter = or_(statline_filter, PlayerStatline.friend_build_id.in_(friend_build_ids))

    db.query(PlayerStatline).filter(statline_filter).delete(synchronize_session=False)
    if friend_build_ids:
        db.query(BuildModel).filter(BuildModel.id.in_(friend_build_ids)).delete(synchronize_session=False)
    db.delete(friend)
    db.flush()
    files_to_delete = delete_orphaned_games(db)
    db.commit()

    delete_image_files(files_to_delete)

    return Response(status_code=204)





