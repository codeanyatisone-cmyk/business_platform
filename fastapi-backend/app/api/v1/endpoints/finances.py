from fastapi import APIRouter
router = APIRouter()

@router.get("/")
async def get_finances():
    return {"message": "Finances endpoint - в разработке"}
