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


def send_invite(name: str, phone: str, company: str = "") -> bool:
    """Send a personalised webinar invite via WhatsApp."""
    if not phone.startswith('whatsapp:'):
        phone = f"whatsapp:{phone}"

    company_line = f"At *{company}*, this session will show you how to streamline your operations, stay KRA-compliant, and get more done with less manual effort.\n\n" if company else ""

    message_body = (
        f"Hi {name}! 👋\n\n"
        "As one of our valued clients, we'd like to personally invite you to an exclusive webinar we've put together just for you.\n\n"
        f"{company_line}"
        "━━━━━━━━━━━━━━━━━━━━━━\n"
        "🎓 *What's New in TallyPrime 7.1*\n"
        "━━━━━━━━━━━━━━━━━━━━━━\n\n"
        "📅 *Date:* Wednesday, 15th July 2026\n"
        "🕒 *Time:* 3:00 PM – 4:00 PM (EAT)\n"
        "📍 *Venue:* Online via Google Meet\n"
        "💰 *Cost:* Completely Free\n\n"
        "🌟 *Why attend — this webinar is 100% FREE:*\n"
        "✅ Be the first to see TallyPrime 7.1's new features before everyone else\n"
        "✅ Learn how to save hours of manual work with AI-powered automation\n"
        "✅ Stay fully compliant with the latest KRA eTIMS requirements\n"
        "✅ Get your questions answered live by our TallyPrime experts\n"
        "✅ Exclusive session for our clients only — limited spots available\n\n"
        "🎯 *What you'll cover:*\n"
        "✨ Latest features & productivity improvements\n"
        "📊 Compliance, reporting & eTIMS enhancements\n"
        "🎥 Live demo of new capabilities\n"
        "💬 Interactive Q&A with our team\n\n"
        "━━━━━━━━━━━━━━━━━━━━━━\n"
        "📝 *Reserve your free spot — takes less than a minute:*\n"
        "https://www.optimumprimesolutions.co.ke/webinar\n"
        "━━━━━━━━━━━━━━━━━━━━━━\n\n"
        "Once registered, we'll send your personal join link straight to your WhatsApp. 🙌\n\n"
        "One of our team will also follow up with you shortly.\n"
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
        if send_invite(c['name'], c['phone'], c.get('company', '')):
            success += 1
        time.sleep(1.2)  # avoid Twilio rate limits

    print(f"\n🎉 Done! {success}/{len(CUSTOMERS)} invites sent successfully.")
