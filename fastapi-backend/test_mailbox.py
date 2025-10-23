#!/usr/bin/env python3
"""
Test script for mailbox functionality
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "app"))

from app.api.v1.endpoints.mailbox import create_mailcow_mailbox, get_mailcow_mailbox

async def test_mailbox_creation():
    """Test mailbox creation functionality"""
    print("🧪 Testing mailbox creation...")
    
    # Test data
    test_email = "test@anyatis.com"
    test_password = "TestPassword123!"
    test_name = "Test User"
    
    try:
        # Test mailbox creation
        print(f"Creating mailbox for {test_email}...")
        result = await create_mailcow_mailbox(test_email, test_password, test_name)
        
        if result["success"]:
            print("✅ Mailbox creation successful!")
            print(f"Response: {result['data']}")
        else:
            print("❌ Mailbox creation failed!")
            print(f"Error: {result['error']}")
            
        # Test mailbox retrieval
        print(f"\nRetrieving mailbox info for {test_email}...")
        info_result = await get_mailcow_mailbox(test_email)
        
        if info_result["success"]:
            print("✅ Mailbox retrieval successful!")
            print(f"Mailbox info: {info_result['data']}")
        else:
            print("❌ Mailbox retrieval failed!")
            print(f"Error: {info_result['error']}")
            
    except Exception as e:
        print(f"❌ Test failed with exception: {str(e)}")

async def test_api_endpoints():
    """Test API endpoints"""
    print("\n🌐 Testing API endpoints...")
    
    # This would require running the FastAPI server
    # For now, just print the expected endpoints
    endpoints = [
        "GET /mailbox/info",
        "POST /mailbox/create",
        "POST /mailbox/update-password", 
        "GET /mailbox/webmail-url"
    ]
    
    print("Available mailbox endpoints:")
    for endpoint in endpoints:
        print(f"  - {endpoint}")

def check_environment():
    """Check if required environment variables are set"""
    print("🔧 Checking environment configuration...")
    
    required_vars = [
        "MAILCOW_API_KEY",
        "MAILCOW_DOMAIN", 
        "MAILCOW_API_URL"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing environment variables:")
        for var in missing_vars:
            print(f"  - {var}")
        print("\nPlease set these variables in your .env file:")
        print("MAILCOW_API_KEY=your-mailcow-api-key")
        print("MAILCOW_DOMAIN=anyatis.com")
        print("MAILCOW_API_URL=https://mail.anyatis.com/api/v1")
        return False
    else:
        print("✅ All required environment variables are set")
        return True

async def main():
    """Main test function"""
    print("🚀 Starting mailbox functionality tests...\n")
    
    # Check environment
    if not check_environment():
        print("\n⚠️  Please configure environment variables before running tests")
        return
    
    # Test mailbox functions
    await test_mailbox_creation()
    
    # Test API endpoints info
    await test_api_endpoints()
    
    print("\n✨ Tests completed!")

if __name__ == "__main__":
    asyncio.run(main())
