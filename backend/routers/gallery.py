import os
import base64
from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
import requests
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel

from database import database
from models import ImageCreate, ImageResponse
from security import ALGORITHM, SECRET_KEY

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Load your new Hugging Face token
HF_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")
# Using the flagship Stable Diffusion XL model
HF_API_URL = os.getenv("HUGGINGFACE_MODEL_URL", "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0")


class SaveImageRequest(BaseModel):
    is_saved: bool = True

def _credentials_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

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

@router.post("/generate", response_model=ImageResponse, status_code=status.HTTP_201_CREATED)
async def generate_image(payload: ImageCreate, user_id: str = Depends(get_current_user_id)) -> ImageResponse:
    if not HF_TOKEN:
        raise HTTPException(status_code=500, detail="Hugging Face token is missing from .env file.")

    created_at = datetime.now(timezone.utc)
    prompt_text = payload.prompt_text.strip()
    
    # 1. Ask Hugging Face to forge the image
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    hf_payload = {"inputs": prompt_text}
    
    response = requests.post(HF_API_URL, headers=headers, json=hf_payload)
    
    if response.status_code != 200:
        print(f"Hugging Face Error: {response.text}")
        raise HTTPException(status_code=500, detail="AI Server failed to generate image. Please try again.")
    
    # 2. Convert the raw image bytes into a Base64 string so Next.js can read it natively
    image_bytes = response.content
    base64_encoded = base64.b64encode(image_bytes).decode("utf-8")
    image_data_url = f"data:image/jpeg;base64,{base64_encoded}"

    # 3. Save to MongoDB
    images_collection = database["images"]
    image_document = {
        "user_id": user_id,
        "prompt_text": prompt_text,
        "image_url": image_data_url,
        "created_at": created_at,
        "is_saved": False,
    }
    result = await images_collection.insert_one(image_document)

    return ImageResponse(
        id=str(result.inserted_id),
        user_id=user_id,
        prompt_text=prompt_text,
        image_url=image_data_url,
        created_at=created_at,
        is_saved=False,
    )


@router.post("/{image_id}/save", status_code=status.HTTP_200_OK)
async def save_image(
    image_id: str,
    payload: SaveImageRequest,
    user_id: str = Depends(get_current_user_id),
) -> dict[str, bool]:
    images_collection = database["images"]
    try:
        object_id = ObjectId(image_id)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found.") from exc

    result = await images_collection.update_one(
        {"_id": object_id, "user_id": user_id},
        {"$set": {"is_saved": payload.is_saved}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found.")

    return {"is_saved": payload.is_saved}

@router.get("/", response_model=list[ImageResponse])
async def list_gallery_items(current_user: dict[str, Any] = Depends(get_current_user)) -> list[ImageResponse]:
    images = await database["images"].find({"user_id": str(current_user["_id"])}).to_list(length=100)

    return [
        ImageResponse(
            id=str(document["_id"]),
            user_id=document["user_id"],
            prompt_text=document["prompt_text"],
            image_url=document["image_url"],
            created_at=document["created_at"],
            is_saved=document.get("is_saved", False),
        )
        for document in images
    ]


@router.delete("/{image_id}", status_code=status.HTTP_200_OK)
async def delete_image(
    image_id: str,
    user_id: str = Depends(get_current_user_id),
) -> dict[str, str]:
    images_collection = database["images"]
    try:
        object_id = ObjectId(image_id)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found.") from exc

    result = await images_collection.delete_one({"_id": object_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found.")

    return {"status": "deleted"}