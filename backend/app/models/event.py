from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class EventModel(BaseModel):
    id: str
    title: str
    startDate: datetime
    endDate: datetime
    description: Optional[str] = None
    categoryId: Optional[str] = None
    participantIds: List[str] = []
    color: str
    userId: str

class EventCreateModel(BaseModel):
    title: str
    startDate: datetime
    endDate: datetime
    description: Optional[str] = None
    categoryId: Optional[str] = None
    participantIds: List[str] = []
    color: str