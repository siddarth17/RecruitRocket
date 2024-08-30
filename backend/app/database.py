import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

client = AsyncIOMotorClient(settings.DATABASE_URL, tlsCAFile=certifi.where(), tlsAllowInvalidCertificates=True)
database = client[settings.DATABASE_NAME]
users_collection = database[settings.COLLECTION_NAME]
events_collection = database["events"]
applicants_collection = database["applicants"]

async def get_users_collection():
    return users_collection

async def get_events_collection():
    return events_collection

async def get_database():
    return database

async def get_collection():
    return users_collection

async def get_applicants_collection():
    return applicants_collection