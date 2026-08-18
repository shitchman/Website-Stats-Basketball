from pydantic import BaseModel, ConfigDict


class BuildCreate(BaseModel):
    build_name: str
    preferred_position: str

class UserBuildOut(BaseModel):
    model_config = ConfigDict(
        from_attributes=True #This allows the model to be created from an ORM object, which is useful when returning data from the database
        ) 

    id: int
    user_id: int
    build_name: str
    preferred_position: str


class FriendBuildOut(BaseModel):
    model_config = ConfigDict(
        from_attributes=True #This allows the model to be created from an ORM object, which is useful when returning data from the database
        ) 

    id: int
    friend_id: int
    build_name: str
    preferred_position: str