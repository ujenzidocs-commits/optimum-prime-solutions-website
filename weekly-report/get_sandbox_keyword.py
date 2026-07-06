import os
#!/usr/bin/env python3
import requests
from requests.auth import HTTPBasicAuth

ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID", "")
AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "")

# Fetch WhatsApp sandbox details
url = f"https://api.twilio.com/2010-04-01/Accounts/{ACCOUNT_SID}/SandBoxes.json"
r = requests.get(url, auth=HTTPBasicAuth(ACCOUNT_SID, AUTH_TOKEN))
print("Status:", r.status_code)
print("Response:", r.text[:1000])
