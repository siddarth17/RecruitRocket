from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class StageModel(BaseModel):
    stage_name: str
    stage_evaluators: List[str]
    performance: Optional[int] = None
    notes: Optional[str] = None

class ApplicantModel(BaseModel):
    id: str
    name: str
    status: str
    strength: int
    stages: List[StageModel] = []
    imageUrl: Optional[str] = None
    year: int
    major: str
    gender: str
    summary: Optional[str] = None
    userId: str

class ApplicantCreateModel(BaseModel):
    name: str
    status: str
    strength: int
    imageUrl: Optional[str] = None
    year: int
    major: str
    gender: str
    summary: Optional[str] = None