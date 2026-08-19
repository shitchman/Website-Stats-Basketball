from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pathlib import Path

from app.schemas.builds import BuildCreate, UserBuildOut, BuildUpdate, FriendBuildCreate, FriendBuildOut
from app.routers.auth import getCurrentUser_id
from app.database.database import get_db

from app.models.builds import BuildModel
from app.models.boxScoreImage import BoxScoreImage
from app.models.friends import FriendModel
from app.models.games import Game
from app.models.playerStatline import PlayerStatline



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

    # A game or image can reference both a user build and a friend build.
    # Keep it when the other reference points to a surviving build.
    attached_games = db.query(Game).filter(or_(Game.build_id == build_id, Game.friend_build_id == build_id)).all()
    attached_images = db.query(BoxScoreImage).filter(or_(BoxScoreImage.build_id == build_id, BoxScoreImage.friend_build_id == build_id)).all()

    referenced_build_ids = {
        reference_id
        for item in [*attached_games, *attached_images]
        for reference_id in (item.build_id, item.friend_build_id)
        if reference_id is not None and reference_id != build_id
    }
    surviving_build_ids = {
        row.id for row in db.query(BuildModel.id).filter(BuildModel.id.in_(referenced_build_ids)).all()
    }

    files_to_delete = []
    for image in attached_images:
        other_build_id = (
            image.friend_build_id
            if image.build_id == build_id
            else image.build_id
        )
        if other_build_id not in surviving_build_ids:
            files_to_delete.extend(
                path for path in (image.original_path, image.processed_path)
                if path
            )
            db.delete(image)

    for game in attached_games:
        other_build_id = (
            game.friend_build_id
            if game.build_id == build_id
            else game.build_id
        )
        if other_build_id not in surviving_build_ids:
            db.delete(game)

    db.query(PlayerStatline).filter(
        PlayerStatline.build_id == build_id
    ).delete(synchronize_session=False)
    db.delete(build)
    db.commit()

    for path in files_to_delete:
        Path(path).unlink(missing_ok=True)

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

    attached_games = db.query(Game).filter(or_(Game.build_id == build_id, Game.friend_build_id == build_id)).all()
    attached_images = db.query(BoxScoreImage).filter(or_(BoxScoreImage.build_id == build_id, BoxScoreImage.friend_build_id == build_id)).all()

    referenced_build_ids = {
        reference_id
        for item in [*attached_games, *attached_images]
        for reference_id in (item.build_id, item.friend_build_id)
        if reference_id is not None and reference_id != build_id
    }
    surviving_build_ids = {
        row.id for row in db.query(BuildModel.id).filter(BuildModel.id.in_(referenced_build_ids)).all()
    }

    files_to_delete = []
    for image in attached_images:
        other_build_id = (
            image.friend_build_id
            if image.build_id == build_id
            else image.build_id
        )
        if other_build_id not in surviving_build_ids:
            files_to_delete.extend(
                path for path in (image.original_path, image.processed_path)
                if path
            )
            db.delete(image)

    for game in attached_games:
        other_build_id = (
            game.friend_build_id
            if game.build_id == build_id
            else game.build_id
        )
        if other_build_id not in surviving_build_ids:
            db.delete(game)

    db.query(PlayerStatline).filter(
        PlayerStatline.friend_build_id == build_id
    ).delete(synchronize_session=False)
    db.delete(build)
    db.commit()

    for path in files_to_delete:
        Path(path).unlink(missing_ok=True)

    return Response(status_code=204)






