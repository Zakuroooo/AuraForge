import os
import certifi  # <-- We added this import

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "")

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is not set. Update .env before running the application.")

# <-- We added tlsCAFile=certifi.where() right here
client: AsyncIOMotorClient = AsyncIOMotorClient(MONGODB_URI, tlsCAFile=certifi.where())
database = client.get_database("auraforge")