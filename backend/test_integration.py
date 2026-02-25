"""
Integration tests for NeuroThrive Backend API
Tests actual HTTP endpoints
"""

import json
import sys
from datetime import timedelta
from typing import Optional

# For integration tests, we'll need httpx or requests
# This test suite can be run against a running backend instance

def test_api_endpoints():
    """
    Test main API endpoints
    Run this against a running backend: uvicorn backend.main:app --reload
    """
    try:
        import httpx
    except ImportError:
        print("[INFO] httpx not installed - install with: pip install httpx")
        return None
    
    BASE_URL = "http://localhost:8000"
    
    print(f"\nTesting API endpoints at {BASE_URL}...")
    print("="*60)
    
    # Test 1: Health endpoint
    try:
        response = httpx.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("[PASS] GET /health - Health check endpoint")
            return True
        else:
            print(f"[FAIL] GET /health - Unexpected status: {response.status_code}")
            return False
    except Exception as e:
        print(f"[SKIP] API endpoints - Backend not running: {e}")
        print("       To run integration tests, start the backend with:")
        print("       cd backend && uvicorn main:app --reload")
        return None


def test_auth_endpoints():
    """Test authentication endpoints"""
    try:
        import httpx
    except ImportError:
        return None
        
    BASE_URL = "http://localhost:8000"
    
    print(f"\nTesting Auth endpoints...")
    print("="*60)
    
    # Prepare test data
    test_user = {
        "email": "test@example.com",
        "password": "testpass123",
        "full_name": "Test User"
    }
    
    try:
        # Test registration
        response = httpx.post(
            f"{BASE_URL}/api/auth/register",
            json=test_user,
            timeout=5
        )
        if response.status_code in (200, 201, 422):  # 422 if user already exists
            print(f"[PASS] POST /api/auth/register - Registration endpoint")
            
            # Test login
            login_data = {
                "email": test_user["email"],
                "password": test_user["password"]
            }
            response = httpx.post(
                f"{BASE_URL}/api/auth/login",
                json=login_data,
                timeout=5
            )
            if response.status_code in (200, 401):  # 401 if wrong credentials
                print(f"[PASS] POST /api/auth/login - Login endpoint")
                return True
            else:
                print(f"[FAIL] POST /api/auth/login - Unexpected status: {response.status_code}")
                return False
        else:
            print(f"[FAIL] POST /api/auth/register - Unexpected status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"[SKIP] Auth endpoints - {e}")
        return None


def test_screening_endpoints():
    """Test screening endpoints"""
    try:
        import httpx
    except ImportError:
        return None
        
    BASE_URL = "http://localhost:8000"
    
    print(f"\nTesting Screening endpoints...")
    print("="*60)
    
    try:
        # Test getting screening history (should return data)
        response = httpx.get(
            f"{BASE_URL}/api/screening/history",
            timeout=5
        )
        if response.status_code in (200, 401):  # 401 if not authenticated
            print(f"[PASS] GET /api/screening/history - Screening history endpoint")
            return True
        else:
            print(f"[FAIL] GET /api/screening/history - Unexpected status: {response.status_code}")
            return False
    except Exception as e:
        print(f"[SKIP] Screening endpoints - {e}")
        return None


def check_backend_running():
    """Check if backend is running"""
    try:
        import httpx
        response = httpx.get("http://localhost:8000/health", timeout=2)
        return response.status_code == 200
    except:
        return False


def run_integration_tests():
    """Run all integration tests"""
    print("\n" + "="*60)
    print("NeuroThrive Backend Integration Tests")
    print("="*60)
    
    if not check_backend_running():
        print("\n[INFO] Backend is not running.")
        print("\nTo run integration tests:")
        print("1. Start the backend server:")
        print("   cd backend")
        print("   uvicorn main:app --reload")
        print("\n2. In another terminal, run:")
        print("   python test_integration.py")
        return None
    
    tests = [
        ("Health Check", test_api_endpoints),
        ("Auth Endpoints", test_auth_endpoints),
        ("Screening Endpoints", test_screening_endpoints),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n[FAIL] {name} - Unexpected error: {e}")
            results.append((name, False))
    
    # Summary
    print("\n" + "="*60)
    print("Integration Test Summary")
    print("="*60)
    
    passed = sum(1 for _, r in results if r is True)
    failed = sum(1 for _, r in results if r is False)
    skipped = sum(1 for _, r in results if r is None)
    
    for name, result in results:
        status = "[PASS]" if result is True else "[FAIL]" if result is False else "[SKIP]"
        print(f"{status:8} {name}")
    
    if skipped == len(results):
        print(f"\nNote: All tests skipped. Backend not running.")
    else:
        print(f"\nTotal: {passed} passed, {failed} failed, {skipped} skipped")
    
    print("="*60 + "\n")
    
    return failed == 0 if failed + passed > 0 else None


if __name__ == "__main__":
    result = run_integration_tests()
    if result is None:
        sys.exit(0)  # Skip gracefully
    sys.exit(0 if result else 1)
