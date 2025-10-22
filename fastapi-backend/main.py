from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import os
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
import asyncpg
import asyncio

# Initialize FastAPI app
app = FastAPI(
    title="Business Platform API",
    description="Backend API for Business Platform",
    version="1.0.0"
)

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://v4.business"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/business_platform")

# Pydantic models
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool

class Token(BaseModel):
    access_token: str
    token_type: str

# Database functions
async def get_db_connection():
    return await asyncpg.connect(DATABASE_URL)

async def create_user(email: str, password: str, full_name: str):
    conn = await get_db_connection()
    try:
        hashed_password = pwd_context.hash(password)
        query = """
        INSERT INTO users (email, password_hash, full_name, is_active)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, full_name, is_active
        """
        result = await conn.fetchrow(query, email, hashed_password, full_name, True)
        return dict(result)
    finally:
        await conn.close()

async def get_user_by_email(email: str):
    conn = await get_db_connection()
    try:
        query = "SELECT id, email, password_hash, full_name, is_active FROM users WHERE email = $1"
        result = await conn.fetchrow(query, email)
        return dict(result) if result else None
    finally:
        await conn.close()

# Authentication functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, os.getenv("SECRET_KEY", "your-secret-key"), algorithm="HS256")
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, os.getenv("SECRET_KEY", "your-secret-key"), algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await get_user_by_email(email)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Routes
@app.get("/")
async def root():
    return {"message": "Business Platform API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {
        "status": "OK",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected"
    }

@app.post("/api/v1/auth/register", response_model=User)
async def register(user: UserCreate):
    # Check if user already exists
    existing_user = await get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    new_user = await create_user(user.email, user.password, user.full_name)
    return new_user

@app.post("/api/v1/auth/login", response_model=Token)
async def login(user: UserLogin):
    # Get user from database
    db_user = await get_user_by_email(user.email)
    if not db_user or not pwd_context.verify(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    # Create access token
    access_token_expires = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120")))
    access_token = create_access_token(
        data={"sub": db_user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/v1/auth/me", response_model=User)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "full_name": current_user["full_name"],
        "is_active": current_user["is_active"]
    }

# Protected routes
@app.get("/api/v1/users")
async def get_users(current_user: dict = Depends(get_current_user)):
    conn = await get_db_connection()
    try:
        query = "SELECT id, email, full_name, is_active FROM users"
        results = await conn.fetch(query)
        return [dict(row) for row in results]
    finally:
        await conn.close()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3001)
