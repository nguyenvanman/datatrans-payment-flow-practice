from sqlalchemy import Column, Integer, String, DateTime, Enum, Text
from sqlalchemy.orm import declarative_base
from datetime import datetime
import enum

Base = declarative_base()


class TransactionStatus(enum.Enum):
    INITIALIZED = "initialized"
    PENDING = "pending"
    AUTHORIZED = "authorized"
    SETTLED = "settled"
    CANCELED = "canceled"
    FAILED = "failed"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(64), unique=True, index=True, nullable=False)
    reference_number = Column(String(128), index=True)
    amount = Column(Integer, nullable=False)          # in smallest unit (e.g. cents)
    currency = Column(String(3), nullable=False, default="CHF")
    description = Column(String(255), nullable=True)
    status = Column(Enum(TransactionStatus), default=TransactionStatus.INITIALIZED, nullable=False)
    raw_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)