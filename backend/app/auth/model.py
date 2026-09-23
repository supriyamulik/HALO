from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from sqlmodel import Field, SQLModel


class Role(str, Enum):
    LAWYER = "LAWYER"
    RESEARCHER = "RESEARCHER"
    ADMIN = "ADMIN"
    INSTITUTION_ADMIN = "INSTITUTION_ADMIN"


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, nullable=False)
    password_hash: str = Field(nullable=False)
    role: Role = Field(default=Role.RESEARCHER, nullable=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
