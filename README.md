<div align="center">

# 🚀 CodeAlpha Internship Projects

### *Web Development Internship — Project Portfolio*

> Two production-grade full-stack web applications built during the CodeAlpha Internship Program

<br>

[![HTML5](https://img.shields.io/badge/HTML5-Semantic-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-Responsive-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org)
[![Django](https://img.shields.io/badge/Django-Backend-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com)
[![Node.js](https://img.shields.io/badge/Node.js-Runtime-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express.js-API-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Production-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![SQLite](https://img.shields.io/badge/SQLite-Development-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org)
[![Render](https://img.shields.io/badge/Render-Deployed-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com)

<br>

| 👤 Intern | 🔗 GitHub | 🏢 Program |
|-----------|----------|-----------|
| **Kumar Ashutosh Narayan** | [@Ashutosh467](https://github.com/Ashutosh467) | CodeAlpha Web Development Internship |

</div>

---

## 📁 Repository Structure

```
codealpha_task/
│
├── codealpha_ShopKart/        # Task 1 – Simple E-Commerce Store (Django)
│   ├── products/              # Product listings & detail pages
│   ├── cart/                  # Cart management logic
│   ├── orders/                # Order processing & history
│   ├── users/                 # Authentication & registration
│   ├── templates/             # HTML templates
│   ├── static/                # CSS, JS, images
│   ├── manage.py              # Django management entry point
│   └── requirements.txt       # Python dependencies
│
└── codealpha_SocialApp/       # Task 2 – Mini Social Media Platform (Express.js)
    ├── server/                # Express backend & REST API
    ├── public/                # Frontend HTML, CSS, JS
    ├── uploads/               # Image upload storage
    └── package.json           # Node.js dependencies
```

---

## 📌 Task 1 — ShopKart

<div align="center">

### 🛒 Simple E-Commerce Store

*A fully functional e-commerce web application with product browsing, cart management, and order processing*

[![View Project](https://img.shields.io/badge/📂%20View%20Project-codealpha__ShopKart-092E20?style=for-the-badge&logo=django&logoColor=white)](https://github.com/Ashutosh467/codealpha_task/tree/main/codealpha_ShopKart)
[![🚀 Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20App-FF6B6B?style=for-the-badge)](https://shopkart-39k3.onrender.com)

</div>

### ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **User Auth** | Registration, login, and session management |
| 🛍️ **Product Listings** | Browse all products with individual detail pages |
| 🛒 **Shopping Cart** | Add, remove, and update item quantities in real time |
| 📦 **Order Processing** | Place orders and view full order history |
| 🗄️ **Database** | Relational schema for products, users, carts, and orders |

### 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, JavaScript |
| **Backend** | Django (Python) |
| **Database** | SQLite (development) · PostgreSQL (production) |

### ⚙️ Local Setup

```bash
# Navigate to project folder
cd codealpha_ShopKart

# Install Python dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

> Visit `http://localhost:8000` in your browser.

---

## 📌 Task 2 — SocialApp

<div align="center">

### 📱 Mini Social Media Platform

*A full-stack Instagram-inspired platform with stories, explore, real-time notifications, and JWT authentication*

[![View Project](https://img.shields.io/badge/📂%20View%20Project-codealpha__SocialApp-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://github.com/Ashutosh467/codealpha_task/tree/main/codealpha_SocialApp)
[![🚀 Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20App-FF6B6B?style=for-the-badge)](https://socialapp-0g3e.onrender.com)

</div>

### ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Authentication** | Secure register & login with token-based auth |
| 📰 **Home Feed** | Posts from followed users with infinite scroll |
| ❤️ **Likes & Saves** | Double-tap like animation, bookmark posts |
| 💬 **Comments** | Inline add and delete without page reloads |
| 📖 **Photo Stories** | 24-hour expiring stories with progress bar viewer |
| 🔍 **Explore Page** | Masonry grid of all posts + debounced user search |
| 🔔 **Notifications** | Real-time polling badge for likes, comments, follows |
| 👤 **User Profiles** | Avatar, bio, stats, followers/following modals |
| 📱 **Mobile Responsive** | Bottom nav bar, touch support, skeleton loaders |

### 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Backend** | Express.js (Node.js) |
| **Database** | SQLite (development) · PostgreSQL (production) |
| **Auth** | JWT + bcryptjs |
| **Deployment** | Render |

### ⚙️ Local Setup

```bash
# Navigate to project folder
cd codealpha_SocialApp

# Install Node.js dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env: set PORT and JWT_SECRET

# Start development server
npm run dev
```

> Visit `http://localhost:3000` in your browser. Register a new account to get started.

---

## 🆚 Project Comparison

| | 🛒 ShopKart | 📱 SocialApp |
|--|------------|-------------|
| **Backend** | Django (Python) | Express.js (Node.js) |
| **Auth** | Django Sessions | JWT Tokens |
| **Database** | SQLite / PostgreSQL | SQLite / PostgreSQL |
| **Frontend** | Django Templates | Vanilla JS SPA |
| **Live Demo** | ✅ [View App](https://shopkart-39k3.onrender.com) | ✅ [View App](https://socialapp-0g3e.onrender.com) |
| **API Style** | Django Views | REST API |

---

## 💡 Key Learnings

- ✅ Built REST APIs with both **Django** and **Express.js** — understanding the differences in approach
- ✅ Implemented authentication using **Django sessions** and **JWT tokens**
- ✅ Designed and migrated relational databases from **SQLite → PostgreSQL**
- ✅ Wrote **Vanilla JavaScript** to consume REST APIs without any frontend framework
- ✅ Handled **file uploads**, environment configs, and production deployment on **Render**
- ✅ Applied **mobile-first responsive design** using CSS custom properties and grid
- ✅ Used **Git & GitHub** for version control with clean commit history and `.gitignore` hygiene

---

<div align="center">

## 👨‍💻 About the Developer

### Kumar Ashutosh Narayan
*Web Development Intern @ CodeAlpha*

[![GitHub](https://img.shields.io/badge/GitHub-Ashutosh467-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Ashutosh467)

<br>

*Submitted as part of the **CodeAlpha Web Development Internship Program***

<br>

*Made with ❤️ by [Ashutosh](https://github.com/Ashutosh467)*

</div>
