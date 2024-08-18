from fastapi import APIRouter, Depends, HTTPException
from app.auth.utils import get_current_user
from app.models.user import UserInDB
from app.database import get_events_collection
from app.models.event import EventModel, EventCreateModel
from typing import List
from bson import ObjectId

router = APIRouter()

@router.post("/", response_model=EventModel)
async def create_event(event_input: EventCreateModel, current_user: UserInDB = Depends(get_current_user)):
    events_collection = await get_events_collection()
    event_dict = event_input.dict()
    event_dict["userId"] = str(current_user.id)
    event_dict["id"] = str(ObjectId())
    result = await events_collection.insert_one(event_dict)
    created_event = await events_collection.find_one({"_id": result.inserted_id})
    return EventModel(**{**created_event, "id": str(created_event["_id"])})

@router.get("/", response_model=List[EventModel])
async def get_user_events(current_user: UserInDB = Depends(get_current_user)):
    events_collection = await get_events_collection()
    events = await events_collection.find({"userId": str(current_user.id)}).to_list(None)
    return [EventModel(**{**event, "id": str(event["_id"])}) for event in events]