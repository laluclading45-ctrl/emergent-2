from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import bcrypt
import jwt
import requests
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Any

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File, Depends, Form
from fastapi.responses import Response as FastAPIResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# ---------------- Config ----------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get("JWT_SECRET", "change-me")
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")
APP_NAME = os.environ.get("APP_NAME", "laluclading")

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
_storage_key: Optional[str] = None

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ---------------- Storage ----------------
def init_storage(force: bool = False) -> Optional[str]:
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    if not EMERGENT_KEY:
        logger.warning("EMERGENT_LLM_KEY missing — storage disabled")
        return None
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        resp.raise_for_status()
        _storage_key = resp.json()["storage_key"]
        logger.info("Storage initialized")
        return _storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        return None

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(500, "Storage not initialized")
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data, timeout=120
        )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str) -> tuple:
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# ---------------- Auth helpers ----------------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(401, "User not found")
        if user.get("role") != "admin":
            raise HTTPException(403, "Admin only")
        user.pop("password_hash", None)
        user.pop("_id", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def new_id() -> str:
    return str(uuid.uuid4())

def clean(doc: dict) -> dict:
    if not doc:
        return doc
    doc.pop("_id", None)
    doc.pop("password_hash", None)
    return doc

# ---------------- Models ----------------
class LoginReq(BaseModel):
    email: EmailStr
    password: str

class CategoryIn(BaseModel):
    name: str
    slug: Optional[str] = None
    subtitle: Optional[str] = ""
    description: Optional[str] = ""
    image_url: Optional[str] = ""
    order: int = 0
    enabled: bool = True

class ProductIn(BaseModel):
    name: str
    category_id: str
    short_description: Optional[str] = ""
    full_description: Optional[str] = ""
    main_image: Optional[str] = ""
    gallery: List[str] = []
    model_3d_url: Optional[str] = ""
    features: List[str] = []
    applications: List[str] = []
    material: Optional[str] = ""
    finish: Optional[str] = ""
    colour: Optional[str] = ""
    dimensions: Optional[str] = ""
    specifications: List[dict] = []  # [{key, value}]
    brochure_url: Optional[str] = ""
    featured: bool = False
    published: bool = True
    order: int = 0

class SlideIn(BaseModel):
    image_url: str
    heading: str
    subheading: Optional[str] = ""
    button_text: Optional[str] = ""
    button_link: Optional[str] = ""
    enabled: bool = True
    order: int = 0

class ProjectIn(BaseModel):
    title: str
    description: Optional[str] = ""
    category_id: Optional[str] = ""
    cover_image: Optional[str] = ""
    images: List[str] = []
    published: bool = True
    order: int = 0

class CatalogueIn(BaseModel):
    title: str
    description: Optional[str] = ""
    pdf_url: str
    published: bool = True
    order: int = 0

class ContentIn(BaseModel):
    key: str
    value: Any

class EnquiryIn(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    firm: Optional[str] = ""
    project_type: Optional[str] = ""
    area: Optional[str] = ""
    message: str

# ---------------- Auth routes ----------------
@api_router.post("/auth/login")
async def login(body: LoginReq, response: Response):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    token = create_access_token(user["id"], email)
    response.set_cookie("access_token", token, httponly=True, secure=True, samesite="none", max_age=7*24*3600, path="/")
    return {"id": user["id"], "email": email, "role": user.get("role", "admin"), "name": user.get("name", "Admin"), "token": token}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}

@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_admin)):
    return user

# ---------------- File upload ----------------
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), user: dict = Depends(get_current_admin)):
    ext = (file.filename or "bin").rsplit(".", 1)[-1].lower()
    allowed = {"jpg", "jpeg", "png", "webp", "gif", "pdf", "glb", "gltf"}
    if ext not in allowed:
        raise HTTPException(400, f"File type .{ext} not allowed")
    content = await file.read()
    if len(content) > 25 * 1024 * 1024:
        raise HTTPException(400, "File too large (>25MB)")
    path = f"{APP_NAME}/uploads/{new_id()}.{ext}"
    ct = file.content_type or ("application/pdf" if ext == "pdf" else f"image/{ext}")
    result = put_object(path, content, ct)
    file_id = new_id()
    await db.media.insert_one({
        "id": file_id,
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": ct,
        "size": result.get("size", len(content)),
        "kind": "pdf" if ext == "pdf" else ("model" if ext in ("glb", "gltf") else "image"),
        "created_at": now_iso(),
        "is_deleted": False,
    })
    return {
        "id": file_id,
        "url": f"/api/files/{result['path']}",
        "storage_path": result["path"],
        "kind": "pdf" if ext == "pdf" else ("model" if ext in ("glb", "gltf") else "image"),
        "original_filename": file.filename,
    }

@api_router.get("/files/{path:path}")
async def get_file(path: str):
    record = await db.media.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(404, "File not found")
    data, content_type = get_object(path)
    return FastAPIResponse(content=data, media_type=record.get("content_type", content_type))

@api_router.get("/media")
async def list_media(user: dict = Depends(get_current_admin)):
    items = await db.media.find({"is_deleted": False}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for it in items:
        it["url"] = f"/api/files/{it['storage_path']}"
    return items

@api_router.delete("/media/{file_id}")
async def delete_media(file_id: str, user: dict = Depends(get_current_admin)):
    await db.media.update_one({"id": file_id}, {"$set": {"is_deleted": True}})
    return {"ok": True}

# ---------------- Categories ----------------
def slugify(s: str) -> str:
    return "".join(c if c.isalnum() else "-" for c in s.lower()).strip("-")

@api_router.get("/categories")
async def list_categories(all: bool = False):
    q = {} if all else {"enabled": True}
    items = await db.categories.find(q, {"_id": 0}).sort("order", 1).to_list(500)
    return items

@api_router.post("/categories")
async def create_category(body: CategoryIn, user: dict = Depends(get_current_admin)):
    doc = body.model_dump()
    doc["id"] = new_id()
    doc["slug"] = doc.get("slug") or slugify(doc["name"])
    doc["created_at"] = now_iso()
    await db.categories.insert_one(doc)
    return clean(doc)

@api_router.put("/categories/{cid}")
async def update_category(cid: str, body: CategoryIn, user: dict = Depends(get_current_admin)):
    doc = body.model_dump()
    doc["slug"] = doc.get("slug") or slugify(doc["name"])
    await db.categories.update_one({"id": cid}, {"$set": doc})
    updated = await db.categories.find_one({"id": cid}, {"_id": 0})
    return updated

@api_router.delete("/categories/{cid}")
async def delete_category(cid: str, user: dict = Depends(get_current_admin)):
    await db.categories.delete_one({"id": cid})
    return {"ok": True}

# ---------------- Products ----------------
@api_router.get("/products")
async def list_products(category: Optional[str] = None, featured: Optional[bool] = None, all: bool = False):
    q = {} if all else {"published": True}
    if category:
        cat = await db.categories.find_one({"$or": [{"id": category}, {"slug": category}]})
        if cat:
            q["category_id"] = cat["id"]
    if featured is not None:
        q["featured"] = featured
    items = await db.products.find(q, {"_id": 0}).sort("order", 1).to_list(1000)
    return items

@api_router.get("/products/{pid}")
async def get_product(pid: str):
    p = await db.products.find_one({"id": pid}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Not found")
    return p

@api_router.post("/products")
async def create_product(body: ProductIn, user: dict = Depends(get_current_admin)):
    doc = body.model_dump()
    doc["id"] = new_id()
    doc["created_at"] = now_iso()
    await db.products.insert_one(doc)
    return clean(doc)

@api_router.put("/products/{pid}")
async def update_product(pid: str, body: ProductIn, user: dict = Depends(get_current_admin)):
    await db.products.update_one({"id": pid}, {"$set": body.model_dump()})
    return await db.products.find_one({"id": pid}, {"_id": 0})

@api_router.post("/products/{pid}/duplicate")
async def duplicate_product(pid: str, user: dict = Depends(get_current_admin)):
    p = await db.products.find_one({"id": pid}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Not found")
    p["id"] = new_id()
    p["name"] = p["name"] + " (Copy)"
    p["published"] = False
    p["created_at"] = now_iso()
    await db.products.insert_one(p)
    return clean(p)

@api_router.delete("/products/{pid}")
async def delete_product(pid: str, user: dict = Depends(get_current_admin)):
    await db.products.delete_one({"id": pid})
    return {"ok": True}

# ---------------- Slides ----------------
@api_router.get("/slides")
async def list_slides(all: bool = False):
    q = {} if all else {"enabled": True}
    return await db.slides.find(q, {"_id": 0}).sort("order", 1).to_list(100)

@api_router.post("/slides")
async def create_slide(body: SlideIn, user: dict = Depends(get_current_admin)):
    doc = body.model_dump()
    doc["id"] = new_id()
    doc["created_at"] = now_iso()
    await db.slides.insert_one(doc)
    return clean(doc)

@api_router.put("/slides/{sid}")
async def update_slide(sid: str, body: SlideIn, user: dict = Depends(get_current_admin)):
    await db.slides.update_one({"id": sid}, {"$set": body.model_dump()})
    return await db.slides.find_one({"id": sid}, {"_id": 0})

@api_router.delete("/slides/{sid}")
async def delete_slide(sid: str, user: dict = Depends(get_current_admin)):
    await db.slides.delete_one({"id": sid})
    return {"ok": True}

# ---------------- Projects ----------------
@api_router.get("/projects")
async def list_projects(all: bool = False):
    q = {} if all else {"published": True}
    return await db.projects.find(q, {"_id": 0}).sort("order", 1).to_list(500)

@api_router.get("/projects/{pid}")
async def get_project(pid: str):
    p = await db.projects.find_one({"id": pid}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Not found")
    return p

@api_router.post("/projects")
async def create_project(body: ProjectIn, user: dict = Depends(get_current_admin)):
    doc = body.model_dump()
    doc["id"] = new_id()
    doc["created_at"] = now_iso()
    await db.projects.insert_one(doc)
    return clean(doc)

@api_router.put("/projects/{pid}")
async def update_project(pid: str, body: ProjectIn, user: dict = Depends(get_current_admin)):
    await db.projects.update_one({"id": pid}, {"$set": body.model_dump()})
    return await db.projects.find_one({"id": pid}, {"_id": 0})

@api_router.delete("/projects/{pid}")
async def delete_project(pid: str, user: dict = Depends(get_current_admin)):
    await db.projects.delete_one({"id": pid})
    return {"ok": True}

# ---------------- Catalogues (PDF brochures) ----------------
@api_router.get("/catalogues")
async def list_catalogues(all: bool = False):
    q = {} if all else {"published": True}
    return await db.catalogues.find(q, {"_id": 0}).sort("order", 1).to_list(200)

@api_router.post("/catalogues")
async def create_catalogue(body: CatalogueIn, user: dict = Depends(get_current_admin)):
    doc = body.model_dump()
    doc["id"] = new_id()
    doc["created_at"] = now_iso()
    await db.catalogues.insert_one(doc)
    return clean(doc)

@api_router.put("/catalogues/{cid}")
async def update_catalogue(cid: str, body: CatalogueIn, user: dict = Depends(get_current_admin)):
    await db.catalogues.update_one({"id": cid}, {"$set": body.model_dump()})
    return await db.catalogues.find_one({"id": cid}, {"_id": 0})

@api_router.delete("/catalogues/{cid}")
async def delete_catalogue(cid: str, user: dict = Depends(get_current_admin)):
    await db.catalogues.delete_one({"id": cid})
    return {"ok": True}

# ---------------- Website Content ----------------
@api_router.get("/content")
async def get_content():
    items = await db.content.find({}, {"_id": 0}).to_list(200)
    return {i["key"]: i["value"] for i in items}

@api_router.put("/content")
async def update_content(body: dict, user: dict = Depends(get_current_admin)):
    for k, v in body.items():
        await db.content.update_one({"key": k}, {"$set": {"key": k, "value": v}}, upsert=True)
    return {"ok": True}

# ---------------- Enquiries ----------------
@api_router.post("/enquiries")
async def create_enquiry(body: EnquiryIn):
    doc = body.model_dump()
    doc["id"] = new_id()
    doc["created_at"] = now_iso()
    doc["read"] = False
    await db.enquiries.insert_one(doc)
    return {"ok": True, "id": doc["id"]}

@api_router.get("/enquiries")
async def list_enquiries(user: dict = Depends(get_current_admin)):
    return await db.enquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

@api_router.delete("/enquiries/{eid}")
async def delete_enquiry(eid: str, user: dict = Depends(get_current_admin)):
    await db.enquiries.delete_one({"id": eid})
    return {"ok": True}

# ---------------- Dashboard stats ----------------
@api_router.get("/admin/stats")
async def stats(user: dict = Depends(get_current_admin)):
    return {
        "products": await db.products.count_documents({}),
        "categories": await db.categories.count_documents({}),
        "projects": await db.projects.count_documents({}),
        "slides": await db.slides.count_documents({}),
        "catalogues": await db.catalogues.count_documents({}),
        "enquiries": await db.enquiries.count_documents({}),
        "media": await db.media.count_documents({"is_deleted": False}),
    }

# ---------------- Seed ----------------
async def seed_admin():
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if not existing:
        await db.users.insert_one({
            "id": new_id(),
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "Lalu Clading Admin",
            "role": "admin",
            "created_at": now_iso(),
        })
        logger.info(f"Admin seeded: {ADMIN_EMAIL}")
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one({"email": ADMIN_EMAIL}, {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}})
        logger.info("Admin password updated from .env")

SEED_CATEGORIES = [
    {"name": "HPL Cladding", "slug": "hpl-cladding", "subtitle": "High-Pressure Exterior Grade Laminates", "description": "UV-shielded, EN 438 certified compact laminates for architectural facades.", "image_url": "https://images.unsplash.com/photo-1615406020658-6c4b805f1f30?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600", "order": 1},
    {"name": "WPC Panels", "slug": "wpc-panels", "subtitle": "Wood-Polymer Composite Fluted & Louver Panels", "description": "Weatherproof composite panels with deep flute profiles and zero rot.", "image_url": "https://images.unsplash.com/photo-1675528030748-d463ab87e8d5?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600", "order": 2},
    {"name": "Exterior Cladding", "slug": "exterior-cladding", "subtitle": "Rear-Ventilated Facade Envelopes", "description": "Rainscreen systems engineered for high windload and thermal comfort.", "image_url": "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600", "order": 3},
    {"name": "Interior Panels", "slug": "interior-panels", "subtitle": "Boiserie, Metallic Sheens & Feature Walls", "description": "Scratch-resistant Class-A architectural interior surfaces.", "image_url": "https://images.unsplash.com/photo-1675528030415-dc82908eeb73?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600", "order": 4},
    {"name": "Decorative Solutions", "slug": "decorative-solutions", "subtitle": "CNC Screens, Mashrabiya & Accent Fins", "description": "Bespoke perforated screens in anodized champagne & bronze.", "image_url": "https://images.unsplash.com/photo-1532680678473-a16f2cda8e43?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600", "order": 5},
    {"name": "Other Products", "slug": "other-products", "subtitle": "Soffits, Column Covers, Parapets & Trims", "description": "Architectural specialty profiles and transition components.", "image_url": "https://images.unsplash.com/photo-1516730670158-8c52cb740fcf?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600", "order": 6},
]

SEED_PRODUCTS = [
    # HPL
    {"name": "Corten Rust HPL 8mm", "cat": "hpl-cladding", "img": "https://images.unsplash.com/photo-1615406020658-6c4b805f1f30?w=1400&q=85", "short": "Weathered steel tone compact laminate with UV shield.", "material": "HPL Compact", "finish": "Corten Rust Matte", "colour": "Corten Bronze", "dimensions": "2440 x 1220 x 8mm", "featured": True},
    {"name": "Smoked Oak HPL 6mm", "cat": "hpl-cladding", "img": "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=1400&q=85", "short": "Deep woodgrain HPL, EN 438 Class 1 fire rated.", "material": "HPL", "finish": "Woodgrain", "colour": "Smoked Oak", "dimensions": "3050 x 1300 x 6mm"},
    {"name": "Titanium Grey HPL 10mm", "cat": "hpl-cladding", "img": "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1400&q=85", "short": "Metallic architectural HPL for premium envelopes.", "material": "HPL", "finish": "Metallic Satin", "colour": "Titanium Grey", "dimensions": "2440 x 1220 x 10mm", "featured": True},
    # WPC
    {"name": "Deep Flute WPC 40mm", "cat": "wpc-panels", "img": "https://images.unsplash.com/photo-1675528030748-d463ab87e8d5?w=1400&q=85", "short": "Deep 40mm fluted WPC louver for architectural depth.", "material": "WPC Composite", "finish": "Woodgrain Matte", "colour": "Teak Natural", "dimensions": "2900 x 155 x 40mm", "featured": True},
    {"name": "Slim Louver WPC 20mm", "cat": "wpc-panels", "img": "https://images.unsplash.com/photo-1615873968403-89e068629265?w=1400&q=85", "short": "Slim architectural louver profile for interior feature walls.", "material": "WPC", "finish": "Brushed", "colour": "Walnut", "dimensions": "2900 x 100 x 20mm"},
    # Exterior
    {"name": "Rainscreen Facade Panel", "cat": "exterior-cladding", "img": "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=1400&q=85", "short": "Rear-ventilated rainscreen with concealed fastener system.", "material": "Aluminium Composite", "finish": "PVDF Coated", "colour": "Anthracite", "dimensions": "Custom bespoke", "featured": True},
    {"name": "Bronze Angled Facade Cassette", "cat": "exterior-cladding", "img": "https://images.unsplash.com/photo-1532680678473-a16f2cda8e43?w=1400&q=85", "short": "Faceted bronze cassette panels with 45° edge folds.", "material": "Anodized Aluminium", "finish": "Anodized Bronze", "colour": "Brushed Bronze", "dimensions": "Custom"},
    # Interior
    {"name": "Boiserie Wall Panel", "cat": "interior-panels", "img": "https://images.unsplash.com/photo-1675528030415-dc82908eeb73?w=1400&q=85", "short": "Fluted boiserie panel for luxury interior walls.", "material": "MDF Composite", "finish": "Veneered Matte", "colour": "Champagne", "dimensions": "2400 x 600 x 18mm"},
    {"name": "Carrara Vein Interior Panel", "cat": "interior-panels", "img": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=85", "short": "High-definition marble vein interior architectural panel.", "material": "HPL", "finish": "High-gloss", "colour": "Carrara White", "dimensions": "2440 x 1220 x 4mm"},
    # Decorative
    {"name": "Parametric CNC Screen", "cat": "decorative-solutions", "img": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&q=85", "short": "Bespoke parametric perforated aluminium screen.", "material": "Aluminium", "finish": "Anodized", "colour": "Champagne Gold", "dimensions": "Bespoke", "featured": True},
    {"name": "Mashrabiya Bronze Screen", "cat": "decorative-solutions", "img": "https://images.unsplash.com/photo-1615529162924-f8605388461d?w=1400&q=85", "short": "Islamic geometric mashrabiya pattern in bronze.", "material": "Metal", "finish": "Brushed Bronze", "colour": "Bronze", "dimensions": "Custom"},
    # Other
    {"name": "Column Cover Profile", "cat": "other-products", "img": "https://images.unsplash.com/photo-1516730670158-8c52cb740fcf?w=1400&q=85", "short": "Architectural column cover with concealed fixings.", "material": "Aluminium", "finish": "Powder Coated", "colour": "Charcoal", "dimensions": "Custom"},
]

SEED_PROJECTS = [
    {"title": "The Obsidian Tower — Bengaluru", "description": "Rear-ventilated HPL facade envelope for a 24-storey corporate tower.", "cover_image": "https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace?w=1600&q=85", "images": ["https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=1600&q=85", "https://images.unsplash.com/photo-1615406020658-6c4b805f1f30?w=1600&q=85"], "order": 1},
    {"title": "Villa Terracotta — Alibaug", "description": "WPC deep-flute cladding across a 12,000 sq.ft. private residence.", "cover_image": "https://images.unsplash.com/photo-1516730670158-8c52cb740fcf?w=1600&q=85", "images": ["https://images.unsplash.com/photo-1675528030748-d463ab87e8d5?w=1600&q=85"], "order": 2},
    {"title": "Bronze Penthouse — Mumbai", "description": "Interior boiserie & anodized bronze mashrabiya feature walls.", "cover_image": "https://images.unsplash.com/photo-1675528030415-dc82908eeb73?w=1600&q=85", "images": ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=85"], "order": 3},
    {"title": "Boutique Hotel Facade — Goa", "description": "Parametric CNC screen facade with integrated sun-shading.", "cover_image": "https://images.unsplash.com/photo-1532680678473-a16f2cda8e43?w=1600&q=85", "images": ["https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=85"], "order": 4},
]

SEED_SLIDES = [
    {"image_url": "https://images.unsplash.com/photo-1615406020658-6c4b805f1f30?w=2400&q=90", "heading": "Architectural Skins of Distinction", "subheading": "Premium Cladding Solutions for Modern Spaces", "button_text": "Explore Products", "button_link": "/products", "order": 1, "enabled": True},
    {"image_url": "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=2400&q=90", "heading": "Swiss & Italian Inspired Facades", "subheading": "Rear-ventilated envelopes engineered for the Indian climate.", "button_text": "View Projects", "button_link": "/projects", "order": 2, "enabled": True},
    {"image_url": "https://images.unsplash.com/photo-1675528030748-d463ab87e8d5?w=2400&q=90", "heading": "Bespoke Interior Panelling", "subheading": "Boiserie, fluted louvers and metallic sheens for luxury interiors.", "button_text": "Contact Us", "button_link": "/contact", "order": 3, "enabled": True},
]

SEED_CONTENT = {
    "about": "Lalu Clading is a premium architectural cladding house crafting bespoke facade & interior surface systems for luxury residences, corporate envelopes and boutique hospitality projects across India. Every panel is engineered with European precision — from concealed substructures to weathered-steel finishes — creating architecture that ages with grace.",
    "why_choose_us": [
        {"title": "Precision Substructure", "text": "Concealed aluminium sub-frames engineered for zero-visible fasteners."},
        {"title": "UV & Climate Endurance", "text": "EN 438 certified surfaces with a 10-year fade guarantee."},
        {"title": "Bespoke Perforation", "text": "Parametric CNC screens designed to your architectural language."},
        {"title": "Zero-Maintenance", "text": "Weatherproof composite systems requiring no yearly upkeep."},
    ],
    "applications": [
        {"title": "Luxury Villas", "image": "https://images.unsplash.com/photo-1516730670158-8c52cb740fcf?w=1200&q=85"},
        {"title": "Corporate Envelopes", "image": "https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace?w=1200&q=85"},
        {"title": "Boutique Hospitality", "image": "https://images.unsplash.com/photo-1532680678473-a16f2cda8e43?w=1200&q=85"},
        {"title": "Penthouse Interiors", "image": "https://images.unsplash.com/photo-1675528030415-dc82908eeb73?w=1200&q=85"},
    ],
    "contact": {
        "phone": "8088791219",
        "whatsapp": "918088791219",
        "email": "laluclading45@gmail.com",
        "website": "laluclading.com",
        "address": "Bengaluru & Mumbai, India",
    },
    "seo_title": "Lalu Clading — Premium Architectural Cladding Solutions",
    "seo_description": "Luxury HPL, WPC & architectural facade cladding for modern spaces. Explore products, projects and download our catalogue.",
    "hero_title": "Premium Cladding Solutions for Modern Spaces",
    "hero_subtitle": "Swiss & Italian inspired architectural facades engineered for the modern era.",
    "footer_tagline": "Architectural Skins of Distinction",
}

async def seed_data():
    if await db.categories.count_documents({}) == 0:
        cats = []
        for c in SEED_CATEGORIES:
            doc = {**c, "id": new_id(), "enabled": True, "created_at": now_iso()}
            cats.append(doc)
        await db.categories.insert_many(cats)
        logger.info(f"Seeded {len(cats)} categories")

    if await db.products.count_documents({}) == 0:
        cats = await db.categories.find({}).to_list(50)
        slug_map = {c["slug"]: c["id"] for c in cats}
        prods = []
        for i, p in enumerate(SEED_PRODUCTS):
            prods.append({
                "id": new_id(),
                "name": p["name"],
                "category_id": slug_map.get(p["cat"], ""),
                "short_description": p["short"],
                "full_description": p["short"] + " Precision-engineered for architectural applications with concealed fastener substructures and a 10-year fade guarantee.",
                "main_image": p["img"],
                "gallery": [p["img"]],
                "model_3d_url": "",
                "features": ["EN 438 Certified", "UV Shield", "Concealed Fastener System", "10-Year Fade Guarantee"],
                "applications": ["Villa Facades", "Corporate Envelopes", "Hospitality Interiors"],
                "material": p["material"],
                "finish": p["finish"],
                "colour": p["colour"],
                "dimensions": p["dimensions"],
                "specifications": [
                    {"key": "Thickness", "value": p["dimensions"].split("x")[-1].strip() if "x" in p["dimensions"] else "—"},
                    {"key": "Fire Rating", "value": "EN 438 Class 1"},
                    {"key": "UV Resistance", "value": "10-Year Guarantee"},
                    {"key": "Warranty", "value": "10 Years"},
                ],
                "brochure_url": "",
                "featured": p.get("featured", False),
                "published": True,
                "order": i,
                "created_at": now_iso(),
            })
        await db.products.insert_many(prods)
        logger.info(f"Seeded {len(prods)} products")

    if await db.slides.count_documents({}) == 0:
        slides = [{**s, "id": new_id(), "created_at": now_iso()} for s in SEED_SLIDES]
        await db.slides.insert_many(slides)

    if await db.projects.count_documents({}) == 0:
        projs = [{**p, "id": new_id(), "published": True, "category_id": "", "created_at": now_iso()} for p in SEED_PROJECTS]
        await db.projects.insert_many(projs)

    if await db.content.count_documents({}) == 0:
        for k, v in SEED_CONTENT.items():
            await db.content.insert_one({"key": k, "value": v})

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("category_id")
    await db.categories.create_index("slug", unique=True)
    init_storage()
    await seed_admin()
    await seed_data()
    logger.info("Lalu Clading backend ready")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        "https://cladding-gallery.preview.emergentagent.com",
        "http://localhost:3000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown():
    client.close()
