"""SumUp Hosted Checkout service for creating payment links."""
import os
import logging
import httpx

logger = logging.getLogger(__name__)

SUMUP_API_URL = "https://api.sumup.com/v0.1/checkouts"


async def create_sumup_checkout(
    amount: float,
    description: str,
    checkout_reference: str,
    redirect_url: str = None,
) -> dict:
    """
    Create a SumUp Hosted Checkout and return the checkout URL.
    """
    api_key = os.environ.get("SUMUP_API_KEY", "").strip()
    merchant_code = os.environ.get("SUMUP_MERCHANT_CODE", "").strip()

    if not api_key:
        logger.error("SUMUP_API_KEY is not set.")
        raise ValueError("SUMUP_API_KEY is not configured. Veuillez publier le site pour activer les paiements.")
    if not merchant_code:
        logger.error("SUMUP_MERCHANT_CODE is not set.")
        raise ValueError("SUMUP_MERCHANT_CODE is not configured")

    payload = {
        "checkout_reference": checkout_reference,
        "amount": amount,
        "currency": "EUR",
        "merchant_code": merchant_code,
        "description": description,
    }

    if redirect_url:
        payload["redirect_url"] = redirect_url

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient() as http_client:
        response = await http_client.post(
            SUMUP_API_URL,
            json=payload,
            headers=headers,
            timeout=15,
        )

        if response.status_code not in (200, 201):
            logger.error(f"SumUp API error: {response.status_code} - {response.text}")
            raise Exception(f"SumUp API error: {response.status_code} - {response.text}")

        data = response.json()
        checkout_id = data.get("id")

        return {
            "checkout_id": checkout_id,
            "hosted_checkout_url": f"https://pay.sumup.com/b2c/Q{checkout_id}",
        }
