"""
MinIO Service для S3-совместимого файлового хранилища
"""

from minio import Minio
from minio.error import S3Error
from typing import Optional, BinaryIO
from datetime import timedelta
from io import BytesIO
import uuid
from app.core.config import settings


class MinIOService:
    """Сервис для работы с MinIO (S3-compatible storage)"""
    
    def __init__(self):
        self.client: Optional[Minio] = None
        self.bucket_name = settings.MINIO_BUCKET_NAME
    
    def connect(self):
        """Подключение к MinIO"""
        try:
            self.client = Minio(
                settings.MINIO_ENDPOINT,
                access_key=settings.MINIO_ACCESS_KEY,
                secret_key=settings.MINIO_SECRET_KEY,
                secure=settings.MINIO_SECURE
            )
            
            # Создать bucket если не существует
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                print(f"✅ MinIO bucket '{self.bucket_name}' created")
            else:
                print(f"✅ MinIO connected to bucket '{self.bucket_name}'")
            
            return True
        except S3Error as e:
            print(f"❌ MinIO connection failed: {e}")
            return False
    
    def upload_file(
        self,
        file_data: BinaryIO,
        file_name: str,
        content_type: str = "application/octet-stream",
        folder: str = ""
    ) -> Optional[str]:
        """
        Загрузить файл в MinIO
        
        Args:
            file_data: Файловые данные
            file_name: Имя файла
            content_type: MIME тип файла
            folder: Папка для организации файлов
        
        Returns:
            Путь к файлу или None при ошибке
        """
        if not self.client:
            print("❌ MinIO client not connected")
            return None
        
        try:
            # Генерируем уникальное имя файла
            file_extension = file_name.split('.')[-1] if '.' in file_name else ''
            unique_name = f"{uuid.uuid4()}.{file_extension}" if file_extension else str(uuid.uuid4())
            
            # Формируем путь с папкой
            object_name = f"{folder}/{unique_name}" if folder else unique_name
            
            # Получаем размер файла
            file_data.seek(0, 2)  # Перемещаемся в конец
            file_size = file_data.tell()
            file_data.seek(0)  # Возвращаемся в начало
            
            # Загружаем файл
            self.client.put_object(
                self.bucket_name,
                object_name,
                file_data,
                length=file_size,
                content_type=content_type
            )
            
            print(f"✅ File uploaded: {object_name}")
            return object_name
        except S3Error as e:
            print(f"❌ MinIO upload error: {e}")
            return None
    
    def download_file(self, object_name: str) -> Optional[bytes]:
        """
        Скачать файл из MinIO
        
        Args:
            object_name: Путь к файлу в MinIO
        
        Returns:
            Содержимое файла или None при ошибке
        """
        if not self.client:
            print("❌ MinIO client not connected")
            return None
        
        try:
            response = self.client.get_object(self.bucket_name, object_name)
            data = response.read()
            response.close()
            response.release_conn()
            return data
        except S3Error as e:
            print(f"❌ MinIO download error: {e}")
            return None
    
    def delete_file(self, object_name: str) -> bool:
        """
        Удалить файл из MinIO
        
        Args:
            object_name: Путь к файлу в MinIO
        
        Returns:
            True при успехе, False при ошибке
        """
        if not self.client:
            print("❌ MinIO client not connected")
            return False
        
        try:
            self.client.remove_object(self.bucket_name, object_name)
            print(f"✅ File deleted: {object_name}")
            return True
        except S3Error as e:
            print(f"❌ MinIO delete error: {e}")
            return False
    
    def get_presigned_url(
        self, 
        object_name: str, 
        expires: timedelta = timedelta(hours=1)
    ) -> Optional[str]:
        """
        Получить временную ссылку на файл
        
        Args:
            object_name: Путь к файлу в MinIO
            expires: Время жизни ссылки
        
        Returns:
            URL или None при ошибке
        """
        if not self.client:
            print("❌ MinIO client not connected")
            return None
        
        try:
            url = self.client.presigned_get_object(
                self.bucket_name,
                object_name,
                expires=expires
            )
            return url
        except S3Error as e:
            print(f"❌ MinIO presigned URL error: {e}")
            return None
    
    def list_files(self, prefix: str = "") -> list:
        """
        Список файлов в bucket
        
        Args:
            prefix: Префикс для фильтрации (папка)
        
        Returns:
            Список объектов
        """
        if not self.client:
            print("❌ MinIO client not connected")
            return []
        
        try:
            objects = self.client.list_objects(
                self.bucket_name,
                prefix=prefix,
                recursive=True
            )
            return [
                {
                    "name": obj.object_name,
                    "size": obj.size,
                    "last_modified": obj.last_modified,
                    "etag": obj.etag
                }
                for obj in objects
            ]
        except S3Error as e:
            print(f"❌ MinIO list error: {e}")
            return []
    
    def file_exists(self, object_name: str) -> bool:
        """
        Проверить существование файла
        
        Args:
            object_name: Путь к файлу в MinIO
        
        Returns:
            True если файл существует
        """
        if not self.client:
            return False
        
        try:
            self.client.stat_object(self.bucket_name, object_name)
            return True
        except S3Error:
            return False
    
    # Специализированные методы для разных типов файлов
    
    def upload_avatar(self, file_data: BinaryIO, file_name: str) -> Optional[str]:
        """Загрузить аватар пользователя"""
        return self.upload_file(file_data, file_name, "image/jpeg", "avatars")
    
    def upload_document(self, file_data: BinaryIO, file_name: str, content_type: str) -> Optional[str]:
        """Загрузить документ"""
        return self.upload_file(file_data, file_name, content_type, "documents")
    
    def upload_attachment(self, file_data: BinaryIO, file_name: str, content_type: str) -> Optional[str]:
        """Загрузить вложение к задаче/письму"""
        return self.upload_file(file_data, file_name, content_type, "attachments")
    
    def upload_knowledge_base_file(self, file_data: BinaryIO, file_name: str, content_type: str) -> Optional[str]:
        """Загрузить файл в базу знаний"""
        return self.upload_file(file_data, file_name, content_type, "knowledge-base")


# Глобальный экземпляр сервиса
minio_service = MinIOService()


