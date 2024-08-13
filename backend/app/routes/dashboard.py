from fastapi import APIRouter, Depends, HTTPException
from app.auth.utils import get_current_user
from app.models.user import UserInDB, UserOut
from app.database import get_collection
from bson import ObjectId
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/dashboard", response_model=dict)
async def get_dashboard_data(current_user: UserInDB = Depends(get_current_user)):
    print(f"Fetching dashboard data for user: {current_user.id}")
    collection = await get_collection()
    
    # Fetch user-specific data
    user_data = await collection.find_one({"_id": ObjectId(current_user.id)})
    
    if user_data is None:
        print(f"User data not found for user ID: {current_user.id}")
        all_users = await collection.find().to_list(length=None)
        print(f"All users in database: {[{str(user['_id']): user['email']} for user in all_users]}")
        raise HTTPException(status_code=404, detail="User data not found")
    
    print(f"User data found: {user_data}")
    
    dashboard_data = {
        "user": UserOut(id=str(user_data["_id"]), email=user_data["email"]),
        "total_applications": await collection.count_documents({"user_id": str(user_data["_id"])}),
    }
    
    return dashboard_data