import jwt
from app.utils.confg import settings
from pydantic import BaseModel, ConfigDict, EmailStr

class UserAccountCreate(BaseModel):
    username: str
    email: EmailStr
    online_ID: str
    password: str

class UserAccountOut(BaseModel):
    model_config = ConfigDict(
        from_attributes=True #This allows the model to be created from an ORM object, which is useful when returning data from the database
        ) 

    id: int
    username: str
    email: EmailStr
    online_ID: str
    is_active: bool


class LoginRequest(BaseModel):
    username: str
    password: str


class PasswordConfirmRequest(BaseModel):
    password: str


class UserAccountUpdate(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    online_ID: str | None = None
    password: str | None = None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str


