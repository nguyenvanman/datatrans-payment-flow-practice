from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import httpx
import base64
import os
import json
from datetime import datetime
from database import engine, SessionLocal
import models
from models import Transaction, TransactionStatus
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    models.Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Datatrans Payment Demo", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Datatrans config
DATATRANS_BASE_URL = os.getenv("DATATRANS_BASE_URL", "")
DATATRANS_PAY_URL = os.getenv("DATATRANS_PAY_URL", "")
DATATRANS_MERCHANT_ID = os.getenv("DATATRANS_MERCHANT_ID", "")
DATATRANS_API_PASSWORD = os.getenv("DATATRANS_API_PASSWORD", "")
WEBHOOK_SECRET = os.getenv("DATATRANS_WEBHOOK_SECRET", "")


def get_datatrans_headers():
    credentials = f"{DATATRANS_MERCHANT_ID}:{DATATRANS_API_PASSWORD}"
    encoded = base64.b64encode(credentials.encode()).decode()
    return {
        "Authorization": f"Basic {encoded}",
        "Content-Type": "application/json",
    }


# ─── Schemas ───────────────────────────────────────────────────────────────────

class InitPaymentRequest(BaseModel):
    amount: int  # in smallest currency unit (e.g. cents)
    currency: str = "CHF"
    reference_number: Optional[str] = None
    description: Optional[str] = None


class InitPaymentResponse(BaseModel):
    transaction_id: str
    payment_page_url: str


# ─── Routes ────────────────────────────────────────────────────────────────────


@app.post("/api/payments/init", response_model=InitPaymentResponse)
async def init_payment(payload: InitPaymentRequest):
    """Initialize a Datatrans transaction and return the hosted payment page URL."""
    db = SessionLocal()
    try:
        ref = payload.reference_number or f"REF-{int(datetime.utcnow().timestamp())}"

        datatrans_payload = {
            "currency": payload.currency,
            "refno": ref,
            "amount": payload.amount,
            "paymentMethods": ["VIS", "ECA", "PAP"],
            "redirect": {
                "successUrl": "http://localhost:3000/payment/success",
                "cancelUrl": "http://localhost:3000/payment/cancel",
                "errorUrl": "http://localhost:3000/payment/error",
            },
            "webhook": {
                "url": os.getenv("WEBHOOK_URL", "https://5cb3-117-2-155-123.ngrok-free.app/api/payments/webhook"),
            },
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{DATATRANS_BASE_URL}/v1/transactions",
                headers=get_datatrans_headers(),
                json=datatrans_payload,
            )

        if response.status_code != 201:
            raise HTTPException(status_code=502, detail=f"Datatrans error: {response.text}")

        data = response.json()
        transaction_id = data.get("transactionId")
        payment_page_url = f"{DATATRANS_PAY_URL}/v1/start/{transaction_id}"

        # Persist to DB
        txn = Transaction(
            transaction_id=transaction_id,
            reference_number=ref,
            amount=payload.amount,
            currency=payload.currency,
            description=payload.description,
            status=TransactionStatus.INITIALIZED,
            raw_response=json.dumps(data),
        )
        db.add(txn)
        db.commit()

        return InitPaymentResponse(
            transaction_id=transaction_id,
            payment_page_url=payment_page_url,
        )
    finally:
        db.close()


@app.get("/api/payments")
async def list_payments(skip: int = 0, limit: int = 50):
    """List all stored transactions."""
    db = SessionLocal()
    try:
        txns = db.query(Transaction).order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()
        return [
            {
                "id": t.id,
                "transaction_id": t.transaction_id,
                "reference_number": t.reference_number,
                "amount": t.amount,
                "currency": t.currency,
                "description": t.description,
                "status": t.status.value,
                "created_at": t.created_at.isoformat(),
                "updated_at": t.updated_at.isoformat(),
            }
            for t in txns
        ]
    finally:
        db.close()


@app.get("/api/payments/{transaction_id}")
async def get_payment(transaction_id: str):
    """Fetch a single transaction + optionally sync from Datatrans."""
    db = SessionLocal()
    try:
        txn = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
        if not txn:
            raise HTTPException(status_code=404, detail="Transaction not found")

        # Optionally pull latest status from Datatrans
        try:
            async with httpx.AsyncClient() as client:
                r = await client.get(
                    f"{DATATRANS_BASE_URL}/v1/transactions/{transaction_id}",
                    headers=get_datatrans_headers(),
                )
            if r.status_code == 200:
                remote = r.json()
                status_map = {
                    "initialized": TransactionStatus.INITIALIZED,
                    "challenge_required": TransactionStatus.PENDING,
                    "challenge_ongoing": TransactionStatus.PENDING,
                    "authenticated": TransactionStatus.PENDING,
                    "authorized": TransactionStatus.AUTHORIZED,
                    "settled": TransactionStatus.SETTLED,
                    "canceled": TransactionStatus.CANCELED,
                    "transmitted": TransactionStatus.SETTLED,
                    "failed": TransactionStatus.FAILED,
                }
                new_status = status_map.get(remote.get("status", "").lower(), txn.status)
                txn.status = new_status
                txn.raw_response = json.dumps(remote)
                db.commit()
        except Exception:
            pass  # Don't fail the request if Datatrans is unreachable

        return {
            "id": txn.id,
            "transaction_id": txn.transaction_id,
            "reference_number": txn.reference_number,
            "amount": txn.amount,
            "currency": txn.currency,
            "description": txn.description,
            "status": txn.status.value,
            "created_at": txn.created_at.isoformat(),
            "updated_at": txn.updated_at.isoformat(),
        }
    finally:
        db.close()


@app.post("/api/payments/webhook")
async def payment_webhook(request: Request):
    """Handle Datatrans webhook notifications."""
    body = await request.body()

    # Optional: verify signature header (Datatrans sends Datatrans-Signature)
    signature = request.headers.get("Datatrans-Signature", "")

    try:
        data = json.loads(body)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    transaction_id = data.get("transactionId")
    if not transaction_id:
        raise HTTPException(status_code=400, detail="Missing transactionId")

    status_map = {
        "authorized": TransactionStatus.AUTHORIZED,
        "settled": TransactionStatus.SETTLED,
        "canceled": TransactionStatus.CANCELED,
        "failed": TransactionStatus.FAILED,
        "transmitted": TransactionStatus.SETTLED,
    }

    db = SessionLocal()
    try:
        txn = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
        if txn:
            remote_status = data.get("status", "").lower()
            txn.status = status_map.get(remote_status, txn.status)
            txn.raw_response = json.dumps(data)
            db.commit()

    finally:
        db.close()

    return {"received": True}


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
