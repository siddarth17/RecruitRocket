import logging
from fastapi import APIRouter, Depends, HTTPException
from app.auth.utils import get_current_user
from app.models.user import UserInDB, UserOut

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/me", response_model=UserOut)
async def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    logger.info(f"User requesting identity: {current_user.email}")
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(id=current_user.id, email=current_user.email)