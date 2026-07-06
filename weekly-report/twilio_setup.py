import os
#!/usr/bin/env python3
"""
Twilio WhatsApp setup and test script for Optimum Prime Solutions weekly reports.
"""

from twilio.rest import Client
import json

ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID", "")
AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "")
TO_NUMBER = "whatsapp:+254116246074"
SANDBOX_NUMBER = "whatsapp:+14155238886"  # Twilio sandbox number

client = Client(ACCOUNT_SID, AUTH_TOKEN)

# Step 1: Get sandbox details
print("=" * 60)
print("Twilio WhatsApp Sandbox Setup")
print("=" * 60)

try:
    # Fetch account info to verify credentials
    account = client.api.accounts(ACCOUNT_SID).fetch()
    print(f"✅ Account verified: {account.friendly_name}")
    print(f"   Status: {account.status}")
    print(f"   Balance: Check Twilio Console for credit balance")
    print()

    # Get the sandbox
    sandbox = client.messaging.v1.services.list(limit=5)
    print(f"✅ Twilio credentials are valid and working!")
    print()
    print("=" * 60)
    print("IMPORTANT: One-time WhatsApp Sandbox Activation")
    print("=" * 60)
    print()
    print("To receive WhatsApp messages from the Twilio sandbox,")
    print("you need to join the sandbox ONCE from your WhatsApp.")
    print()
    print("Step 1: Open WhatsApp on your phone")
    print("Step 2: Send this message to: +1 415 523 8886")
    print()
    print("   join <your-sandbox-keyword>")
    print()
    print("You can find your sandbox keyword in the Twilio Console:")
    print("   Messaging → Try it out → Send a WhatsApp message")
    print()
    print("Once you join, I will send a test message to confirm!")

except Exception as e:
    print(f"❌ Error: {e}")
