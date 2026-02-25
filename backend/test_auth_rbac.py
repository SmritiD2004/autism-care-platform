"""
Authentication and RBAC tests against a running backend server.
"""

from __future__ import annotations

import httpx
import pytest

BASE_URL = "http://localhost:8000"
TIMEOUT = 10.0

# Test data for different roles
TEST_USERS = {
    "clinician": {
        "email": "dr.smith@clinic.com",
        "password": "DoctorPass123",
        "full_name": "Dr. Smith (Clinician)",
        "role": "clinician",
    },
    "parent": {
        "email": "parent.jane@example.com",
        "password": "ParentPass123",
        "full_name": "Jane Parent",
        "role": "parent",
    },
    "admin": {
        "email": "admin.user@example.com",
        "password": "AdminPass123",
        "full_name": "Admin User",
        "role": "admin",
    },
}


@pytest.fixture(scope="session")
def require_backend() -> None:
    """Skip this module when backend is not reachable."""
    try:
        response = httpx.get(f"{BASE_URL}/docs", timeout=3.0)
        if response.status_code >= 500:
            pytest.skip(f"backend unhealthy at {BASE_URL} (status={response.status_code})")
    except httpx.HTTPError as exc:
        pytest.skip(f"backend not running at {BASE_URL}: {exc}")


@pytest.fixture(scope="session")
def tokens(require_backend: None) -> dict[str, str]:
    """Register/login users and return auth tokens by role."""
    role_tokens: dict[str, str] = {}

    for role, user_data in TEST_USERS.items():
        register_response = httpx.post(
            f"{BASE_URL}/api/auth/register",
            json=user_data,
            timeout=TIMEOUT,
        )
        assert register_response.status_code in (
            201,
            409,
        ), f"register failed for {role}: {register_response.status_code} {register_response.text}"

        login_response = httpx.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": user_data["email"], "password": user_data["password"]},
            timeout=TIMEOUT,
        )
        assert (
            login_response.status_code == 200
        ), f"login failed for {role}: {login_response.status_code} {login_response.text}"

        body = login_response.json()
        assert "access_token" in body and body["access_token"], f"missing access token for {role}"
        role_tokens[role] = body["access_token"]

    assert role_tokens, "no tokens obtained"
    return role_tokens


def test_registration_and_login(tokens: dict[str, str]) -> None:
    assert set(tokens.keys()) >= {"admin", "clinician", "parent"}


def test_protected_endpoints(tokens: dict[str, str], require_backend: None) -> None:
    endpoints_to_test = {
        "Parent Endpoint": {
            "method": "POST",
            "path": "/api/parent/journal",
            "allowed_roles": {"parent"},
            "data": {
                "title": "Test Journal Entry",
                "content": "This is a test",
                "mood": "happy",
            },
        },
        "Clinician Endpoint": {
            "method": "POST",
            "path": "/api/interventions/generate/1",
            "allowed_roles": {"admin", "clinician"},
            "data": {
                "focus_area": "test",
                "specific_goals": ["goal1"],
                "duration_weeks": 4,
            },
        },
        "Get User Info": {
            "method": "GET",
            "path": "/api/auth/me",
            "allowed_roles": {"admin", "clinician", "parent", "therapist"},
            "data": None,
        },
    }

    for endpoint_config in endpoints_to_test.values():
        for role, token in tokens.items():
            headers = {"Authorization": f"Bearer {token}"}

            if endpoint_config["method"] == "GET":
                response = httpx.get(
                    f"{BASE_URL}{endpoint_config['path']}",
                    headers=headers,
                    timeout=TIMEOUT,
                )
            else:
                response = httpx.post(
                    f"{BASE_URL}{endpoint_config['path']}",
                    json=endpoint_config["data"],
                    headers=headers,
                    timeout=TIMEOUT,
                )

            if role in endpoint_config["allowed_roles"]:
                assert response.status_code in {
                    200,
                    201,
                    401,
                    422,
                }, f"unexpected status for allowed role {role}: {response.status_code}"
            else:
                assert response.status_code in {
                    401,
                    403,
                }, f"unexpected status for disallowed role {role}: {response.status_code}"


def test_auth_required(require_backend: None) -> None:
    endpoints = [
        ("GET", "/api/auth/me", None),
        ("POST", "/api/parent/journal", {}),
    ]

    for method, path, payload in endpoints:
        if method == "GET":
            response = httpx.get(f"{BASE_URL}{path}", timeout=TIMEOUT)
        else:
            response = httpx.post(f"{BASE_URL}{path}", json=payload, timeout=TIMEOUT)

        assert response.status_code in {401, 403}, f"{method} {path} was not protected"


def test_invalid_token(require_backend: None) -> None:
    invalid_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token"
    headers = {"Authorization": f"Bearer {invalid_token}"}

    response = httpx.get(f"{BASE_URL}/api/auth/me", headers=headers, timeout=TIMEOUT)
    assert response.status_code == 401
