import os
from datetime import datetime, timedelta, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException, status
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from jose import ExpiredSignatureError, JWTError, jwt
from pydantic import BaseModel, EmailStr

from database import database
from security import ALGORITHM, SECRET_KEY, hash_password

router = APIRouter()
RESET_TOKEN_EXPIRE_MINUTES = int(os.getenv("RESET_TOKEN_EXPIRE_MINUTES", "30"))
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")

MAIL_CONFIG = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", ""),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", ""),
    MAIL_FROM=os.getenv("MAIL_FROM", ""),
    MAIL_PORT=int(os.getenv("MAIL_PORT", "587")),
    MAIL_SERVER=os.getenv("MAIL_SERVER", ""),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


def _normalized_email(email: str) -> str:
    return email.lower().strip()


def create_reset_token(email: str, password_version: int) -> str:
    if not SECRET_KEY:
        raise RuntimeError("SECRET_KEY is not set. Update .env before issuing tokens.")

    normalized_email = _normalized_email(email)
    expire = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": normalized_email,
        "email": normalized_email,
        "password_version": password_version,
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
async def request_password_reset(request: ForgotPasswordRequest) -> dict[str, str]:
    users_collection = database["users"]
    resets_collection = database["password_resets"]

    email = _normalized_email(request.email)
    user = await users_collection.find_one({"email": email})
    password_version = 1
    if user:
        try:
            password_version = int(user.get("password_version", 1))
        except (TypeError, ValueError):
            password_version = 1
        if "password_version" not in user:
            await users_collection.update_one(
                {"_id": user["_id"]},
                {"$set": {"password_version": password_version}},
            )

    token = create_reset_token(email, password_version)


    # Always respond with success to avoid account enumeration
    if user:
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
        await resets_collection.update_one(
            {"user_id": str(user["_id"])},
            {
                "$set": {
                    "user_id": str(user["_id"]),
                    "email": email,
                    "token": token,
                    "expires_at": expires_at,
                }
            },
            upsert=True,
        )

        reset_link = f"{FRONTEND_BASE_URL}/auth/reset-password?token={token}"
        message = MessageSchema(
            subject="AuraForge Pro Password Reset",
            recipients=[email],
            body=f"Reset your password using this link: {reset_link}",
            subtype=MessageType.plain,
        )
        fm = FastMail(MAIL_CONFIG)
        try:
            await fm.send_message(message)
        except Exception as e:
            print(f"!!! SMTP ACTUAL ERROR: {str(e)}")

    return {"message": "Email sent"}


@router.post("/reset-password-confirm", status_code=status.HTTP_200_OK)
async def reset_password_confirm(payload: ResetPasswordRequest) -> dict[str, str]:
    users_collection = database["users"]

    try:
        decoded = jwt.decode(payload.token, SECRET_KEY, algorithms=[ALGORITHM])
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Link expired. Please request a new one.",
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token.",
        ) from exc

    email = _normalized_email(decoded.get("email") or decoded.get("sub") or "")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token.",
        )

    token_version_raw = decoded.get("password_version")
    try:
        token_version = int(token_version_raw)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token.",
        )

    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    try:
        current_version = int(user.get("password_version", 1))
    except (TypeError, ValueError):
        current_version = 1

    if token_version != current_version:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error: This link has already been used or is invalid.",
        )

    hashed_password = hash_password(payload.new_password)
    result = await users_collection.update_one(
        {
            "_id": user["_id"],
            "$or": [
                {"password_version": current_version},
                {"password_version": {"$exists": False}},
            ],
        },
        {
            "$set": {
                "hashed_password": hashed_password,
                "password_version": current_version + 1,
            }
        },
    )
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error: This link has already been used or is invalid.",
        )

    return {"message": "Password updated successfully."}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(payload: ResetPasswordRequest) -> dict[str, str]:
    resets_collection = database["password_resets"]
    users_collection = database["users"]

    record = await resets_collection.find_one({"token": payload.token})
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid or expired token.")

    expires_at: datetime = record.get("expires_at")
    if not expires_at or expires_at < datetime.now(timezone.utc):
        await resets_collection.delete_one({"_id": record["_id"]})
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="This reset link has expired.")

    hashed_password = hash_password(payload.new_password)
    user_id = record.get("user_id")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Recovery token corrupt.")

    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"hashed_password": hashed_password}},
    )

    await resets_collection.delete_one({"_id": record["_id"]})

    return {"message": "Password updated successfully."}
