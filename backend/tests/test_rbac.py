import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.api.main import app
from app.auth.repository import get_session

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
    SQLModel.metadata.create_all(test_engine)
    app.dependency_overrides[get_session] = get_test_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    SQLModel.metadata.drop_all(test_engine)


def register_and_login(client: TestClient, email: str, role: str) -> str:
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "Password123!", "role": role},
    )
    assert reg_resp.status_code == 201, f"Failed to register {email}: {reg_resp.text}"

    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "Password123!"},
    )
    assert login_resp.status_code == 200, f"Failed to login {email}: {login_resp.text}"
    token = login_resp.json()["access_token"]
    return token


def test_role_lawyer(client: TestClient):
    """LAWYER: confirms role string on /me and is REJECTED with 403 on /admin-only"""
    token = register_and_login(client, "lawyer_user@example.com", "LAWYER")

    # 1. Check /me returns correct role string
    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["role"] == "LAWYER"

    # 2. Confirm 403 Forbidden on /admin-only
    admin_resp = client.get("/api/v1/auth/admin-only", headers={"Authorization": f"Bearer {token}"})
    assert admin_resp.status_code == 403
    assert "not permitted" in admin_resp.json()["detail"].lower()


def test_role_researcher(client: TestClient):
    """RESEARCHER: confirms role string on /me and is REJECTED with 403 on /admin-only"""
    token = register_and_login(client, "researcher_user@example.com", "RESEARCHER")

    # 1. Check /me returns correct role string
    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["role"] == "RESEARCHER"

    # 2. Confirm 403 Forbidden on /admin-only
    admin_resp = client.get("/api/v1/auth/admin-only", headers={"Authorization": f"Bearer {token}"})
    assert admin_resp.status_code == 403
    assert "not permitted" in admin_resp.json()["detail"].lower()


def test_role_institution_admin(client: TestClient):
    """INSTITUTION_ADMIN: confirms role string on /me and is REJECTED with 403 on /admin-only"""
    token = register_and_login(client, "inst_admin_user@example.com", "INSTITUTION_ADMIN")

    # 1. Check /me returns correct role string
    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["role"] == "INSTITUTION_ADMIN"

    # 2. Confirm 403 Forbidden on /admin-only
    admin_resp = client.get("/api/v1/auth/admin-only", headers={"Authorization": f"Bearer {token}"})
    assert admin_resp.status_code == 403
    assert "not permitted" in admin_resp.json()["detail"].lower()


def test_role_admin(client: TestClient):
    """ADMIN: confirms role string on /me and access is GRANTED (200) on /admin-only"""
    token = register_and_login(client, "admin_user@example.com", "ADMIN")

    # 1. Check /me returns correct role string
    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["role"] == "ADMIN"

    # 2. Confirm 200 OK access granted on /admin-only
    admin_resp = client.get("/api/v1/auth/admin-only", headers={"Authorization": f"Bearer {token}"})
    assert admin_resp.status_code == 200
    assert admin_resp.json() == {"message": "admin access granted"}
