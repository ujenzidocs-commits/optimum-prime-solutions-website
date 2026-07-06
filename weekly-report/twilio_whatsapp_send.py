import os
#!/usr/bin/env python3
"""
Send weekly report via Twilio WhatsApp to both personal and business numbers.
Called by the weekly report scheduled task every Monday at 8am Nairobi time.
"""
from twilio.rest import Client

ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID", "")
AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "")
FROM_WHATSAPP = "whatsapp:+14155238886"   # Twilio sandbox number

# Both numbers to receive the report
RECIPIENTS = [
    "whatsapp:+254758449475",   # Personal number (sandbox activated)
    "whatsapp:+254116246074",   # Business number (activate by sending join code from this number)
]

def send_whatsapp_report(message_body: str, recipients: list = None):
    """Send a WhatsApp message to one or more recipients."""
    if recipients is None:
        recipients = RECIPIENTS

    client = Client(ACCOUNT_SID, AUTH_TOKEN)
    results = []

    for to_number in recipients:
        try:
            msg = client.messages.create(
                from_=FROM_WHATSAPP,
                to=to_number,
                body=message_body
            )
            results.append({"number": to_number, "sid": msg.sid, "status": msg.status, "success": True})
            print(f"  ✅ Sent to {to_number} — SID: {msg.sid}")
        except Exception as e:
            results.append({"number": to_number, "error": str(e), "success": False})
            print(f"  ⚠ Failed to send to {to_number}: {e}")

    return results


def build_report_message(week_start: str, week_end: str, ga_data: dict, chat_data: dict) -> str:
    """Build a concise WhatsApp report message."""
    ga_ok = "error" not in ga_data
    chat_ok = "error" not in chat_data

    lines = [
        "📊 *Weekly Report — Optimum Prime Solutions*",
        f"_{week_start} to {week_end}_",
        "",
        "🌐 *Website Traffic*",
    ]

    if ga_ok:
        lines += [
            f"• Sessions: *{ga_data.get('sessions', 'N/A')}*",
            f"• Users: *{ga_data.get('total_users', 'N/A')}* ({ga_data.get('new_users', 'N/A')} new)",
            f"• Page Views: *{ga_data.get('page_views', 'N/A')}*",
            f"• Avg. Duration: *{ga_data.get('avg_session_duration', 'N/A')} min*",
        ]
    else:
        lines.append("• ⚠ GA4 data not yet connected")

    lines += ["", "💬 *Chatbot Interactions*"]

    if chat_ok:
        lines += [
            f"• Chats Started: *{chat_data.get('total_sessions', 'N/A')}*",
            f"• Leads Captured: *{chat_data.get('leads_captured', 'N/A')}*",
            f"• Total Messages: *{chat_data.get('total_messages', 'N/A')}*",
        ]
        if chat_data.get("top_topics"):
            top = ", ".join([t[0] for t in chat_data["top_topics"][:3]])
            lines.append(f"• Top Topics: _{top}_")
        if chat_data.get("lead_names"):
            names = ", ".join(chat_data["lead_names"][:3])
            lines.append(f"• Leads: _{names}_")
    else:
        lines.append("• ⚠ Firebase data not yet connected")

    lines += [
        "",
        "_Auto-generated every Monday 8am Nairobi time_ ✅",
        "_Optimum Prime Solutions — Certified TallyPrime Partner_"
    ]

    return "\n".join(lines)


if __name__ == "__main__":
    import datetime

    # Sample data for testing
    today = datetime.date.today()
    last_monday = today - datetime.timedelta(days=today.weekday() + 7)
    last_sunday = last_monday + datetime.timedelta(days=6)
    week_start = last_monday.strftime("%d %b %Y")
    week_end = last_sunday.strftime("%d %b %Y")

    ga_data = {
        "sessions": 312, "total_users": 247, "new_users": 189,
        "page_views": 874, "avg_session_duration": 2.4, "bounce_rate": 48.3,
    }
    chat_data = {
        "total_sessions": 38, "leads_captured": 14, "total_messages": 203,
        "top_topics": [("pricing", 18), ("tallyprime", 15), ("demo", 12)],
        "lead_names": ["James Mwangi", "Sarah Odhiambo", "Peter Kamau"],
    }

    message = build_report_message(week_start, week_end, ga_data, chat_data)
    print("Sending WhatsApp report...")
    print("-" * 40)
    print(message)
    print("-" * 40)

    # Send to both personal and business numbers
    results = send_whatsapp_report(message, recipients=[
        "whatsapp:+254758449475",   # Personal number
        "whatsapp:+254116246074",   # Business number
    ])
    print(f"\nDelivery complete: {sum(1 for r in results if r['success'])}/{len(results)} sent successfully")
