import re
from typing import Any, Dict


def mock_lead_capture(name: str, email: str, platform: str) -> Dict[str, Any]:
    """
    Mock CRM API call to capture a qualified lead.
    In production, this would POST to a real CRM (HubSpot, Salesforce, etc.)

    IMPORTANT: This must only be called after ALL THREE fields are collected.
    """
    print("\n" + "=" * 50)
    print("LEAD CAPTURE TRIGGERED")
    print(f"   Name:     {name}")
    print(f"   Email:    {email}")
    print(f"   Platform: {platform}")
    print("=" * 50 + "\n")

    return {
        "success": True,
        "message": f"Lead captured successfully for {name}",
        "lead_id": f"LEAD_{name[:3].upper()}_{len(email)}",
        "data": {
            "name": name,
            "email": email,
            "platform": platform,
        },
    }


def validate_email(email: str) -> bool:
    """Validate email format using regex."""
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email.strip()))


def format_lead_summary(lead_data: dict) -> str:
    """Format collected lead data for display."""
    return (
        f"Name: {lead_data.get('name', 'N/A')}\n"
        f"Email: {lead_data.get('email', 'N/A')}\n"
        f"Platform: {lead_data.get('platform', 'N/A')}"
    )
