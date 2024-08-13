from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings
from app.models.user import User, UserInDB
from app.database import get_database
from datetime import datetime, timedelta
from app.database import get_collection
import logging

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        collection = await get_collection()
        user = await collection.find_one({"email": email})
        if user is None:
            raise credentials_exception
        return UserInDB(id=str(user['_id']), email=user['email'], hashed_password=user['hashed_password'])
    except JWTError:
        raise credentials_exception

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def authenticate_user(email: str, password: str):
    collection = await get_collection()
    user = await collection.find_one({"email": email})
    print(f"User found: {user is not None}")  # Logging
    if not user:
        return False
    password_verified = verify_password(password, user["hashed_password"])
    print(f"Password verified: {password_verified}")  # Logging
    if not password_verified:
        return False
    return UserInDB(**user)