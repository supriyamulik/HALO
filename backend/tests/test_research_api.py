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


from unittest.mock import patch


@patch("app.research.controller.generate_answer", return_value="Under Section 135 of the Companies Act, 2013, every qualifying company must constitute a Corporate Social Responsibility Committee.")
def test_research_query_submit(mock_gen, client: TestClient):
    payload = {
        "query_text": "Is CSR committee mandatory under Section 135 of Companies Act, 2013?",
        "jurisdiction": "Supreme Court of India",
        "court_level": "All Courts",
        "date_range": "all",
    }
    response = client.post("/api/v1/research/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "query_id" in data
    assert data["status"] == "done"
    assert "result" in data
    res = data["result"]
    assert "answer_text" in res
    assert len(res["claims"]) > 0
    assert "confidence_score" in res
    assert "evidence_coverage" in res


def test_research_query_generation_failure_503(client: TestClient):
    from app.generation.service import GenerationServiceError
    with patch("app.research.controller.generate_answer", side_effect=GenerationServiceError("Groq quota exceeded")):
        payload = {
            "query_text": "Is CSR committee mandatory under Section 135 of Companies Act, 2013?",
        }
        response = client.post("/api/v1/research/query", json=payload)
        assert response.status_code == 503
        assert "Legal answer generation failed" in response.json()["detail"]


def test_research_history_get(client: TestClient):
    response = client.get("/api/v1/research/history")
    assert response.status_code == 200
    history = response.json()
    assert isinstance(history, list)
    assert len(history) >= 1


def test_research_result_get(client: TestClient):
    response = client.get("/api/v1/research/result/q_001")
    assert response.status_code == 200
    data = response.json()
    assert data["query_id"] == "q_001"
    assert "claims" in data
    assert "sources" in data
