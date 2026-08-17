from fastapi import APIRouter, File, Form, UploadFile

router = APIRouter()


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    crop_x: float = Form(...),
    crop_y: float = Form(...),
    crop_width: float = Form(...),
    crop_height: float = Form(...),
):
    image_bytes = await file.read()
    confirmation = {
        "message": "Box score crop received by Python",
        "filename": file.filename,
        "content_type": file.content_type,
        "image_size_bytes": len(image_bytes),
        "crop_area": {
            "x": crop_x,
            "y": crop_y,
            "width": crop_width,
            "height": crop_height,
        },
    }
    print(f"Box score crop received: {confirmation}")

    return confirmation
