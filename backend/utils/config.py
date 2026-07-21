from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    openrouter_api_key: str | None = None
    gemini_api_key: str | None = None
    ebay_client_id: str | None = None
    ebay_client_secret: str | None = None
    firebase_service_account_path: str | None = None
    firebase_service_account_json: str | None = None
    frontend_origin: str = "http://localhost:8080"

    # Email delivery for order receipts (app -> user's inbox). Dual-provider strategy:
    #   1) PRIMARY: Gmail API via a server-side OAuth2 refresh token (no password, fixed sender).
    #   2) FALLBACK: Resend API (api key + verified sender).
    # If neither is configured, the endpoint reports email delivery isn't set up.
    gmail_sender_email: str | None = None
    gmail_client_id: str | None = None
    gmail_client_secret: str | None = None
    gmail_refresh_token: str | None = None

    resend_api_key: str | None = None
    resend_from_email: str | None = None

    model_config = SettingsConfigDict(env_file=".env")


@lru_cache
def get_settings() -> Settings:
    return Settings()
