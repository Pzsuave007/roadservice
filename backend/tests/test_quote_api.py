"""
Backend API tests for Ben's Road Service Quote API
Tests the /api/quote/estimate endpoint with various vehicle/service combinations
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthCheck:
    """Basic API health check"""
    
    def test_api_root(self):
        """Test API root endpoint returns success"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Ben's Road Service API" in data["message"]


class TestQuoteEstimate:
    """Tests for /api/quote/estimate endpoint - price calculation"""
    
    def test_estimate_sedan_emergency_towing(self):
        """Test estimate for sedan with emergency towing"""
        response = requests.post(
            f"{BASE_URL}/api/quote/estimate",
            params={
                "vehicle_type": "sedan",
                "service_type": "emergency_towing",
                "is_emergency": True,
                "distance_miles": 15
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "base_price" in data
        assert "mileage_charge" in data
        assert "emergency_fee" in data
        assert "total_estimate" in data
        assert "distance_miles" in data
        
        # Verify values
        assert data["base_price"] == 85.0  # Emergency towing for sedan
        assert data["mileage_charge"] == 52.5  # 15 miles * $3.50
        assert data["emergency_fee"] == 25.0
        assert data["total_estimate"] == 162.5
        assert data["distance_miles"] == 15
    
    def test_estimate_suv_flatbed_scheduled(self):
        """Test estimate for SUV with flatbed towing (scheduled)"""
        response = requests.post(
            f"{BASE_URL}/api/quote/estimate",
            params={
                "vehicle_type": "suv",
                "service_type": "flatbed_towing",
                "is_emergency": False,
                "distance_miles": 20
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # SUV multiplier is 1.15, flatbed base is $95
        expected_base = 95 * 1.15  # 109.25
        expected_mileage = 20 * 3.50  # 70
        
        assert data["base_price"] == round(expected_base, 2)
        assert data["mileage_charge"] == expected_mileage
        assert data["emergency_fee"] == 0  # No emergency fee for scheduled
        assert data["total_estimate"] == round(expected_base + expected_mileage, 2)
    
    def test_estimate_truck_accident_recovery(self):
        """Test estimate for truck with accident recovery service"""
        response = requests.post(
            f"{BASE_URL}/api/quote/estimate",
            params={
                "vehicle_type": "truck",
                "service_type": "accident_recovery",
                "is_emergency": True,
                "distance_miles": 10
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Truck multiplier is 1.25, accident recovery base is $125
        expected_base = 125 * 1.25  # 156.25
        expected_mileage = 10 * 3.50  # 35
        
        assert data["base_price"] == round(expected_base, 2)
        assert data["emergency_fee"] == 25
    
    def test_estimate_lockout_service(self):
        """Test lockout service estimate (no towing needed)"""
        response = requests.post(
            f"{BASE_URL}/api/quote/estimate",
            params={
                "vehicle_type": "sedan",
                "service_type": "lockout",
                "is_emergency": True,
                "distance_miles": 5
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["base_price"] == 55.0  # Lockout base price
        assert data["mileage_charge"] == 17.5  # 5 miles * $3.50
    
    def test_estimate_jump_start(self):
        """Test jump start service estimate"""
        response = requests.post(
            f"{BASE_URL}/api/quote/estimate",
            params={
                "vehicle_type": "sedan",
                "service_type": "jump_start",
                "is_emergency": False,
                "distance_miles": 3
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["base_price"] == 45.0  # Jump start base price
        assert data["emergency_fee"] == 0
    
    def test_estimate_motorcycle(self):
        """Test estimate for motorcycle (lower multiplier)"""
        response = requests.post(
            f"{BASE_URL}/api/quote/estimate",
            params={
                "vehicle_type": "motorcycle",
                "service_type": "emergency_towing",
                "is_emergency": True,
                "distance_miles": 10
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Motorcycle multiplier is 0.85
        expected_base = 85 * 0.85  # 72.25
        assert data["base_price"] == round(expected_base, 2)
    
    def test_estimate_long_distance(self):
        """Test long distance towing (high mileage)"""
        response = requests.post(
            f"{BASE_URL}/api/quote/estimate",
            params={
                "vehicle_type": "van",
                "service_type": "long_distance",
                "is_emergency": False,
                "distance_miles": 100
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Van multiplier is 1.2, long_distance base is $100
        expected_base = 100 * 1.2  # 120
        expected_mileage = 100 * 3.50  # 350
        
        assert data["base_price"] == expected_base
        assert data["mileage_charge"] == expected_mileage
        assert data["total_estimate"] == expected_base + expected_mileage


class TestQuoteRequest:
    """Tests for /api/quote/request endpoint - submitting quote requests"""
    
    def test_submit_quote_request(self):
        """Test submitting a valid quote request"""
        response = requests.post(
            f"{BASE_URL}/api/quote/request",
            json={
                "pickup_location": "TEST_123 Main St, Salem, OR",
                "dropoff_location": "TEST_456 Oak Ave, Portland, OR",
                "vehicle_type": "sedan",
                "service_type": "emergency_towing",
                "is_emergency": True,
                "phone_number": "555-TEST-123",
                "estimated_distance": 50
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "id" in data
        assert "pickup_location" in data
        assert "dropoff_location" in data
        assert "estimated_price" in data
        assert "status" in data
        
        # Verify data persisted correctly
        assert data["pickup_location"] == "TEST_123 Main St, Salem, OR"
        assert data["vehicle_type"] == "sedan"
        assert data["status"] == "pending"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
