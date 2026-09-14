from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    secret_key: str = Field(validation_alias="SECRET_KEY")
    database_url: str = Field(validation_alias="DATABASE_URL")
    environment: str = Field(default="development", validation_alias="ENVIRONMENT")
    cors_origins: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000",
        validation_alias="CORS_ORIGINS",
    )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cookie_secure(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def cookie_samesite(self) -> str:
        return "none" if self.cookie_secure else "lax"


settings = Settings()

