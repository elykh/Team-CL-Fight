"""Router for SumUp payment checkout creation."""
import logging
import uuid
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional

from services.sumup_service import create_sumup_checkout

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/sumup", tags=["sumup"])


class CartItem(BaseModel):
    name: str
    price: float
    quantity: int
    size: str


class CreateCheckoutRequest(BaseModel):
    items: List[CartItem]
    total: float
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None


class CreateCheckoutResponse(BaseModel):
    checkout_url: str
    checkout_id: str


@router.post("/create_checkout", response_model=CreateCheckoutResponse)
async def create_checkout(
    data: CreateCheckoutRequest,
    request: Request,
):
    """Create a SumUp Hosted Checkout for the cart items."""
    try:
        # Validate total matches items
        calculated_total = sum(item.price * item.quantity for item in data.items)
        if abs(calculated_total - data.total) > 0.01:
            raise HTTPException(
                status_code=400,
                detail="Le total ne correspond pas aux articles du panier"
            )

        # Build description from cart items
        items_desc = ", ".join(
            f"{item.name} (x{item.quantity}, {item.size})" for item in data.items
        )
        description = f"Commande Team Fight: {items_desc}"
        if len(description) > 200:
            description = description[:197] + "..."

        # Generate unique checkout reference
        checkout_reference = f"TF-{uuid.uuid4().hex[:12].upper()}"

        # Get redirect URL from frontend host
        frontend_host = request.headers.get("App-Host", "")
        if frontend_host and not frontend_host.startswith(("http://", "https://")):
            frontend_host = f"https://{frontend_host}"
        redirect_url = frontend_host if frontend_host else None

        # Create SumUp checkout
        result = await create_sumup_checkout(
            amount=data.total,
            description=description,
            checkout_reference=checkout_reference,
            redirect_url=redirect_url,
        )

        return CreateCheckoutResponse(
            checkout_url=result["hosted_checkout_url"],
            checkout_id=result["checkout_id"],
        )

    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"SumUp configuration error: {e}")
        raise HTTPException(
            status_code=503,
            detail="Le paiement en ligne n'est pas encore activé. Veuillez publier le site ou contacter l'administrateur."
        )
    except Exception as e:
        logger.error(f"SumUp checkout creation error: {e}")
        raise HTTPException(
            status_code=502,
            detail="Erreur de communication avec le service de paiement SumUp. Veuillez réessayer."
        )
