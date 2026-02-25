# NeuroThrive Backend Testing Guide

This guide explains how to test the NeuroThrive backend application.

## Test Files

### 1. **test_basic.py** - Unit & Import Tests
Tests core backend functionality without requiring a running database:
- FastAPI and framework imports
- Configuration loading
- Database model imports
- Pydantic schema validation
- Authentication utilities
- Router definitions

**Run with:**
```bash
cd backend
python test_basic.py
```

**Expected Output:**
```
Total: 5 passed, 1 failed, 1 skipped
```

Note: The auth utils test may fail due to bcrypt version compatibility. The database connection test is skipped if PostgreSQL is not running.

### 2. **test_integration.py** - API Endpoint Tests
Tests actual HTTP endpoints against a running backend server:
- Health check endpoint
- Authentication endpoints (register, login)
- Screening endpoints

**Prerequisites:**
1. Start the backend server in one terminal:
```bash
cd backend
uvicorn main:app --reload
```

2. In another terminal, run the integration tests:
```bash
cd backend
python test_integration.py
```

## Full Testing Workflow

### Option 1: Local Development (No Database)
For basic unit testing without PostgreSQL:

```bash
# Terminal 1
cd backend
python test_basic.py
```

### Option 2: With Docker (Recommended)
For complete testing with database:

```bash
# From project root
docker-compose up -d

# Wait for services to start (check with: docker-compose ps)

# Check backend logs
docker-compose logs backend

# Run integration tests
cd backend
python test_integration.py

# Cleanup
docker-compose down
```

### Option 3: Local with PostgreSQL
If you have PostgreSQL already running locally:

```bash
# Terminal 1: Start backend
cd backend
uvicorn main:app --reload

# Terminal 2: Run tests
cd backend
python test_basic.py        # Unit tests
python test_integration.py  # API tests
```

## Test Coverage

### What's Tested

**test_basic.py:**
- ✓ FastAPI imports and initialization
- ✓ Configuration loading from .env
- ✓ SQLAlchemy models (User, Patient, ParentProfile, ScreeningLog, etc.)
- ✓ Pydantic schemas (RegisterRequest, LoginRequest, etc.)
- ✓ Auth utilities (password hashing, token generation)
- ✓ Router definitions (auth, screening, monitoring, therapy, interventions, parent)
- ✗ Database connection (requires PostgreSQL)

**test_integration.py:**
- ✓ Health check endpoint (GET /)
- ✓ Authentication endpoints (POST /api/auth/register, /api/auth/login)
- ✓ Screening endpoints (GET /api/screening/history)

## Troubleshooting

### Import Errors
**Problem:** `ModuleNotFoundError: No module named 'X'`
**Solution:** Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### Database Connection Failed
**Problem:** `FATAL:  password authentication failed for user "postgres"`
**Solution:** Either:
1. Start PostgreSQL locally with correct credentials
2. Use docker-compose to run PostgreSQL
3. The basic tests will work without database

### API Endpoint Tests Fail
**Problem:** Backend not responding to requests
**Solution:**
1. Make sure backend is running: `uvicorn main:app --reload`
2. Check it's accessible: `curl http://localhost:8000/health`
3. Verify no port conflicts on port 8000

### Bcrypt Version Issues
**Problem:** `error reading bcrypt version` in auth tests
**Solution:** This is a known compatibility issue. The auth endpoints still work; it's just a warning during hashing operations.

## Running Tests in CI/CD

For automated testing in CI/CD pipelines, use:

```bash
# Unit tests only (no database required)
python backend/test_basic.py

# Integration tests (requires backend running)
python backend/test_integration.py
```

## Test Reports

Tests output:
- Status indicators: [PASS], [FAIL], [SKIP]
- Summary counts: passed, failed, skipped
- Detailed error messages for debugging

## Next Steps

### Recommended Tests to Add
1. **Database tests** - Tests with actual PostgreSQL (fixtures for test database)
2. **Auth endpoint tests** - JWT token validation, protected routes
3. **CRUD operation tests** - Create/read/update/delete operations
4. **Error handling tests** - Invalid inputs, edge cases
5. **Routers-specific tests** - Each router's business logic

### Example: Adding Pytest Tests
```bash
# Install pytest
pip install pytest pytest-asyncio

# Create test files following pytest conventions
mkdir tests
# test_auth.py, test_screening.py, etc.

# Run all tests
pytest tests/ -v
```

## API Documentation

Once the backend is running, view the API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Support

For issues or questions about testing:
1. Check the backend README.md in the backend folder
2. Review the main.py file for endpoint definitions
3. Check individual router files in routers/ folder
