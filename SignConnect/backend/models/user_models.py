from pydantic import BaseModel, EmailStr

# Schema for the data we expect when a user registers
class UserCreate(BaseModel):
    email: EmailStr
    password: str

# Schema for the data we return after successful login/signup
class Token(BaseModel):
    access_token: str
    token_type: str