from pydantic import BaseModel
from typing import List

class CompanyValueModel(BaseModel):
    id: str
    userId: str
    values: List[str]

class CompanyValueCreateModel(BaseModel):
    value: str