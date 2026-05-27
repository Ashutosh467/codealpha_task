<div align="center">

# 📸 SocialApp

### *A full-stack Instagram-inspired social media platform*

> Real-time interactions · Photo Stories · Explore · Notifications · JWT Auth

<br>

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-Semantic-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-Custom_Properties-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![SQLite](https://img.shields.io/badge/SQLite-Development-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Production-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![Render](https://img.shields.io/badge/Render-Deployed-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com)
[![Git](https://img.shields.io/badge/Git-Version_Control-F05032?style=for-the-badge&logo=git&logoColor=white)](https://git-scm.com)

<br>

[![🚀 Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20App-FF6B6B?style=for-the-badge)](https://socialapp-0g3e.onrender.com)
[![📂 GitHub Repo](https://img.shields.io/badge/📂%20GitHub-View%20Source-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Ashutosh467/codealpha_task/tree/main/codealpha_SocialApp)

</div>

---

## 📌 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📁 Project Structure](#-project-structure)
- [🗄️ Database Models](#️-database-models)
- [🌐 Live Pages](#-live-pages)
- [📡 API Reference](#-api-reference)
- [💡 What I Learned](#-what-i-learned)
- [👨‍💻 Author](#-author)

---

## ✨ Features

| # | Feature | Description |
|---|---------|-------------|
| 🔐 | **JWT Authentication** | Secure register & login with token-based session management |
| 🌑 | **Instagram Dark UI** | Pixel-perfect dark mode design using CSS custom properties |
| 📰 | **Home Feed** | Posts from followed users with infinite scroll pagination |
| ❤️ | **Like / Unlike** | Double-tap heart animation with optimistic UI update |
| 🔖 | **Save & Bookmark** | Save posts to a personal collection, viewable on your profile |
| 💬 | **Inline Comments** | Add and delete comments without page reloads |
| 📖 | **Photo Stories** | 24-hour expiring stories with animated progress bar viewer |
| 🔵 | **Story Rings** | Gradient ring (unseen) vs grey ring (viewed) — just like Instagram |
| 🔍 | **Explore Page** | Masonry grid of all public posts with fullscreen lightbox |
| 🔎 | **User Search** | Debounced live search by username or display name |
| 🔔 | **Notifications** | Real-time badge polling (every 30s) for likes, comments, follows, mentions |
| 📤 | **Create Post** | Drag-and-drop image upload with caption support |
| 👤 | **User Profile** | Avatar, bio, follower/following stats, and 3-column posts grid |
| ✏️ | **Edit Profile** | Inline edit of display name, bio, and profile avatar |
| 👥 | **Follow System** | Follow/unfollow with live count updates and modal lists |
| 📱 | **Mobile Responsive** | Bottom navigation bar, touch gestures, and fluid layouts |
| 💀 | **Skeleton Loaders** | Smooth content placeholders before data loads |
| 🍞 | **Toast Notifications** | Pill-shaped bottom-center toasts for all user actions |
| ⌨️ | **Keyboard Shortcuts** | `L` to like · `Esc` to close modal · Arrow keys to navigate |

---

## 🛠️ Tech Stack

### ⚙️ Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | JavaScript runtime powering the server |
| **Express.js** | RESTful API framework with organized route modules |
| **JWT (jsonwebtoken)** | Stateless authentication tokens |
| **bcryptjs** | Secure password hashing |
| **Multer** | Multipart file upload handling for images |
| **UUID** | Unique ID generation for uploaded files |
| **Nodemon** | Auto-restart during development |

### 🎨 Frontend
| Technology | Purpose |
|-----------|---------|
| **HTML5** | Semantic page structure across all views |
| **CSS3** | Custom properties, grid, flexbox, animations |
| **Vanilla JavaScript (ES6+)** | DOM manipulation, fetch API, IntersectionObserver |

### 🗄️ Database
| Technology | Purpose |
|-----------|---------|
| **SQLite** | Lightweight file-based DB for local development |
| **PostgreSQL** | Managed production database on Render |

### ☁️ DevOps & Tooling
| Technology | Purpose |
|-----------|---------|
| **Render** | Cloud deployment with environment variables |
| **Git & GitHub** | Version control and source code hosting |
| **.env** | Environment-based configuration management |

---

## 🚀 Getting Started

### 📋 Prerequisites

Make sure you have the following installed:

```bash
node --version    # v18.x or higher
npm --version     # v9.x or higher
git --version     # any recent version
```

### 🔧 Installation & Setup

**1. Clone the repository**
```bash
git clone https://github.com/Ashutosh467/codealpha_task.git
cd codealpha_task/codealpha_SocialApp
```

**2. Install dependencies**
```bash
npm install
```

**3. Create your environment file**
```bash
cp .env.example .env
```

**4. Configure environment variables**
```env
# .env
PORT=3000
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development

# For production PostgreSQL (leave empty for local SQLite)
DATABASE_URL=
```

**5. Create uploads directory**
```bash
mkdir -p uploads
```

**6. Start the development server**
```bash
npm run dev
```

**7. Open in browser**
```
http://localhost:3000
```

> 💡 **No seed data required.** Simply visit the app, click **Register**, and create your own account to get started.

---

## 🔑 Access & Credentials

| Role | How to Access | Auth Method |
|------|--------------|-------------|
| 👤 New User | Click **Register** on the landing page | Username + Password → JWT Token |
| 🔄 Returning User | Click **Login** with your credentials | JWT stored in localStorage |
| 🛡️ Protected Routes | JWT is auto-attached to every API request | Bearer Token via `Authorization` header |

> There are no pre-seeded test accounts. The app uses self-registration — create your account and explore all features instantly.

---

## 📁 Project Structure

```
socialapp/
│
├── server/                         # 🖥️  All backend server code
│   ├── index.js                    # Express app entry point & middleware setup
│   ├── db.js                       # SQLite/PostgreSQL connection & schema init
│   │
│   ├── middleware/
│   │   └── auth.js                 # JWT verification middleware
│   │
│   └── routes/
│       ├── auth.js                 # POST /register, POST /login, GET /me
│       ├── users.js                # Profile, search, avatar upload, suggestions
│       ├── posts.js                # CRUD, like, save, explore feed, paginated feed
│       ├── comments.js             # Add and delete post comments
│       ├── follows.js              # Follow, unfollow, followers list, following list
│       ├── stories.js              # Create, view, delete stories, mark as viewed
│       └── notifications.js        # Get, read, mark-all-read, delete notifications
│
├── public/                         # 🌐  All frontend static files
│   ├── index.html                  # Home feed page
│   ├── profile.html                # User profile page
│   ├── explore.html                # Explore & search page
│   │
│   ├── css/
│   │   └── style.css               # Full Instagram dark mode design system
│   │
│   └── js/
│       ├── api.js                  # Centralized fetch helper & all API endpoints
│       ├── auth.js                 # Login, register, logout, session management
│       ├── feed.js                 # Feed rendering, post cards, create post, likes
│       ├── profile.js              # Profile page, grid, edit, avatar, follow modal
│       ├── explore.js              # Search, debounce, masonry grid, lightbox
│       ├── stories.js              # Story viewer, creator, progress bar, swipe
│       ├── notifications.js        # Notification panel, badge, polling logic
│       └── icons.js                # Inline SVG icon library
│
├── uploads/                        # 📁  Local image upload storage (git-ignored)
├── .env                            # 🔒  Environment variables (not committed)
├── .gitignore                      # ⛔  Ignores node_modules, .env, uploads, db
└── package.json                    # 📦  Dependencies and npm scripts
```

---

## 🗄️ Database Models

```sql
-- 👤 User accounts
users           (id, username, email, password_hash, display_name, bio, avatar_url, created_at)

-- 📸 Posts
posts           (id, user_id, content, image_url, likes_count, comments_count, saves_count, created_at)

-- ❤️ Post interactions
post_likes      (user_id, post_id, created_at)
post_saves      (user_id, post_id, created_at)

-- 💬 Comments
comments        (id, post_id, user_id, content, created_at)

-- 👥 Social graph
follows         (follower_id, following_id, created_at)

-- 📖 Stories (24-hour expiry)
stories         (id, user_id, image_url, caption, views_count, created_at, expires_at)
story_views     (story_id, viewer_id, viewed_at)

-- 🔔 Notifications
notifications   (id, recipient_id, sender_id, type, post_id, comment_id, is_read, created_at)
```

---

## 🌐 Live Pages

| Page | Route | Description |
|------|-------|-------------|
| 🏠 Home Feed | `/` | Posts from followed users, stories bar |
| 👤 Profile | `/profile.html?user=:username` | User's posts, bio, followers, saved |
| 🔍 Explore | `/explore.html` | All posts masonry grid + user search |

---

## 📡 API Reference

### 🔐 Auth Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Create a new account | ❌ |
| `POST` | `/api/auth/login` | Login and receive JWT | ❌ |
| `GET` | `/api/auth/me` | Get logged-in user info | ✅ |

### 👤 User Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/users/:username` | Get user profile | ✅ |
| `PUT` | `/api/users/profile` | Update display name & bio | ✅ |
| `POST` | `/api/users/avatar` | Upload profile avatar | ✅ |
| `GET` | `/api/users/search?q=` | Search users by name/username | ✅ |
| `GET` | `/api/users/suggestions` | Get suggested users to follow | ✅ |

### 📸 Post Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/posts/feed` | Paginated feed from followed users | ✅ |
| `GET` | `/api/posts/explore` | All posts for explore page | ✅ |
| `POST` | `/api/posts` | Create a new post | ✅ |
| `DELETE` | `/api/posts/:id` | Delete own post | ✅ |
| `POST` | `/api/posts/:id/like` | Like a post | ✅ |
| `DELETE` | `/api/posts/:id/like` | Unlike a post | ✅ |
| `POST` | `/api/posts/:id/save` | Save/bookmark a post | ✅ |
| `DELETE` | `/api/posts/:id/save` | Unsave a post | ✅ |
| `GET` | `/api/posts/saved` | Get saved posts of current user | ✅ |

### 💬 Comment Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/comments/:postId` | Get all comments for a post | ✅ |
| `POST` | `/api/comments/:postId` | Add a comment | ✅ |
| `DELETE` | `/api/comments/:id` | Delete own comment | ✅ |

### 👥 Follow Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/follows/:username` | Follow a user | ✅ |
| `DELETE` | `/api/follows/:username` | Unfollow a user | ✅ |
| `GET` | `/api/follows/:username/followers` | Get followers list | ✅ |
| `GET` | `/api/follows/:username/following` | Get following list | ✅ |

### 📖 Story Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/stories` | Get stories of followed users | ✅ |
| `POST` | `/api/stories` | Create a new story | ✅ |
| `DELETE` | `/api/stories/:id` | Delete own story | ✅ |
| `POST` | `/api/stories/:id/view` | Mark a story as viewed | ✅ |

### 🔔 Notification Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/notifications` | Get all notifications | ✅ |
| `PUT` | `/api/notifications/:id/read` | Mark one as read | ✅ |
| `PUT` | `/api/notifications/read-all` | Mark all as read | ✅ |
| `DELETE` | `/api/notifications/:id` | Delete a notification | ✅ |

---

## 💡 What I Learned

**Backend & API Design**
- ✅ Building a complete REST API with Express.js, organized by resource modules
- ✅ Implementing JWT-based authentication with protected middleware at route level
- ✅ Designing a relational database schema with foreign keys and cascading deletes
- ✅ Migrating from SQLite (dev) to PostgreSQL (prod) with zero code changes
- ✅ Handling multipart/form-data file uploads with Multer and UUID naming

**Frontend Engineering**
- ✅ Consuming a REST API entirely with Vanilla JS and the native Fetch API
- ✅ Building complex UI interactions: story progress bars, double-tap like, drag-drop upload
- ✅ Implementing infinite scroll using the `IntersectionObserver` API
- ✅ Polling for real-time notification updates without WebSockets
- ✅ Designing a mobile-first responsive layout with CSS custom properties and grid

**DevOps & Tooling**
- ✅ Deploying a Node.js app to Render with environment variables and a managed database
- ✅ Using Git and GitHub for version control, branching, and `.gitignore` best practices
- ✅ Separating dev and production configurations cleanly using `.env`

---

## 📸 Screenshots

> 🚀 **[Visit the Live Demo](https://socialapp-0g3e.onrender.com)** to see all features in action.

---

## 👨‍💻 Author

<div align="center">

### Built with ❤️ by **Ashutosh**

[![GitHub](https://img.shields.io/badge/GitHub-Ashutosh467-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Ashutosh467)

<br>

⭐ **If this project impressed you, please give it a star on GitHub!** ⭐

[![Star this repo](https://img.shields.io/github/stars/Ashutosh467/codealpha_task?style=social)](https://github.com/Ashutosh467/codealpha_task)

<br>

*Made with ❤️ by [Ashutosh](https://github.com/Ashutosh467)*

</div>
