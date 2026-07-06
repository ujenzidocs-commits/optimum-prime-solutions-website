import os
#!/usr/bin/env python3
"""
Send a test WhatsApp message via Twilio sandbox.
The recipient must have already joined the sandbox by sending:
  join <keyword>  to  +1 415 523 8886
"""
from twilio.rest import Client

ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID", "")
AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "")
FROM_WHATSAPP = "whatsapp:+14155238886"   # Twilio sandbox number
TO_WHATSAPP = "whatsapp:+254758449475"    # Personal number (sandbox activated)

client = Client(ACCOUNT_SID, AUTH_TOKEN)

try:
    message = client.messages.create(
        from_=FROM_WHATSAPP,
        to=TO_WHATSAPP,
        body=(
            "📊 *Weekly Report — Optimum Prime Solutions*\n"
            "_29 Jun 2026 to 05 Jul 2026_\n\n"
            "🌐 *Website Traffic*\n"
            "• Sessions: *312*\n"
            "• Users: *247* (189 new)\n"
            "• Page Views: *874*\n"
            "• Avg. Duration: *2.4 min*\n\n"
            "💬 *Chatbot Interactions*\n"
            "• Chats Started: *38*\n"
            "• Leads Captured: *14*\n"
            "• Top Topics: pricing, tallyprime, demo\n"
            "• Leads: James Mwangi, Sarah Odhiambo\n\n"
            "_Auto-generated every Monday 8am Nairobi time_ ✅"
        )
    )
    print(f"✅ WhatsApp message sent! SID: {message.sid}")
    print(f"   Status: {message.status}")
except Exception as e:
    print(f"❌ Error: {e}")
