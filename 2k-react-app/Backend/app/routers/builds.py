from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.routers.auth import getCurrentUser_id
from app.database.database import get_db
from app.schemas.builds import BuildCreate, UserBuildOut
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