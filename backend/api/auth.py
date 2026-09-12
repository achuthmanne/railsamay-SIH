from fastapi import APIRouter, HTTPException, Depends
from backend.models.user import UserLogin, UserResponse
from backend.core.database import get_database
import hashlib
import secrets

router = APIRouter()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/login", response_model=UserResponse)
async def login(credentials: UserLogin, db=Depends(get_database)):
    users_collection = db.users
    
    # Check if user exists in MongoDB
    user = await users_collection.find_one({"username": credentials.username, "role": credentials.role})
    
    hashed_pwd = hash_password(credentials.password)
    
    if not user:
        # HACKATHON SEEDING LOGIC: Auto-create official ATS user if it doesn't exist yet for smooth demo
        if credentials.role == "ats":
            # For hackathon demo, allow auto-creation of any ATS user provided
            new_user = {
                "username": credentials.username,
                "password": hashed_pwd,
                "role": credentials.role,
                "zone": credentials.zone or "South Central Railway (SCR)",
                "division": credentials.division or "Vijayawada",
                "control_office": credentials.controlOffice or "Vijayawada Control",
                "clearance_level": "LEVEL_4"
            }
            await users_collection.insert_one(new_user)
            user = new_user
        # Auto-create passenger user for OTP demo
        elif credentials.role == "passenger":
            new_user = {
                "username": credentials.username, # The phone number
                "password": hashed_pwd,           # The OTP they entered
                "role": credentials.role,
                "alerts_enabled": True
            }
            await users_collection.insert_one(new_user)
            user = new_user
        else:
            raise HTTPException(status_code=401, detail="Invalid authorization credentials")

    # Verify Password (or OTP for passenger)
    if user["password"] != hashed_pwd:
        if credentials.role == "passenger":
            # For passenger OTP, if they log in again with a DIFFERENT OTP, update it for the demo
            await users_collection.update_one({"_id": user["_id"]}, {"$set": {"password": hashed_pwd}})
        else:
            raise HTTPException(status_code=401, detail="Invalid secure passkey")
    
    # Generate a secure session token
    session_token = secrets.token_hex(32)
    
    return UserResponse(
        username=user["username"],
        role=user["role"],
        token=session_token,
        message="Secure session established."
    )
