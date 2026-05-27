You are a professional technical writer and GitHub profile expert. 
Create a world-class, recruiter-impressive README.md for my project.
═══════════════════════════════════════════════════════
  PROJECT DETAILS
═══════════════════════════════════════════════════════
Project Name: SocialApp
Project Description: A full-stack Instagram-inspired social media platform with stories, notifications, explore, and real-time interactions
Live Demo URL: https://socialapp-0g3e.onrender.com
GitHub URL: https://github.com/Ashutosh467/codealpha_task/tree/main/codealpha_SocialApp
Internship/Course: Personal Project
Developer Name: Ashutosh
GitHub Username: Ashutosh467

Tech Stack:
- Backend: Node.js, Express.js
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Database: SQLite (development), PostgreSQL (production)
- Deployment: Render
- Other tools: Git, GitHub, JWT, bcryptjs, Multer, UUID, Nodemon

Features:
- User registration and login with JWT authentication
- Instagram-style dark mode UI
- Home feed showing posts from followed users
- Infinite scroll pagination on feed
- Like and unlike posts with double-tap heart animation
- Save and bookmark posts
- Inline comments — add and delete
- Photo Stories with 24-hour expiry and progress bar viewer
- Story gradient ring (unseen) vs gray ring (viewed)
- Explore page with masonry grid of all users' posts
- Search users by username or display name with debounce
- Real-time notification badge polling every 30 seconds
- Notifications for likes, comments, follows, and mentions
- Create post with drag-and-drop image upload and caption
- User profile with avatar, bio, and stats
- Edit profile inline (display name and bio)
- Upload and change profile avatar
- 3-column posts grid on profile
- Saved posts tab on own profile
- Followers and Following modal with follow buttons
- Follow and unfollow with live count update
- Mobile responsive with bottom navigation bar
- Skeleton loading screens
- Toast notifications (pill shape, bottom center)
- Keyboard shortcuts: L to like, Escape to close modal, arrow keys to navigate

Project Folder Structure:
socialapp/
├── server/
│   ├── index.js                  # Express app entry point
│   ├── db.js                     # SQLite/PostgreSQL database connection
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   └── routes/
│       ├── auth.js               # Register, login, get current user
│       ├── users.js              # Profile, search, avatar upload, suggestions
│       ├── posts.js              # CRUD, like, save, explore feed, paginated feed
│       ├── comments.js           # Add and delete comments
│       ├── follows.js            # Follow, unfollow, followers list, following list
│       ├── stories.js            # Create, view, delete, mark viewed
│       └── notifications.js      # Get, read, mark all read, delete
├── public/
│   ├── index.html                # Home feed page
│   ├── profile.html              # User profile page
│   ├── explore.html              # Explore and search page
│   ├── css/
│   │   └── style.css             # Full Instagram dark mode design system
│   └── js/
│       ├── api.js                # Centralized API fetch helper and all endpoints
│       ├── auth.js               # Login, register, logout, session management
│       ├── feed.js               # Feed rendering, post cards, create post, likes
│       ├── profile.js            # Profile page, grid, edit, avatar, follow modal
│       ├── explore.js            # Search, debounce, masonry grid, lightbox
│       ├── stories.js            # Story viewer, creator, progress bar, swipe
│       ├── notifications.js      # Notification panel, badge, polling
│       └── icons.js              # Inline SVG icon library
├── uploads/                      # Local image upload storage
├── .env                          # Environment variables (not committed)
├── .gitignore                    # Ignores node_modules, .env, uploads, db files
└── package.json                  # Dependencies and npm scripts

Database Models:
- users (id, username, email, password_hash, display_name, bio, avatar_url, created_at)
- posts (id, user_id, content, image_url, likes_count, comments_count, saves_count, created_at)
- post_likes (user_id, post_id, created_at)
- post_saves (user_id, post_id, created_at)
- comments (id, post_id, user_id, content, created_at)
- follows (follower_id, following_id, created_at)
- stories (id, user_id, image_url, caption, views_count, created_at, expires_at)
- story_views (story_id, viewer_id, viewed_at)
- notifications (id, recipient_id, sender_id, type, post_id, comment_id, is_read, created_at)

Test Credentials (if any):
- Create your own account via Register — no pre-seeded users

What I learned from this project:
- Building a complete REST API with Express.js and organizing routes by resource
- Implementing JWT-based authentication with protected middleware
- Designing a relational SQLite schema with foreign keys and cascading deletes
- Migrating from SQLite to PostgreSQL for production deployment
- Handling multipart file uploads with Multer
- Writing Vanilla JavaScript that consumes a REST API without any framework
- Building complex UI interactions like story progress bars, double-tap like, and drag-drop upload
- Deploying a Node.js app to Render with environment variables and a managed database
- Using Git and GitHub for version control and managing .gitignore properly
- Designing a mobile-first responsive layout with CSS custom properties
- Implementing infinite scroll with IntersectionObserver API
- Polling for real-time-like notification updates without WebSockets

═══════════════════════════════════════════════════════
  README REQUIREMENTS
═══════════════════════════════════════════════════════
Generate a complete, professional README.md that includes:

1. HEADER SECTION:
   - Project name in large heading with emoji
   - One-line description
   - Badges using shields.io for every tech used
     Format: https://img.shields.io/badge/NAME-VERSION-COLOR?style=for-the-badge&logo=LOGO&logoColor=white
   - Live Demo and GitHub repo buttons
   - All centered using <div align="center">

2. FEATURES TABLE:
   - Emoji + Feature Name + Description
   - Use markdown table format

3. TECH STACK SECTION:
   - Organized by: Backend, Frontend, Database, DevOps
   - Each tech with bold name and short description

4. LOCAL SETUP:
   - Prerequisites
   - Step by step numbered installation commands
   - All commands in code blocks
   - Must work copy-paste without any changes

5. TEST CREDENTIALS TABLE:
   - Role, Username, Password, Access level columns
   - Use emojis for roles (note: this app uses self-registration)

6. PROJECT STRUCTURE:
   - Full folder tree using ASCII characters
   - Every file and folder with # comment explaining it
   - Must render correctly on GitHub

7. DATABASE MODELS:
   - List all 9 models and their purpose
   - In a code block

8. LIVE URLS TABLE:
   - Page name and route for every URL in the app

9. API ENDPOINTS TABLE:
   - Method, Endpoint, Description, Auth Required columns
   - Cover all routes: auth, users, posts, comments, follows, stories, notifications

10. WHAT I LEARNED:
    - Bullet points with ✅ emoji
    - Technical and soft skills

11. FOOTER:
    - Developer name and GitHub link
    - Star the repo call to action
    - "Made with ❤️ by Ashutosh"
    - All centered using <div align="center">

═══════════════════════════════════════════════════════
  QUALITY REQUIREMENTS
═══════════════════════════════════════════════════════
- Use shields.io badges with correct colors and logos
- Every section separated by --- divider
- All code blocks properly formatted with language tags
- Folder structure must use │ ├── └── characters correctly
- No broken markdown — every tag must be closed
- Must look stunning on GitHub when rendered
- Professional tone — written to impress recruiters
- Include emojis in every section heading
- Output the complete README.md — do not truncate
