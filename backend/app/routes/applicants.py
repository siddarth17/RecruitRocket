from fastapi import APIRouter, Depends, HTTPException
from app.auth.utils import get_current_user
from app.models.user import UserInDB
from app.database import get_database, get_applicants_collection  
from app.models.applicant import ApplicantModel, ApplicantCreateModel, StageModel
from typing import List
from bson import ObjectId
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=ApplicantModel)
async def create_applicant(applicant_input: ApplicantCreateModel, current_user: UserInDB = Depends(get_current_user)):
    logger.info(f"Attempting to create applicant for user: {current_user.id}")
    try:
        collection = await get_applicants_collection() 
        applicant_dict = applicant_input.dict()
        applicant_dict["userId"] = str(current_user.id)
        applicant_dict["id"] = str(ObjectId())
        result = await collection.insert_one(applicant_dict)
        created_applicant = await collection.find_one({"_id": result.inserted_id})
        return ApplicantModel(**{**created_applicant, "id": str(created_applicant["_id"])})
    except Exception as e:
        logger.error(f"Error creating applicant: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred while creating the applicant: {str(e)}")

@router.get("/", response_model=List[ApplicantModel])
async def get_user_applicants(current_user: UserInDB = Depends(get_current_user)):
    logger.info(f"Fetching applicants for user: {current_user.id}")
    try:
        collection = await get_applicants_collection()
        applicants = await collection.find({"userId": str(current_user.id)}).to_list(None)
        return [ApplicantModel(**{**applicant, "id": str(applicant["_id"])}) for applicant in applicants]
    except Exception as e:
        logger.error(f"Error fetching applicants: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred while fetching applicants: {str(e)}")

@router.delete("/{applicant_id}", response_model=ApplicantModel)
async def delete_applicant(applicant_id: str, current_user: UserInDB = Depends(get_current_user)):
    logger.info(f"Attempting to delete applicant {applicant_id} for user: {current_user.id}")
    try:
        collection = await get_applicants_collection()
        applicant = await collection.find_one_and_delete({"_id": ObjectId(applicant_id), "userId": str(current_user.id)})
        if applicant:
            logger.info(f"Applicant {applicant_id} deleted successfully")
            return ApplicantModel(**{**applicant, "id": str(applicant["_id"])})
        else:
            logger.warning(f"Applicant {applicant_id} not found for user {current_user.id}")
            raise HTTPException(status_code=404, detail="Applicant not found")
    except Exception as e:
        logger.error(f"Error deleting applicant: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred while deleting the applicant: {str(e)}")

@router.get("/{applicant_id}", response_model=ApplicantModel)
async def get_applicant(applicant_id: str, current_user: UserInDB = Depends(get_current_user)):
    logger.info(f"Fetching applicant {applicant_id} for user: {current_user.id}")
    try:
        collection = await get_applicants_collection()
        applicant = await collection.find_one({"_id": ObjectId(applicant_id), "userId": str(current_user.id)})
        if applicant:
            return ApplicantModel(**{**applicant, "id": str(applicant["_id"])})
        else:
            raise HTTPException(status_code=404, detail="Applicant not found")
    except Exception as e:
        logger.error(f"Error fetching applicant: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred while fetching the applicant: {str(e)}")

@router.post("/{applicant_id}/stages", response_model=ApplicantModel)
async def add_stage(applicant_id: str, stage: StageModel, current_user: UserInDB = Depends(get_current_user)):
    logger.info(f"Adding stage to applicant {applicant_id} for user: {current_user.id}")
    try:
        collection = await get_applicants_collection()
        result = await collection.find_one_and_update(
            {"_id": ObjectId(applicant_id), "userId": str(current_user.id)},
            {"$push": {"stages": stage.dict()}},
            return_document=True
        )
        if result:
            return ApplicantModel(**{**result, "id": str(result["_id"])})
        else:
            raise HTTPException(status_code=404, detail="Applicant not found")
    except Exception as e:
        logger.error(f"Error adding stage: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred while adding the stage: {str(e)}")

@router.put("/{applicant_id}/stages/{stage_index}", response_model=ApplicantModel)
async def update_stage(applicant_id: str, stage_index: int, stage: StageModel, current_user: UserInDB = Depends(get_current_user)):
    logger.info(f"Updating stage {stage_index} for applicant {applicant_id} for user: {current_user.id}")
    try:
        collection = await get_applicants_collection()
        result = await collection.find_one_and_update(
            {"_id": ObjectId(applicant_id), "userId": str(current_user.id)},
            {"$set": {f"stages.{stage_index}": stage.dict()}},
            return_document=True
        )
        if result:
            return ApplicantModel(**{**result, "id": str(result["_id"])})
        else:
            raise HTTPException(status_code=404, detail="Applicant or stage not found")
    except Exception as e:
        logger.error(f"Error updating stage: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred while updating the stage: {str(e)}")

@router.delete("/{applicant_id}/stages/{stage_index}", response_model=ApplicantModel)
async def delete_stage(applicant_id: str, stage_index: int, current_user: UserInDB = Depends(get_current_user)):
    logger.info(f"Deleting stage {stage_index} from applicant {applicant_id} for user: {current_user.id}")
    try:
        collection = await get_applicants_collection()
        result = await collection.find_one_and_update(
            {"_id": ObjectId(applicant_id), "userId": str(current_user.id)},
            {"$unset": {f"stages.{stage_index}": ""}},
            return_document=True
        )
        if result:
            await collection.update_one(
                {"_id": ObjectId(applicant_id)},
                {"$pull": {"stages": None}}
            )
            updated_applicant = await collection.find_one({"_id": ObjectId(applicant_id)})
            return ApplicantModel(**{**updated_applicant, "id": str(updated_applicant["_id"])})
        else:
            raise HTTPException(status_code=404, detail="Applicant or stage not found")
    except Exception as e:
        logger.error(f"Error deleting stage: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred while deleting the stage: {str(e)}")