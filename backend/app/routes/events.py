# from fastapi import APIRouter, Depends, HTTPException
# from app.auth.utils import get_current_user
# from app.models.user import UserInDB
# from app.database import get_events_collection
# from app.models.event import EventModel, EventCreateModel
# from typing import List
# from bson import ObjectId

# router = APIRouter()

# @router.post("/", response_model=EventModel)
# async def create_event(event_input: EventCreateModel, current_user: UserInDB = Depends(get_current_user)):
#     events_collection = await get_events_collection()
#     event_dict = event_input.dict()
#     event_dict["userId"] = str(current_user.id)
#     event_dict["id"] = str(ObjectId())
#     result = await events_collection.insert_one(event_dict)
#     created_event = await events_collection.find_one({"_id": result.inserted_id})
#     return EventModel(**{**created_event, "id": str(created_event["_id"])})

# @router.get("/", response_model=List[EventModel])
# async def get_user_events(current_user: UserInDB = Depends(get_current_user)):
#     events_collection = await get_events_collection()
#     events = await events_collection.find({"userId": str(current_user.id)}).to_list(None)
#     return [EventModel(**{**event, "id": str(event["_id"])}) for event in events]
from fastapi import APIRouter, Depends, HTTPException
from app.auth.utils import get_current_user
from app.models.user import UserInDB
from app.database import get_events_collection
from app.models.event import EventModel, EventCreateModel
from typing import List
from bson import ObjectId
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=EventModel)
async def create_event(event_input: EventCreateModel, current_user: UserInDB = Depends(get_current_user)):
    logger.info(f"Attempting to create event for user: {current_user.id}")
    logger.info(f"Event input: {event_input.dict()}")
    try:
        events_collection = await get_events_collection()
        event_dict = event_input.dict()
        event_dict["userId"] = str(current_user.id)
        event_dict["id"] = str(ObjectId())
        logger.info(f"Inserting event: {event_dict}")
        result = await events_collection.insert_one(event_dict)
        logger.info(f"Event inserted with ID: {result.inserted_id}")
        created_event = await events_collection.find_one({"_id": result.inserted_id})
        logger.info(f"Retrieved created event: {created_event}")
        return EventModel(**{**created_event, "id": str(created_event["_id"])})
    except Exception as e:
        logger.error(f"Error creating event: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred while creating the event: {str(e)}")

@router.get("/", response_model=List[EventModel])
async def get_user_events(current_user: UserInDB = Depends(get_current_user)):
    logger.info(f"Fetching events for user: {current_user.id}")
    try:
        events_collection = await get_events_collection()
        events = await events_collection.find({"userId": str(current_user.id)}).to_list(None)
        logger.info(f"Found {len(events)} events for user")
        return [EventModel(**{**event, "id": str(event["_id"])}) for event in events]
    except Exception as e:
        logger.error(f"Error fetching events: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred while fetching events: {str(e)}")

@router.delete("/{event_id}", response_model=EventModel)
async def delete_event(event_id: str, current_user: UserInDB = Depends(get_current_user)):
    logger.info(f"Attempting to delete event {event_id} for user: {current_user.id}")
    try:
        events_collection = await get_events_collection()
        event = await events_collection.find_one_and_delete({"_id": ObjectId(event_id), "userId": str(current_user.id)})
        if event:
            logger.info(f"Event {event_id} deleted successfully")
            return EventModel(**{**event, "id": str(event["_id"])})
        else:
            logger.warning(f"Event {event_id} not found for user {current_user.id}")
            raise HTTPException(status_code=404, detail="Event not found")
    except Exception as e:
        logger.error(f"Error deleting event: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred while deleting the event: {str(e)}")