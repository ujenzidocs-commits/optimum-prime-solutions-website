#!/usr/bin/env python3
"""
Generate a sample weekly report with realistic placeholder data.
Used when GA4/Firebase credentials are not yet configured.
"""

import datetime
import os

def get_week_range():
    today = datetime.date.today()
    last_monday = today - datetime.timedelta(days=today.weekday() + 7)
    last_sunday = last_monday + datetime.timedelta(days=6)
    return last_monday, last_sunday

week_start, week_end = get_week_range()
week_label_start = week_start.strftime("%d %b %Y")
week_label_end = week_end.strftime("%d %b %Y")
start_str = week_start.strftime("%Y-%m-%d")

# Realistic sample data for a Kenyan SME software company
ga_data = {
    "sessions": 312,
    "total_users": 247,
    "new_users": 189,
    "page_views": 874,
    "avg_session_duration": 2.4,
    "bounce_rate": 48.3,
    "top_pages": [
        {"page": "/", "views": "284"},
        {"page": "/products", "views": "156"},
        {"page": "/features", "views": "121"},
        {"page": "/contact", "views": "98"},
        {"page": "/about", "views": "74"},
    ],
    "traffic_sources": [
        {"source": "Organic Search", "sessions": "118"},
        {"source": "Direct", "sessions": "87"},
        {"source": "Social", "sessions": "54"},
        {"source": "Referral", "sessions": "31"},
        {"source": "Email", "sessions": "22"},
    ],
}

chat_data = {
    "total_sessions": 38,
    "leads_captured": 14,
    "total_messages": 203,
    "avg_messages_per_session": 5.3,
    "top_topics": [
        ("pricing", 18),
        ("tallyprime", 15),
        ("demo", 12),
        ("eos", 8),
        ("cloud", 6),
    ],
    "lead_names": ["James Mwangi", "Sarah Odhiambo", "Peter Kamau", "Grace Njeri"],
}

top_pages_html = ""
for p in ga_data["top_pages"]:
    page = p["page"].replace("/", " / ").strip(" /") or "Home"
    top_pages_html += f"<tr><td style='padding:5px 8px;border-bottom:1px solid #f1f5f9;'>{page}</td><td style='padding:5px 8px;text-align:right;font-weight:600;border-bottom:1px solid #f1f5f9;'>{p['views']}</td></tr>"

sources_html = ""
for s in ga_data["traffic_sources"]:
    sources_html += f"<tr><td style='padding:5px 8px;border-bottom:1px solid #f1f5f9;'>{s['source']}</td><td style='padding:5px 8px;text-align:right;font-weight:600;border-bottom:1px solid #f1f5f9;'>{s['sessions']}</td></tr>"

topics_html = ""
for topic, count in chat_data["top_topics"]:
    topics_html += f"<tr><td style='padding:5px 8px;border-bottom:1px solid #f1f5f9;text-transform:capitalize;'>{topic.replace('_', ' ')}</td><td style='padding:5px 8px;text-align:right;font-weight:600;border-bottom:1px solid #f1f5f9;'>{count}</td></tr>"

lead_names_str = ", ".join(chat_data["lead_names"])

html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Report — Optimum Prime Solutions</title>
</head>
<body style='font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#1e293b;max-width:620px;margin:0 auto;padding:16px;background:#f8fafc;'>

  <!-- Header -->
  <div style='background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:32px;border-radius:12px 12px 0 0;'>
    <div style='display:flex;align-items:center;gap:12px;margin-bottom:8px;'>
      <div style='background:#dc2626;width:4px;height:32px;border-radius:2px;'></div>
      <div>
        <h1 style='color:#fff;margin:0;font-size:20px;font-weight:700;letter-spacing:-0.3px;'>📊 Weekly Performance Report</h1>
        <p style='color:#94a3b8;margin:3px 0 0;font-size:13px;'>Optimum Prime Solutions &nbsp;·&nbsp; {week_label_start} – {week_label_end}</p>
      </div>
    </div>
    <div style='margin-top:16px;padding:10px 14px;background:rgba(251,191,36,0.15);border:1px solid rgba(251,191,36,0.3);border-radius:8px;'>
      <p style='color:#fbbf24;margin:0;font-size:12px;'>⚠ <strong>Sample Report</strong> — This report uses illustrative data. Connect your Google Analytics and Firebase credentials to receive live data.</p>
    </div>
  </div>

  <!-- Body -->
  <div style='padding:28px 32px;background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;'>

    <!-- ── Website Traffic ── -->
    <h2 style='font-size:15px;font-weight:700;color:#0f172a;margin:0 0 14px;display:flex;align-items:center;gap:8px;'>
      <span style='background:#fef2f2;color:#dc2626;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;'>Website Traffic</span>
    </h2>

    <!-- Stats grid -->
    <table style='width:100%;border-collapse:separate;border-spacing:6px;margin-bottom:8px;'>
      <tr>
        <td style='padding:14px;background:#fef2f2;border-radius:8px;text-align:center;border:1px solid #fee2e2;'>
          <div style='font-size:30px;font-weight:800;color:#dc2626;line-height:1;'>{ga_data['sessions']}</div>
          <div style='font-size:11px;color:#64748b;margin-top:4px;font-weight:500;'>Sessions</div>
        </td>
        <td style='padding:14px;background:#f8fafc;border-radius:8px;text-align:center;border:1px solid #e2e8f0;'>
          <div style='font-size:30px;font-weight:800;color:#0f172a;line-height:1;'>{ga_data['total_users']}</div>
          <div style='font-size:11px;color:#64748b;margin-top:4px;font-weight:500;'>Total Users</div>
        </td>
        <td style='padding:14px;background:#f8fafc;border-radius:8px;text-align:center;border:1px solid #e2e8f0;'>
          <div style='font-size:30px;font-weight:800;color:#0f172a;line-height:1;'>{ga_data['new_users']}</div>
          <div style='font-size:11px;color:#64748b;margin-top:4px;font-weight:500;'>New Users</div>
        </td>
        <td style='padding:14px;background:#f8fafc;border-radius:8px;text-align:center;border:1px solid #e2e8f0;'>
          <div style='font-size:30px;font-weight:800;color:#0f172a;line-height:1;'>{ga_data['page_views']}</div>
          <div style='font-size:11px;color:#64748b;margin-top:4px;font-weight:500;'>Page Views</div>
        </td>
      </tr>
    </table>

    <p style='margin:8px 0 20px;color:#64748b;font-size:13px;'>
      Avg. Session Duration: <strong style='color:#0f172a;'>{ga_data['avg_session_duration']} min</strong>
      &nbsp;·&nbsp;
      Bounce Rate: <strong style='color:#0f172a;'>{ga_data['bounce_rate']}%</strong>
    </p>

    <!-- Top Pages & Sources side by side -->
    <table style='width:100%;border-collapse:collapse;margin-bottom:24px;'>
      <tr>
        <td style='width:50%;vertical-align:top;padding-right:12px;'>
          <h3 style='font-size:12px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;'>Top Pages</h3>
          <table style='width:100%;border-collapse:collapse;font-size:13px;'>
            {top_pages_html}
          </table>
        </td>
        <td style='width:50%;vertical-align:top;padding-left:12px;border-left:1px solid #f1f5f9;'>
          <h3 style='font-size:12px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;'>Traffic Sources</h3>
          <table style='width:100%;border-collapse:collapse;font-size:13px;'>
            {sources_html}
          </table>
        </td>
      </tr>
    </table>

    <!-- ── Chatbot Interactions ── -->
    <h2 style='font-size:15px;font-weight:700;color:#0f172a;margin:0 0 14px;display:flex;align-items:center;gap:8px;'>
      <span style='background:#f0fdf4;color:#16a34a;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;'>Chatbot Interactions</span>
    </h2>

    <table style='width:100%;border-collapse:separate;border-spacing:6px;margin-bottom:8px;'>
      <tr>
        <td style='padding:14px;background:#f0fdf4;border-radius:8px;text-align:center;border:1px solid #dcfce7;'>
          <div style='font-size:30px;font-weight:800;color:#16a34a;line-height:1;'>{chat_data['total_sessions']}</div>
          <div style='font-size:11px;color:#64748b;margin-top:4px;font-weight:500;'>Chats Started</div>
        </td>
        <td style='padding:14px;background:#f0fdf4;border-radius:8px;text-align:center;border:1px solid #dcfce7;'>
          <div style='font-size:30px;font-weight:800;color:#16a34a;line-height:1;'>{chat_data['leads_captured']}</div>
          <div style='font-size:11px;color:#64748b;margin-top:4px;font-weight:500;'>Leads Captured</div>
        </td>
        <td style='padding:14px;background:#f8fafc;border-radius:8px;text-align:center;border:1px solid #e2e8f0;'>
          <div style='font-size:30px;font-weight:800;color:#0f172a;line-height:1;'>{chat_data['total_messages']}</div>
          <div style='font-size:11px;color:#64748b;margin-top:4px;font-weight:500;'>Total Messages</div>
        </td>
        <td style='padding:14px;background:#f8fafc;border-radius:8px;text-align:center;border:1px solid #e2e8f0;'>
          <div style='font-size:30px;font-weight:800;color:#0f172a;line-height:1;'>{chat_data['avg_messages_per_session']}</div>
          <div style='font-size:11px;color:#64748b;margin-top:4px;font-weight:500;'>Msgs / Chat</div>
        </td>
      </tr>
    </table>

    <p style='margin:8px 0 16px;color:#64748b;font-size:13px;'>
      Leads this week: <strong style='color:#0f172a;'>{lead_names_str}</strong>
    </p>

    <table style='width:100%;border-collapse:collapse;margin-bottom:24px;'>
      <tr>
        <td style='vertical-align:top;'>
          <h3 style='font-size:12px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;'>Top Topics Discussed</h3>
          <table style='width:100%;border-collapse:collapse;font-size:13px;'>
            {topics_html}
          </table>
        </td>
      </tr>
    </table>

    <!-- Setup Notice -->
    <div style='background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin-bottom:24px;'>
      <h3 style='margin:0 0 8px;font-size:14px;color:#92400e;'>🔧 To Activate Live Data — 3 Quick Steps</h3>
      <ol style='margin:0;padding-left:20px;font-size:13px;color:#78350f;line-height:1.8;'>
        <li><strong>Google Analytics:</strong> Create a service account in Google Cloud Console, share it with your GA4 property, and save the JSON key as <code>ga4-credentials.json</code></li>
        <li><strong>Firebase:</strong> Go to Firebase Console → Project Settings → Service Accounts → Generate new private key → save as <code>firebase-credentials.json</code></li>
        <li><strong>WhatsApp:</strong> Send <em>"I allow callmebot to send me messages"</em> to <strong>+34 644 59 77 58</strong> on WhatsApp to get your free API key</li>
      </ol>
    </div>

    <!-- Footer -->
    <div style='padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;'>
      <p style='margin:0;'>Auto-generated every Monday at 8:00am Nairobi time.</p>
      <p style='margin:4px 0 0;'>Optimum Prime Solutions · Kenya's Certified TallyPrime Partner · Cloud Hosting · EOS® · Biz Analyst</p>
    </div>
  </div>

</body>
</html>"""

report_path = f"/home/ubuntu/weekly-report/sample_report_{start_str}.html"
with open(report_path, "w") as f:
    f.write(html)

print(f"✅ Sample report saved: {report_path}")

# Also save as the latest report
with open("/home/ubuntu/weekly-report/latest_report.html", "w") as f:
    f.write(html)

print("✅ Also saved as: /home/ubuntu/weekly-report/latest_report.html")
