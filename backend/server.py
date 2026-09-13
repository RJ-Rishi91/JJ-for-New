from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os, logging, uuid, jwt, bcrypt, base64
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

UPLOAD_DIR = ROOT_DIR / "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

JWT_SECRET = os.environ.get("JWT_SECRET", "jj_secret_key_2025_young_gazette")
JWT_ALGO = "HS256"

@app.get("/")
async def root_health():
    return {"status": "ok", "app": "Junior Journalist API", "version": "1.0.0"}

@api_router.get("/health")
async def api_health():
    return {"status": "ok", "app": "Junior Journalist API"}

@app.on_event("startup")
async def init_db_indexes():
    try:
        await db.users.create_index("email", unique=True)
        await db.users.create_index("id", unique=True)
        await db.submissions.create_index([("status", 1), ("created_at", -1)])
        await db.submissions.create_index("category")
        await db.messages.create_index([("channel", 1), ("created_at", -1)])
        await db.notifications.create_index([("user_id", 1), ("read", 1)])
        await db.comments.create_index([("submission_id", 1), ("created_at", 1)])
        await db.projects.create_index("category")
        logger.info("MongoDB indexes verified successfully.")
    except Exception as e:
        logger.warning(f"MongoDB index verification note: {e}")

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

async def create_notification(user_id: str, title: str, message: str, link: str = "", notif_type: str = "general"):
    notif = {
        "id": make_id(),
        "user_id": user_id,
        "title": title,
        "message": message,
        "link": link,
        "type": notif_type,
        "read": False,
        "created_at": now_iso()
    }
    await db.notifications.insert_one(notif)
    return notif

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
        for b in new_badges:
            await create_notification(user_id, "New Badge Unlocked! 🏆", f"You unlocked the {b.replace('_', ' ').title()} badge!", "/rewards", "badge")

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

class BroadcastInput(BaseModel):
    title: str
    message: str
    target_role: Optional[str] = "all"
    link: Optional[str] = "/community"

class MentorQuestionInput(BaseModel):
    topic: str
    question: str
    category: Optional[str] = "writing"

class ProjectCreate(BaseModel):
    title: str
    description: str
    category: Optional[str] = "investigative"
    goal: Optional[str] = "Publish a 5-part youth series"
    target_date: Optional[str] = None
    cover_image: Optional[str] = ""
    open_roles: Optional[List[str]] = []

class ProjectProgressUpdate(BaseModel):
    progress: int

class MessageCreate(BaseModel):
    content: str
    channel: Optional[str] = "general"
    channel_id: Optional[str] = None
    recipient_id: Optional[str] = None
    attachment_url: Optional[str] = None

class UploadInput(BaseModel):
    data_url: str
    filename: Optional[str] = "upload.jpg"

class CommentCreate(BaseModel):
    content: str

class NewsletterInput(BaseModel):
    email: str
    name: Optional[str] = ""
    school: Optional[str] = ""

class ContactInput(BaseModel):
    name: str
    email: str
    category: Optional[str] = "general"
    subject: str
    message: str

class ArchiveCreate(BaseModel):
    title: str
    issue_number: int
    season: str
    cover_image: Optional[str] = None
    pdf_url: str
    articles_count: Optional[int] = 10
    pages: Optional[int] = 28

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
    await add_points(user["id"], 25, f"Submitted: {inp.title}")
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
async def update_submission_status(sub_id: str, status: str = Query(...), notes: Optional[str] = Query(None), user=Depends(get_current_user)):
    if user["role"] not in ("admin", "manager", "editor"):
        raise HTTPException(403, "Not authorized. Requires editor or admin role.")
    sub = await db.submissions.find_one({"id": sub_id}, {"_id": 0})
    if not sub:
        raise HTTPException(404, "Not found")
    target_status = "published" if status in ("published", "approved") else status
    update = {"status": target_status}
    if notes:
        update["editorial_notes"] = notes
    if target_status == "published":
        update["published_at"] = now_iso()
    await db.submissions.update_one({"id": sub_id}, {"$set": update})
    if target_status == "published":
        await add_points(sub["author_id"], 10, f"Published: {sub['title']}")
        await create_notification(sub["author_id"], "Article Published! 🎉", f"Your piece '{sub['title']}' is now live on Explore!", f"/submissions/{sub_id}", "submission")
    elif target_status == "revision_requested":
        feedback_str = f" Notes from Editor: {notes}" if notes else " Please check review notes on your piece."
        await create_notification(sub["author_id"], "Revision Requested 📝", f"Your piece '{sub['title']}' needs revision before publication.{feedback_str}", f"/submissions/{sub_id}", "submission")
    elif target_status == "rejected":
        feedback_str = f" Editorial notes: {notes}" if notes else " Review notes on your Dashboard."
        await create_notification(sub["author_id"], "Submission Update", f"Your piece '{sub['title']}' was declined.{feedback_str}", "/dashboard", "submission")
    return {"message": f"Status updated to {target_status}"}

@api_router.post("/submissions/{sub_id}/react")
async def react_submission(sub_id: str, reaction: str = Query(...), user=Depends(get_current_user)):
    valid = ["fire", "heart", "clap", "mind_blown"]
    if reaction not in valid:
        raise HTTPException(400, f"Invalid reaction. Use: {valid}")
    await db.submissions.update_one({"id": sub_id}, {"$inc": {f"reactions.{reaction}": 1}})
    return {"message": "Reacted"}

# ─── ARTICLE COMMENTS & PEER DISCUSSION ───
@api_router.get("/submissions/{sub_id}/comments")
async def list_article_comments(sub_id: str):
    comments = await db.comments.find({"submission_id": sub_id}, {"_id": 0}).sort("created_at", 1).limit(100).to_list(100)
    return comments

@api_router.post("/submissions/{sub_id}/comments")
async def add_article_comment(sub_id: str, inp: CommentCreate, user=Depends(get_current_user)):
    sub = await db.submissions.find_one({"id": sub_id}, {"_id": 0})
    if not sub:
        raise HTTPException(404, "Article not found")
    if not inp.content.strip():
        raise HTTPException(400, "Comment cannot be empty")
    comment = {
        "id": make_id(),
        "submission_id": sub_id,
        "user_id": user["id"],
        "user_name": user["name"],
        "user_role": user.get("role", "member"),
        "content": inp.content.strip(),
        "created_at": now_iso()
    }
    await db.comments.insert_one(comment)
    await add_points(user["id"], 2, f"Commented on article: {sub['title'][:40]}")
    if sub["author_id"] != user["id"]:
        await create_notification(
            sub["author_id"],
            "New Article Comment 💬",
            f"{user['name']} commented on your story '{sub['title'][:35]}...'",
            f"/submissions/{sub_id}",
            "comment"
        )
    return {k: v for k, v in comment.items() if k != "_id"}

@api_router.delete("/submissions/{sub_id}/comments/{comment_id}")
async def delete_article_comment(sub_id: str, comment_id: str, user=Depends(get_current_user)):
    comment = await db.comments.find_one({"id": comment_id, "submission_id": sub_id})
    if not comment:
        raise HTTPException(404, "Comment not found")
    if comment["user_id"] != user["id"] and user["role"] not in ("admin", "editor", "manager"):
        raise HTTPException(403, "Not authorized")
    await db.comments.delete_one({"id": comment_id})
    return {"message": "Comment deleted"}

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
    if event.get("creator_id") and event["creator_id"] != user["id"]:
        await create_notification(event["creator_id"], "New Team Member! 🤝", f"{user['name']} joined '{event['title']}' as {role.replace('_', ' ')}.", f"/events/{event_id}", "event")
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
    if inp.assignee_id and inp.assignee_id != user["id"]:
        await create_notification(inp.assignee_id, "New Task Assigned 📋", f"You were assigned task '{inp.title}' in {event['title']}", f"/events/{inp.event_id}", "task")
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

@api_router.delete("/opportunities/{opp_id}")
async def delete_opportunity(opp_id: str, user=Depends(get_current_user)):
    if user["role"] not in ("admin", "manager"):
        raise HTTPException(403, "Not authorized")
    await db.opportunities.delete_one({"id": opp_id})
    return {"message": "Opportunity deleted"}

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

@api_router.delete("/resources/{res_id}")
async def delete_resource(res_id: str, user=Depends(get_current_user)):
    if user["role"] not in ("admin", "manager"):
        raise HTTPException(403, "Not authorized")
    await db.resources.delete_one({"id": res_id})
    return {"message": "Resource deleted"}

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
    total_opps = await db.opportunities.count_documents({})
    total_res = await db.resources.count_documents({})
    total_subs = await db.newsletter_subscribers.count_documents({})
    total_inq = await db.contact_inquiries.count_documents({})
    total_arch = await db.archives.count_documents({})
    total_proj = await db.projects.count_documents({})
    return {
        "my_submissions": my_subs, "my_published": my_published,
        "my_events": my_events, "my_tasks": my_tasks, "my_tasks_done": my_tasks_done,
        "total_users": total_users, "total_submissions": total_submissions,
        "total_events": total_events, "pending_reviews": pending_reviews,
        "total_opportunities": total_opps, "total_resources": total_res,
        "total_subscribers": total_subs, "total_inquiries": total_inq,
        "total_archives": total_arch, "total_projects": total_proj,
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

# ─── ADMIN: MANAGE USERS & DESK ───
@api_router.put("/admin/users/{user_id}/role")
async def update_user_role(user_id: str, role: str = Query(...), user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "Admin only")
    if role not in ("member", "contributor", "editor", "manager", "admin"):
        raise HTTPException(400, "Invalid role. Allowed: member, contributor, editor, manager, admin")
    await db.users.update_one({"id": user_id}, {"$set": {"role": role}})
    return {"message": f"User role updated to {role}"}

@api_router.get("/admin/users")
async def list_all_users(user=Depends(get_current_user)):
    if user["role"] not in ("admin", "manager"):
        raise HTTPException(403, "Not authorized")
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("joined_at", -1).to_list(500)
    return users

@api_router.get("/admin/contact-inquiries")
async def list_contact_inquiries(user=Depends(get_current_user)):
    if user["role"] not in ("admin", "manager", "editor"):
        raise HTTPException(403, "Not authorized")
    inquiries = await db.contact_inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return inquiries

@api_router.get("/admin/subscribers")
async def list_newsletter_subscribers(user=Depends(get_current_user)):
    if user["role"] not in ("admin", "manager"):
        raise HTTPException(403, "Not authorized")
    subscribers = await db.newsletter_subscribers.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return subscribers

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
    await create_notification(user["id"], "Reward Redeemed! 🎁", f"You claimed {reward['name']}. Points spent: {reward['points_cost']} pts.", "/rewards", "reward")
    return {"message": f"Redeemed: {reward['name']}"}

# ─── SEED DATA ───
@api_router.post("/seed")
async def seed_data():
    user_count = await db.users.count_documents({})
    if user_count == 0:
        demo_users = [
            {
                "id": "seed-u4",
                "email": "editor@juniorjournalist.org",
                "password_hash": hash_pw("EditorPass123!"),
                "name": "Rushal Singh",
                "bio": "Managing Editor & investigative reporter mentoring young journalists.",
                "city": "Udaipur",
                "school": "St. Paul's Senior Secondary",
                "role": "admin",
                "role_tags": ["Managing Editor", "Investigative Lead"],
                "lifetime_xp": 280,
                "redeemable_points": 240,
                "badges": ["wordsmith", "storyteller", "veteran_leader"],
                "joined_at": now_iso()
            },
            {
                "id": "seed-u1",
                "email": "aarav@juniorjournalist.org",
                "password_hash": hash_pw("StudentPass123!"),
                "name": "Aarav Sharma",
                "bio": "Campus lead passionate about civic reporting and climate resilience.",
                "city": "New Delhi",
                "school": "Delhi Public School (R.K. Puram)",
                "role": "editor",
                "role_tags": ["Campus Lead", "Civic Writer"],
                "lifetime_xp": 190,
                "redeemable_points": 150,
                "badges": ["wordsmith", "organizer", "rising_star"],
                "joined_at": now_iso()
            }
        ]
        await db.users.insert_many(demo_users)

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

    # Seed Sample Published Submissions
    sub_count = await db.submissions.count_documents({})
    if sub_count == 0:
        sample_subs = [
            {
                "id": make_id(),
                "title": "Campus Mental Health: Breaking the Silence in High Schools",
                "content": "Across secondary schools and university campuses nationwide, student pressure around standardized tests, college admissions, and social media comparison has reached unprecedented levels.\n\nIn this investigative report, we spoke with guidance counselors, student peer leaders, and adolescent psychologists to explore why open conversations around mental wellness are critical in modern newsrooms.",
                "type": "article",
                "category": "opinion",
                "author_id": "seed-u1",
                "author_name": "Aarav Sharma",
                "author_role": "Campus Lead",
                "author_school": "Delhi Public School (R.K. Puram)",
                "status": "published",
                "views": 420,
                "reactions": {"heart": 34, "fire": 18, "clap": 27, "mindblown": 8},
                "cover_image": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=60",
                "co_authors": ["Ananya Desai"],
                "created_at": now_iso()
            },
            {
                "id": make_id(),
                "title": "The River Yamuna Restoration: A Student Photo Essay",
                "content": "Armed with second-hand DSLRs and field notebooks, four youth photojournalists documented the foam pollution and community cleanup drives along the northern banks of the Yamuna.\n\nThese photographs capture both the ecological challenge and the relentless resilience of volunteer youth squads removing tons of plastic waste each weekend.",
                "type": "photo_essay",
                "category": "photo_essays",
                "author_id": "seed-u2",
                "author_name": "Rohan Verma",
                "author_role": "Photojournalist",
                "author_school": "National Public School, Bengaluru",
                "status": "published",
                "views": 612,
                "reactions": {"heart": 56, "fire": 42, "clap": 31, "mindblown": 14},
                "cover_image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=60",
                "co_authors": [],
                "created_at": now_iso()
            },
            {
                "id": make_id(),
                "title": "Student Voices on AI in Classrooms: Threat or Learning Accelerator?",
                "content": "Should AI be banned from homework assignments or integrated into daily coursework? We polled 350 high school seniors to understand how generative AI is shifting essay writing, code debugging, and critical thinking.",
                "type": "article",
                "category": "campus_voices",
                "author_id": "seed-u3",
                "author_name": "Ananya Desai",
                "author_role": "Staff Writer",
                "author_school": "The Cathedral & John Connon, Mumbai",
                "status": "published",
                "views": 380,
                "reactions": {"heart": 29, "fire": 22, "clap": 19, "mindblown": 30},
                "cover_image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60",
                "co_authors": ["Aarav Sharma"],
                "created_at": now_iso()
            },
            {
                "id": make_id(),
                "title": "Review: The Best Open-Source Tools for Student Newsrooms",
                "content": "Running a high school gazette with zero budget? Here is our comprehensive review of open-source publishing CMS, encrypted messaging, and audio transcription tools vetted by student editors.",
                "type": "article",
                "category": "reviews",
                "author_id": "seed-u4",
                "author_name": "Rushal Singh",
                "author_role": "Managing Editor",
                "author_school": "St. Paul's Senior Secondary, Udaipur",
                "status": "published",
                "views": 530,
                "reactions": {"heart": 41, "fire": 35, "clap": 48, "mindblown": 12},
                "cover_image": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=60",
                "co_authors": [],
                "created_at": now_iso()
            },
            {
                "id": make_id(),
                "title": "Field Report: Inside Udaipur's Ancient Water Harvest Systems",
                "content": "Centuries-old stepwells and interconnecting lake systems designed in medieval Mewar still hold vital lessons for modern urban rainwater harvesting. Our on-the-ground report from the heritage wells of Rajasthan.",
                "type": "field_report",
                "category": "field_reports",
                "author_id": "seed-u4",
                "author_name": "Rushal Singh",
                "author_role": "Field Reporter",
                "author_school": "St. Paul's Senior Secondary, Udaipur",
                "status": "published",
                "views": 720,
                "reactions": {"heart": 88, "fire": 62, "clap": 74, "mindblown": 25},
                "cover_image": "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=60",
                "co_authors": [],
                "created_at": now_iso()
            },
            {
                "id": make_id(),
                "title": "Echoes of the Classroom: A Collection of Student Poems",
                "content": "Between bells, chalk dust, and late evening library hours, high school poets pen their reflections on friendship, growing up, and chasing ambitions.",
                "type": "article",
                "category": "creative_writing",
                "author_id": "seed-u1",
                "author_name": "Aarav Sharma",
                "author_role": "Writer",
                "author_school": "Delhi Public School (R.K. Puram)",
                "status": "published",
                "views": 290,
                "reactions": {"heart": 51, "fire": 15, "clap": 32, "mindblown": 6},
                "cover_image": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=60",
                "co_authors": [],
                "created_at": now_iso()
            }
        ]
        await db.submissions.insert_many(sample_subs)

    # Seed Sample Projects & Campaigns (Module 7)
    proj_count = await db.projects.count_documents({})
    if proj_count == 0:
        sample_projs = [
            {
                "id": make_id(),
                "title": "Clean Campus & Zero Single-Use Plastic Drive",
                "description": "A 3-month multi-school campaign auditing plastic waste in school cafeterias and advocating for biodegradable alternatives.",
                "category": "environment",
                "goal": "Audit 20 high schools & publish national findings",
                "target_date": "2026-05-30",
                "cover_image": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=60",
                "open_roles": ["Campus Auditor", "Data Visualizer", "Investigative Writer", "School Liaison"],
                "creator_id": "seed-u2",
                "creator_name": "Rohan Verma",
                "progress": 45,
                "team": [
                    {"user_id": "seed-u2", "name": "Rohan Verma", "role": "Campaign Lead"},
                    {"user_id": "seed-u3", "name": "Ananya Desai", "role": "Data Visualizer"}
                ],
                "created_at": now_iso()
            },
            {
                "id": make_id(),
                "title": "Youth Civic & Voter Awareness Campaign",
                "description": "Mobilizing student journalists to demystify local civic government, municipal ward budgets, and youth voting rights.",
                "category": "civic",
                "goal": "Publish 10 explainers & conduct 5 live webinars",
                "target_date": "2026-06-15",
                "cover_image": "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=60",
                "open_roles": ["Civic Researcher", "Podcast Anchor", "Social Media Coordinator"],
                "creator_id": "seed-u1",
                "creator_name": "Aarav Sharma",
                "progress": 60,
                "team": [
                    {"user_id": "seed-u1", "name": "Aarav Sharma", "role": "Project Lead"},
                    {"user_id": "seed-u4", "name": "Rushal Singh", "role": "Editorial Advisor"}
                ],
                "created_at": now_iso()
            },
            {
                "id": make_id(),
                "title": "Grassroots Climate Innovators: 50-State Photo Essay",
                "description": "Documenting young engineers and environmentalists building affordable renewable solutions in tier-2 and tier-3 towns.",
                "category": "investigative",
                "goal": "Collect 100 field photo essays and create a virtual gallery",
                "target_date": "2026-07-20",
                "cover_image": "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&auto=format&fit=crop&q=60",
                "open_roles": ["Field Photographer", "Story Editor", "Audio Producer"],
                "creator_id": "seed-u4",
                "creator_name": "Rushal Singh",
                "progress": 30,
                "team": [
                    {"user_id": "seed-u4", "name": "Rushal Singh", "role": "Project Lead"}
                ],
                "created_at": now_iso()
            }
        ]
        await db.projects.insert_many(sample_projs)

    # Seed Sample Events
    event_count = await db.events.count_documents({})
    if event_count == 0:
        sample_events = [
            {
                "id": make_id(),
                "title": "Live National Student Debate: Freedom of the Press in Schools",
                "description": "An interactive digital debate desk bringing student editors from 15 cities to discuss press freedom, censorship, and ethical reporting.",
                "type": "debate",
                "start_date": "2026-04-10T18:00:00Z",
                "end_date": "2026-04-10T20:30:00Z",
                "creator_id": "seed-u1",
                "creator_name": "Aarav Sharma",
                "open_roles": ["Debate Moderator", "Fact Checker", "Live Twitter/X Correspondent"],
                "max_team": 8,
                "team": [{"user_id": "seed-u1", "name": "Aarav Sharma", "role": "Event Leader"}],
                "created_at": now_iso()
            },
            {
                "id": make_id(),
                "title": "Investigative Journalism Bootcamp 2026",
                "description": "Intensive weekend workshop with senior editors covering RTI filing, data scraping, and source protection for youth writers.",
                "type": "workshop",
                "start_date": "2026-04-24T14:00:00Z",
                "end_date": "2026-04-25T17:00:00Z",
                "creator_id": "seed-u4",
                "creator_name": "Rushal Singh",
                "open_roles": ["Session Coordinator", "Note Taker", "Tech Support"],
                "max_team": 12,
                "team": [{"user_id": "seed-u4", "name": "Rushal Singh", "role": "Event Leader"}],
                "created_at": now_iso()
            }
        ]
        await db.events.insert_many(sample_events)

    # Seed Sample Messages
    msg_count = await db.messages.count_documents({})
    if msg_count == 0:
        sample_msgs = [
            {"id": make_id(), "sender_id": "seed-u1", "sender_name": "Aarav Sharma", "sender_role": "member", "channel": "general", "recipient_id": None, "content": "Welcome everyone to the new Junior Journalist newsroom! Pitch your stories in #investigative or share photo essays in #photojournalism.", "created_at": now_iso()},
            {"id": make_id(), "sender_id": "seed-u4", "sender_name": "Rushal Singh", "sender_role": "admin", "channel": "general", "recipient_id": None, "content": "The Clean Campus plastic audit project is now live under the Projects tab. You can join the audit team!", "created_at": now_iso()}
        ]
    # Seed Sample Digital Publication Archives
    archive_count = await db.archives.count_documents({})
    if archive_count == 0:
        sample_archives = [
            {
                "id": make_id(),
                "title": "Young Gazette — Issue #03: The Climate Innovators Edition",
                "issue_number": 3,
                "season": "Spring 2026",
                "cover_image": "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&auto=format&fit=crop&q=60",
                "pdf_url": "https://raw.githubusercontent.com/RJ-Rishi91/JJ-for-New/main/sample_issue_03.pdf",
                "articles_count": 12,
                "pages": 32,
                "created_at": now_iso()
            },
            {
                "id": make_id(),
                "title": "Young Gazette — Issue #02: Voices of Campus Governance",
                "issue_number": 2,
                "season": "Winter 2025",
                "cover_image": "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=60",
                "pdf_url": "https://raw.githubusercontent.com/RJ-Rishi91/JJ-for-New/main/sample_issue_02.pdf",
                "articles_count": 10,
                "pages": 28,
                "created_at": now_iso()
            },
            {
                "id": make_id(),
                "title": "Young Gazette — Issue #01: The Inaugural Youth Anthology",
                "issue_number": 1,
                "season": "Fall 2025",
                "cover_image": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=60",
                "pdf_url": "https://raw.githubusercontent.com/RJ-Rishi91/JJ-for-New/main/sample_issue_01.pdf",
                "articles_count": 14,
                "pages": 36,
                "created_at": now_iso()
            }
        ]
        await db.archives.insert_many(sample_archives)

    return {"message": "Seed data created"}

@api_router.get("/badges")
async def list_badges():
    badges = await db.badges.find({}, {"_id": 0}).to_list(100)
    return badges

# ─── NOTIFICATIONS ───
@api_router.get("/notifications")
async def list_notifications(user=Depends(get_current_user)):
    notifs = await db.notifications.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)
    unread_count = await db.notifications.count_documents({"user_id": user["id"], "read": False})
    return {"notifications": notifs, "unread_count": unread_count}

@api_router.put("/notifications/{notif_id}/read")
async def mark_notification_read(notif_id: str, user=Depends(get_current_user)):
    await db.notifications.update_one({"id": notif_id, "user_id": user["id"]}, {"$set": {"read": True}})
    return {"message": "Marked read"}

@api_router.put("/notifications/read-all")
async def mark_all_notifications_read(user=Depends(get_current_user)):
    await db.notifications.update_many({"user_id": user["id"]}, {"$set": {"read": True}})
    return {"message": "All marked read"}

# ─── USER REDEMPTIONS ───
@api_router.get("/rewards/my-redemptions")
async def list_my_redemptions(user=Depends(get_current_user)):
    redemptions = await db.redemptions.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return redemptions

# ─── CAMPUS CHAPTERS ───
@api_router.get("/chapters")
async def list_chapters():
    pipeline = [
        {"$match": {"school": {"$ne": ""}}},
        {"$group": {"_id": {"school": "$school", "city": "$city"}, "member_count": {"$sum": 1}, "leaders": {"$push": {"id": "$id", "name": "$name", "role": "$role"}}}},
        {"$project": {"school": "$_id.school", "city": "$_id.city", "member_count": 1, "leaders": {"$slice": ["$leaders", 3]}, "_id": 0}},
        {"$sort": {"member_count": -1}},
        {"$limit": 20}
    ]
    chapters = await db.users.aggregate(pipeline).to_list(20)
    if not chapters:
        chapters = [
            {"school": "Delhi Public School", "city": "Delhi", "member_count": 14, "leaders": [{"name": "Aarav Sharma", "role": "Campus Lead"}]},
            {"school": "St. Paul's Senior Secondary", "city": "Udaipur", "member_count": 11, "leaders": [{"name": "Rushal Singh", "role": "Chapter Founder"}]},
            {"school": "The Cathedral & John Connon", "city": "Mumbai", "member_count": 12, "leaders": [{"name": "Ananya Desai", "role": "Editor"}]},
            {"school": "National Public School", "city": "Bengaluru", "member_count": 9, "leaders": [{"name": "Rohan Verma", "role": "Lead Reporter"}]},
        ]
    return chapters

# ─── ADMIN BROADCAST ───
@api_router.post("/admin/broadcast")
async def broadcast_announcement(inp: BroadcastInput, user=Depends(get_current_user)):
    if user["role"] not in ("admin", "manager"):
        raise HTTPException(403, "Not authorized")
    query = {}
    if inp.target_role and inp.target_role != "all":
        query["role"] = inp.target_role
    target_users = await db.users.find(query, {"id": 1, "_id": 0}).to_list(1000)
    notifs = []
    now = now_iso()
    for u in target_users:
        notifs.append({
            "id": make_id(),
            "user_id": u["id"],
            "title": f"📢 {inp.title}",
            "message": inp.message,
            "link": inp.link or "",
            "type": "broadcast",
            "read": False,
            "created_at": now
        })
    if notifs:
        await db.notifications.insert_many(notifs)
    return {"message": f"Broadcast sent to {len(notifs)} members"}

# ─── ASK A MENTOR ───
@api_router.post("/resources/ask-mentor")
async def ask_mentor(inp: MentorQuestionInput, user=Depends(get_current_user)):
    question = {
        "id": make_id(),
        "user_id": user["id"],
        "user_name": user["name"],
        "topic": inp.topic,
        "question": inp.question,
        "category": inp.category or "writing",
        "status": "submitted",
        "created_at": now_iso()
    }
    await db.mentor_questions.insert_one(question)
    await add_points(user["id"], 2, "Asked a mentor question")
    return {"message": "Question sent to mentor team! You earned +2 XP.", "id": question["id"]}

# ─── MEDIA UPLOAD HELPER ───
@api_router.post("/upload")
async def upload_media(inp: UploadInput, user=Depends(get_current_user)):
    if not inp.data_url.startswith("data:image/"):
        raise HTTPException(400, "Invalid image data format. Must be an image data URL.")
    try:
        header, b64data = inp.data_url.split(",", 1)
        ext = "jpg"
        if "png" in header: ext = "png"
        elif "webp" in header: ext = "webp"
        elif "gif" in header: ext = "gif"
        
        file_id = f"{uuid.uuid4().hex}.{ext}"
        filepath = UPLOAD_DIR / file_id
        
        file_bytes = base64.b64decode(b64data)
        with open(filepath, "wb") as f:
            f.write(file_bytes)
            
        file_url = f"/uploads/{file_id}"
        return {"url": file_url, "filename": inp.filename or file_id}
    except Exception as e:
        logger.warning(f"Upload write note: {e}")
        return {"url": inp.data_url, "filename": inp.filename}

# ─── NEWSLETTER & ARCHIVES ───
@api_router.post("/newsletter/subscribe")
async def subscribe_newsletter(inp: NewsletterInput):
    if not inp.email or "@" not in inp.email:
        raise HTTPException(400, "Valid email required")
    existing = await db.newsletter_subscribers.find_one({"email": inp.email.lower()})
    if existing:
        return {"message": "You are already subscribed to the Young Gazette digest!", "subscribed": True}
    doc = {
        "id": make_id(),
        "email": inp.email.lower(),
        "name": inp.name or "",
        "school": inp.school or "",
        "created_at": now_iso()
    }
    await db.newsletter_subscribers.insert_one(doc)
    return {"message": "Subscribed successfully! Welcome to the Young Gazette weekly digest.", "subscribed": True}

@api_router.get("/archives")
async def list_publication_archives():
    archives = await db.archives.find({}, {"_id": 0}).sort("issue_number", -1).to_list(50)
    return archives

@api_router.post("/archives")
async def create_archive(inp: ArchiveCreate, user=Depends(get_current_user)):
    if user["role"] not in ("admin", "manager", "editor"):
        raise HTTPException(403, "Not authorized. Requires editor or admin role.")
    archive = {
        "id": make_id(),
        "title": inp.title,
        "issue_number": inp.issue_number,
        "season": inp.season,
        "cover_image": inp.cover_image or "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&auto=format&fit=crop&q=60",
        "pdf_url": inp.pdf_url,
        "articles_count": inp.articles_count or 10,
        "pages": inp.pages or 28,
        "created_at": now_iso()
    }
    await db.archives.insert_one(archive)
    return {k: v for k, v in archive.items() if k != "_id"}

@api_router.delete("/archives/{archive_id}")
async def delete_archive(archive_id: str, user=Depends(get_current_user)):
    if user["role"] not in ("admin", "manager"):
        raise HTTPException(403, "Not authorized")
    await db.archives.delete_one({"id": archive_id})
    return {"message": "Archive issue deleted"}

# ─── CONTACT & INQUIRIES ───
@api_router.post("/contact")
async def submit_contact_inquiry(inp: ContactInput):
    if not inp.email or "@" not in inp.email:
        raise HTTPException(400, "Valid email required")
    inquiry = {
        "id": make_id(),
        "name": inp.name,
        "email": inp.email.lower(),
        "category": inp.category or "general",
        "subject": inp.subject,
        "message": inp.message,
        "created_at": now_iso()
    }
    await db.contact_inquiries.insert_one(inquiry)
    return {"message": "Your inquiry has been received. Our editorial team will review it shortly."}

# ─── PROJECTS & CAMPAIGNS (Module 7) ───
@api_router.get("/projects")
async def list_projects(category: Optional[str] = None):
    query = {}
    if category and category != "all":
        query["category"] = category
    projects = await db.projects.find(query, {"_id": 0}).sort("created_at", -1).to_list(50)
    return projects

@api_router.post("/projects")
async def create_project(inp: ProjectCreate, user=Depends(get_current_user)):
    proj = {
        "id": make_id(),
        "title": inp.title,
        "description": inp.description,
        "category": inp.category or "investigative",
        "goal": inp.goal or "Publish a 5-part youth series",
        "target_date": inp.target_date,
        "cover_image": inp.cover_image or "",
        "open_roles": inp.open_roles or ["Researcher", "Staff Writer", "Fact Checker", "Visual Lead"],
        "creator_id": user["id"],
        "creator_name": user["name"],
        "progress": 15,
        "team": [{"user_id": user["id"], "name": user["name"], "role": "Project Lead", "joined_at": now_iso()}],
        "created_at": now_iso()
    }
    await db.projects.insert_one(proj)
    await add_points(user["id"], 25, "Launched a new project campaign")
    return proj

@api_router.get("/projects/{project_id}")
async def get_project(project_id: str):
    proj = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not proj:
        raise HTTPException(404, "Project not found")
    return proj

@api_router.post("/projects/{project_id}/join")
async def join_project(project_id: str, role: str = "Contributor", user=Depends(get_current_user)):
    proj = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not proj:
        raise HTTPException(404, "Project not found")
    team = proj.get("team", [])
    if any(m.get("user_id") == user["id"] for m in team):
        return {"message": "Already on this project team"}
    member = {"user_id": user["id"], "name": user["name"], "role": role, "joined_at": now_iso()}
    await db.projects.update_one({"id": project_id}, {"$push": {"team": member}})
    await create_notification(proj["creator_id"], "New Project Member! 🚀", f"{user['name']} joined '{proj['title']}' as {role}.", f"/projects/{project_id}", "project")
    await add_points(user["id"], 10, "Joined a project team")
    return {"message": f"Joined project as {role}"}

@api_router.put("/projects/{project_id}/progress")
async def update_project_progress(project_id: str, inp: ProjectProgressUpdate, user=Depends(get_current_user)):
    proj = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not proj:
        raise HTTPException(404, "Project not found")
    if proj.get("creator_id") != user["id"] and user["role"] not in ("admin", "manager"):
        raise HTTPException(403, "Not authorized to update project progress")
    prog = max(0, min(100, inp.progress))
    await db.projects.update_one({"id": project_id}, {"$set": {"progress": prog}})
    return {"message": f"Progress updated to {prog}%"}

# ─── IN-APP MESSAGES & NEWSROOM CHAT (Module 10) ───
@api_router.get("/messages/channels")
async def list_message_channels():
    return [
        {"id": "general", "name": "General Newsroom", "description": "Global youth journalist discussion & pitches"},
        {"id": "photojournalism", "name": "Visual & Photography Desk", "description": "Photojournalism tips, photo essays, and visual layout"},
        {"id": "investigative", "name": "Investigative & Research", "description": "Deep-dives, public records, and fact-checking coordination"},
        {"id": "campus-leads", "name": "Campus Leads & Editors", "description": "Newsroom leadership, Chapter updates, and event co-ops"}
    ]

@api_router.get("/messages/channel/{channel_id}")
async def get_channel_messages(channel_id: str, user=Depends(optional_user)):
    msgs = await db.messages.find({"$or": [{"channel": channel_id}, {"channel_id": channel_id}]}, {"_id": 0}).sort("created_at", -1).limit(60).to_list(60)
    msgs.reverse()
    return msgs

@api_router.post("/messages")
async def send_message(inp: MessageCreate, user=Depends(get_current_user)):
    target_channel = inp.channel_id or inp.channel or "general"
    msg = {
        "id": make_id(),
        "sender_id": user["id"],
        "sender_name": user["name"],
        "sender_role": user.get("role", "member"),
        "channel": target_channel,
        "channel_id": target_channel,
        "recipient_id": inp.recipient_id,
        "content": inp.content,
        "attachment_url": inp.attachment_url,
        "created_at": now_iso()
    }
    await db.messages.insert_one(msg)
    if inp.recipient_id:
        await create_notification(inp.recipient_id, f"New Message from {user['name']}", inp.content[:60], "/messages", "message")
    return {k: v for k, v in msg.items() if k != "_id"}

@api_router.get("/messages/dm/{recipient_id}")
async def get_direct_messages(recipient_id: str, user=Depends(get_current_user)):
    query = {
        "$or": [
            {"sender_id": user["id"], "recipient_id": recipient_id},
            {"sender_id": recipient_id, "recipient_id": user["id"]}
        ]
    }
    msgs = await db.messages.find(query, {"_id": 0}).sort("created_at", -1).limit(60).to_list(60)
    msgs.reverse()
    return msgs

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
