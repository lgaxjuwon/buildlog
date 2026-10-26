from fastapi.testclient import TestClient
from sqlalchemy import text

from app.config import Settings
from app.main import create_app


def test_sqlite_connection_and_allowed_origin(tmp_path):
    app = create_app(Settings(database_url=f"sqlite+pysqlite:///{tmp_path / 'test.db'}"))
    with TestClient(app) as client:
        result = client.get("/api/health", headers={"Origin": "http://localhost:5173"})
        assert result.json() == {"status": "ok"}
        assert result.headers["access-control-allow-origin"] == "http://localhost:5173"
        with app.state.engine.connect() as connection:
            assert connection.execute(text("PRAGMA foreign_keys")).scalar() == 1
        result = client.get("/api/health", headers={"Origin": "https://untrusted.example"})
        assert "access-control-allow-origin" not in result.headers


def test_database_failure_does_not_expose_details(monkeypatch, tmp_path):
    app = create_app(Settings(database_url=f"sqlite+pysqlite:///{tmp_path / 'test.db'}"))
    from sqlalchemy.exc import OperationalError

    def fail():
        raise OperationalError("private details", {}, Exception("secret"))

    with TestClient(app) as client:
        monkeypatch.setattr(app.state.engine, "connect", fail)
        result = client.get("/api/health")
        assert result.status_code == 503
        assert result.json() == {"status": "unavailable"}
