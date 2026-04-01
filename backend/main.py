from contextlib import asynccontextmanager
from dotenv import load_dotenv
load_dotenv()

import os


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers.auth import router as auth_router
from routers.gallery import router as gallery_router
from routers.auth_recovery import router as auth_recovery_router
from routers.users import router as users_router
from database import database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create TTL index on password_resets so expired tokens are auto-deleted by MongoDB
    await database["password_resets"].create_index("expires_at", expireAfterSeconds=0)
    yield


app = FastAPI(title="AuraForge Pro API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads/avatars", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# <-- We are telling the app to actually use the auth router here
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(gallery_router, prefix="/gallery", tags=["Gallery"])
app.include_router(auth_recovery_router, prefix="/auth", tags=["Authentication"]) # With the others
app.include_router(users_router, prefix="/users", tags=["Users"])

@app.get("/")
async def health_check() -> dict[str, str]:
    """Simple health check endpoint for uptime monitoring."""
    return {"status": "ok", "service": "AuraForge Pro"}