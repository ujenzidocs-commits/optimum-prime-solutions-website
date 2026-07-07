# WhatsApp Business Number Migration Guide
## Optimum Prime Solutions Ltd — Twilio Sandbox → Verified Business Number

---

## Current Status (as at July 2026)

| Item | Value |
|---|---|
| **Sandbox number (active now)** | `+14155238886` (Twilio shared sandbox) |
| **Business number (pending)** | `+254727209720` |
| **Meta verification status** | Registered with Meta — awaiting approval (showing "Offline") |
| **Twilio Account SID** | *(stored in Render.com environment variables — do not commit to repo)* |
| **Twilio Auth Token** | *(stored in Render.com environment variables — do not commit to repo)* |

> **Sandbox limitation:** Only numbers that have opted in (sent "join <keyword>" to +14155238886) can receive sandbox messages. Once the business number is verified and Online, ALL customers can receive messages without opting in.

---

## When Meta Verification Completes — Step-by-Step

### Step 1 — Confirm the number is Online in Twilio Console
1. Log in to [console.twilio.com](https://console.twilio.com)
2. Go to **Messaging → Senders → WhatsApp Senders**
3. Confirm `+254727209720` shows status **"Online"** (green)

---

### Step 2 — Update the Render.com notification server

File: `/home/ubuntu/lead-notifier-server/app.py`

Find this line:
```python
TWILIO_FROM = "whatsapp:+14155238886"
```
Change to:
```python
TWILIO_FROM = "whatsapp:+254727209720"
```

Then redeploy to Render.com:
```bash
cd /home/ubuntu/lead-notifier-server
git add app.py
git commit -m "Switch WhatsApp sender to verified business number +254727209720"
git push
```
Render auto-deploys on push. Confirm at: https://optimum-prime-lead-notifier.onrender.com

---

### Step 3 — Update the single-send invite script

File: `/home/ubuntu/send_invite_only.py`

Find:
```python
FROM_WA = "whatsapp:+14155238886"
```
Change to:
```python
FROM_WA = "whatsapp:+254727209720"
```

---

### Step 4 — Update the bulk invite blast script

File: `/home/ubuntu/optimum-prime-solutions-website/weekly-report/send_webinar_invites.py`

Find:
```python
TWILIO_FROM_NUMBER = 'whatsapp:+14155238886'
```
Change to:
```python
TWILIO_FROM_NUMBER = 'whatsapp:+254727209720'
```

---

### Step 5 — Update the webinar reminder script (when built)

Any future reminder/follow-up scripts must also use `whatsapp:+254727209720` as the sender.

---

### Step 6 — Update the WebinarPage.tsx (website registration form)

File: `/home/ubuntu/optimum-prime-solutions-website/src/pages/WebinarPage.tsx`

The page calls the Render.com notification server which handles the WhatsApp sending. Once Step 2 is done, the website will automatically use the new number — **no change needed in the website code itself.**

---

## Webinar Invite Message (Current — Approved)

The following is the approved Message 1 (invite) text. Use this as the template for all future campaigns:

```
Hi {Name}! 👋

As one of our valued clients at *{Company}*, we'd like to personally invite you to an exclusive webinar we've put together just for you.

━━━━━━━━━━━━━━━━━━━━━━
🎓 *What's New in TallyPrime 7.1*
━━━━━━━━━━━━━━━━━━━━━━

📅 *Date:* Wednesday, 15th July 2026
🕒 *Time:* 3:00 PM – 4:00 PM (EAT)
📍 *Venue:* Online via Google Meet
💰 *Cost:* Free webinar

🌟 *What we'll cover:*
✅ *Auto Wrap Text* — long descriptions, narrations & names display fully without truncation
✅ *Professional Invoice Print Templates* — 8 ready-to-use, fully customisable templates with your logo & branding
✅ *Scheduled Auto Backup* — set it once and your company data backs up automatically
✅ *Reuse Deleted Voucher Numbers* — keep your numbering sequence clean and continuous
✅ Live Q&A with our TallyPrime experts

━━━━━━━━━━━━━━━━━━━━━━
📝 *Reserve your spot — takes less than a minute:*
https://www.optimumprimesolutions.co.ke/webinar
━━━━━━━━━━━━━━━━━━━━━━

Once registered, we'll send your personal Google Meet join link straight to your WhatsApp. 🙌

One of our team will also follow up with you shortly.
— *Optimum Prime Solutions*
🌐 www.optimumprimesolutions.co.ke
```

**Key rules for this message:**
- Always include salutation: Mr. / Ms. / Dr. before the name
- "Free" refers to the **webinar**, not the registration process
- Message 1 contains **registration link only** — NO Google Meet join link
- Google Meet join link is sent automatically by the server **only after registration**

---

## Message 2 — Auto-sent on Registration (Confirmation)

This is sent automatically by the Render.com server when someone submits the registration form. It is triggered by the website's `/webinar` page calling the notification server.

The message includes:
- Congratulations / confirmation
- Google Meet join link: `https://meet.google.com/bsj-hpbp-avz`
- Webinar date/time reminder

---

## Numbers Opted In to Sandbox (for reference)

These numbers were opted in during testing and can still receive sandbox messages:

| Person | Number |
|---|---|
| Chege (personal) | +254758449475 |
| Business line | +254116246074 |
| Ken | +254723145133 |
| Jane | +254726006085 |
| John | +254701146343 |

> Once the business number is verified, opt-ins are no longer required.

---

## Files Summary

| File | Purpose |
|---|---|
| `/home/ubuntu/send_invite_only.py` | Send Message 1 to a single number (testing/demo) |
| `/home/ubuntu/optimum-prime-solutions-website/weekly-report/send_webinar_invites.py` | Bulk invite blast to customer list |
| `/home/ubuntu/lead-notifier-server/app.py` | Render.com server — sends Message 2 on registration + team alerts |
| `/home/ubuntu/optimum-prime-solutions-website/src/pages/WebinarPage.tsx` | Website registration form — calls Render.com server |

---

*Last updated: July 2026*
