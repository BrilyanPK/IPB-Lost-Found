import os
import uuid
import requests as http_requests
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

    # Read file content
    file_content = await file.read()

    # Upload to Supabase Storage
    upload_url = (
        f"{settings.SUPABASE_URL}/storage/v1/object/"
        f"{settings.SUPABASE_BUCKET}/{filename}"
    )

    headers = {
        "apikey": settings.SUPABASE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_KEY}",
        "Content-Type": file.content_type,
    }

    try:
        response = http_requests.post(
            upload_url,
            headers=headers,
            data=file_content,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not connect to storage: {str(e)}")

    if response.status_code not in [200, 201]:
        raise HTTPException(
            status_code=500,
            detail=f"Upload to storage failed: {response.text}"
        )

    # Return the public URL
    public_url = (
        f"{settings.SUPABASE_URL}/storage/v1/object/public/"
        f"{settings.SUPABASE_BUCKET}/{filename}"
    )

    return {"url": public_url}
