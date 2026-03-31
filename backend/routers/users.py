import os
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from bson import ObjectId
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr

from database import database
from security import ALGORITHM, SECRET_KEY, hash_password

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

UPLOAD_ROOT = Path("uploads/avatars")
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:8001")


def _credentials_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def _normalize_identity(value: str) -> str:
    return value.strip().lower()


async def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    if not SECRET_KEY:
        raise RuntimeError("SECRET_KEY is not set. Update .env before issuing tokens.")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise _credentials_exception() from exc

    user_id: str | None = payload.get("sub")
    if not user_id:
        raise _credentials_exception()

    return user_id


async def get_current_user(user_id: str = Depends(get_current_user_id)) -> dict[str, Any]:
    users_collection = database["users"]
    try:
        object_id = ObjectId(user_id)
    except Exception as exc:
        raise _credentials_exception() from exc

    user = await users_collection.find_one({"_id": object_id})
    if not user:
        raise _credentials_exception()

    return user


class UserProfileResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
    avatar_url: str | None = None
    totalGenerated: int = 0
    createdAt: datetime | None = None
    planType: str = "Free"


class UserUpdateRequest(BaseModel):
    username: str | None = None
    new_password: str | None = None


class AvatarUploadResponse(BaseModel):
    avatar_url: str


def _build_profile_response(user: dict[str, Any], total_generated: int) -> UserProfileResponse:
    created_at = user.get("created_at")
    plan_type = user.get("plan_type", "Free")
    return UserProfileResponse(
        id=str(user["_id"]),
        username=user.get("username", ""),
        email=user.get("email", ""),
        avatar_url=user.get("avatar_url"),
        totalGenerated=total_generated,
        createdAt=created_at,
        planType=plan_type,
    )


@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> UserProfileResponse:
    images_collection = database["images"]
    total_generated = await images_collection.count_documents(
        {"user_id": str(current_user["_id"])}
    )

    if "created_at" not in current_user:
        created_at = datetime.now(timezone.utc)
        await database["users"].update_one(
            {"_id": current_user["_id"]},
            {"$set": {"created_at": created_at}},
        )
        current_user["created_at"] = created_at

    return _build_profile_response(current_user, total_generated)


@router.patch("/me", response_model=UserProfileResponse)
async def update_my_profile(
    payload: UserUpdateRequest,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> UserProfileResponse:
    users_collection = database["users"]
    updates: dict[str, Any] = {}

    if payload.username:
        normalized_username = _normalize_identity(payload.username)
        existing_user = await users_collection.find_one(
            {
                "_id": {"$ne": current_user["_id"]},
                "$or": [
                    {"username": normalized_username},
                    {"email": normalized_username},
                ],
            }
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with that email or username already exists.",
            )
        updates["username"] = normalized_username

    if payload.new_password:
        updates["hashed_password"] = hash_password(payload.new_password)
        current_version = int(current_user.get("password_version", 1))
        updates["password_version"] = current_version + 1

    if updates:
        await users_collection.update_one(
            {"_id": current_user["_id"]},
            {"$set": updates},
        )
        current_user.update(updates)

    images_collection = database["images"]
    total_generated = await images_collection.count_documents(
        {"user_id": str(current_user["_id"])}
    )

    return _build_profile_response(current_user, total_generated)


@router.post("/me/avatar", response_model=AvatarUploadResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict[str, Any] = Depends(get_current_user),
) -> AvatarUploadResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type.")

    user_id = str(current_user["_id"])
    user_folder = UPLOAD_ROOT / user_id
    user_folder.mkdir(parents=True, exist_ok=True)

    suffix = Path(file.filename or "").suffix.lower() or ".png"
    filename = f"{uuid4().hex}{suffix}"
    file_path = user_folder / filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    avatar_url = f"{BACKEND_BASE_URL}/uploads/avatars/{user_id}/{filename}"
    await database["users"].update_one(
        {"_id": current_user["_id"]},
        {"$set": {"avatar_url": avatar_url}},
    )

    return AvatarUploadResponse(avatar_url=avatar_url)
