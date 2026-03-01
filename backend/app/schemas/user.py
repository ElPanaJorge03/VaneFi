from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserCreate(BaseModel):
    nombre: str
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    nombre: str
    email: str
    creado_en: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
