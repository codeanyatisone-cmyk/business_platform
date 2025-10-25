"""
API endpoints для работы с файлами через MinIO
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import StreamingResponse
from typing import List
from io import BytesIO

from app.services.minio_service import minio_service
from app.api.v1.dependencies import get_current_user_from_token
from app.models import User

router = APIRouter()


@router.post("/upload/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user_from_token)
):
    """Загрузить аватар пользователя"""
    try:
        # Проверка типа файла
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only image files are allowed"
            )
        
        # Загрузка файла
        file_data = BytesIO(await file.read())
        object_name = minio_service.upload_avatar(file_data, file.filename)
        
        if not object_name:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload file"
            )
        
        # Получение временной ссылки
        url = minio_service.get_presigned_url(object_name)
        
        return {
            "success": True,
            "message": "Avatar uploaded successfully",
            "file_path": object_name,
            "url": url
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading avatar: {str(e)}"
        )


@router.post("/upload/document")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user_from_token)
):
    """Загрузить документ"""
    try:
        # Загрузка файла
        file_data = BytesIO(await file.read())
        content_type = file.content_type or "application/octet-stream"
        object_name = minio_service.upload_document(file_data, file.filename, content_type)
        
        if not object_name:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload file"
            )
        
        # Получение временной ссылки
        url = minio_service.get_presigned_url(object_name)
        
        return {
            "success": True,
            "message": "Document uploaded successfully",
            "file_path": object_name,
            "url": url,
            "file_name": file.filename,
            "content_type": content_type
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading document: {str(e)}"
        )


@router.post("/upload/attachment")
async def upload_attachment(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user_from_token)
):
    """Загрузить вложение (для задач, писем и т.д.)"""
    try:
        # Загрузка файла
        file_data = BytesIO(await file.read())
        content_type = file.content_type or "application/octet-stream"
        object_name = minio_service.upload_attachment(file_data, file.filename, content_type)
        
        if not object_name:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload file"
            )
        
        # Получение временной ссылки
        url = minio_service.get_presigned_url(object_name)
        
        return {
            "success": True,
            "message": "Attachment uploaded successfully",
            "file_path": object_name,
            "url": url,
            "file_name": file.filename,
            "content_type": content_type
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading attachment: {str(e)}"
        )


@router.get("/download/{file_path:path}")
async def download_file(
    file_path: str,
    current_user: User = Depends(get_current_user_from_token)
):
    """Скачать файл"""
    try:
        # Проверка существования файла
        if not minio_service.file_exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        
        # Скачивание файла
        file_data = minio_service.download_file(file_path)
        
        if not file_data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to download file"
            )
        
        # Возврат файла
        return StreamingResponse(
            BytesIO(file_data),
            media_type="application/octet-stream",
            headers={
                "Content-Disposition": f"attachment; filename={file_path.split('/')[-1]}"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error downloading file: {str(e)}"
        )


@router.delete("/delete/{file_path:path}")
async def delete_file(
    file_path: str,
    current_user: User = Depends(get_current_user_from_token)
):
    """Удалить файл"""
    try:
        # Проверка существования файла
        if not minio_service.file_exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        
        # Удаление файла
        success = minio_service.delete_file(file_path)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete file"
            )
        
        return {
            "success": True,
            "message": "File deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting file: {str(e)}"
        )


@router.get("/list")
async def list_files(
    prefix: str = "",
    current_user: User = Depends(get_current_user_from_token)
):
    """Список файлов"""
    try:
        files = minio_service.list_files(prefix)
        
        return {
            "success": True,
            "files": files,
            "count": len(files)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing files: {str(e)}"
        )


@router.get("/url/{file_path:path}")
async def get_file_url(
    file_path: str,
    current_user: User = Depends(get_current_user_from_token)
):
    """Получить временную ссылку на файл"""
    try:
        # Проверка существования файла
        if not minio_service.file_exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        
        # Получение временной ссылки
        url = minio_service.get_presigned_url(file_path)
        
        if not url:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate URL"
            )
        
        return {
            "success": True,
            "url": url,
            "file_path": file_path
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating URL: {str(e)}"
        )


