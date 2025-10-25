"""
Redis Service для кэширования и управления сессиями
"""

import json
import redis.asyncio as aioredis
from typing import Optional, Any
from datetime import timedelta
from app.core.config import settings


class RedisService:
    """Сервис для работы с Redis"""
    
    def __init__(self):
        self.redis_client: Optional[aioredis.Redis] = None
    
    async def connect(self):
        """Подключение к Redis"""
        try:
            self.redis_client = await aioredis.from_url(
                settings.REDIS_URL,
                password=settings.REDIS_PASSWORD,
                db=settings.REDIS_DB,
                encoding="utf-8",
                decode_responses=True
            )
            # Проверка подключения
            await self.redis_client.ping()
            print("✅ Redis connected successfully")
        except Exception as e:
            print(f"❌ Redis connection failed: {e}")
            self.redis_client = None
    
    async def disconnect(self):
        """Отключение от Redis"""
        if self.redis_client:
            await self.redis_client.close()
            print("✅ Redis disconnected")
    
    async def get(self, key: str) -> Optional[Any]:
        """Получить значение из кэша"""
        if not self.redis_client:
            return None
        
        try:
            value = await self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            print(f"❌ Redis GET error: {e}")
            return None
    
    async def set(
        self, 
        key: str, 
        value: Any, 
        ttl: Optional[int] = None
    ) -> bool:
        """Сохранить значение в кэш"""
        if not self.redis_client:
            return False
        
        try:
            ttl = ttl or settings.REDIS_CACHE_TTL
            serialized_value = json.dumps(value, default=str)
            await self.redis_client.setex(
                key,
                timedelta(seconds=ttl),
                serialized_value
            )
            return True
        except Exception as e:
            print(f"❌ Redis SET error: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Удалить значение из кэша"""
        if not self.redis_client:
            return False
        
        try:
            await self.redis_client.delete(key)
            return True
        except Exception as e:
            print(f"❌ Redis DELETE error: {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """Проверить существование ключа"""
        if not self.redis_client:
            return False
        
        try:
            return await self.redis_client.exists(key) > 0
        except Exception as e:
            print(f"❌ Redis EXISTS error: {e}")
            return False
    
    async def clear_pattern(self, pattern: str) -> int:
        """Удалить все ключи по паттерну"""
        if not self.redis_client:
            return 0
        
        try:
            keys = []
            async for key in self.redis_client.scan_iter(match=pattern):
                keys.append(key)
            
            if keys:
                return await self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            print(f"❌ Redis CLEAR_PATTERN error: {e}")
            return 0
    
    # Session Management
    async def set_session(
        self, 
        session_id: str, 
        data: dict, 
        ttl: Optional[int] = None
    ) -> bool:
        """Сохранить сессию"""
        ttl = ttl or settings.REDIS_SESSION_TTL
        return await self.set(f"session:{session_id}", data, ttl)
    
    async def get_session(self, session_id: str) -> Optional[dict]:
        """Получить сессию"""
        return await self.get(f"session:{session_id}")
    
    async def delete_session(self, session_id: str) -> bool:
        """Удалить сессию"""
        return await self.delete(f"session:{session_id}")
    
    # Cache Management for specific entities
    async def cache_user(self, user_id: int, user_data: dict, ttl: Optional[int] = None) -> bool:
        """Кэшировать данные пользователя"""
        return await self.set(f"user:{user_id}", user_data, ttl)
    
    async def get_cached_user(self, user_id: int) -> Optional[dict]:
        """Получить кэшированные данные пользователя"""
        return await self.get(f"user:{user_id}")
    
    async def invalidate_user_cache(self, user_id: int) -> bool:
        """Инвалидировать кэш пользователя"""
        return await self.delete(f"user:{user_id}")
    
    async def cache_task_list(self, company_id: int, tasks: list, ttl: Optional[int] = None) -> bool:
        """Кэшировать список задач"""
        return await self.set(f"tasks:company:{company_id}", tasks, ttl)
    
    async def get_cached_task_list(self, company_id: int) -> Optional[list]:
        """Получить кэшированный список задач"""
        return await self.get(f"tasks:company:{company_id}")
    
    async def invalidate_task_cache(self, company_id: int) -> bool:
        """Инвалидировать кэш задач компании"""
        return await self.clear_pattern(f"tasks:company:{company_id}*") > 0


# Глобальный экземпляр сервиса
redis_service = RedisService()


