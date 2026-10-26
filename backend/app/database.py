from pathlib import Path

from sqlalchemy import create_engine, event
from sqlalchemy.engine import make_url

from app.config import ROOT


def build_engine(database_url: str):
    url = make_url(database_url)
    options = {"pool_pre_ping": True}
    if url.get_backend_name() == "sqlite":
        if url.database and url.database != ":memory:":
            db_path = Path(url.database)
            if not db_path.is_absolute():
                db_path = ROOT / db_path
            db_path.parent.mkdir(parents=True, exist_ok=True)
            url = url.set(database=str(db_path))
        options["connect_args"] = {"check_same_thread": False}
    engine = create_engine(url, **options)
    if url.get_backend_name() == "sqlite":
        @event.listens_for(engine, "connect")
        def enable_foreign_keys(connection, _):
            connection.execute("PRAGMA foreign_keys=ON")
    return engine
