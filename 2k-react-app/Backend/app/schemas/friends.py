from pydantic import BaseModel, ConfigDict


class FriendCreate(BaseModel):
    name: str
    online_ID: str

class FriendOut(BaseModel):
   model_config = ConfigDict(
        from_attributes=True #This allows the model to be created from an ORM object, which is useful when returning data from the database
        ) 

   id: int
   user_id: int
   name: str
   online_ID: str
   friendBuildCount: int = 0

class FriendUpdate(BaseModel):
   name: str | None = None
   online_ID: str | None = None

class FriendDashboardStats(BaseModel):
    model_config = ConfigDict(from_attributes=True) 
    
    id: int
    name: str
    ppg: float
    games_played: int
    win_percentage: float













