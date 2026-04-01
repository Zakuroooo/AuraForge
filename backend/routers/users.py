import os
from datetime import datetime, timezone
from typing import Any

import cloudinary
import cloudinary.uploader
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr

from database import database
from security import ALGORITHM, SECRET_KEY, hash_password

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


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


class AvatarUploadRequest(BaseModel):
    image_base64: str


class AvatarUploadResponse(BaseModel):
    avatar_url: str | None


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
    payload: AvatarUploadRequest,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> AvatarUploadResponse:
    user_id = str(current_user["_id"])

    try:
        result = cloudinary.uploader.upload(
            payload.image_base64,
            folder="auraforge/avatars",
            public_id=f"avatar_{user_id}",
            overwrite=True,
            transformation=[
                {"width": 400, "height": 400, "crop": "fill", "gravity": "face"}
            ],
        )
        secure_url: str = result["secure_url"]
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload avatar to cloud storage.",
        ) from exc

    await database["users"].update_one(
        {"_id": current_user["_id"]},
        {"$set": {"avatar_url": secure_url}},
    )

    return AvatarUploadResponse(avatar_url=secure_url)


@router.delete("/me/avatar", response_model=AvatarUploadResponse)
async def delete_avatar(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> AvatarUploadResponse:
    user_id = str(current_user["_id"])

    try:
        cloudinary.uploader.destroy(f"auraforge/avatars/avatar_{user_id}")
    except Exception:
        pass  # Even if Cloudinary destroy fails, clear from DB

    await database["users"].update_one(
        {"_id": current_user["_id"]},
        {"$set": {"avatar_url": None}},
    )

    return AvatarUploadResponse(avatar_url=None)
