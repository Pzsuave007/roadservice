import requests
import sys
from datetime import datetime
import json
import base64

BACKEND_URL = "https://quick-towing-pro.preview.emergentagent.com"
API = f"{BACKEND_URL}/api"

class BensRoadServiceTester:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.admin_auth = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{API}/{endpoint}"
        test_headers = headers or {}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if response.content:
                    try:
                        return True, response.json()
                    except:
                        return True, response.text
                return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'error': response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'expected': expected_status,
                'actual': 'Exception',
                'error': str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_quote_estimate(self):
        """Test quote estimation"""
        params = "?vehicle_type=sedan&service_type=emergency_towing&is_emergency=true&distance_miles=10"
        return self.run_test("Quote Estimate", "POST", f"quote/estimate{params}", 200)

    def test_quote_request_submission(self):
        """Test submitting a quote request"""
        quote_data = {
            "pickup_location": "123 Main St, Salem OR",
            "dropoff_location": "456 Oak Ave, Salem OR", 
            "vehicle_type": "sedan",
            "service_type": "emergency_towing",
            "is_emergency": True,
            "phone_number": "(971) 388-6300",
            "estimated_distance": 10
        }
        success, response = self.run_test("Submit Quote Request", "POST", "quote/request", 200, quote_data)
        if success and 'id' in response:
            return True, response['id']  # Return the quote ID for further testing
        return False, None

    def test_admin_login(self):
        """Test admin authentication"""
        # Create Basic Auth header
        credentials = base64.b64encode(b"admin:bensroadservice2024").decode('ascii')
        self.admin_auth = {"Authorization": f"Basic {credentials}"}
        
        return self.run_test("Admin Login", "GET", "admin/quotes", 200, headers=self.admin_auth)

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        if not self.admin_auth:
            print("❌ No admin auth available for stats test")
            return False, {}
            
        return self.run_test("Admin Stats", "GET", "admin/stats", 200, headers=self.admin_auth)

    def test_admin_update_quote_status(self, quote_id):
        """Test updating quote status"""
        if not self.admin_auth or not quote_id:
            print("❌ No admin auth or quote ID available")
            return False, {}
            
        update_data = {"status": "contacted", "notes": "Test update"}
        return self.run_test("Update Quote Status", "PATCH", f"admin/quotes/{quote_id}", 200, update_data, self.admin_auth)

    def test_admin_delete_quote(self, quote_id):
        """Test deleting a quote"""
        if not self.admin_auth or not quote_id:
            print("❌ No admin auth or quote ID available")
            return False, {}
            
        return self.run_test("Delete Quote", "DELETE", f"admin/quotes/{quote_id}", 200, headers=self.admin_auth)

def main():
    print("🚛 Starting Ben's Road Service API Tests...")
    print(f"Testing against: {BACKEND_URL}")
    
    tester = BensRoadServiceTester()
    
    # Test basic endpoints
    tester.test_root_endpoint()
    tester.test_quote_estimate()
    
    # Test quote submission and get the ID
    success, quote_id = tester.test_quote_request_submission()
    
    # Test admin functionality
    tester.test_admin_login()
    tester.test_admin_stats()
    
    # Test admin operations on the quote we just created
    if success and quote_id:
        tester.test_admin_update_quote_status(quote_id)
        # Don't delete immediately, let's keep it for frontend testing
        # tester.test_admin_delete_quote(quote_id)

    # Print results
    print(f"\n📊 Test Results:")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    if tester.failed_tests:
        print(f"\n❌ Failed Tests:")
        for test in tester.failed_tests:
            print(f"  - {test['name']}: Expected {test['expected']}, got {test['actual']}")
            print(f"    Error: {test['error']}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())