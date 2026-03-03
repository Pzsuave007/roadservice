from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import secrets
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# HTTP Basic Auth for admin
security = HTTPBasic()

# Admin credentials (hardcoded for MVP)
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "bensroadservice2024"

def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, ADMIN_USERNAME)
    correct_password = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username


# Enums
class VehicleType(str, Enum):
    sedan = "sedan"
    suv = "suv"
    truck = "truck"
    motorcycle = "motorcycle"
    van = "van"
    other = "other"

class ServiceType(str, Enum):
    emergency_towing = "emergency_towing"
    flatbed_towing = "flatbed_towing"
    accident_recovery = "accident_recovery"
    lockout = "lockout"
    jump_start = "jump_start"
    tire_change = "tire_change"
    long_distance = "long_distance"

class RequestStatus(str, Enum):
    pending = "pending"
    contacted = "contacted"
    completed = "completed"
    cancelled = "cancelled"


# Default Settings
DEFAULT_SETTINGS = {
    "phone_number": "9713886300",
    "phone_display": "(971) 388-6300",
    "company_name": "Ben's Road Service LLC",
    "service_area": "Salem & All of Oregon",
    "mileage_rate": 3.50,
    "emergency_fee": 25,
    "base_prices": {
        "emergency_towing": 85,
        "flatbed_towing": 95,
        "accident_recovery": 125,
        "lockout": 55,
        "jump_start": 45,
        "tire_change": 55,
        "long_distance": 100
    },
    "vehicle_multipliers": {
        "sedan": 1.0,
        "suv": 1.15,
        "truck": 1.25,
        "motorcycle": 0.85,
        "van": 1.2,
        "other": 1.1
    }
}


# Models
class SiteSettings(BaseModel):
    phone_number: str = "9713886300"
    phone_display: str = "(971) 388-6300"
    company_name: str = "Ben's Road Service LLC"
    service_area: str = "Salem & All of Oregon"
    mileage_rate: float = 3.50
    emergency_fee: float = 25
    base_prices: Dict[str, float] = Field(default_factory=lambda: DEFAULT_SETTINGS["base_prices"].copy())
    vehicle_multipliers: Dict[str, float] = Field(default_factory=lambda: DEFAULT_SETTINGS["vehicle_multipliers"].copy())

class QuoteRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    pickup_location: str
    dropoff_location: str
    vehicle_type: VehicleType
    service_type: ServiceType
    is_emergency: bool = True
    phone_number: str
    estimated_distance: Optional[float] = None
    estimated_price: Optional[float] = None
    status: RequestStatus = RequestStatus.pending
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    notes: Optional[str] = None

class QuoteRequestCreate(BaseModel):
    pickup_location: str
    dropoff_location: str
    vehicle_type: VehicleType
    service_type: ServiceType
    is_emergency: bool = True
    phone_number: str
    estimated_distance: Optional[float] = None

class QuoteEstimate(BaseModel):
    base_price: float
    mileage_charge: float
    emergency_fee: float
    total_estimate: float
    distance_miles: float

class QuoteStatusUpdate(BaseModel):
    status: RequestStatus
    notes: Optional[str] = None


# Helper function to get settings
async def get_settings() -> dict:
    """Get settings from database or return defaults"""
    settings = await db.settings.find_one({"_id": "site_settings"})
    if settings:
        settings.pop('_id', None)
        # Merge with defaults in case new fields were added
        merged = DEFAULT_SETTINGS.copy()
        merged.update(settings)
        return merged
    return DEFAULT_SETTINGS.copy()


# Pricing logic - now uses database settings
async def calculate_quote_async(vehicle_type: VehicleType, service_type: ServiceType, is_emergency: bool, distance_miles: float) -> QuoteEstimate:
    settings = await get_settings()
    
    base_prices = settings.get("base_prices", DEFAULT_SETTINGS["base_prices"])
    vehicle_multipliers = settings.get("vehicle_multipliers", DEFAULT_SETTINGS["vehicle_multipliers"])
    mileage_rate = settings.get("mileage_rate", 3.50)
    emergency_fee_amount = settings.get("emergency_fee", 25)
    
    base_price = base_prices.get(service_type.value, 75) * vehicle_multipliers.get(vehicle_type.value, 1.0)
    mileage_charge = distance_miles * mileage_rate
    emergency_fee = emergency_fee_amount if is_emergency else 0
    
    total = base_price + mileage_charge + emergency_fee
    
    return QuoteEstimate(
        base_price=round(base_price, 2),
        mileage_charge=round(mileage_charge, 2),
        emergency_fee=emergency_fee,
        total_estimate=round(total, 2),
        distance_miles=distance_miles
    )


# Routes
@api_router.get("/")
async def root():
    return {"message": "Ben's Road Service API"}


# Public settings endpoint (for frontend to get phone number, etc.)
@api_router.get("/settings/public")
async def get_public_settings():
    """Get public settings like phone number for frontend"""
    settings = await get_settings()
    return {
        "phone_number": settings.get("phone_number", "9713886300"),
        "phone_display": settings.get("phone_display", "(971) 388-6300"),
        "company_name": settings.get("company_name", "Ben's Road Service LLC"),
        "service_area": settings.get("service_area", "Salem & All of Oregon")
    }


@api_router.post("/quote/estimate", response_model=QuoteEstimate)
async def get_quote_estimate(
    vehicle_type: VehicleType,
    service_type: ServiceType,
    is_emergency: bool = True,
    distance_miles: float = 10
):
    """Get an instant price estimate without submitting a quote request"""
    return await calculate_quote_async(vehicle_type, service_type, is_emergency, distance_miles)


@api_router.post("/quote/request", response_model=QuoteRequest)
async def create_quote_request(input: QuoteRequestCreate):
    """Submit a quote request - saves to database for admin review"""
    distance = input.estimated_distance or 10  # Default 10 miles if not provided
    
    estimate = await calculate_quote_async(
        input.vehicle_type,
        input.service_type,
        input.is_emergency,
        distance
    )
    
    quote_obj = QuoteRequest(
        pickup_location=input.pickup_location,
        dropoff_location=input.dropoff_location,
        vehicle_type=input.vehicle_type,
        service_type=input.service_type,
        is_emergency=input.is_emergency,
        phone_number=input.phone_number,
        estimated_distance=distance,
        estimated_price=estimate.total_estimate
    )
    
    # Convert to dict for MongoDB
    doc = quote_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.quote_requests.insert_one(doc)
    return quote_obj


@api_router.get("/admin/quotes", response_model=List[QuoteRequest])
async def get_all_quotes(username: str = Depends(verify_admin)):
    """Admin endpoint - get all quote requests"""
    quotes = await db.quote_requests.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for quote in quotes:
        if isinstance(quote.get('created_at'), str):
            quote['created_at'] = datetime.fromisoformat(quote['created_at'])
    
    return quotes


@api_router.patch("/admin/quotes/{quote_id}", response_model=QuoteRequest)
async def update_quote_status(quote_id: str, update: QuoteStatusUpdate, username: str = Depends(verify_admin)):
    """Admin endpoint - update quote status"""
    update_dict = {"status": update.status.value}
    if update.notes:
        update_dict["notes"] = update.notes
    
    result = await db.quote_requests.find_one_and_update(
        {"id": quote_id},
        {"$set": update_dict},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    # Remove _id and convert datetime
    result.pop('_id', None)
    if isinstance(result.get('created_at'), str):
        result['created_at'] = datetime.fromisoformat(result['created_at'])
    
    return QuoteRequest(**result)


@api_router.delete("/admin/quotes/{quote_id}")
async def delete_quote(quote_id: str, username: str = Depends(verify_admin)):
    """Admin endpoint - delete a quote request"""
    result = await db.quote_requests.delete_one({"id": quote_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Quote not found")
    return {"message": "Quote deleted successfully"}


@api_router.get("/admin/stats")
async def get_admin_stats(username: str = Depends(verify_admin)):
    """Admin endpoint - get dashboard stats"""
    total = await db.quote_requests.count_documents({})
    pending = await db.quote_requests.count_documents({"status": "pending"})
    contacted = await db.quote_requests.count_documents({"status": "contacted"})
    completed = await db.quote_requests.count_documents({"status": "completed"})
    
    return {
        "total_quotes": total,
        "pending": pending,
        "contacted": contacted,
        "completed": completed
    }


# Admin Settings Endpoints
@api_router.get("/admin/settings", response_model=SiteSettings)
async def get_admin_settings(username: str = Depends(verify_admin)):
    """Admin endpoint - get all site settings"""
    settings = await get_settings()
    return SiteSettings(**settings)


@api_router.put("/admin/settings")
async def update_settings(settings: SiteSettings, username: str = Depends(verify_admin)):
    """Admin endpoint - update site settings"""
    settings_dict = settings.model_dump()
    
    await db.settings.update_one(
        {"_id": "site_settings"},
        {"$set": settings_dict},
        upsert=True
    )
    
    return {"message": "Settings updated successfully", "settings": settings_dict}


@api_router.patch("/admin/settings/phone")
async def update_phone(phone_number: str, phone_display: str, username: str = Depends(verify_admin)):
    """Admin endpoint - update phone number only"""
    await db.settings.update_one(
        {"_id": "site_settings"},
        {"$set": {"phone_number": phone_number, "phone_display": phone_display}},
        upsert=True
    )
    return {"message": "Phone updated successfully"}


@api_router.patch("/admin/settings/pricing")
async def update_pricing(
    mileage_rate: Optional[float] = None,
    emergency_fee: Optional[float] = None,
    base_prices: Optional[Dict[str, float]] = None,
    vehicle_multipliers: Optional[Dict[str, float]] = None,
    username: str = Depends(verify_admin)
):
    """Admin endpoint - update pricing settings"""
    update_dict = {}
    if mileage_rate is not None:
        update_dict["mileage_rate"] = mileage_rate
    if emergency_fee is not None:
        update_dict["emergency_fee"] = emergency_fee
    if base_prices is not None:
        update_dict["base_prices"] = base_prices
    if vehicle_multipliers is not None:
        update_dict["vehicle_multipliers"] = vehicle_multipliers
    
    if update_dict:
        await db.settings.update_one(
            {"_id": "site_settings"},
            {"$set": update_dict},
            upsert=True
        )
    
    return {"message": "Pricing updated successfully"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
