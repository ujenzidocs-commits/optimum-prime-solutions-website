import os
from twilio.rest import Client
import time

# ---------------------------------------------------------------
# Twilio credentials — set these as environment variables:
#   export TWILIO_ACCOUNT_SID="your_account_sid"
#   export TWILIO_AUTH_TOKEN="your_auth_token"
# ---------------------------------------------------------------
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN  = os.environ.get('TWILIO_AUTH_TOKEN')
TWILIO_FROM_NUMBER = 'whatsapp:+14155238886'

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# ---------------------------------------------------------------
# Add your customer list here — Name + Phone (with country code)
# ---------------------------------------------------------------
CUSTOMERS = [
    # {"name": "John", "phone": "+254712345678"},
    # {"name": "Mary", "phone": "+254723456789"},
    # {"name": "Peter", "phone": "+254734567890"},
]


def send_invite(name: str, phone: str) -> bool:
    """Send a personalised webinar invite via WhatsApp."""
    if not phone.startswith('whatsapp:'):
        phone = f"whatsapp:{phone}"

    message_body = (
        f"Hi {name}! 👋\n\n"
        "We'd like to personally invite you to our upcoming webinar — a session we've put together specifically for our valued clients.\n\n"
        "━━━━━━━━━━━━━━━━━━━━━━\n"
        "🎓 *What's New in TallyPrime 7.1*\n"
        "━━━━━━━━━━━━━━━━━━━━━━\n\n"
        "📅 *Date:* Wednesday, 8th July 2026\n"
        "🕒 *Time:* 3:00 PM – 4:00 PM (EAT)\n"
        "📍 *Venue:* Online via Google Meet\n"
        "💰 *Cost:* Completely Free\n\n"
        "🎯 *What you'll learn:*\n"
        "✨ Latest features in TallyPrime 7.1\n"
        "⚡ Productivity improvements & smarter workflows\n"
        "📊 Compliance and reporting enhancements\n"
        "🎥 Live demonstration of new capabilities\n"
        "💬 Interactive Q&A with our experts\n\n"
        "━━━━━━━━━━━━━━━━━━━━━━\n"
        "📝 *Register here to secure your spot:*\n"
        "https://www.optimumprimesolutions.co.ke/webinar\n\n"
        "🔗 *Direct join link (save this):*\n"
        "https://meet.google.com/bsj-hpbp-avz\n"
        "━━━━━━━━━━━━━━━━━━━━━━\n\n"
        "One of our team will follow up with you shortly. We hope to see you there! 🙌\n"
        "— *Optimum Prime Solutions*\n"
        "🌐 www.optimumprimesolutions.co.ke"
    )

    try:
        message = client.messages.create(
            from_=TWILIO_FROM_NUMBER,
            body=message_body,
            to=phone
        )
        print(f"✅  Sent to {name} ({phone}) — SID: {message.sid}")
        return True
    except Exception as e:
        print(f"❌  Failed for {name} ({phone}): {e}")
        return False


if __name__ == "__main__":
    print("🚀 TallyPrime 7.1 Webinar — WhatsApp Invite Blast")
    print("=" * 50)

    if not CUSTOMERS:
        print("\n⚠️  Customer list is empty!")
        print("   Add entries to the CUSTOMERS list in this script:")
        print('   {"name": "John", "phone": "+254712345678"}')
        exit(1)

    print(f"   Sending to {len(CUSTOMERS)} customer(s)...\n")
    success = 0
    for c in CUSTOMERS:
        if send_invite(c['name'], c['phone']):
            success += 1
        time.sleep(1.2)  # avoid Twilio rate limits

    print(f"\n🎉 Done! {success}/{len(CUSTOMERS)} invites sent successfully.")
