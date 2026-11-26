import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "Multimodal Impersonation & Fraud Analyzer"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    SECRET_KEY: str = "change-this-in-production-to-a-secure-random-32-byte-hex"

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./app.db"

    # Storage & Retention
    EVIDENCE_UPLOAD_DIR: str = "./uploads"
    EVIDENCE_RETENTION_HOURS: int = 24
    AUTO_PURGE_EXPIRED: bool = True

    # Modality Toggles
    ENABLE_VOICE_MODALITY: bool = True
    ENABLE_MESSAGE_MODALITY: bool = True
    ENABLE_CONVERSATION_MODALITY: bool = True
    ENABLE_URL_MODALITY: bool = True
    ENABLE_PHONE_MODALITY: bool = True

    # HITL Gate & External Lookups
    ENABLE_EXTERNAL_PHONE_LOOKUP: bool = False
    ENABLE_LIVE_URL_FETCHING: bool = False

settings = Settings()
