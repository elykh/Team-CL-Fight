"""Router for handling club registration form submissions."""
import logging
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from services.email_service import send_registration_email, _save_registration_locally

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/registration", tags=["registration"])


class RegistrationRequest(BaseModel):
    nom: str
    prenom: str
    email: str
    telephone: str
    date_naissance: Optional[str] = ""
    niveau: Optional[str] = ""
    discipline: Optional[str] = ""
    message: Optional[str] = ""


class RegistrationResponse(BaseModel):
    success: bool
    message: str
    email_sent: bool


@router.post("/submit", response_model=RegistrationResponse)
async def submit_registration(data: RegistrationRequest):
    """Submit a registration form. Always saves locally, attempts email notification."""
    try:
        logger.info(f"Registration received: {data.prenom} {data.nom} ({data.email})")
        registration_data = data.model_dump()

        # Always save locally first (never lose a registration)
        saved = _save_registration_locally(registration_data)
        if not saved:
            logger.warning("Failed to save registration locally, but continuing...")

        # Attempt to send email notification
        email_sent = await send_registration_email(registration_data)

        if email_sent:
            return RegistrationResponse(
                success=True,
                message="Inscription envoyée avec succès ! Le club vous contactera bientôt.",
                email_sent=True,
            )
        else:
            return RegistrationResponse(
                success=True,
                message="Inscription enregistrée avec succès ! Le club vous contactera bientôt.",
                email_sent=False,
            )

    except Exception as e:
        logger.error(f"Registration submission error: {type(e).__name__}: {e}")
        _save_registration_locally(data.model_dump())
        return RegistrationResponse(
            success=True,
            message="Inscription enregistrée. Le club vous contactera bientôt.",
            email_sent=False,
        )
