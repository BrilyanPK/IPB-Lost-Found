import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.api.deps import CurrentUser
from app.core.config import settings

router = APIRouter()

@router.post("/image")
async def upload_image(
    current_user: CurrentUser,
    file: UploadFile = File(...)
):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Create unique filename
    extension = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{extension}"
    file_path = os.path.join("uploads", filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")
    
    # Return the URL to access the image
    # Note: In production, use the actual domain
    return {"url": f"http://127.0.0.1:8000/uploads/{filename}"}
