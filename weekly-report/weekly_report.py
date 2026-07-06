#!/usr/bin/env python3
"""
Optimum Prime Solutions — Weekly Website & Chatbot Report
Runs every Monday morning and sends a report via email and WhatsApp.

Requirements:
  pip install firebase-admin google-analytics-data requests

Configuration:
  Set environment variables or edit the CONFIG section below.
"""

import os
import json
import smtplib
import datetime
import sys
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# ─── CONFIG ──────────────────────────────────────────────────────────────────
# Google Analytics 4
GA4_PROPERTY_ID = os.environ.get("GA4_PROPERTY_ID", "")          # e.g. "properties/123456789"
GA4_CREDENTIALS_FILE = os.environ.get("GA4_CREDENTIALS_FILE", "/home/ubuntu/weekly-report/ga4-credentials.json")

# Firebase
FIREBASE_CREDENTIALS_FILE = os.environ.get("FIREBASE_CREDENTIALS_FILE", "/home/ubuntu/weekly-report/firebase-credentials.json")
FIREBASE_DATABASE_URL = "https://optimum-website-1a60b-default-rtdb.firebaseio.com"

# Email (Gmail SMTP)
EMAIL_SENDER = os.environ.get("REPORT_EMAIL_SENDER", "")          # Gmail address used to send
EMAIL_PASSWORD = os.environ.get("REPORT_EMAIL_PASSWORD", "")      # Gmail App Password (not account password)
EMAIL_RECIPIENT = "optimumprimesolutionsltd@gmail.com"

# WhatsApp (via CallMeBot free API — no subscription needed)
# Setup: Send "I allow callmebot to send me messages" to +34 644 59 77 58 on WhatsApp first
WHATSAPP_NUMBER = os.environ.get("WHATSAPP_NUMBER", "254116246074")  # without + sign
CALLMEBOT_API_KEY = os.environ.get("CALLMEBOT_API_KEY", "")         # get from CallMeBot setup
# ─────────────────────────────────────────────────────────────────────────────


def get_week_range():
    """Return the start and end dates of the previous week (Mon–Sun)."""
    today = datetime.date.today()
    last_monday = today - datetime.timedelta(days=today.weekday() + 7)
    last_sunday = last_monday + datetime.timedelta(days=6)
    return last_monday, last_sunday


def fetch_ga4_data(start_date: str, end_date: str) -> dict:
    """Fetch key metrics from Google Analytics 4."""
    try:
        from google.analytics.data_v1beta import BetaAnalyticsDataClient
        from google.analytics.data_v1beta.types import (
            DateRange, Dimension, Metric, RunReportRequest
        )
        from google.oauth2 import service_account

        if not GA4_PROPERTY_ID or not os.path.exists(GA4_CREDENTIALS_FILE):
            return {"error": "GA4 credentials not configured"}

        credentials = service_account.Credentials.from_service_account_file(
            GA4_CREDENTIALS_FILE,
            scopes=["https://www.googleapis.com/auth/analytics.readonly"]
        )
        client = BetaAnalyticsDataClient(credentials=credentials)

        # Main metrics report
        request = RunReportRequest(
            property=GA4_PROPERTY_ID,
            date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
            metrics=[
                Metric(name="sessions"),
                Metric(name="totalUsers"),
                Metric(name="newUsers"),
                Metric(name="screenPageViews"),
                Metric(name="averageSessionDuration"),
                Metric(name="bounceRate"),
            ]
        )
        response = client.run_report(request)
        row = response.rows[0].metric_values if response.rows else []

        # Top pages report
        pages_request = RunReportRequest(
            property=GA4_PROPERTY_ID,
            date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
            dimensions=[Dimension(name="pagePath")],
            metrics=[Metric(name="screenPageViews")],
            limit=5
        )
        pages_response = client.run_report(pages_request)
        top_pages = [
            {
                "page": r.dimension_values[0].value,
                "views": r.metric_values[0].value
            }
            for r in pages_response.rows
        ] if pages_response.rows else []

        # Traffic sources
        source_request = RunReportRequest(
            property=GA4_PROPERTY_ID,
            date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
            dimensions=[Dimension(name="sessionDefaultChannelGroup")],
            metrics=[Metric(name="sessions")],
            limit=5
        )
        source_response = client.run_report(source_request)
        traffic_sources = [
            {
                "source": r.dimension_values[0].value,
                "sessions": r.metric_values[0].value
            }
            for r in source_response.rows
        ] if source_response.rows else []

        return {
            "sessions": int(row[0].value) if row else 0,
            "total_users": int(row[1].value) if row else 0,
            "new_users": int(row[2].value) if row else 0,
            "page_views": int(row[3].value) if row else 0,
            "avg_session_duration": round(float(row[4].value) / 60, 1) if row else 0,
            "bounce_rate": round(float(row[5].value) * 100, 1) if row else 0,
            "top_pages": top_pages,
            "traffic_sources": traffic_sources,
        }
    except Exception as e:
        return {"error": str(e)}


def fetch_firebase_chatbot_data(week_key: str) -> dict:
    """Fetch chatbot session data from Firebase for the given week."""
    try:
        import firebase_admin
        from firebase_admin import credentials, db

        if not os.path.exists(FIREBASE_CREDENTIALS_FILE):
            return {"error": "Firebase credentials not configured"}

        # Initialize Firebase (avoid re-init)
        if not firebase_admin._apps:
            cred = credentials.Certificate(FIREBASE_CREDENTIALS_FILE)
            firebase_admin.initialize_app(cred, {"databaseURL": FIREBASE_DATABASE_URL})

        ref = db.reference("chatbot_sessions")
        all_sessions = ref.get() or {}

        # Filter sessions for this week
        week_sessions = [
            s for s in all_sessions.values()
            if isinstance(s, dict) and s.get("week") == week_key
        ]

        total_sessions = len(week_sessions)
        leads_captured = sum(1 for s in week_sessions if s.get("leadCaptured"))
        total_messages = sum(s.get("messageCount", 0) for s in week_sessions)

        # Count topic frequency
        topic_counts: dict = {}
        for s in week_sessions:
            for t in s.get("topics", []):
                topic_counts[t] = topic_counts.get(t, 0) + 1

        top_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:5]

        # Lead names
        lead_names = [
            s.get("leadName", "") for s in week_sessions
            if s.get("leadCaptured") and s.get("leadName")
        ]

        return {
            "total_sessions": total_sessions,
            "leads_captured": leads_captured,
            "total_messages": total_messages,
            "avg_messages_per_session": round(total_messages / total_sessions, 1) if total_sessions else 0,
            "top_topics": top_topics,
            "lead_names": lead_names[:5],
        }
    except Exception as e:
        return {"error": str(e)}


def format_email_report(ga_data: dict, chat_data: dict, week_start: str, week_end: str) -> str:
    """Format a clean HTML email report."""
    ga_ok = "error" not in ga_data
    chat_ok = "error" not in chat_data

    top_pages_html = ""
    if ga_ok and ga_data.get("top_pages"):
        for p in ga_data["top_pages"]:
            page = p["page"].replace("/", " / ").strip(" /") or "Home"
            top_pages_html += f"<tr><td style='padding:4px 8px;'>{page}</td><td style='padding:4px 8px;text-align:right;font-weight:600;'>{p['views']}</td></tr>"

    sources_html = ""
    if ga_ok and ga_data.get("traffic_sources"):
        for s in ga_data["traffic_sources"]:
            sources_html += f"<tr><td style='padding:4px 8px;'>{s['source']}</td><td style='padding:4px 8px;text-align:right;font-weight:600;'>{s['sessions']}</td></tr>"

    topics_html = ""
    if chat_ok and chat_data.get("top_topics"):
        for topic, count in chat_data["top_topics"]:
            topics_html += f"<tr><td style='padding:4px 8px;text-transform:capitalize;'>{topic.replace('_', ' ')}</td><td style='padding:4px 8px;text-align:right;font-weight:600;'>{count}</td></tr>"

    leads_html = ""
    if chat_ok and chat_data.get("lead_names"):
        leads_html = "<p style='margin:4px 0;'><strong>Leads this week:</strong> " + ", ".join(chat_data["lead_names"]) + "</p>"

    ga_section = f"""
    <table style='width:100%;border-collapse:collapse;margin-bottom:16px;'>
      <tr>
        <td style='padding:12px;background:#f8fafc;border-radius:8px;text-align:center;'>
          <div style='font-size:28px;font-weight:700;color:#dc2626;'>{ga_data.get('sessions', 'N/A')}</div>
          <div style='font-size:12px;color:#64748b;'>Sessions</div>
        </td>
        <td style='width:8px;'></td>
        <td style='padding:12px;background:#f8fafc;border-radius:8px;text-align:center;'>
          <div style='font-size:28px;font-weight:700;color:#dc2626;'>{ga_data.get('total_users', 'N/A')}</div>
          <div style='font-size:12px;color:#64748b;'>Users</div>
        </td>
        <td style='width:8px;'></td>
        <td style='padding:12px;background:#f8fafc;border-radius:8px;text-align:center;'>
          <div style='font-size:28px;font-weight:700;color:#dc2626;'>{ga_data.get('new_users', 'N/A')}</div>
          <div style='font-size:12px;color:#64748b;'>New Users</div>
        </td>
        <td style='width:8px;'></td>
        <td style='padding:12px;background:#f8fafc;border-radius:8px;text-align:center;'>
          <div style='font-size:28px;font-weight:700;color:#dc2626;'>{ga_data.get('page_views', 'N/A')}</div>
          <div style='font-size:12px;color:#64748b;'>Page Views</div>
        </td>
      </tr>
    </table>
    <p style='margin:4px 0;color:#475569;font-size:13px;'>
      Avg. Session Duration: <strong>{ga_data.get('avg_session_duration', 'N/A')} min</strong> &nbsp;|&nbsp;
      Bounce Rate: <strong>{ga_data.get('bounce_rate', 'N/A')}%</strong>
    </p>
    """ if ga_ok else f"<p style='color:#ef4444;'>⚠ GA4 data unavailable: {ga_data.get('error')}</p>"

    chat_section = f"""
    <table style='width:100%;border-collapse:collapse;margin-bottom:16px;'>
      <tr>
        <td style='padding:12px;background:#f0fdf4;border-radius:8px;text-align:center;'>
          <div style='font-size:28px;font-weight:700;color:#16a34a;'>{chat_data.get('total_sessions', 'N/A')}</div>
          <div style='font-size:12px;color:#64748b;'>Chats Started</div>
        </td>
        <td style='width:8px;'></td>
        <td style='padding:12px;background:#f0fdf4;border-radius:8px;text-align:center;'>
          <div style='font-size:28px;font-weight:700;color:#16a34a;'>{chat_data.get('leads_captured', 'N/A')}</div>
          <div style='font-size:12px;color:#64748b;'>Leads Captured</div>
        </td>
        <td style='width:8px;'></td>
        <td style='padding:12px;background:#f0fdf4;border-radius:8px;text-align:center;'>
          <div style='font-size:28px;font-weight:700;color:#16a34a;'>{chat_data.get('total_messages', 'N/A')}</div>
          <div style='font-size:12px;color:#64748b;'>Total Messages</div>
        </td>
        <td style='width:8px;'></td>
        <td style='padding:12px;background:#f0fdf4;border-radius:8px;text-align:center;'>
          <div style='font-size:28px;font-weight:700;color:#16a34a;'>{chat_data.get('avg_messages_per_session', 'N/A')}</div>
          <div style='font-size:12px;color:#64748b;'>Msgs / Chat</div>
        </td>
      </tr>
    </table>
    {leads_html}
    """ if chat_ok else f"<p style='color:#ef4444;'>⚠ Chatbot data unavailable: {chat_data.get('error')}</p>"

    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style='font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:#1e293b;max-width:600px;margin:0 auto;padding:0;'>

  <!-- Header -->
  <div style='background:linear-gradient(135deg,#0f172a,#1e293b);padding:28px 32px;border-radius:12px 12px 0 0;'>
    <h1 style='color:#fff;margin:0;font-size:20px;font-weight:700;'>📊 Weekly Performance Report</h1>
    <p style='color:#94a3b8;margin:4px 0 0;font-size:14px;'>Optimum Prime Solutions &nbsp;·&nbsp; {week_start} to {week_end}</p>
  </div>

  <!-- Body -->
  <div style='padding:28px 32px;background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;'>

    <!-- Website Traffic -->
    <h2 style='font-size:16px;font-weight:700;color:#0f172a;margin:0 0 12px;border-bottom:2px solid #dc2626;padding-bottom:6px;'>
      🌐 Website Traffic
    </h2>
    {ga_section}

    {"<h3 style='font-size:14px;font-weight:600;color:#475569;margin:16px 0 8px;'>Top Pages</h3><table style='width:100%;border-collapse:collapse;font-size:13px;'>" + top_pages_html + "</table>" if top_pages_html else ""}
    {"<h3 style='font-size:14px;font-weight:600;color:#475569;margin:16px 0 8px;'>Traffic Sources</h3><table style='width:100%;border-collapse:collapse;font-size:13px;'>" + sources_html + "</table>" if sources_html else ""}

    <!-- Chatbot -->
    <h2 style='font-size:16px;font-weight:700;color:#0f172a;margin:24px 0 12px;border-bottom:2px solid #16a34a;padding-bottom:6px;'>
      💬 Chatbot Interactions
    </h2>
    {chat_section}

    {"<h3 style='font-size:14px;font-weight:600;color:#475569;margin:16px 0 8px;'>Top Topics Discussed</h3><table style='width:100%;border-collapse:collapse;font-size:13px;'>" + topics_html + "</table>" if topics_html else ""}

    <!-- Footer -->
    <div style='margin-top:28px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;'>
      <p style='margin:0;'>This report was automatically generated by your website monitoring system.</p>
      <p style='margin:4px 0 0;'>Optimum Prime Solutions · Kenya's Certified TallyPrime Partner</p>
    </div>
  </div>
</body>
</html>
"""


def format_whatsapp_message(ga_data: dict, chat_data: dict, week_start: str, week_end: str) -> str:
    """Format a concise WhatsApp text summary."""
    ga_ok = "error" not in ga_data
    chat_ok = "error" not in chat_data

    lines = [
        f"📊 *Weekly Report — Optimum Prime Solutions*",
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
        lines.append(f"⚠ GA4 data unavailable")

    lines += ["", "💬 *Chatbot Interactions*"]

    if chat_ok:
        lines += [
            f"• Chats Started: *{chat_data.get('total_sessions', 'N/A')}*",
            f"• Leads Captured: *{chat_data.get('leads_captured', 'N/A')}*",
            f"• Total Messages: *{chat_data.get('total_messages', 'N/A')}*",
        ]
        if chat_data.get("top_topics"):
            top = ", ".join(t[0].replace("_", " ") for t in chat_data["top_topics"][:3])
            lines.append(f"• Top Topics: _{top}_")
        if chat_data.get("lead_names"):
            lines.append(f"• Lead Names: _{', '.join(chat_data['lead_names'])}_")
    else:
        lines.append(f"⚠ Chatbot data unavailable")

    lines += ["", "_Auto-generated every Monday 8am_"]
    return "\n".join(lines)


def send_email(subject: str, html_body: str):
    """Send HTML email via Gmail SMTP."""
    if not EMAIL_SENDER or not EMAIL_PASSWORD:
        print("⚠ Email not configured — skipping email delivery")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = EMAIL_SENDER
        msg["To"] = EMAIL_RECIPIENT
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_SENDER, EMAIL_RECIPIENT, msg.as_string())
        print(f"✅ Email sent to {EMAIL_RECIPIENT}")
        return True
    except Exception as e:
        print(f"❌ Email failed: {e}")
        return False


def send_whatsapp(message: str):
    """Send WhatsApp message via CallMeBot API (free)."""
    if not CALLMEBOT_API_KEY:
        print("⚠ WhatsApp (CallMeBot) not configured — skipping WhatsApp delivery")
        return False

    try:
        import requests
        import urllib.parse
        encoded = urllib.parse.quote(message)
        url = f"https://api.callmebot.com/whatsapp.php?phone={WHATSAPP_NUMBER}&text={encoded}&apikey={CALLMEBOT_API_KEY}"
        response = requests.get(url, timeout=15)
        if response.status_code == 200:
            print(f"✅ WhatsApp message sent to +{WHATSAPP_NUMBER}")
            return True
        else:
            print(f"❌ WhatsApp failed: HTTP {response.status_code} — {response.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ WhatsApp failed: {e}")
        return False


def main():
    print("=" * 60)
    print("Optimum Prime Solutions — Weekly Report Generator")
    print("=" * 60)

    # Date range: previous Mon–Sun
    week_start, week_end = get_week_range()
    week_key = week_start.strftime("%Y-W%W")
    start_str = week_start.strftime("%Y-%m-%d")
    end_str = week_end.strftime("%Y-%m-%d")
    week_label_start = week_start.strftime("%d %b %Y")
    week_label_end = week_end.strftime("%d %b %Y")

    print(f"\n📅 Reporting period: {week_label_start} to {week_label_end}")

    # Fetch data
    print("\n🔍 Fetching Google Analytics 4 data...")
    ga_data = fetch_ga4_data(start_str, end_str)
    print(f"   {'✅ OK' if 'error' not in ga_data else '⚠ ' + ga_data.get('error', '')}")

    print("🔍 Fetching Firebase chatbot data...")
    chat_data = fetch_firebase_chatbot_data(week_key)
    print(f"   {'✅ OK' if 'error' not in chat_data else '⚠ ' + chat_data.get('error', '')}")

    # Format reports
    email_html = format_email_report(ga_data, chat_data, week_label_start, week_label_end)
    whatsapp_msg = format_whatsapp_message(ga_data, chat_data, week_label_start, week_label_end)

    # Save a local copy
    report_path = f"/home/ubuntu/weekly-report/report_{start_str}.html"
    with open(report_path, "w") as f:
        f.write(email_html)
    print(f"\n💾 Report saved: {report_path}")

    # Deliver
    print("\n📤 Sending reports...")
    subject = f"Weekly Report — Optimum Prime Solutions ({week_label_start} to {week_label_end})"
    send_email(subject, email_html)
    send_whatsapp(whatsapp_msg)

    print("\n✅ Done!")


if __name__ == "__main__":
    main()
