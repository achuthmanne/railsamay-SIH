from pydantic import BaseModel, Field
from typing import Optional

class UserLogin(BaseModel):
    username: str = Field(..., description="Controller ID or PNR")
    password: str = Field(..., description="Secure Passkey")
    role: str = Field(..., description="ats or passenger")
    zone: Optional[str] = None
    division: Optional[str] = None
    controlOffice: Optional[str] = None

class UserResponse(BaseModel):
    username: str
    role: str
    token: str
    message: str
