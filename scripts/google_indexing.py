"""
Google Indexing API Script for Optimum Prime Solutions
Submits URLs to Google for instant indexing using the service account key.
Usage: python3 google_indexing.py [url1 url2 ...]
       If no URLs provided, submits all URLs from sitemap.xml
"""

import sys
import os
import json
import requests
import xml.etree.ElementTree as ET
from google.oauth2 import service_account
from google.auth.transport.requests import Request

# Path to the service account key file (same directory as this script)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ACCOUNT_FILE = os.path.join(SCRIPT_DIR, "google-service-account.json")
SCOPES = ["https://www.googleapis.com/auth/indexing"]
INDEXING_API_URL = "https://indexing.googleapis.com/v3/urlNotifications:publish"
SITEMAP_URL = "https://www.optimumprimesolutions.co.ke/sitemap.xml"

def get_credentials():
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    credentials.refresh(Request())
    return credentials

def submit_url(credentials, url, notification_type="URL_UPDATED"):
    headers = {
        "Authorization": f"Bearer {credentials.token}",
        "Content-Type": "application/json"
    }
    payload = {
        "url": url,
        "type": notification_type
    }
    response = requests.post(INDEXING_API_URL, headers=headers, json=payload)
    return response.status_code, response.json()

def get_urls_from_sitemap():
    """Fetch all URLs from the live sitemap."""
    try:
        response = requests.get(SITEMAP_URL, timeout=10)
        root = ET.fromstring(response.content)
        ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        urls = [loc.text for loc in root.findall(".//sm:loc", ns)]
        # Filter out anchor links — Google Indexing API only accepts full page URLs
        urls = [u for u in urls if "#" not in u]
        return list(set(urls))  # deduplicate
    except Exception as e:
        print(f"Error fetching sitemap: {e}")
        return []

def main():
    print("🔑 Authenticating with Google Indexing API...")
    credentials = get_credentials()
    print(f"✅ Authenticated as: {credentials.service_account_email}\n")

    # Use provided URLs or fall back to sitemap
    if len(sys.argv) > 1:
        urls = sys.argv[1:]
    else:
        print("📄 Fetching URLs from sitemap...")
        urls = get_urls_from_sitemap()
        print(f"Found {len(urls)} URLs to submit\n")

    success = 0
    failed = 0

    for url in urls:
        # Refresh token if needed
        if not credentials.valid:
            credentials.refresh(Request())
        
        status, result = submit_url(credentials, url)
        if status == 200:
            print(f"✅ Submitted: {url}")
            success += 1
        else:
            error_msg = result.get("error", {}).get("message", str(result))
            print(f"❌ Failed: {url} — {error_msg}")
            failed += 1

    print(f"\n📊 Results: {success} submitted successfully, {failed} failed")

if __name__ == "__main__":
    main()
