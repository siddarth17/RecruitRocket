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
    name: Optional[str] = None
    status: Optional[str] = None
    strength: Optional[int] = None
    imageUrl: Optional[str] = None
    year: Optional[int] = None
    major: Optional[str] = None
    gender: Optional[str] = None
    summary: Optional[str] = None