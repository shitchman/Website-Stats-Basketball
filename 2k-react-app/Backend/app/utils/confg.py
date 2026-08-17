from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    secret_key: str = Field(validation_alias="SECRET_KEY")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

