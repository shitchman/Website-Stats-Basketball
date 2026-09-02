from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.schemas.builds import BuildCreate, UserBuildOut, BuildUpdate, FriendBuildCreate, FriendBuildOut
from app.routers.auth import getCurrentUser_id
from app.database.database import get_db

from app.models.builds import BuildModel
from app.models.friends import FriendModel
from app.models.playerStatline import PlayerStatline
from app.services.matchRemoval import delete_image_files, delete_orphaned_games



router = APIRouter();

#User Build Endpoints

#Returns all builds
@router.get("/myBuilds", response_model=list[UserBuildOut])
async def get_builds(
    current_user_id: int = Depends(getCurrentUser_id),
    db: Session = Depends(get_db)
):
    builds = db.query(BuildModel).filter(
        (BuildModel.user_id == current_user_id)
    ).all()

    return builds

#Adds a new build
@router.post("/newUserBuild", response_model=UserBuildOut)
async def create_build(build: BuildCreate, current_user_id: int = Depends(getCurrentUser_id), db: Session = Depends(get_db)):

    new_build = BuildModel(user_id=current_user_id, build_name=build.build_name, preferred_position=build.preferred_position)

    db.add(new_build)
    db.commit()
    db.refresh(new_build)

    return new_build

#Updates an existing build
@router.patch("/updateUserBuild", response_model=UserBuildOut)
async def update_build( updates: BuildUpdate, build_id: int, current_user_id: int = Depends(getCurrentUser_id), db: Session = Depends(get_db)):

   build = db.query(BuildModel).filter((BuildModel.id == build_id) & (BuildModel.user_id == current_user_id)).first()

   if not build:
      raise HTTPException(status_code=404, detail="Build not found")

   if updates.build_name is not None:
      build.build_name = updates.build_name
   if updates.preferred_position is not None:
      build.preferred_position = updates.preferred_position

   db.commit()
   db.refresh(build)

   return build

#Deletes an existing build
@router.delete("/deleteUserBuild", status_code=204, response_class=Response)
async def delete_build(build_id: int, current_user_id: int = Depends(getCurrentUser_id), db: Session = Depends(get_db)):

    build = db.query(BuildModel).filter(
        (BuildModel.id == build_id) & (BuildModel.user_id == current_user_id)
    ).first()

    if not build:
        raise HTTPException(status_code=404, detail="Build not found")

    db.query(PlayerStatline).filter(
        PlayerStatline.build_id == build_id
    ).delete(synchronize_session=False)
    db.delete(build)
    db.flush()
    files_to_delete = delete_orphaned_games(db)
    db.commit()

    delete_image_files(files_to_delete)

    return Response(status_code=204)



#Friend Build Endpoints

#Returns all builds from all friends (including the count of builds for each friend)
@router.get("/friendsBuilds", response_model=list[FriendBuildOut])
async def get_friend_builds( current_user_id: int = Depends(getCurrentUser_id), db: Session = Depends(get_db)):
    builds = db.query(BuildModel).join(
        FriendModel,
        BuildModel.friend_id == FriendModel.id
    ).filter(
        FriendModel.user_id == current_user_id
    ).all()

    return builds

#Adds a new build to a friend
@router.post("/addFriendBuild", response_model=FriendBuildOut)
async def create_friend_build( build: FriendBuildCreate, current_user_id: int = Depends(getCurrentUser_id), db: Session = Depends(get_db)):
    friend = db.query(FriendModel).filter((FriendModel.id == build.friend_id) & (FriendModel.user_id == current_user_id)).first()

    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")

    new_build = BuildModel( friend_id=friend.id, build_name=build.build_name, preferred_position=build.preferred_position)

    db.add(new_build)
    db.commit()
    db.refresh(new_build)

    return new_build

#Updates an existing build for a friend
@router.patch("/updateFriendBuild", response_model=FriendBuildOut)
async def update_friend_build( updates: BuildUpdate, build_id: int, current_user_id: int = Depends(getCurrentUser_id), db: Session = Depends(get_db)):

    build = db.query(BuildModel).join(FriendModel, BuildModel.friend_id == FriendModel.id).filter((BuildModel.id == build_id) & (FriendModel.user_id == current_user_id)).first()

    if not build:
        raise HTTPException(status_code=404, detail="Build not found")

    if updates.build_name is not None:
        build.build_name = updates.build_name
    if updates.preferred_position is not None:
        build.preferred_position = updates.preferred_position

    db.commit()
    db.refresh(build)

    return build

#Deletes an existing build for a friend
@router.delete("/deleteFriendBuild", status_code=204, response_class=Response)
async def delete_friend_build(build_id: int, current_user_id: int = Depends(getCurrentUser_id), db: Session = Depends(get_db)):

    build = db.query(BuildModel).join(FriendModel, BuildModel.friend_id == FriendModel.id).filter((BuildModel.id == build_id) & (FriendModel.user_id == current_user_id)).first()

    if not build:
        raise HTTPException(status_code=404, detail="Build not found")

    db.query(PlayerStatline).filter(
        PlayerStatline.friend_build_id == build_id
    ).delete(synchronize_session=False)
    db.delete(build)
    db.flush()
    files_to_delete = delete_orphaned_games(db)
    db.commit()

    delete_image_files(files_to_delete)

    return Response(status_code=204)






