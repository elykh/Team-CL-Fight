"""Email service for sending registration notifications to the club."""
import os
import json
import logging
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path

import aiosmtplib

logger = logging.getLogger(__name__)

CLUB_EMAIL = "clubfight.teamcl@gmail.com"
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587

REGISTRATIONS_FILE = Path("data/registrations.json")
SITE_URL = os.environ.get("SITE_URL", "https://clubfight-teamcl.atoms.dev")


def _save_registration_locally(registration_data: dict) -> bool:
    """Save registration data to a local JSON file as backup."""
    try:
        REGISTRATIONS_FILE.parent.mkdir(parents=True, exist_ok=True)
        registrations = []
        if REGISTRATIONS_FILE.exists():
            with open(REGISTRATIONS_FILE, "r", encoding="utf-8") as f:
                registrations = json.load(f)

        entry = {
            **registration_data,
            "registered_at": datetime.now().isoformat(),
            "email_sent": False,
        }
        registrations.append(entry)

        with open(REGISTRATIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(registrations, f, ensure_ascii=False, indent=2)

        logger.info(f"Registration saved locally: {registration_data.get('prenom')} {registration_data.get('nom')}")
        return True
    except Exception as e:
        logger.error(f"Failed to save registration locally: {e}")
        return False


async def _send_email(to_email: str, subject: str, body: str, smtp_password: str) -> bool:
    """Helper to send a single email."""
    try:
        msg = MIMEMultipart()
        msg["From"] = CLUB_EMAIL
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain", "utf-8"))

        await aiosmtplib.send(
            msg,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            start_tls=True,
            username=CLUB_EMAIL,
            password=smtp_password,
        )
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {type(e).__name__}: {e}")
        return False


async def send_registration_email(registration_data: dict) -> bool:
    """Send registration details to the club AND a confirmation email to the member."""
    smtp_password = os.environ.get("GMAIL_APP_PASSWORD", "").strip()

    if not smtp_password:
        logger.error("GMAIL_APP_PASSWORD is not set or empty. Cannot send email.")
        return False

    prenom = registration_data.get('prenom', '')
    nom = registration_data.get('nom', '')
    member_email = registration_data.get('email', '')
    discipline = registration_data.get('discipline', 'Non renseigné')

    # --- Email 1: Notification au club ---
    club_subject = f"Nouvelle inscription - {prenom} {nom}"
    club_body = f"""
Nouvelle inscription reçue sur le site Team Fight / LA TEAM CL

--- Informations du membre ---

Nom : {nom}
Prénom : {prenom}
Email : {member_email}
Téléphone : {registration_data.get('telephone', 'Non renseigné')}
Date de naissance : {registration_data.get('date_naissance', 'Non renseigné')}
Niveau : {registration_data.get('niveau', 'Non renseigné')}
Discipline : {discipline}
Message : {registration_data.get('message', 'Aucun')}

---
Ce message a été envoyé automatiquement depuis le site web du club.
"""

    club_sent = await _send_email(CLUB_EMAIL, club_subject, club_body, smtp_password)

    # --- Email 2: Confirmation + documents à l'inscrit ---
    member_sent = False
    if member_email:
        site_url = os.environ.get("SITE_URL", SITE_URL).rstrip("/")
        docs_base = f"{site_url}/documents"

        member_subject = "Team Fight / LA TEAM CL - Confirmation d'inscription & Documents à remplir"
        member_body = f"""
Bonjour {prenom},

Merci pour votre inscription au club Team Fight / LA TEAM CL ! 🥊

Nous avons bien reçu votre demande pour la discipline : {discipline}.

Pour finaliser votre inscription, vous devez télécharger, remplir et signer les documents ci-dessous, puis nous les renvoyer par email à : {CLUB_EMAIL}


📋 DOCUMENTS À TÉLÉCHARGER, REMPLIR ET SIGNER :

1. 📄 Fiche d'inscription 2025-2026
   ➜ {docs_base}/fiche-inscription-2025-2026.pdf

2. 📄 Note explicative de la fiche d'inscription
   ➜ {docs_base}/note-fiche-inscription.pdf

3. 📄 Règlement intérieur du club (à lire et signer)
   ➜ {docs_base}/reglement-interieur.pdf

4. 📄 Questionnaire de santé - Majeur
   ➜ {docs_base}/questionnaire-sante-majeur.pdf

5. 📄 Questionnaire de santé - Mineur
   ➜ {docs_base}/questionnaire-sante-mineur.pdf

6. 📄 Questionnaire de santé - Mineur (partie 2)
   ➜ {docs_base}/questionnaire-sante-mineur-2.pdf

7. 📄 Attestation questionnaire de santé - Majeur
   ➜ {docs_base}/attestation-questionnaire-sante-majeur.pdf

8. 📄 Certificat médical - Combat
   ➜ {docs_base}/certificat-medical-combat.pdf

9. 📄 Certificat médical - Light / Loisir
   ➜ {docs_base}/certificat-medical-light-loisir.pdf


📌 DOCUMENTS SUPPLÉMENTAIRES À FOURNIR :

• Photocopie de votre pièce d'identité (recto/verso)
• 1 photo d'identité récente
• Attestation d'assurance responsabilité civile


📧 COMMENT NOUS RENVOYER VOS DOCUMENTS :

Envoyez tous les documents remplis et signés par email à :
➜ {CLUB_EMAIL}

Ou apportez-les directement au club lors de votre premier entraînement.


⚠️ IMPORTANT : Votre inscription ne sera validée qu'après réception de l'ensemble des documents signés.

📅 En attendant, n'hésitez pas à venir faire un cours d'essai gratuit !

Pour toute question, contactez-nous :
📧 {CLUB_EMAIL}

À très bientôt sur le ring ! 🥊

---
L'équipe Team Fight / LA TEAM CL
"""

        member_sent = await _send_email(member_email, member_subject, member_body, smtp_password)

    return club_sent or member_sent
