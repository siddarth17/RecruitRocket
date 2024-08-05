from fastapi import APIRouter, Depends
from app.auth.utils import get_current_user
from app.models.user import UserOut

router = APIRouter()

@router.get("/dashboard", response_model=UserOut)
async def user_dashboard(current_user: UserOut = Depends(get_current_user)):
    return current_user

@router.get("/me", response_model=UserOut)
async def read_users_me(current_user: UserOut = Depends(get_current_user)):
    return current_user