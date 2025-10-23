#!/usr/bin/env python3
"""
Bulk mailbox creation script for existing users
"""

import asyncio
import os
import sys
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

# Add the app directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "app"))

from app.core.database import get_db_session
from app.models import User
from app.api.v1.endpoints.mailbox import create_mailcow_mailbox

async def get_all_users() -> list[User]:
    """Get all users from the database"""
    async with get_db_session() as db:
        result = await db.execute(select(User))
        users = result.scalars().all()
        return list(users)

async def create_mailbox_for_user(user: User, password: str = None) -> dict:
    """Create mailbox for a specific user"""
    try:
        # Use a default password if not provided
        if not password:
            password = f"TempPass123!{user.id}"  # Temporary password
        
        result = await create_mailcow_mailbox(
            user.email,
            password,
            user.username or f"User {user.id}"
        )
        
        return {
            "user_id": user.id,
            "email": user.email,
            "success": result["success"],
            "error": result.get("error") if not result["success"] else None
        }
    except Exception as e:
        return {
            "user_id": user.id,
            "email": user.email,
            "success": False,
            "error": str(e)
        }

async def bulk_create_mailboxes():
    """Create mailboxes for all existing users"""
    print("🚀 Starting bulk mailbox creation for existing users...\n")
    
    # Get all users
    print("📋 Fetching all users from database...")
    users = await get_all_users()
    
    if not users:
        print("❌ No users found in database")
        return
    
    print(f"✅ Found {len(users)} users\n")
    
    # Create mailboxes
    results = []
    successful = 0
    failed = 0
    
    for i, user in enumerate(users, 1):
        print(f"[{i}/{len(users)}] Creating mailbox for {user.email}...")
        
        result = await create_mailbox_for_user(user)
        results.append(result)
        
        if result["success"]:
            print(f"  ✅ Success")
            successful += 1
        else:
            print(f"  ❌ Failed: {result['error']}")
            failed += 1
        
        # Small delay to avoid overwhelming the API
        await asyncio.sleep(0.5)
    
    # Print summary
    print(f"\n📊 Summary:")
    print(f"  Total users: {len(users)}")
    print(f"  Successful: {successful}")
    print(f"  Failed: {failed}")
    
    if failed > 0:
        print(f"\n❌ Failed creations:")
        for result in results:
            if not result["success"]:
                print(f"  - {result['email']}: {result['error']}")
    
    print(f"\n✨ Bulk mailbox creation completed!")

async def main():
    """Main function"""
    # Check environment
    if not os.getenv("MAILCOW_API_KEY"):
        print("❌ MAILCOW_API_KEY not set in environment")
        print("Please set your Mailcow API key in the .env file")
        return
    
    await bulk_create_mailboxes()

if __name__ == "__main__":
    asyncio.run(main())



