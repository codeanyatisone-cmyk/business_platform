from fastapi import APIRouter
router = APIRouter()

@router.get("/")
async def get_knowledge():
    return {"message": "Knowledge endpoint - в разработке"}
