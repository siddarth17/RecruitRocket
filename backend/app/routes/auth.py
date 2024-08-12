from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import UserCreate, UserOut, UserInDB
from app.database import get_collection
from app.auth.utils import create_access_token, get_password_hash, authenticate_user, get_current_user
from bson import ObjectId

router = APIRouter()

@router.post("/signup", response_model=UserOut)
async def signup(user: UserCreate):
    collection = await get_collection()
    existing_user = await collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = UserInDB(
        id=str(ObjectId()),
        email=user.email,
        hashed_password=hashed_password
    )
    result = await collection.insert_one(new_user.dict())
    created_user = await collection.find_one({"_id": result.inserted_id})
    return UserOut(**created_user)

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=UserOut)
async def read_users_me(current_user: UserOut = Depends(get_current_user)):
    return current_user