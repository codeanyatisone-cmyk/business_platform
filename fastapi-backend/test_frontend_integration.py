#!/usr/bin/env python3
"""
Frontend Integration Test Script
Tests the FastAPI backend with the same calls the React frontend would make
"""

import requests
import json
import sys

BASE_URL = "http://localhost:3001/api/v1"

def test_api_connection():
    """Test basic API connection"""
    print("🔗 Testing API Connection...")
    try:
        response = requests.get(f"{BASE_URL}/test")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API Connection: {data['message']}")
            return True
        else:
            print(f"❌ API Connection failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API Connection error: {e}")
        return False

def test_companies_api():
    """Test companies API"""
    print("\n🏢 Testing Companies API...")
    try:
        response = requests.get(f"{BASE_URL}/companies")
        if response.status_code == 200:
            companies = response.json()
            print(f"✅ Found {len(companies)} companies:")
            for company in companies:
                print(f"   - {company['name']} (ID: {company['id']})")
            return True
        else:
            print(f"❌ Companies API failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Companies API error: {e}")
        return False

def test_boards_api():
    """Test boards API"""
    print("\n📋 Testing Boards API...")
    try:
        # Test GET boards
        response = requests.get(f"{BASE_URL}/boards")
        if response.status_code == 200:
            boards = response.json()
            print(f"✅ Found {len(boards)} boards:")
            for board in boards:
                print(f"   - {board['name']} (ID: {board['id']})")
            
            # Test POST board (create new)
            new_board = {
                "name": "Frontend Test Board",
                "description": "Created by frontend integration test",
                "color": "#FF5722",
                "is_default": False,
                "is_archived": False,
                "company_id": 1
            }
            
            post_response = requests.post(f"{BASE_URL}/boards", json=new_board)
            if post_response.status_code == 200:
                created_board = post_response.json()
                print(f"✅ Created new board: {created_board['name']} (ID: {created_board['id']})")
                return True
            else:
                print(f"❌ Board creation failed: {post_response.status_code}")
                return False
        else:
            print(f"❌ Boards API failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Boards API error: {e}")
        return False

def test_auth_api():
    """Test authentication API"""
    print("\n🔐 Testing Authentication API...")
    try:
        # Test login
        login_data = {
            "email": "admin@example.com",
            "password": "admin"
        }
        
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            auth_data = response.json()
            print(f"✅ Login successful:")
            print(f"   - User: {auth_data['user']['name']}")
            print(f"   - Role: {auth_data['user']['role']}")
            print(f"   - Token: {auth_data['access_token'][:20]}...")
            return True
        else:
            print(f"❌ Login failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Auth API error: {e}")
        return False

def test_tasks_api():
    """Test tasks API"""
    print("\n📝 Testing Tasks API...")
    try:
        response = requests.get(f"{BASE_URL}/tasks")
        if response.status_code == 200:
            tasks = response.json()
            print(f"✅ Found {len(tasks)} tasks:")
            for task in tasks:
                print(f"   - {task['title']} (Status: {task['status']})")
            return True
        else:
            print(f"❌ Tasks API failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Tasks API error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Frontend Integration Test for FastAPI Backend")
    print("=" * 50)
    
    tests = [
        test_api_connection,
        test_companies_api,
        test_boards_api,
        test_auth_api,
        test_tasks_api
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Frontend integration is working perfectly!")
        return 0
    else:
        print("⚠️  Some tests failed. Check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())


