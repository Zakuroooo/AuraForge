from datetime import timedelta
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr

from database import database
from models import Token, UserCreate, UserInDB
from security import create_access_token, hash_password, verify_password

router = APIRouter()


def _normalize_identity(value: str) -> str:
    return value.strip().lower()

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate) -> dict[str, str]:
    users_collection = database["users"]
    normalized_username = _normalize_identity(user.username)
    normalized_email = _normalize_identity(user.email)
    existing_user = await users_collection.find_one(
        {"$or": [{"email": normalized_email}, {"username": normalized_username}]}
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with that email or username already exists.",
        )

    user_in_db = UserInDB(
        username=normalized_username,
        email=normalized_email,
        hashed_password=hash_password(user.password),
    )
    result = await users_collection.insert_one(user_in_db.model_dump())

    return {
        "id": str(result.inserted_id),
        "username": user_in_db.username,
        "email": user_in_db.email,
    }

# 👇 We updated this route to accept standard OAuth2 Form Data
@router.post("/login", response_model=Token)
async def login_user(credentials: OAuth2PasswordRequestForm = Depends()) -> Token:
    users_collection = database["users"]
    identifier = _normalize_identity(credentials.username)
    
    # The form field is called 'username', but we check if it matches an email OR a username in the DB!
    stored_user = await users_collection.find_one({
        "$or": [{"email": identifier}, {"username": identifier}]
    })
    
    if not stored_user or not verify_password(credentials.password, stored_user.get("hashed_password", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

    access_token = create_access_token(
        data={
            "sub": str(stored_user["_id"]),
            "username": stored_user["username"],
            "email": stored_user["email"],
        }
    )
    return Token(access_token=access_token, token_type="bearer")