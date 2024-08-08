import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

client = AsyncIOMotorClient(settings.DATABASE_URL, tlsCAFile=certifi.where())
database = client[settings.DATABASE_NAME]
collection = database[settings.COLLECTION_NAME]

async def get_database():
    return database

async def get_collection():
    return collection