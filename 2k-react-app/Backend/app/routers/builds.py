from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.routers.auth import getCurrentUser_id
from app.database.database import get_db
from app.schemas.builds import BuildCreate, UserBuildOut, BuildUpdate
from app.models.builds import BuildModel



router = APIRouter();


#Returns all builds of the current user based on the access token in the request
@router.get("/me", response_model=list[UserBuildOut])
async def get_builds(
    current_user_id: int = Depends(getCurrentUser_id),
    db: Session = Depends(get_db)
):
    builds = db.query(BuildModel).filter(
        (BuildModel.user_id == current_user_id)
    ).all()

    return builds


#Adds a new build to the current user's build list and returns the created build
@router.post("/", response_model=UserBuildOut)
async def create_build(build: BuildCreate, current_user_id: int = Depends(getCurrentUser_id), db: Session = Depends(get_db)):

    new_build = BuildModel(user_id=current_user_id, build_name=build.build_name, preferred_position=build.preferred_position)

    db.add(new_build)
    db.commit()
    db.refresh(new_build)

    return new_build



#Updates an existing build of the current user
@router.put("/updatebuilds", response_model=UserBuildOut)
async def update_build( updates: BuildUpdate, build_id: int, current_user_id: int = Depends(getCurrentUser_id), db: Session = Depends(get_db)):

    build = db.query(BuildModel).filter(
        (BuildModel.id == build_id) & (BuildModel.user_id == current_user_id)
    ).first()

    if not build:
        raise HTTPException(status_code=404, detail="Build not found")

    if updates.build_name is not None:
        build.build_name = updates.build_name
    if updates.preferred_position is not None:
        build.preferred_position = updates.preferred_position

    db.commit()
    db.refresh(build)

    return build




