#!/usr/bin/env python3
"""
Скрипт для инициализации базы данных PostgreSQL
"""

import asyncio
import sys
from pathlib import Path

# Добавляем путь к приложению
sys.path.append(str(Path(__file__).parent))

from app.core.database import init_db, engine
from app.models import Base


async def create_tables():
    """Создание всех таблиц в базе данных"""
    print("🚀 Инициализация базы данных...")
    
    try:
        # Создаем все таблицы
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        print("✅ Все таблицы успешно созданы!")
        print("📊 Созданные таблицы:")
        
        # Показываем список созданных таблиц
        for table_name in Base.metadata.tables.keys():
            print(f"   - {table_name}")
            
    except Exception as e:
        print(f"❌ Ошибка при создании таблиц: {e}")
        return False
    
    return True


async def main():
    """Основная функция"""
    success = await create_tables()
    
    if success:
        print("\n🎉 База данных готова к использованию!")
        print("💡 Теперь можно запустить FastAPI сервер:")
        print("   python3 app/main.py")
    else:
        print("\n💥 Не удалось инициализировать базу данных")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
