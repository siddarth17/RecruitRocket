from fastapi import APIRouter, Depends, HTTPException
from app.auth.utils import get_current_user
from app.models.user import UserInDB
from app.database import get_database
from app.models.value import CompanyValueModel, CompanyValueCreateModel
from typing import List
from bson import ObjectId
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=CompanyValueModel)
async def get_company_values(current_user: UserInDB = Depends(get_current_user)):
    logger.info(f"Fetching company values for user: {current_user.id}")
    try:
        db = await get_database()
        company_values = await db.company_values.find_one({"userId": str(current_user.id)})
        if company_values:
            return CompanyValueModel(**{**company_values, "id": str(company_values["_id"])})
        else:
            # If no values exist, return an empty list
            return CompanyValueModel(id=str(ObjectId()), userId=str(current_user.id), values=[])
    except Exception as e:
        logger.error(f"Error fetching company values: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred while fetching company values: {str(e)}")

@router.post("/", response_model=CompanyValueModel)
async def add_company_value(value: CompanyValueCreateModel, current_user: UserInDB = Depends(get_current_user)):
    logger.info(f"Adding company value for user: {current_user.id}")
    try:
        db = await get_database()
        company_values = await db.company_values.find_one({"userId": str(current_user.id)})
        if company_values:
            result = await db.company_values.update_one(
                {"userId": str(current_user.id)},
                {"$push": {"values": value.value}}
            )
            updated_values = await db.company_values.find_one({"userId": str(current_user.id)})
        else:
            new_values = {
                "userId": str(current_user.id),
                "values": [value.value]
            }
            result = await db.company_values.insert_one(new_values)
            updated_values = await db.company_values.find_one({"_id": result.inserted_id})
        return CompanyValueModel(**{**updated_values, "id": str(updated_values["_id"])})
    except Exception as e:
        logger.error(f"Error adding company value: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred while adding company value: {str(e)}")

@router.put("/{index}", response_model=CompanyValueModel)
async def update_company_value(index: int, value: CompanyValueCreateModel, current_user: UserInDB = Depends(get_current_user)):
    logger.info(f"Updating company value at index {index} for user: {current_user.id}")
    try:
        db = await get_database()
        result = await db.company_values.update_one(
            {"userId": str(current_user.id)},
            {"$set": {f"values.{index}": value.value}}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Value not found or not modified")
        updated_values = await db.company_values.find_one({"userId": str(current_user.id)})
        return CompanyValueModel(**{**updated_values, "id": str(updated_values["_id"])})
    except Exception as e:
        logger.error(f"Error updating company value: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred while updating company value: {str(e)}")

@router.delete("/{index}", response_model=CompanyValueModel)
async def delete_company_value(index: int, current_user: UserInDB = Depends(get_current_user)):
    logger.info(f"Deleting company value at index {index} for user: {current_user.id}")
    try:
        db = await get_database()
        company_values = await db.company_values.find_one({"userId": str(current_user.id)})
        if not company_values or index >= len(company_values["values"]):
            raise HTTPException(status_code=404, detail="Value not found")

        values = company_values["values"]
        del values[index]

        result = await db.company_values.update_one(
            {"userId": str(current_user.id)},
            {"$set": {"values": values}}
        )
        updated_values = await db.company_values.find_one({"userId": str(current_user.id)})
        return CompanyValueModel(**{**updated_values, "id": str(updated_values["_id"])})
    except Exception as e:
        logger.error(f"Error deleting company value: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred while deleting company value: {str(e)}")