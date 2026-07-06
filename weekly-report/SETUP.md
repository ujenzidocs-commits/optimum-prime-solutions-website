# Weekly Report Setup Guide — Optimum Prime Solutions

This guide walks you through the one-time setup needed to activate your automatic weekly reports.

---

## What Gets Reported Every Monday at 8am

- **Website Traffic** (from Google Analytics 4): sessions, users, page views, top pages, traffic sources
- **Chatbot Interactions** (from Firebase): chats started, leads captured, top topics discussed, lead names

---

## Step 1: Google Analytics 4 — Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Enable the **Google Analytics Data API**
4. Go to **IAM & Admin → Service Accounts** and create a new service account
5. Download the JSON key file and save it as `/home/ubuntu/weekly-report/ga4-credentials.json`
6. Go to [Google Analytics](https://analytics.google.com/) → Admin → Property Access Management
7. Add the service account email (from the JSON file) as a **Viewer**
8. Copy your **Property ID** (the number in the URL, e.g. `123456789`)
9. Set the environment variable: `export GA4_PROPERTY_ID="properties/123456789"`

---

## Step 2: Firebase — Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/) → Project Settings → Service Accounts
2. Click **Generate new private key** and download the JSON file
3. Save it as `/home/ubuntu/weekly-report/firebase-credentials.json`

---

## Step 3: Gmail App Password (for Email Sending)

1. Go to your Google Account → Security → 2-Step Verification (must be enabled)
2. Scroll down to **App passwords** and create one for "Mail"
3. Set environment variables:
   ```
   export REPORT_EMAIL_SENDER="optimumprimesolutionsltd@gmail.com"
   export REPORT_EMAIL_PASSWORD="your-16-char-app-password"
   ```

---

## Step 4: WhatsApp via CallMeBot (Free)

1. Save the number **+34 644 59 77 58** in your WhatsApp contacts as "CallMeBot"
2. Send the message: `I allow callmebot to send me messages`
3. You will receive an API key in reply
4. Set the environment variable: `export CALLMEBOT_API_KEY="your-api-key"`

---

## Step 5: Schedule Weekly Delivery (Every Monday 8am Nairobi Time)

Add this line to your crontab (`crontab -e`):

```
0 5 * * 1 GA4_PROPERTY_ID="properties/YOUR_ID" REPORT_EMAIL_SENDER="optimumprimesolutionsltd@gmail.com" REPORT_EMAIL_PASSWORD="your-app-password" CALLMEBOT_API_KEY="your-key" python3 /home/ubuntu/weekly-report/weekly_report.py >> /home/ubuntu/weekly-report/cron.log 2>&1
```

*(5am UTC = 8am Nairobi EAT)*

---

## Step 6: Test the Report

Run manually to verify everything works:

```bash
export GA4_PROPERTY_ID="properties/YOUR_ID"
export REPORT_EMAIL_SENDER="optimumprimesolutionsltd@gmail.com"
export REPORT_EMAIL_PASSWORD="your-app-password"
export CALLMEBOT_API_KEY="your-key"
python3 /home/ubuntu/weekly-report/weekly_report.py
```

---

## Environment Variables Summary

| Variable | Description |
|---|---|
| `GA4_PROPERTY_ID` | GA4 property ID, e.g. `properties/123456789` |
| `GA4_CREDENTIALS_FILE` | Path to GA4 service account JSON (default: `./ga4-credentials.json`) |
| `FIREBASE_CREDENTIALS_FILE` | Path to Firebase service account JSON (default: `./firebase-credentials.json`) |
| `REPORT_EMAIL_SENDER` | Gmail address used to send the report |
| `REPORT_EMAIL_PASSWORD` | Gmail App Password (16 characters) |
| `WHATSAPP_NUMBER` | WhatsApp number without `+`, e.g. `254116246074` |
| `CALLMEBOT_API_KEY` | API key from CallMeBot setup |
