"""
Basic API tests for NeuroThrive Backend
Tests core functionality without external database
"""

import sys
import json
from pathlib import Path

# Test data structures
def test_imports():
    """Test that all required modules can be imported"""
    try:
        import fastapi
        from fastapi import FastAPI
        from fastapi.middleware.cors import CORSMiddleware
        print("[PASS] FastAPI imports successful")
        return True
    except ImportError as e:
        print(f"[FAIL] Import error: {e}")
        return False


def test_config():
    """Test configuration loading"""
    try:
        from config import settings
        assert settings.SECRET_KEY is not None
        assert settings.ALGORITHM == "HS256"
        print("[PASS] Config loads successfully")
        print(f"  - DB URL: {settings.DATABASE_URL}")
        print(f"  - Algorithm: {settings.ALGORITHM}")
        return True
    except Exception as e:
        print(f"[FAIL] Config test failed: {e}")
        return False


def test_models_import():
    """Test that database models can be imported"""
    try:
        from models import Base, User, Patient, ParentProfile, ScreeningLog
        print("[PASS] Database models import successfully")
        print(f"  - Base: {Base}")
        print(f"  - User model: {User}")
        print(f"  - Patient model: {Patient}")
        print(f"  - ParentProfile model: {ParentProfile}")
        print(f"  - ScreeningLog model: {ScreeningLog}")
        return True
    except Exception as e:
        print(f"[FAIL] Models import failed: {e}")
        return False


def test_schemas_import():
    """Test that Pydantic schemas can be imported"""
    try:
        from schemas import RegisterRequest, LoginRequest, UserOut, TokenResponse
        print("[PASS] Pydantic schemas import successfully")
        print(f"  - RegisterRequest: {RegisterRequest}")
        print(f"  - LoginRequest: {LoginRequest}")
        print(f"  - UserOut: {UserOut}")
        print(f"  - TokenResponse: {TokenResponse}")
        return True
    except Exception as e:
        print(f"[FAIL] Schemas import failed: {e}")
        return False


def test_auth_utils():
    """Test authentication utilities"""
    try:
        from auth_utils import hash_password, verify_password, create_access_token
        from datetime import timedelta
        
        # Test password hashing with a shorter password
        test_password = "test123"
        hashed = hash_password(test_password)
        assert hashed != test_password
        assert verify_password(test_password, hashed)
        
        # Test token creation with proper data format
        token_data = {"user_id": "test_user_id"}
        token = create_access_token(token_data, expires_delta=timedelta(hours=1))
        assert isinstance(token, str)
        assert len(token) > 0
        
        print("[PASS] Auth utilities working correctly")
        print(f"  - Password hashing: OK")
        print(f"  - Password verification: OK")
        print(f"  - Token creation: OK")
        return True
    except Exception as e:
        print(f"[FAIL] Auth utils test failed: {e}")
        return False


def test_routers_import():
    """Test that all routers can be imported"""
    try:
        from routers import auth, screening, monitoring, therapy, interventions, parent, proto
        print("[PASS] All routers import successfully")
        print(f"  - Auth router: {auth.router}")
        print(f"  - Screening router: {screening.router}")
        print(f"  - Monitoring router: {monitoring.router}")
        return True
    except Exception as e:
        print(f"[FAIL] Router import failed: {e}")
        return False


def test_database_connection():
    """Test database connection"""
    try:
        from database import engine
        from sqlalchemy import text
        
        # Try to create a connection
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("[PASS] Database connection successful")
            return True
    except Exception as e:
        print(f"[SKIP] Database connection test: {e}")
        print("  (This is expected if PostgreSQL is not running)")
        return None  # Not a hard failure


def run_all_tests():
    """Run all tests and report results"""
    print("\n" + "="*60)
    print("NeuroThrive Backend Test Suite")
    print("="*60 + "\n")
    
    tests = [
        ("Imports", test_imports),
        ("Configuration", test_config),
        ("Models", test_models_import),
        ("Schemas", test_schemas_import),
        ("Auth Utils", test_auth_utils),
        ("Routers", test_routers_import),
        ("Database", test_database_connection),
    ]
    
    results = []
    for name, test_func in tests:
        print(f"\nTesting {name}...")
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"[FAIL] Unexpected error: {e}")
            results.append((name, False))
    
    # Summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    
    passed = sum(1 for _, r in results if r is True)
    failed = sum(1 for _, r in results if r is False)
    skipped = sum(1 for _, r in results if r is None)
    
    for name, result in results:
        status = "[PASS]" if result is True else "[FAIL]" if result is False else "[SKIP]"
        print(f"{status:8} {name}")
    
    print(f"\nTotal: {passed} passed, {failed} failed, {skipped} skipped")
    print("="*60 + "\n")
    
    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
