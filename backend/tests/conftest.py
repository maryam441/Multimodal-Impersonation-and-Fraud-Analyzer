import pytest
import pytest_asyncio
from backend.app.db.session import init_db

@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    await init_db()
