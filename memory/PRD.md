# Junior Journalist - Product Requirements Document

## Original Problem Statement
Build "Junior Journalist" - a youth-led creative ecosystem platform (Young Gazette). A decentralized project management + media engine for school/college students. Features: flexible multi-role identities, multi-format content submission, Asana-style Kanban task boards, gamified rewards, learning hub, and role-based dashboards. UI: dark, glassmorphic, Web3-style.

## Architecture
- **Frontend**: React 19 + TailwindCSS + Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB (Motor async driver)
- **Auth**: JWT-based with bcrypt password hashing
- **Design**: Dark theme (#050505 bg, #00FFA3 primary), glassmorphism, Unbounded/Chivo/Azeret Mono fonts

## User Personas
1. **Student Writer** - Submits articles, earns badges, builds portfolio
2. **Event Leader** - Creates events, manages teams with Kanban boards
3. **Manager** - Reviews submissions, manages users, moderates content
4. **Admin** - Full platform control, analytics, user role management

## Core Requirements
- Multi-role flexible identity (Writer, Photographer, Reporter, Videographer, Organizer)
- Multi-format content submission with editorial workflow
- Event/project management with Kanban task boards
- Gamified point system (Lifetime XP + Redeemable Points)
- Badge system (9 badges: Wordsmith, Storyteller, Prolific, Organizer, Veteran Leader, Rising Star, Influencer, Legend, All-Rounder)
- Role-based dashboards (Member, Manager, Admin)
- Community leaderboards
- Opportunities board (internships, scholarships, contests, fellowships)
- Learning hub with resources and writing prompts
- Rewards redemption center (merch, digital, trophies, scholarships)

## What's Been Implemented (Feb 26, 2026)
### Backend (24 API endpoints - all working)
- Auth: register, login, me, update profile
- Submissions: CRUD + approval workflow + reactions
- Events: CRUD + join team + status management
- Tasks: CRUD with Kanban status (todo/in_progress/review/done)
- Opportunities, Resources, Badges, Rewards, Leaderboard
- Dashboard stats, Homepage aggregation, User profiles
- Admin: user role management, content moderation
- Seed data for badges, rewards, opportunities, resources

### Frontend (12 pages - all functional)
1. **Homepage** - Hero with personalized greeting, stats, categories, featured stories, events, opportunities, top writers, CTA
2. **Explore** - Story grid with search, type/category filters
3. **Submit Work** - Multi-format submission form (article, photo essay, field report, video)
4. **Events** - Event listing + event creation form
5. **Event Detail** - Kanban task board, team management, join team
6. **Rewards** - Badges display + Redeem center with merch/trophies/scholarships
7. **Learn Hub** - Writing prompts, resources, guides
8. **Opportunities** - Internships, scholarships, contests, fellowships
9. **Profile** - User info, badges, published work, edit profile
10. **Dashboard** - Role-based stats, quick actions, admin moderation, user management
11. **Community** - Podium + full leaderboard
12. **Submission Detail** - Full article view with reactions

## Prioritized Backlog
### P0 (Completed)
- [x] Auth system (register/login/JWT)
- [x] Content submission + approval workflow
- [x] Event/project management with Kanban
- [x] Rewards/badge system
- [x] Role-based dashboards
- [x] Homepage with Zepto-style interactivity

### P1 (Next Phase)
- [ ] Rich text editor for submissions (Markdown/WYSIWYG)
- [ ] File/image upload integration (object storage)
- [ ] Push notifications (Web Push API)
- [ ] PDF portfolio generation
- [ ] In-app messaging system
- [ ] Real-time task updates (WebSocket)

### P2 (Future)
- [ ] Co-authoring with real-time collaboration
- [ ] Campus chapters/clubs system
- [ ] Newsletter builder
- [ ] Advanced analytics dashboard
- [ ] Mentor matching system
- [ ] Mobile PWA optimization
- [ ] Interactive map of chapters
- [ ] AI writing assistant
