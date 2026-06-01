"""Test signup and login against running API."""
import json
import urllib.error
import urllib.request

BASE = "http://127.0.0.1:8000"
TEST_USER = {
    "username": "testuser99",
    "email": "testuser99@example.com",
    "password": "testpass123",
}


def post(path, data):
    req = urllib.request.Request(
        f"{BASE}{path}",
        data=json.dumps(data).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            return res.status, json.loads(res.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try:
            detail = json.loads(body).get("detail", body)
        except Exception:
            detail = body
        return e.code, detail


def get(path, token):
    req = urllib.request.Request(
        f"{BASE}{path}",
        headers={"Authorization": f"Bearer {token}"},
    )
    with urllib.request.urlopen(req, timeout=10) as res:
        return json.loads(res.read().decode())


if __name__ == "__main__":
    print("1. Signup...")
    code, result = post("/api/auth/signup", TEST_USER)
    print(f"   Status: {code}")
    if code != 201:
        print(f"   FAIL: {result}")
        if code == 400 and "already" in str(result).lower():
            print("   (User exists — trying login instead)")
        else:
            raise SystemExit(1)
    else:
        token = result["access_token"]
        print(f"   OK user id={result['user']['id']} username={result['user']['username']}")

    print("2. Login...")
    code, result = post(
        "/api/auth/login/json",
        {"username_or_email": TEST_USER["username"], "password": TEST_USER["password"]},
    )
    print(f"   Status: {code}")
    if code != 200:
        print(f"   FAIL: {result}")
        raise SystemExit(1)
    token = result["access_token"]
    print(f"   OK token received")

    print("3. Me...")
    me = get("/api/auth/me", token)
    print(f"   OK email={me['email']} role={me['role']}")
    print("\nAll auth tests passed.")
