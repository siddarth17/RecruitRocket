from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from app.auth.utils import get_current_user
from app.models.user import UserInDB
from app.database import get_database, get_applicants_collection  
from app.models.applicant import ApplicantModel, ApplicantCreateModel, StageModel
from app.utils.csv_parser import process_csv
from typing import List
from bson import ObjectId
import logging
import csv
import io
from openai import OpenAI
from app.config import settings
import json
import re

router = APIRouter()
logger = logging.getLogger(__name__)

# Configure OpenAI API
OpenAI.api_key = settings.OPENAI_API_KEY
client = OpenAI(api_key=settings.OPENAI_API_KEY)


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

@router.post("/bulk", response_model=List[ApplicantModel])
async def bulk_create_applicants(file: UploadFile = File(...), current_user: UserInDB = Depends(get_current_user)):
    logger.info(f"Attempting bulk create applicants for user: {current_user.id}")
    try:
        content = await file.read()
        csv_data = content.decode('utf-8')
        
        # Process the CSV data
        processed_data = process_csv(csv_data)
        
        # Prepare the prompt for OpenAI API
        prompt = f"""
        Convert the following CSV data into a format suitable for creating applicants:
        {processed_data}
        
        The desired format for each applicant is:
        {{
            "name": "string",
            "status": "string (rejected, considering, or accepted)",
            "strength": "integer (0-100)",
            "imageUrl": "string (URL)",
            "year": "integer (1-5)",
            "major": "string",
            "gender": "string",
            "summary": "string"
        }}
        
        Please follow these guidelines:
        1. Map the CSV columns to the desired fields as accurately as possible.
        2. If a required field is missing, use a default value:
           - name: "Unknown"
           - status: "considering"
           - strength: 50
           - imageUrl: ""
           - year: 1
           - major: "Undeclared"
           - gender: "Not specified"
           - summary: ""
        3. If a field in the CSV doesn't match any of the desired fields, ignore it.
        4. Ensure 'strength' is an integer between 0 and 100.
        5. Ensure 'year' is an integer between 1 and 5.
        6. Ensure 'status' is one of: "rejected", "considering", or "accepted".
        7. Convert any relevant text to appropriate data types (e.g., string to integer for 'strength' and 'year').
        
        Return the result as a valid JSON array of objects.
        """
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                    ],
                }
            ],
            max_tokens=1000,  # Adjust as needed
        )
        
        # Parse the GPT-4 response
        gpt_response = response.choices[0].message.content
        print(f"GPT-4 response: {gpt_response}")
        
        # Extract JSON from the response
        json_match = re.search(r'\[.*\]', gpt_response, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
            parsed_applicants = json.loads(json_str)
        else:
            raise ValueError("No valid JSON found in the GPT-4 response")
        
        print(f"Parsed applicants: {parsed_applicants}")
        
        # Create applicants in bulk
        collection = await get_applicants_collection()
        created_applicants = []
        for applicant_data in parsed_applicants:
            applicant_data["userId"] = str(current_user.id)
            applicant_data["id"] = str(ObjectId())
            result = await collection.insert_one(applicant_data)
            created_applicant = await collection.find_one({"_id": result.inserted_id})
            created_applicants.append(ApplicantModel(**{**created_applicant, "id": str(created_applicant["_id"])}))
        
        return created_applicants
    except Exception as e:
        logger.error(f"Error in bulk create applicants: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred during bulk applicant creation: {str(e)}")

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

@router.put("/{applicant_id}", response_model=ApplicantModel)
async def update_applicant(
    applicant_id: str, 
    applicant_update: ApplicantCreateModel, 
    current_user: UserInDB = Depends(get_current_user)
):
    logger.info(f"Updating applicant {applicant_id} for user: {current_user.id}")
    try:
        collection = await get_applicants_collection()
        
        # Prepare the update data
        update_data = applicant_update.dict(exclude_unset=True)
        
        # Perform the update
        result = await collection.find_one_and_update(
            {"_id": ObjectId(applicant_id), "userId": str(current_user.id)},
            {"$set": update_data},
            return_document=True
        )
        
        if result:
            return ApplicantModel(**{**result, "id": str(result["_id"])})
        else:
            raise HTTPException(status_code=404, detail="Applicant not found")
    except Exception as e:
        logger.error(f"Error updating applicant: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred while updating the applicant: {str(e)}")

@router.post("/{applicant_id}/ai-evaluation", response_model=dict)
async def generate_ai_evaluation(applicant_id: str, current_user: UserInDB = Depends(get_current_user)):
    applicants_collection = await get_applicants_collection()
    applicant = await applicants_collection.find_one({"_id": ObjectId(applicant_id), "userId": str(current_user.id)})
    
    if not applicant:
        raise HTTPException(status_code=404, detail="Applicant not found")

    # Fetch company values
    db = await get_database()
    company_values = await db.company_values.find_one({"userId": str(current_user.id)})
    values = company_values['values'] if company_values else []

    # Prepare the prompt for OpenAI
    prompt = f"""
    Evaluate the following applicant based on their summary, stage notes, and the company values:

    Applicant Summary: {applicant.get('summary', 'No summary provided')}

    Stage Notes:
    {' '.join([f"{stage.get('stage_name', 'Unnamed Stage')}: {stage.get('notes', 'No notes')}" for stage in applicant.get('stages', [])])}

    Company Values:
    {', '.join(values)}

    Please provide a comprehensive evaluation of the applicant in the following format:
    <h3>1. Summary Analysis:</h3>
    <p>[Detailed analysis of the applicant's summary, highlighting strengths and potential weaknesses]</p>

    <h3>2. Stage Performance:</h3>
    <p>[Summarize the applicant's performance across all stages, noting strengths and areas for improvement]</p>

    <h3>3. Alignment with Company Values:</h3>
    {' '.join([f"<h4>{value}:</h4><p>[Detailed evaluation of the applicant's alignment with this value]</p>" for value in values])}

    <h3>4. Conclusion:</h3>
    <p>[Provide an overall assessment of the applicant's fit for the company, considering all the above factors]</p>
    """

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an AI assistant that evaluates job applicants. Provide your evaluation in HTML format as specified."},
            {"role": "user", "content": prompt}
        ]
    )

    evaluation = response.choices[0].message.content.strip()

    return {"evaluation": evaluation}


# @router.post("/bulk", response_model=List[ApplicantModel])
# async def bulk_create_applicants(file: UploadFile = File(...), current_user: UserInDB = Depends(get_current_user)):
#     logger.info(f"Attempting bulk create applicants for user: {current_user.id}")
#     try:
#         content = await file.read()
#         csv_data = content.decode('utf-8')
        
#         # Process the CSV data
#         processed_data = process_csv(csv_data)
        
#         # Prepare the prompt for OpenAI API
#         prompt = f"""
#         Convert the following CSV data into a format suitable for creating applicants:
#         {processed_data}
        
#         The desired format for each applicant is:
#         {{
#             "name": "string",
#             "status": "string (rejected, considering, or accepted)",
#             "strength": "integer (0-100)",
#             "imageUrl": "string (URL)",
#             "year": "integer (1-5)",
#             "major": "string",
#             "gender": "string",
#             "summary": "string"
#         }}
        
#         Please follow these guidelines:
#         1. Map the CSV columns to the desired fields as accurately as possible.
#         2. If a required field is missing, use a default value:
#            - name: "Unknown"
#            - status: "considering"
#            - strength: 50
#            - imageUrl: ""
#            - year: 1
#            - major: "Undeclared"
#            - gender: "Not specified"
#            - summary: ""
#         3. If a field in the CSV doesn't match any of the desired fields, ignore it.
#         4. Ensure 'strength' is an integer between 0 and 100.
#         5. Ensure 'year' is an integer between 1 and 5.
#         6. Ensure 'status' is one of: "rejected", "considering", or "accepted".
#         7. Convert any relevant text to appropriate data types (e.g., string to integer for 'strength' and 'year').
        
#         Return the result as a valid Python list of dictionaries.
#         """
        
#         # Call OpenAI API
#         client = OpenAI()
#         response = client.chat.completions.create(
#             model="gpt-4o-mini",
#             messages=[
#                 {"role": "system", "content": "You are a helpful assistant that converts CSV data to JSON."},
#                 {"role": "user", "content": prompt}
#             ]
#         )
        
#         # Parse the OpenAI response
#         parsed_applicants = eval(response.choices[0].message['content'])
        
#         # Create applicants in bulk
#         collection = await get_applicants_collection()
#         created_applicants = []
#         for applicant_data in parsed_applicants:
#             applicant_data["userId"] = str(current_user.id)
#             applicant_data["id"] = str(ObjectId())
#             result = await collection.insert_one(applicant_data)
#             created_applicant = await collection.find_one({"_id": result.inserted_id})
#             created_applicants.append(ApplicantModel(**{**created_applicant, "id": str(created_applicant["_id"])}))
        
#         return created_applicants
#     except Exception as e:
#         logger.error(f"Error in bulk create applicants: {str(e)}", exc_info=True)
#         raise HTTPException(status_code=500, detail=f"An error occurred during bulk applicant creation: {str(e)}")

# @router.post("/bulk", response_model=List[ApplicantModel])
# async def bulk_create_applicants(file: UploadFile = File(...), current_user: UserInDB = Depends(get_current_user)):
#     logger.info(f"Attempting bulk create applicants for user: {current_user.id}")
#     try:
#         content = await file.read()
#         csv_data = content.decode('utf-8')
        
#         # Process the CSV data
#         processed_data = process_csv(csv_data)
        
#         # Prepare the prompt for OpenAI API
#         prompt = f"""
#         Convert the following CSV data into a format suitable for creating applicants:
#         {processed_data}
        
#         The desired format for each applicant is:
#         {{
#             "name": "string",
#             "status": "string (rejected, considering, or accepted)",
#             "strength": "integer (0-100)",
#             "imageUrl": "string (URL)",
#             "year": "integer (1-5)",
#             "major": "string",
#             "gender": "string",
#             "summary": "string"
#         }}
        
#         Please follow these guidelines:
#         1. Map the CSV columns to the desired fields as accurately as possible.
#         2. If a required field is missing, use a default value:
#            - name: "Unknown"
#            - status: "considering"
#            - strength: 50
#            - imageUrl: ""
#            - year: 1
#            - major: "Undeclared"
#            - gender: "Not specified"
#            - summary: ""
#         3. If a field in the CSV doesn't match any of the desired fields, ignore it.
#         4. Ensure 'strength' is an integer between 0 and 100.
#         5. Ensure 'year' is an integer between 1 and 5.
#         6. Ensure 'status' is one of: "rejected", "considering", or "accepted".
#         7. Convert any relevant text to appropriate data types (e.g., string to integer for 'strength' and 'year').
        
#         Return the result as a valid Python list of dictionaries.
#         """
        
#         # Call OpenAI API
#         response = client.chat.completions.create(
#             model="gpt-4o-mini",  # Note: Changed from "gpt-4o-mini" to "gpt-4" as the former is not a standard model name
#             messages=[
#                 {"role": "system", "content": "You are a helpful assistant that converts CSV data to JSON."},
#                 {"role": "user", "content": prompt}
#             ]
#         )
        
#         # Parse the OpenAI response
#         parsed_applicants = eval(response.choices[0].message.content)
        
#         # Create applicants in bulk
#         collection = await get_applicants_collection()
#         created_applicants = []
#         for applicant_data in parsed_applicants:
#             applicant_data["userId"] = str(current_user.id)
#             applicant_data["id"] = str(ObjectId())
#             result = await collection.insert_one(applicant_data)
#             created_applicant = await collection.find_one({"_id": result.inserted_id})
#             created_applicants.append(ApplicantModel(**{**created_applicant, "id": str(created_applicant["_id"])}))
        
#         return created_applicants
#     except Exception as e:
#         logger.error(f"Error in bulk create applicants: {str(e)}", exc_info=True)
#         raise HTTPException(status_code=500, detail=f"An error occurred during bulk applicant creation: {str(e)}")