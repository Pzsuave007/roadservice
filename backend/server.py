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
from typing import List, Optional
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


# Models
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


# Pricing logic
def calculate_quote(vehicle_type: VehicleType, service_type: ServiceType, is_emergency: bool, distance_miles: float) -> QuoteEstimate:
    # Base prices by service type
    base_prices = {
        ServiceType.emergency_towing: 85,
        ServiceType.flatbed_towing: 95,
        ServiceType.accident_recovery: 125,
        ServiceType.lockout: 55,
        ServiceType.jump_start: 45,
        ServiceType.tire_change: 55,
        ServiceType.long_distance: 100,
    }
    
    # Vehicle multipliers
    vehicle_multipliers = {
        VehicleType.sedan: 1.0,
        VehicleType.suv: 1.15,
        VehicleType.truck: 1.25,
        VehicleType.motorcycle: 0.85,
        VehicleType.van: 1.2,
        VehicleType.other: 1.1,
    }
    
    base_price = base_prices.get(service_type, 75) * vehicle_multipliers.get(vehicle_type, 1.0)
    mileage_rate = 3.50  # per mile
    mileage_charge = distance_miles * mileage_rate
    emergency_fee = 25 if is_emergency else 0
    
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

@api_router.post("/quote/estimate", response_model=QuoteEstimate)
async def get_quote_estimate(
    vehicle_type: VehicleType,
    service_type: ServiceType,
    is_emergency: bool = True,
    distance_miles: float = 10
):
    """Get an instant price estimate without submitting a quote request"""
    return calculate_quote(vehicle_type, service_type, is_emergency, distance_miles)

@api_router.post("/quote/request", response_model=QuoteRequest)
async def create_quote_request(input: QuoteRequestCreate):
    """Submit a quote request - saves to database for admin review"""
    distance = input.estimated_distance or 10  # Default 10 miles if not provided
    
    estimate = calculate_quote(
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
