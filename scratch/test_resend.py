import os
import json
import urllib.request
import urllib.error

# Load environment variables
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                if k.strip() not in os.environ:
                    os.environ[k.strip()] = v.strip()

resend_key = os.getenv("RESEND_API_KEY")
to_email = os.getenv("DEMO_NOTIFICATION_EMAIL", "chrisyarwood@msn.com")

print("Testing Resend Email Dispatch...")
print("API Key:", resend_key[:10] + "...")
print("Destination Email:", to_email)

payload = json.dumps({
    "from": "onboarding@resend.dev",
    "to": [to_email],
    "subject": "CAIRN ETP Test Email",
    "html": "<p>Testing Resend email dispatch for CAIRN ETP demo request pipeline.</p>"
}).encode("utf-8")

req = urllib.request.Request(
    "https://api.resend.com/emails",
    data=payload,
    headers={
        "Authorization": f"Bearer {resend_key}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    },
    method="POST"
)

try:
    with urllib.request.urlopen(req) as resp:
        body = resp.read().decode("utf-8")
        print("SUCCESS (200/201):", body)
except urllib.error.HTTPError as e:
    err_body = e.read().decode("utf-8")
    print(f"HTTP ERROR ({e.code}):", err_body)
except Exception as e:
    print("EXCEPTION:", str(e))
