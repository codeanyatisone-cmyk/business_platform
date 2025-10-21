from fastapi import APIRouter
router = APIRouter()

@router.get("/")
async def get_academy():
    return {"message": "Academy endpoint - в разработке"}
