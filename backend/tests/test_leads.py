"""Backend tests for the Lead capture feature."""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://photo-to-sms.preview.emergentagent.com').rstrip('/')
ADMIN_AUTH = ('admin', 'bensroadservice2024')


@pytest.fixture(scope="module")
def created_lead():
    payload = {
        "name": "TEST_John Doe",
        "phone_number": "5551234567",
        "pickup_location": "123 Main St, Salem, OR",
        "dropoff_location": "456 Oak Ave, Portland, OR",
        "vehicle_type": "sedan",
        "distance_miles": 47,
        "photo_url": "https://example.com/photo.jpg",
    }
    r = requests.post(f"{BASE_URL}/api/leads", json=payload, timeout=15)
    assert r.status_code == 200, f"create lead failed: {r.status_code} {r.text}"
    data = r.json()
    assert "id" in data and "created_at" in data
    assert isinstance(data["id"], str) and len(data["id"]) >= 8
    yield {"id": data["id"], "payload": payload}
    # cleanup
    requests.delete(f"{BASE_URL}/api/admin/leads/{data['id']}", auth=ADMIN_AUTH, timeout=15)


# POST /api/leads
def test_create_lead_returns_id(created_lead):
    assert created_lead["id"]


# GET /api/leads/{id}
def test_get_lead_returns_full_record(created_lead):
    lid = created_lead["id"]
    p = created_lead["payload"]
    r = requests.get(f"{BASE_URL}/api/leads/{lid}", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["name"] == p["name"]
    assert d["phone_number"] == p["phone_number"]
    assert d["pickup_location"] == p["pickup_location"]
    assert d["dropoff_location"] == p["dropoff_location"]
    assert d["vehicle_type"] == p["vehicle_type"]
    assert d["distance_miles"] == p["distance_miles"]
    assert d["photo_url"] == p["photo_url"]
    assert "created_at" in d
    assert "_id" not in d


# GET /api/leads/{id} 404
def test_get_lead_invalid_id_returns_404():
    r = requests.get(f"{BASE_URL}/api/leads/this-id-does-not-exist-xyz", timeout=15)
    assert r.status_code == 404


# GET /api/admin/leads - auth required
def test_admin_leads_requires_auth():
    r = requests.get(f"{BASE_URL}/api/admin/leads", timeout=15)
    assert r.status_code == 401


def test_admin_leads_with_auth_returns_list(created_lead):
    r = requests.get(f"{BASE_URL}/api/admin/leads", auth=ADMIN_AUTH, timeout=15)
    assert r.status_code == 200
    leads = r.json()
    assert isinstance(leads, list)
    ids = [l["id"] for l in leads]
    assert created_lead["id"] in ids
    # Sort verification - newest first
    if len(leads) >= 2:
        assert leads[0]["created_at"] >= leads[1]["created_at"]


# DELETE /api/admin/leads/{id}
def test_delete_lead_with_auth():
    # Create a fresh one to delete
    payload = {"name": "TEST_DeleteMe", "phone_number": "5559999999", "pickup_location": "X"}
    r = requests.post(f"{BASE_URL}/api/leads", json=payload, timeout=15)
    assert r.status_code == 200
    lid = r.json()["id"]
    # delete without auth -> 401
    r2 = requests.delete(f"{BASE_URL}/api/admin/leads/{lid}", timeout=15)
    assert r2.status_code == 401
    # delete with auth -> 200
    r3 = requests.delete(f"{BASE_URL}/api/admin/leads/{lid}", auth=ADMIN_AUTH, timeout=15)
    assert r3.status_code == 200
    # verify gone
    r4 = requests.get(f"{BASE_URL}/api/leads/{lid}", timeout=15)
    assert r4.status_code == 404


# Required field validation
def test_create_lead_missing_required_fields_returns_422():
    r = requests.post(f"{BASE_URL}/api/leads", json={"phone_number": "555"}, timeout=15)
    assert r.status_code == 422


def test_unguessable_id_format(created_lead):
    # token_urlsafe(8) generates ~11 char url-safe string
    lid = created_lead["id"]
    assert len(lid) >= 8
    # No mongo ObjectId format (24 hex)
    assert not (len(lid) == 24 and all(c in "0123456789abcdef" for c in lid))
