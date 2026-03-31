from datetime import datetime, timezone

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserInDB(BaseModel):
    id: str | None = None
    username: str
    email: EmailStr
    hashed_password: str
    password_version: int = 1
    avatar_url: str | None = None
    plan_type: str = "Free"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ImageCreate(BaseModel):
    prompt_text: str


class ImageResponse(BaseModel):
    id: str
    user_id: str
    prompt_text: str
    image_url: str
    created_at: datetime
    is_saved: bool = False
