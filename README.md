# 📰 Junior Journalist (Young Gazette)

> An open, decentralized, youth-led creative ecosystem for student journalists, creators, organizers, and leaders.

Inspired by the engagement of Zepto, Zomato, and Swiggy, and the project management power of Asana, **Junior Journalist** allows any student to contribute stories, propose and lead events, build teams, earn points and badges, and showcase a dynamic live portfolio.

---

## 🧩 14 Core Modules

1. **User Roles & Membership**: Multi-role flexible identity (Writer, Reporter, Photographer, Anchor, Editor, Organizer, Mentor). No fixed role binding at signup.
2. **Profile & Portfolio**: Dynamic live portfolio displaying contributions, achievements, lifetime XP, redeemable points, and role badges.
3. **Content Submission**: Multi-format submissions (Articles, Photo Essays, Video Stories, Field Reports) with co-author support and editorial approval workflows.
4. **Learn & Mentorship**: Journalism guides, recorded webinars, writing prompts, and pitch templates.
5. **Opportunities**: Curated student internships, writing contests, fellowships, and scholarships.
6. **Events**: Anyone can propose an event, become an Event Leader, recruit team members, and assign roles.
7. **Projects & Campaigns**: Long-term thematic initiatives and campus challenges.
8. **Community & Clubs**: Campus chapters, global & monthly leaderboards, and member spotlights.
9. **Dashboard (Role-Based)**: Dynamic workspaces for Members, Event Leaders (Kanban boards), Chapter Managers, and Admins.
10. **Communication**: Real-time notifications, task comment threads, and team announcements.
11. **Rewards & Recognition**: Gamified XP, badges (Wordsmith, Storyteller, Organizer, etc.), merch redemption (caps, t-shirts), and YouTube-style milestone trophies.
12. **Monetization & Growth**: Partner voucher redemptions, sponsorship portal, and educational allowances/scholarships.
13. **Admin & Moderation**: Complete moderation queue for submissions, user role elevation, and sitewide broadcasts.
14. **Analytics & Insights**: Personal views/reads analytics, team completion rates, and platform-wide impact stats.

---

## 🛠 Tech Stack

- **Frontend**: React 19, CRACO, TailwindCSS, Radix UI Primitives, Lucide Icons, Axios, React Router v7.
- **Backend**: FastAPI (Python 3.12+), Uvicorn, Motor (Async MongoDB), Pydantic v2, JWT Auth, Bcrypt.
- **Database**: MongoDB (Local `mongod` or Cloud **MongoDB Atlas**).
- **Hosting Targets**:
  - Frontend: **Vercel**
  - Backend: **Render** / **Railway**
  - Database: **MongoDB Atlas (Free M0 Cluster)**

---

## 🚀 Local Development (3-Terminal Setup)

### 1. Database
```bash
sudo systemctl start mongod
# or
mongod --dbpath /path/to/data
```

### 2. Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
# API running on http://127.0.0.1:8000
# Interactive docs at http://127.0.0.1:8000/docs
```

### 3. Frontend
```bash
cd frontend
npm install
npm start
# App running on http://localhost:3000
```

---

## 🌐 Live Production Deployment Guide

### Phase 1: Cloud Database (MongoDB Atlas)
1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create an **M0 Free Cluster**.
2. Create a Database User with username and password under **Database Access**.
3. Under **Network Access**, add `0.0.0.0/0` (Allow access from anywhere).
4. Copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/junior_journalist?retryWrites=true&w=majority
   ```

### Phase 2: Backend API (Render)
1. Sign up at [render.com](https://render.com) and create a **New Web Service**.
2. Connect your GitHub repository: `RJ-Rishi91/JJ-for-New`.
3. Set the following build settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   - `MONGO_URL`: `<Your MongoDB Atlas connection string>`
   - `DB_NAME`: `junior_journalist`
   - `JWT_SECRET`: `<Secure random 32+ character string>`
   - `CORS_ORIGINS`: `https://<your-frontend>.vercel.app,http://localhost:3000`
5. Click **Deploy**. Note your live URL: `https://<backend-service>.onrender.com`.

### Phase 3: Frontend (Vercel)
1. Sign up at [vercel.com](https://vercel.com) and import the `RJ-Rishi91/JJ-for-New` repo.
2. Configure project settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Create React App`
3. Set Environment Variable:
   - `REACT_APP_BACKEND_URL`: `https://<backend-service>.onrender.com`
4. Click **Deploy**.

### Phase 4: Seed Initial Production Content
Once deployed, seed default badges, rewards, opportunities, and learning resources by sending a POST request:
```bash
curl -X POST https://<backend-service>.onrender.com/api/seed
```

---

## 📄 License
MIT © Junior Journalist / Studio Ravya / Young Gazette
