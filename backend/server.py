from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os, logging, uuid, jwt, bcrypt
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL', 'mongodb://127.0.0.1:27017')
client = AsyncIOMotorClient(mongo_url)
db_name = os.environ.get('DB_NAME', 'junior_journalist')
db = client[db_name]

app = FastAPI(title="Junior Journalist API", version="1.0.0")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

JWT_SECRET = os.environ.get("JWT_SECRET", "jj_secret_key_2025_young_gazette")
JWT_ALGO = "HS256"

@app.get("/")
async def root_health():
    return {"status": "ok", "app": "Junior Journalist API", "version": "1.0.0"}

@api_router.get("/health")
async def api_health():
    return {"status": "ok", "app": "Junior Journalist API"}

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ─── Helpers ───
def now_iso():
    return datetime.now(timezone.utc).isoformat()

def make_id():
    return str(uuid.uuid4())

def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def check_pw(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode(), hashed.encode())

def create_token(user_id: str, role: str):
    return jwt.encode({"sub": user_id, "role": role, "exp": datetime.now(timezone.utc) + timedelta(days=30)}, JWT_SECRET, algorithm=JWT_ALGO)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(401, "User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except Exception:
        raise HTTPException(401, "Invalid token")

async def optional_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
        return await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
    except Exception:
        return None

async def add_points(user_id: str, points: int, reason: str):
    await db.users.update_one({"id": user_id}, {"$inc": {"lifetime_xp": points, "redeemable_points": points}})
    await db.point_logs.insert_one({"id": make_id(), "user_id": user_id, "points": points, "reason": reason, "created_at": now_iso()})
    await check_badges(user_id)

async def check_badges(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        return
    current_badges = user.get("badges", [])
    sub_count = await db.submissions.count_documents({"author_id": user_id, "status": "published"})
    event_count = await db.events.count_documents({"creator_id": user_id})
    xp = user.get("lifetime_xp", 0)
    new_badges = []
    badge_map = [
        ("wordsmith", sub_count >= 1, "Published your first article"),
        ("storyteller", sub_count >= 5, "Published 5 articles"),
        ("prolific", sub_count >= 10, "Published 10 articles"),
        ("organizer", event_count >= 1, "Led your first event"),
        ("veteran_leader", event_count >= 5, "Led 5 events"),
        ("rising_star", xp >= 50, "Earned 50 XP"),
        ("influencer", xp >= 200, "Earned 200 XP"),
        ("legend", xp >= 500, "Earned 500 XP"),
    ]
    if len(user.get("role_tags", [])) >= 3:
        badge_map.append(("all_rounder", True, "Active in 3+ roles"))
    for badge_id, condition, _ in badge_map:
        if condition and badge_id not in current_badges:
            new_badges.append(badge_id)
    if new_badges:
        await db.users.update_one({"id": user_id}, {"$push": {"badges": {"$each": new_badges}}})

# ─── Pydantic Models ───
class RegisterInput(BaseModel):
    name: str
    email: str
    password: str
    city: Optional[str] = ""
    school: Optional[str] = ""

class LoginInput(BaseModel):
    email: str
    password: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    city: Optional[str] = None
    school: Optional[str] = None
    avatar_url: Optional[str] = None
    role_tags: Optional[List[str]] = None

class SubmissionCreate(BaseModel):
    title: str
    content: str
    type: str = "article"
    category: str = "opinion"
    thumbnail_url: Optional[str] = ""
    co_authors: Optional[List[str]] = []

class EventCreate(BaseModel):
    title: str
    description: str
    type: str = "workshop"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    open_roles: Optional[List[str]] = []
    max_team: Optional[int] = 10

class TaskCreate(BaseModel):
    event_id: str
    title: str
    description: Optional[str] = ""
    assignee_id: Optional[str] = None
    priority: Optional[str] = "medium"
    due_date: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    assignee_id: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None

class OpportunityCreate(BaseModel):
    title: str
    description: str
    type: str = "internship"
    organization: Optional[str] = ""
    deadline: Optional[str] = None
    link: Optional[str] = ""

class ResourceCreate(BaseModel):
    title: str
    description: str
    type: str = "guide"
    category: str = "writing"
    content_url: Optional[str] = ""

# ─── AUTH ───
@api_router.post("/auth/register")
async def register(inp: RegisterInput):
    existing = await db.users.find_one({"email": inp.email.lower()}, {"_id": 0})
    if existing:
        raise HTTPException(400, "Email already registered")
    user = {
        "id": make_id(), "email": inp.email.lower(), "password_hash": hash_pw(inp.password),
        "name": inp.name, "bio": "", "city": inp.city or "", "school": inp.school or "",
        "avatar_url": "", "role_tags": [], "role": "member",
        "lifetime_xp": 0, "redeemable_points": 0, "badges": [],
        "joined_at": now_iso()
    }
    await db.users.insert_one(user)
    token = create_token(user["id"], user["role"])
    return {"token": token, "user": {k: v for k, v in user.items() if k not in ("password_hash", "_id")}}

@api_router.post("/auth/login")
async def login(inp: LoginInput):
    user = await db.users.find_one({"email": inp.email.lower()})
    if not user or not check_pw(inp.password, user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    token = create_token(user["id"], user["role"])
    safe = {k: v for k, v in user.items() if k not in ("password_hash", "_id")}
    return {"token": token, "user": safe}

@api_router.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    return {k: v for k, v in user.items() if k not in ("password_hash",)}

@api_router.put("/auth/profile")
async def update_profile(inp: ProfileUpdate, user=Depends(get_current_user)):
    updates = {k: v for k, v in inp.model_dump().items() if v is not None}
    if updates:
        await db.users.update_one({"id": user["id"]}, {"$set": updates})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return updated

# ─── SUBMISSIONS ───
@api_router.post("/submissions")
async def create_submission(inp: SubmissionCreate, user=Depends(get_current_user)):
    sub = {
        "id": make_id(), "author_id": user["id"], "author_name": user["name"],
        "co_authors": inp.co_authors or [], "title": inp.title, "content": inp.content,
        "type": inp.type, "category": inp.category, "thumbnail_url": inp.thumbnail_url or "",
        "status": "pending", "views": 0, "reactions": {"fire": 0, "heart": 0, "clap": 0, "mind_blown": 0},
        "created_at": now_iso(), "published_at": None
    }
    await db.submissions.insert_one(sub)
    await add_points(user["id"], 5, f"Submitted: {inp.title}")
    tag = {"article": "writer", "photo_essay": "photographer", "field_report": "reporter", "video": "videographer"}.get(inp.type, "writer")
    if tag not in user.get("role_tags", []):
        await db.users.update_one({"id": user["id"]}, {"$addToSet": {"role_tags": tag}})
    return {k: v for k, v in sub.items() if k != "_id"}

@api_router.get("/submissions")
async def list_submissions(status: Optional[str] = None, type: Optional[str] = None, category: Optional[str] = None, author_id: Optional[str] = None, limit: int = 50, skip: int = 0):
    query = {}
    if status:
        query["status"] = status
    if type:
        query["type"] = type
    if category:
        query["category"] = category
    if author_id:
        query["author_id"] = author_id
    subs = await db.submissions.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return subs

@api_router.get("/submissions/{sub_id}")
async def get_submission(sub_id: str):
    sub = await db.submissions.find_one({"id": sub_id}, {"_id": 0})
    if not sub:
        raise HTTPException(404, "Not found")
    await db.submissions.update_one({"id": sub_id}, {"$inc": {"views": 1}})
    sub["views"] = sub.get("views", 0) + 1
    return sub

@api_router.put("/submissions/{sub_id}/status")
async def update_submission_status(sub_id: str, status: str = Query(...), user=Depends(get_current_user)):
    if user["role"] not in ("admin", "manager"):
        raise HTTPException(403, "Not authorized")
    sub = await db.submissions.find_one({"id": sub_id}, {"_id": 0})
    if not sub:
        raise HTTPException(404, "Not found")
    update = {"status": status}
    if status == "published":
        update["published_at"] = now_iso()
    await db.submissions.update_one({"id": sub_id}, {"$set": update})
    if status == "published":
        await add_points(sub["author_id"], 10, f"Published: {sub['title']}")
    return {"message": f"Status updated to {status}"}

@api_router.post("/submissions/{sub_id}/react")
async def react_submission(sub_id: str, reaction: str = Query(...), user=Depends(get_current_user)):
    valid = ["fire", "heart", "clap", "mind_blown"]
    if reaction not in valid:
        raise HTTPException(400, f"Invalid reaction. Use: {valid}")
    await db.submissions.update_one({"id": sub_id}, {"$inc": {f"reactions.{reaction}": 1}})
    return {"message": "Reacted"}

# ─── EVENTS ───
@api_router.post("/events")
async def create_event(inp: EventCreate, user=Depends(get_current_user)):
    event = {
        "id": make_id(), "title": inp.title, "description": inp.description,
        "creator_id": user["id"], "creator_name": user["name"],
        "type": inp.type, "status": "active",
        "start_date": inp.start_date, "end_date": inp.end_date,
        "open_roles": inp.open_roles or [], "max_team": inp.max_team or 10,
        "team_members": [{"user_id": user["id"], "name": user["name"], "role": "leader"}],
        "event_leaders": [user["id"]],
        "join_requests": [],
        "created_at": now_iso()
    }
    await db.events.insert_one(event)
    await add_points(user["id"], 20, f"Created event: {inp.title}")
    if "organizer" not in user.get("role_tags", []):
        await db.users.update_one({"id": user["id"]}, {"$addToSet": {"role_tags": "organizer"}})
    return {k: v for k, v in event.items() if k != "_id"}

@api_router.get("/events")
async def list_events(status: Optional[str] = None, limit: int = 50):
    query = {}
    if status:
        query["status"] = status
    events = await db.events.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return events

@api_router.get("/events/{event_id}")
async def get_event(event_id: str):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(404, "Not found")
    return event

@api_router.post("/events/{event_id}/join")
async def join_event(event_id: str, role: str = Query("member"), user=Depends(get_current_user)):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(404, "Not found")
    existing = [m for m in event.get("team_members", []) if m["user_id"] == user["id"]]
    if existing:
        raise HTTPException(400, "Already a team member")
    await db.events.update_one({"id": event_id}, {
        "$push": {"team_members": {"user_id": user["id"], "name": user["name"], "role": role}}
    })
    await add_points(user["id"], 3, f"Joined event: {event['title']}")
    return {"message": "Joined event"}

@api_router.put("/events/{event_id}/status")
async def update_event_status(event_id: str, status: str = Query(...), user=Depends(get_current_user)):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(404, "Not found")
    if user["id"] not in event.get("event_leaders", []) and user["role"] != "admin":
        raise HTTPException(403, "Not authorized")
    await db.events.update_one({"id": event_id}, {"$set": {"status": status}})
    return {"message": f"Event status updated to {status}"}

# ─── TASKS (Kanban) ───
@api_router.post("/tasks")
async def create_task(inp: TaskCreate, user=Depends(get_current_user)):
    event = await db.events.find_one({"id": inp.event_id}, {"_id": 0})
    if not event:
        raise HTTPException(404, "Event not found")
    if user["id"] not in event.get("event_leaders", []) and user["role"] != "admin":
        is_member = any(m["user_id"] == user["id"] for m in event.get("team_members", []))
        if not is_member:
            raise HTTPException(403, "Not authorized")
    assignee_name = ""
    if inp.assignee_id:
        assignee = await db.users.find_one({"id": inp.assignee_id}, {"_id": 0})
        assignee_name = assignee["name"] if assignee else ""
    task = {
        "id": make_id(), "event_id": inp.event_id, "title": inp.title,
        "description": inp.description or "", "assignee_id": inp.assignee_id or "",
        "assignee_name": assignee_name, "status": "todo",
        "priority": inp.priority or "medium", "due_date": inp.due_date or "",
        "created_by": user["id"], "created_at": now_iso()
    }
    await db.tasks.insert_one(task)
    return {k: v for k, v in task.items() if k != "_id"}

@api_router.get("/tasks")
async def list_tasks(event_id: Optional[str] = None, assignee_id: Optional[str] = None, status: Optional[str] = None):
    query = {}
    if event_id:
        query["event_id"] = event_id
    if assignee_id:
        query["assignee_id"] = assignee_id
    if status:
        query["status"] = status
    tasks = await db.tasks.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    return tasks

@api_router.put("/tasks/{task_id}")
async def update_task(task_id: str, inp: TaskUpdate, user=Depends(get_current_user)):
    updates = {k: v for k, v in inp.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(400, "No updates")
    if "status" in updates and updates["status"] == "done":
        task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
        if task and task.get("assignee_id"):
            await add_points(task["assignee_id"], 2, f"Completed task: {task['title']}")
    if "assignee_id" in updates and updates["assignee_id"]:
        assignee = await db.users.find_one({"id": updates["assignee_id"]}, {"_id": 0})
        updates["assignee_name"] = assignee["name"] if assignee else ""
    await db.tasks.update_one({"id": task_id}, {"$set": updates})
    updated = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    return updated

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, user=Depends(get_current_user)):
    await db.tasks.delete_one({"id": task_id})
    return {"message": "Task deleted"}

# ─── OPPORTUNITIES ───
@api_router.post("/opportunities")
async def create_opportunity(inp: OpportunityCreate, user=Depends(get_current_user)):
    if user["role"] not in ("admin", "manager"):
        raise HTTPException(403, "Not authorized")
    opp = {
        "id": make_id(), "title": inp.title, "description": inp.description,
        "type": inp.type, "organization": inp.organization or "",
        "deadline": inp.deadline or "", "link": inp.link or "", "created_at": now_iso()
    }
    await db.opportunities.insert_one(opp)
    return {k: v for k, v in opp.items() if k != "_id"}

@api_router.get("/opportunities")
async def list_opportunities(type: Optional[str] = None, limit: int = 50):
    query = {}
    if type:
        query["type"] = type
    opps = await db.opportunities.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return opps

# ─── RESOURCES (Learn Hub) ───
@api_router.post("/resources")
async def create_resource(inp: ResourceCreate, user=Depends(get_current_user)):
    if user["role"] not in ("admin", "manager"):
        raise HTTPException(403, "Not authorized")
    res = {
        "id": make_id(), "title": inp.title, "description": inp.description,
        "type": inp.type, "category": inp.category,
        "content_url": inp.content_url or "", "created_at": now_iso()
    }
    await db.resources.insert_one(res)
    return {k: v for k, v in res.items() if k != "_id"}

@api_router.get("/resources")
async def list_resources(type: Optional[str] = None, category: Optional[str] = None, limit: int = 50):
    query = {}
    if type:
        query["type"] = type
    if category:
        query["category"] = category
    resources = await db.resources.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return resources

# ─── LEADERBOARD ───
@api_router.get("/leaderboard")
async def get_leaderboard(limit: int = 20):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("lifetime_xp", -1).limit(limit).to_list(limit)
    return users

# ─── DASHBOARD STATS ───
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(user=Depends(get_current_user)):
    my_subs = await db.submissions.count_documents({"author_id": user["id"]})
    my_published = await db.submissions.count_documents({"author_id": user["id"], "status": "published"})
    my_events = await db.events.count_documents({"creator_id": user["id"]})
    my_tasks = await db.tasks.count_documents({"assignee_id": user["id"]})
    my_tasks_done = await db.tasks.count_documents({"assignee_id": user["id"], "status": "done"})
    total_users = await db.users.count_documents({})
    total_submissions = await db.submissions.count_documents({})
    total_events = await db.events.count_documents({})
    pending_reviews = await db.submissions.count_documents({"status": "pending"})
    return {
        "my_submissions": my_subs, "my_published": my_published,
        "my_events": my_events, "my_tasks": my_tasks, "my_tasks_done": my_tasks_done,
        "total_users": total_users, "total_submissions": total_submissions,
        "total_events": total_events, "pending_reviews": pending_reviews,
        "user": {k: v for k, v in user.items() if k != "password_hash"}
    }

# ─── HOMEPAGE DATA ───
@api_router.get("/homepage")
async def get_homepage(user=Depends(optional_user)):
    featured = await db.submissions.find({"status": "published"}, {"_id": 0}).sort("views", -1).limit(5).to_list(5)
    latest = await db.submissions.find({"status": "published"}, {"_id": 0}).sort("created_at", -1).limit(6).to_list(6)
    upcoming_events = await db.events.find({"status": "active"}, {"_id": 0}).sort("start_date", 1).limit(4).to_list(4)
    opportunities = await db.opportunities.find({}, {"_id": 0}).sort("created_at", -1).limit(4).to_list(4)
    top_writers = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("lifetime_xp", -1).limit(5).to_list(5)
    stats = {
        "total_articles": await db.submissions.count_documents({"status": "published"}),
        "total_events": await db.events.count_documents({}),
        "total_members": await db.users.count_documents({}),
    }
    return {
        "featured": featured, "latest": latest, "upcoming_events": upcoming_events,
        "opportunities": opportunities, "top_writers": top_writers, "stats": stats,
        "user": {k: v for k, v in user.items() if k != "password_hash"} if user else None
    }

# ─── USER PROFILE ───
@api_router.get("/users/{user_id}")
async def get_user_profile(user_id: str):
    u = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not u:
        raise HTTPException(404, "User not found")
    submissions = await db.submissions.find({"author_id": user_id, "status": "published"}, {"_id": 0}).sort("created_at", -1).limit(20).to_list(20)
    events = await db.events.find({"creator_id": user_id}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
    u["submissions"] = submissions
    u["events_led"] = events
    return u

# ─── ADMIN: MANAGE USERS ───
@api_router.put("/admin/users/{user_id}/role")
async def update_user_role(user_id: str, role: str = Query(...), user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "Admin only")
    if role not in ("member", "manager", "admin"):
        raise HTTPException(400, "Invalid role")
    await db.users.update_one({"id": user_id}, {"$set": {"role": role}})
    return {"message": f"User role updated to {role}"}

@api_router.get("/admin/users")
async def list_all_users(user=Depends(get_current_user)):
    if user["role"] not in ("admin", "manager"):
        raise HTTPException(403, "Not authorized")
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("joined_at", -1).to_list(500)
    return users

# ─── REWARDS STORE ───
@api_router.get("/rewards")
async def list_rewards():
    rewards = await db.rewards.find({}, {"_id": 0}).to_list(100)
    return rewards

@api_router.post("/rewards/{reward_id}/redeem")
async def redeem_reward(reward_id: str, user=Depends(get_current_user)):
    reward = await db.rewards.find_one({"id": reward_id}, {"_id": 0})
    if not reward:
        raise HTTPException(404, "Reward not found")
    if user.get("redeemable_points", 0) < reward.get("points_cost", 0):
        raise HTTPException(400, "Not enough points")
    await db.users.update_one({"id": user["id"]}, {"$inc": {"redeemable_points": -reward["points_cost"]}})
    await db.redemptions.insert_one({
        "id": make_id(), "user_id": user["id"], "reward_id": reward_id,
        "reward_name": reward["name"], "points_spent": reward["points_cost"], "created_at": now_iso()
    })
    return {"message": f"Redeemed: {reward['name']}"}

# ─── SEED DATA ───
@api_router.post("/seed")
async def seed_data():
    badge_count = await db.badges.count_documents({})
    if badge_count == 0:
        badges = [
            {"id": "wordsmith", "name": "Wordsmith", "description": "Published your first article", "icon": "pen-tool", "xp_value": 10, "category": "writing"},
            {"id": "storyteller", "name": "Storyteller", "description": "Published 5 articles", "icon": "book-open", "xp_value": 25, "category": "writing"},
            {"id": "prolific", "name": "Prolific Writer", "description": "Published 10 articles", "icon": "feather", "xp_value": 50, "category": "writing"},
            {"id": "organizer", "name": "Event Organizer", "description": "Led your first event", "icon": "calendar", "xp_value": 15, "category": "leadership"},
            {"id": "veteran_leader", "name": "Veteran Leader", "description": "Led 5 events", "icon": "award", "xp_value": 40, "category": "leadership"},
            {"id": "rising_star", "name": "Rising Star", "description": "Earned 50 XP", "icon": "star", "xp_value": 0, "category": "milestone"},
            {"id": "influencer", "name": "Influencer", "description": "Earned 200 XP", "icon": "zap", "xp_value": 0, "category": "milestone"},
            {"id": "legend", "name": "Legend", "description": "Earned 500 XP", "icon": "crown", "xp_value": 0, "category": "milestone"},
            {"id": "all_rounder", "name": "All-Rounder", "description": "Active in 3+ roles", "icon": "shield", "xp_value": 30, "category": "special"},
        ]
        await db.badges.insert_many(badges)
    reward_count = await db.rewards.count_documents({})
    if reward_count == 0:
        rewards = [
            {"id": "jj-cap", "name": "JJ Cap", "description": "Exclusive Junior Journalist cap", "type": "merch", "points_cost": 100, "image_url": "", "stock": 50},
            {"id": "jj-tshirt", "name": "JJ T-Shirt", "description": "Premium Junior Journalist tee", "type": "merch", "points_cost": 200, "image_url": "", "stock": 30},
            {"id": "writing-ebook", "name": "Writing Masterclass eBook", "description": "Advanced journalism guide", "type": "digital", "points_cost": 50, "image_url": "", "stock": 999},
            {"id": "silver-button", "name": "Silver Button Trophy", "description": "YouTube-style silver button for top contributors", "type": "trophy", "points_cost": 500, "image_url": "", "stock": 10},
            {"id": "gold-button", "name": "Gold Button Trophy", "description": "Elite gold button trophy", "type": "trophy", "points_cost": 1000, "image_url": "", "stock": 5},
            {"id": "scholarship-entry", "name": "Scholarship Entry", "description": "Entry to the JJ Scholarship Program", "type": "scholarship", "points_cost": 300, "image_url": "", "stock": 20},
        ]
        await db.rewards.insert_many(rewards)
    opp_count = await db.opportunities.count_documents({})
    if opp_count == 0:
        opps = [
            {"id": make_id(), "title": "Youth Journalism Internship", "description": "3-month internship at a leading news outlet", "type": "internship", "organization": "The Daily Wire", "deadline": "2026-04-15", "link": "#", "created_at": now_iso()},
            {"id": make_id(), "title": "Climate Writing Contest", "description": "Submit your best climate journalism piece", "type": "contest", "organization": "Young Gazette", "deadline": "2026-03-30", "link": "#", "created_at": now_iso()},
            {"id": make_id(), "title": "JJ Annual Scholarship", "description": "Full scholarship for outstanding junior journalists", "type": "scholarship", "organization": "Junior Journalist Foundation", "deadline": "2026-06-01", "link": "#", "created_at": now_iso()},
            {"id": make_id(), "title": "Campus Ambassador Program", "description": "Represent Junior Journalist at your school", "type": "fellowship", "organization": "Young Gazette", "deadline": "2026-05-01", "link": "#", "created_at": now_iso()},
        ]
        await db.opportunities.insert_many(opps)
    res_count = await db.resources.count_documents({})
    if res_count == 0:
        resources = [
            {"id": make_id(), "title": "Journalism 101", "description": "Learn the fundamentals of news reporting", "type": "guide", "category": "writing", "content_url": "#", "created_at": now_iso()},
            {"id": make_id(), "title": "Writing Compelling Headlines", "description": "Master the art of headline writing", "type": "guide", "category": "writing", "content_url": "#", "created_at": now_iso()},
            {"id": make_id(), "title": "Photo Journalism Workshop", "description": "Recorded session on visual storytelling", "type": "webinar", "category": "photography", "content_url": "#", "created_at": now_iso()},
            {"id": make_id(), "title": "Story Pitch Template", "description": "Professional template for pitching stories", "type": "template", "category": "tools", "content_url": "#", "created_at": now_iso()},
            {"id": make_id(), "title": "Daily Writing Prompt", "description": "Write about a local hero in your community", "type": "prompt", "category": "writing", "content_url": "#", "created_at": now_iso()},
        ]
        await db.resources.insert_many(resources)
    return {"message": "Seed data created"}

@api_router.get("/badges")
async def list_badges():
    badges = await db.badges.find({}, {"_id": 0}).to_list(100)
    return badges

# Include router & middleware
app.include_router(api_router)
cors_origins_raw = os.environ.get('CORS_ORIGINS', '*')
if cors_origins_raw.strip() == '*':
    cors_origins = ['*']
else:
    cors_origins = [o.strip() for o in cors_origins_raw.split(',') if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
