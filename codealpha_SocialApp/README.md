SocialApp 📸
A full-stack Instagram-inspired social media platform built with Node.js, Express, and SQLite/PostgreSQL.
🌐 Live Demo: socialapp.onrender.com

✨ Features
👤 Authentication

Register & Login with JWT
Secure password hashing with bcryptjs
Token stored in localStorage, auto-logout on expiry

🏠 Home Feed

See posts from users you follow
Infinite scroll pagination
Like / unlike posts (single click + double-tap image)
Floating heart animation on double-tap
Save / bookmark posts
Comment inline, delete your own comments
Share post link to clipboard
Delete your own posts

📖 Stories

Post photo stories (expire after 24 hours)
Story viewer with progress bar (5s per story)
Tap left/right to navigate, hold to pause
Gradient ring = unseen, gray ring = viewed
View count on your own stories

🔍 Search & Explore

Search users by username or display name (debounced)
Recent searches saved locally
Explore grid of posts from all users
Masonry layout — every 7th post is double height
Click any post to open full lightbox

🔔 Notifications

Real-time badge count (polls every 30s)
Like, comment, follow, and mention notifications
Mark all as read
Click to navigate to the relevant post or profile

➕ Create Post

Drag & drop or click to upload image
Caption with character counter (2200 max)
Image preview before posting
Post instantly appears in feed

👤 Profile

Avatar, display name, bio
Posts / Followers / Following stats
Edit profile inline
Upload & change avatar
3-column posts grid
Saved posts tab
Followers / Following modal with follow buttons
Follow / Unfollow with live count update

💫 UI & UX

Instagram dark mode design
Skeleton loading screens
Toast notifications (bottom center)
Mobile responsive with bottom nav bar
Keyboard shortcuts (L to like, Escape to close, ← → to navigate)
Empty states for all sections


🛠 Tech Stack
Frontend

HTML5, CSS3, Vanilla JavaScript
CSS custom properties (design tokens)
Google Fonts — Instrument Sans + Playfair Display

Backend

Node.js + Express.js
JWT for authentication
bcryptjs for password hashing
Multer for image uploads
express-validator for input validation
UUID for unique IDs

Database

SQLite (local development via better-sqlite3)
PostgreSQL (production on Render)


🗄 Database Schema
users          — id, username, email, password_hash, display_name, bio, avatar_url
posts          — id, user_id, content, image_url, likes_count, comments_count
post_likes     — user_id, post_id
post_saves     — user_id, post_id
comments       — id, post_id, user_id, content
follows        — follower_id, following_id
stories        — id, user_id, image_url, caption, views_count, expires_at
story_views    — story_id, viewer_id
notifications  — id, recipient_id, sender_id, type, post_id, is_read

📁 Project Structure
socialapp/
├── server/
│   ├── index.js              # Express app entry point
│   ├── db.js                 # Database connection (SQLite/Postgres)
│   ├── middleware/
│   │   └── auth.js           # JWT verification middleware
│   └── routes/
│       ├── auth.js           # Register, login, me
│       ├── users.js          # Profile, search, suggestions
│       ├── posts.js          # CRUD, like, save, explore, feed
│       ├── comments.js       # Add, delete comments
│       ├── follows.js        # Follow, unfollow, lists
│       ├── stories.js        # Create, view, delete stories
│       └── notifications.js  # Get, read, delete notifications
├── public/
│   ├── index.html            # Feed page
│   ├── profile.html          # Profile page
│   ├── explore.html          # Explore & search page
│   ├── css/
│   │   └── style.css         # Full design system
│   └── js/
│       ├── api.js            # All API calls
│       ├── auth.js           # Auth logic
│       ├── feed.js           # Feed, posts, create
│       ├── profile.js        # Profile page logic
│       ├── explore.js        # Search & explore grid
│       ├── stories.js        # Story viewer & creator
│       ├── notifications.js  # Notifications panel
│       └── icons.js          # SVG icon library
├── uploads/                  # Local image uploads
├── .env                      # Environment variables (not committed)
├── .gitignore
└── package.json

🚀 Run Locally
Prerequisites

Node.js v18+
npm

Steps
bash# 1. Clone the repo
git clone https://github.com/Ashutosh467/socialapp.git
cd socialapp

# 2. Install dependencies
npm install

# 3. Create .env file
touch .env
Add this to .env:
PORT=3000
JWT_SECRET=your_secret_key_here
DB_PATH=./socialmini.db
bash# 4. Start the development server
npm run dev

# 5. Open in browser
https://socialapp-0g3e.onrender.com

☁️ Deployment (Render)
This app is deployed on Render.
Environment Variables on Render
KeyValueJWT_SECRETyour secret keyDATABASE_URLPostgreSQL internal URL from RenderNODE_ENVproduction
Deploy Steps

Push code to GitHub
Create a PostgreSQL database on Render (free tier)
Create a Web Service on Render connected to this repo
Set Build Command: npm install
Set Start Command: node server/index.js
Add environment variables
Deploy — Render auto-deploys on every git push


📱 Screenshots

Home Feed | Stories | Explore | Profile | Notifications

(Add screenshots here)

🔐 API Endpoints
Auth
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
Users
GET    /api/users/search?q=term
GET    /api/users/suggestions
GET    /api/users/:username
PUT    /api/users/profile
POST   /api/users/avatar
Posts
GET    /api/posts/feed
GET    /api/posts/explore
GET    /api/posts/user/:username
POST   /api/posts
DELETE /api/posts/:id
POST   /api/posts/:id/like
POST   /api/posts/:id/save
Comments
GET    /api/comments/:postId
POST   /api/comments/:postId
DELETE /api/comments/:id
Follows
POST   /api/follows/:username
GET    /api/follows/:username/followers
GET    /api/follows/:username/following
Stories
GET    /api/stories/feed
GET    /api/stories/user/:username
POST   /api/stories
POST   /api/stories/:id/view
DELETE /api/stories/:id
Notifications
GET    /api/notifications
POST   /api/notifications/read-all
POST   /api/notifications/read/:id
DELETE /api/notifications/:id

👨‍💻 Author
Ashutosh — @Ashutosh467

📄 License
MIT License — free to use and modify.Share
