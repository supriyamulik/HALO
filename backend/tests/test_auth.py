import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.api.main import app
from app.auth.model import Role
from app.auth.repository import get_session

# In-memory test engine shared across threads for testing
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


def get_test_session():
    with Session(test_engine) as session:
        yield session


@pytest.fixture(name="client", autouse=True)
def client_fixture():
    # Setup test schema
    SQLModel.metadata.create_all(test_engine)
    app.dependency_overrides[get_session] = get_test_session
    with TestClient(app) as test_client:
        yield test_client
    # Teardown
    app.dependency_overrides.clear()
    SQLModel.metadata.drop_all(test_engine)


def test_register_success(client: TestClient):
    payload = {
        "email": "lawyer1@example.com",
        "password": "Password123!",
        "role": "LAWYER",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "lawyer1@example.com"
    assert data["role"] == "LAWYER"
    assert "id" in data
    assert "password_hash" not in data


def test_duplicate_email_409(client: TestClient):
    payload = {
        "email": "duplicate@example.com",
        "password": "SecurePassword123",
        "role": "RESEARCHER",
    }
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 409
    assert "already registered" in res2.json()["detail"].lower()


def test_short_password_422(client: TestClient):
    payload = {
        "email": "shortpw@example.com",
        "password": "short",  # less than 8 chars
        "role": "ADMIN",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_login_success(client: TestClient):
    # Register first
    client.post(
        "/api/v1/auth/register",
        json={"email": "login_user@example.com", "password": "ValidPassword123", "role": "LAWYER"},
    )
    # Login
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "login_user@example.com", "password": "ValidPassword123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_wrong_password_401(client: TestClient):
    client.post(
        "/api/v1/auth/register",
        json={"email": "wrong_pw@example.com", "password": "CorrectPassword123", "role": "RESEARCHER"},
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "wrong_pw@example.com", "password": "WrongPassword456"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_unknown_email_401(client: TestClient):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@example.com", "password": "SomePassword123"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_me_with_valid_token(client: TestClient):
    client.post(
        "/api/v1/auth/register",
        json={"email": "me_user@example.com", "password": "ValidPassword123", "role": "INSTITUTION_ADMIN"},
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "me_user@example.com", "password": "ValidPassword123"},
    )
    token = login_res.json()["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me_user@example.com"
    assert data["role"] == "INSTITUTION_ADMIN"
    assert "password_hash" not in data


def test_me_without_token_401_or_403(client: TestClient):
    response = client.get("/api/v1/auth/me")
    assert response.status_code in (401, 403)


def test_me_with_invalid_token_401(client: TestClient):
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid_gibberish_token_string"},
    )
    assert response.status_code == 401
