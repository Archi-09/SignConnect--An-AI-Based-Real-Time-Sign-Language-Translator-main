from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["User Progress"])

# Simple in-memory storage: {"email": ["HELLO", "WORLD"]}
user_progress_db = {}

class LearnRequest(BaseModel):
    email: str
    word: str

@router.post("/user/learn")
def mark_word_learned(data: LearnRequest):
    # Create entry if user is new
    if data.email not in user_progress_db:
        user_progress_db[data.email] = []
    
    # Add word if not already learned
    if data.word not in user_progress_db[data.email]:
        user_progress_db[data.email].append(data.word)
    
    return {"total_learned": len(user_progress_db[data.email])}

@router.get("/user/stats/{email}")
def get_user_stats(email: str):
    learned_words = user_progress_db.get(email, [])
    return {"total_learned": len(learned_words)}