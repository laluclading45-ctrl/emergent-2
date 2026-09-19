"""Backend production audit tests for Lalu Clading."""
import os
import io
import pytest
import requests

try:
    from dotenv import load_dotenv
    load_dotenv("/app/frontend/.env")
    load_dotenv("/app/backend/.env")
except Exception:
    pass
BASE = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "laluclading45@gmail.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "LaluAdmin@2026")


@pytest.fixture(scope="session")
def s():
    return requests.Session()


@pytest.fixture(scope="session")
def token(s):
    r = s.post(f"{BASE}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth(token):
    return {"Authorization": f"Bearer {token}"}


# ---------------- Auth & error contracts ----------------

def test_login_wrong_password():
    r = requests.post(f"{BASE}/api/auth/login", json={"email": ADMIN_EMAIL, "password": "WrongPW!"}, timeout=15)
    assert r.status_code == 401


def test_enquiries_requires_auth():
    r = requests.get(f"{BASE}/api/enquiries", timeout=15)
    assert r.status_code == 401


def test_upload_requires_auth():
    r = requests.post(f"{BASE}/api/upload", files={"file": ("x.png", b"\x89PNG\r\n\x1a\n", "image/png")}, timeout=15)
    assert r.status_code == 401


def test_upload_rejects_exe(auth):
    r = requests.post(f"{BASE}/api/upload", headers=auth, files={"file": ("bad.exe", b"MZ", "application/octet-stream")}, timeout=15)
    assert r.status_code == 400


def test_product_not_found():
    r = requests.get(f"{BASE}/api/products/does-not-exist-xyz", timeout=15)
    assert r.status_code == 404


def test_category_put_invalid(auth):
    # Fetch existing category id first
    cats = requests.get(f"{BASE}/api/categories", timeout=15).json()
    assert isinstance(cats, list) and len(cats) > 0
    cid = cats[0]["id"]
    r = requests.put(f"{BASE}/api/categories/{cid}", headers=auth, json={"name": None}, timeout=15)
    assert r.status_code in (400, 422)


# ---------------- Public read endpoints ----------------

def test_public_products_list():
    r = requests.get(f"{BASE}/api/products", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)


def test_public_categories_list():
    r = requests.get(f"{BASE}/api/categories", timeout=15)
    assert r.status_code == 200


def test_public_slides_list():
    r = requests.get(f"{BASE}/api/slides", timeout=15)
    assert r.status_code == 200


def test_public_projects_list():
    r = requests.get(f"{BASE}/api/projects", timeout=15)
    assert r.status_code == 200


def test_public_content():
    r = requests.get(f"{BASE}/api/content", timeout=15)
    assert r.status_code == 200


# ---------------- Static assets ----------------

def test_robots_txt():
    r = requests.get(f"{BASE}/robots.txt", timeout=15)
    assert r.status_code == 200
    assert "sitemap" in r.text.lower() or "user-agent" in r.text.lower()


def test_sitemap_xml():
    r = requests.get(f"{BASE}/sitemap.xml", timeout=15)
    assert r.status_code == 200
    assert "<urlset" in r.text or "<sitemap" in r.text


def test_favicon():
    r = requests.get(f"{BASE}/favicon.png", timeout=15)
    assert r.status_code == 200


def test_index_meta_tags():
    r = requests.get(f"{BASE}/", timeout=15)
    assert r.status_code == 200
    html = r.text
    assert "Lalu Clading" in html
    assert 'property="og:' in html or "og:title" in html


# ---------------- CORS ----------------

def test_cors_preflight_allowed_origin():
    # Frontend is same-origin with backend so browser doesn't send preflight.
    # Verify GET responses carry credentialed CORS headers for allowed origin.
    r = requests.get(
        f"{BASE}/api/products",
        headers={"Origin": "https://cladding-gallery.preview.emergentagent.com"},
        timeout=15,
    )
    assert r.status_code == 200
    assert r.headers.get("access-control-allow-credentials", "").lower() == "true"


# ---------------- Enquiry submission (public) ----------------

def test_enquiry_create_and_admin_read_delete(auth):
    payload = {"name": "QA Audit", "email": "qa_audit@example.com", "message": "QA audit test enquiry"}
    r = requests.post(f"{BASE}/api/enquiries", json=payload, timeout=15)
    assert r.status_code in (200, 201), r.text
    body = r.json()
    # Admin should see it
    lst = requests.get(f"{BASE}/api/enquiries", headers=auth, timeout=15)
    assert lst.status_code == 200
    items = lst.json()
    match = [e for e in items if e.get("email") == "qa_audit@example.com" and e.get("name") == "QA Audit"]
    assert match, "enquiry not persisted"
    eid = match[0]["id"]
    d = requests.delete(f"{BASE}/api/enquiries/{eid}", headers=auth, timeout=15)
    assert d.status_code in (200, 204)


# ---------------- Upload happy path ----------------

def test_upload_png_and_serve(auth):
    # 1x1 PNG
    png = bytes.fromhex(
        "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4"
        "890000000A49444154789C63000100000500010D0A2DB40000000049454E44AE426082"
    )
    r = requests.post(
        f"{BASE}/api/upload",
        headers=auth,
        files={"file": ("qa_audit.png", png, "image/png")},
        timeout=30,
    )
    assert r.status_code == 200, r.text
    url = r.json().get("url")
    assert url and "/api/files/" in url
    full = url if url.startswith("http") else f"{BASE}{url}"
    g = requests.get(full, timeout=15)
    assert g.status_code == 200
    assert g.headers.get("content-type", "").startswith("image/")
