from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "Recruit-Rocket-DB"
    COLLECTION_NAME: str = "LoginDetails"
    SECRET_KEY: str = "balasore123"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()