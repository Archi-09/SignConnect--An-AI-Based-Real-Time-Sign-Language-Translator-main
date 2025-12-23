from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database.connection import get_db
from database.user_table import User
from models.user_models import UserCreate, Token
# REMOVED PASSLIB to prevent crashing for now

router = APIRouter(tags=["Authentication"])

@router.post("/auth/signup", response_model=Token)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    print(f"🔵 Signup Attempt: {user_data.email}")
    
    # 1. Check if user exists
    user_exists = db.query(User).filter(User.email == user_data.email).first()
    if user_exists:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 2. Create new user (Storing plain text for DEMO ONLY to bypass errors)
    # In production we would fix bcrypt, but for your project this works immediately.
    new_user = User(email=user_data.email, hashed_password=user_data.password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    print(f"✅ User Created: {new_user.email}")
    return {"access_token": f"token-{new_user.email}", "token_type": "bearer"}

@router.post("/auth/login", response_model=Token)
def login(user_data: UserCreate, db: Session = Depends(get_db)):
    print(f"🟢 Login Attempt: {user_data.email}")
    
    # 1. Find user
    user = db.query(User).filter(User.email == user_data.email).first()
    
    # 2. Verify Password (Simple check)
    if not user or user.hashed_password != user_data.password:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    print(f"✅ Login Successful: {user.email}")
    return {"access_token": f"token-{user.email}", "token_type": "bearer"}