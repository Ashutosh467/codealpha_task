<div align="center">

# 🛒 ShopKart
### Full-Stack E-Commerce Web Application

[![Django](https://img.shields.io/badge/Django-4.2-092E20?style=for-the-badge&logo=django&logoColor=white)](https://djangoproject.com)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Production-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com)
[![GitHub](https://img.shields.io/badge/GitHub-Ashutosh467-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Ashutosh467)

<br/>

> A production-ready e-commerce platform built as part of my **CodeAlpha Internship** — featuring product listings, shopping cart, user authentication, order processing, and UPI/COD payment simulation.

<br/>

🌐 **[View Live Demo](https://shopkart-39k3.onrender.com)** &nbsp;|&nbsp; 💻 **[GitHub Repo](https://github.com/Ashutosh467/codealpha_task/tree/main/codealpha_ShopKart)**

</div>

---

## 📸 Project Preview

> Homepage • Product Listing • Cart • Checkout • Order History

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🏠 **Homepage** | Featured products with category filters and search |
| 📦 **Product Catalog** | 20 products across 4 categories with detail pages |
| 🛒 **Shopping Cart** | Session-based cart — works for guests too |
| 👤 **Authentication** | Register, Login, Profile, Password change |
| 📋 **Order Processing** | Full checkout flow with order confirmation |
| 💳 **Payment Methods** | Cash on Delivery + UPI Online Payment simulation |
| 📜 **Order History** | Permanent record of all orders placed |
| 🔐 **Admin Panel** | Full Django admin for managing products & orders |
| 📱 **Responsive Design** | Works on mobile, tablet, and desktop |
| 🇮🇳 **Indian Market** | All prices in ₹ with real Indian market pricing |

---

## 🛠️ Tech Stack

### Backend
- **Django 4.2** — Web framework
- **Django REST Framework** — API layer
- **Django Simple JWT** — Token authentication
- **SQLite** (development) → **PostgreSQL** (production)
- **Gunicorn** — Production WSGI server

### Frontend
- **HTML5** — Semantic markup
- **CSS3** — Custom properties, Flexbox, Grid
- **Vanilla JavaScript (ES6+)** — AJAX cart, DOM manipulation
- **Google Fonts** — Typography

### DevOps & Tools
- **Git + GitHub** — Version control
- **Render.com** — Cloud deployment
- **Whitenoise** — Static file serving
- **Pillow** — Image processing
- **Python Decouple** — Environment variables

---

## 🚀 Local Setup

### Prerequisites
- Python 3.11+
- Git

### Step-by-Step Installation

```bash
# 1. Clone the repository
git clone https://github.com/Ashutosh467/codealpha_task.git
cd codealpha_task/codealpha_ShopKart

# 2. Create virtual environment
python3 -m venv venv

# 3. Activate virtual environment
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# 4. Install dependencies
pip install -r requirements.txt

# 5. Setup environment variables
cp .env.example .env
# Open .env and set your SECRET_KEY

# 6. Run database migrations
python manage.py migrate

# 7. Load sample data (products, users, categories)
python manage.py seed_data

# 8. Download product images
python manage.py download_images

# 9. Start development server
python manage.py runserver 8080
```

Open your browser → **http://127.0.0.1:8080**

---

## 👤 Test Credentials

| Role | Username | Password | Access |
|------|----------|----------|--------|
| 🔑 Admin | `admin` | `admin123` | Full admin panel |
| 👤 User 1 | `user1` | `pass123` | Shopping + orders |
| 👤 User 2 | `user2` | `pass123` | Shopping + orders |
| 👤 User 3 | `user3` | `pass123` | Shopping + orders |

---

## 📁 Project Structure

```
codealpha_ShopKart/
├── apps/
│   ├── accounts/           # User registration, login, profile
│   ├── products/           # Product catalog, categories, search
│   ├── cart/               # Session-based shopping cart
│   └── orders/             # Checkout, order processing, history
├── templates/
│   ├── base.html           # Base layout with navbar & footer
│   ├── accounts/           # Login, register, profile templates
│   ├── products/           # Product list & detail templates
│   ├── cart/               # Cart template
│   └── orders/             # Checkout, confirmation, history
├── static/
│   ├── css/
│   │   └── main.css        # All styles & CSS variables
│   └── js/
│       ├── cart.js         # Cart AJAX logic
│       ├── product.js      # Product gallery & quantity
│       └── auth.js         # Login/register validation
├── ecommerce/
│   ├── settings.py         # Django configuration
│   ├── urls.py             # URL routing
│   └── wsgi.py             # WSGI entry point
├── media/                  # Product images
├── requirements.txt        # Python dependencies
├── Procfile                # Render deployment config
├── build.sh                # Build script for deployment
├── runtime.txt             # Python version for Render
└── manage.py               # Django management
```

## 🗄️ Database Models
CustomUser      → Extended Django user (phone, address)
Category        → Product categories (Electronics, Clothing, Books, Home)
Product         → Products with price, stock, discount, images
ProductImage    → Multiple images per product
Order           → Customer orders with shipping & payment info
OrderItem       → Individual items within each order
---

## 🌐 Live URLs

| Page | Route |
|------|-------|
| Homepage | `/` |
| Products | `/products/` |
| Product Detail | `/products/<slug>/` |
| Cart | `/cart/` |
| Checkout | `/orders/checkout/` |
| Order History | `/orders/history/` |
| Login | `/accounts/login/` |
| Register | `/accounts/register/` |
| Admin | `/admin/` |

---

## 📊 What I Learned

- ✅ Building a full-stack web app from scratch with Django
- ✅ Designing relational database models with Django ORM
- ✅ Implementing session-based cart for authenticated & guest users
- ✅ AJAX requests with vanilla JavaScript (no jQuery)
- ✅ User authentication with login, register, profile management
- ✅ Deploying Django to production with PostgreSQL on Render
- ✅ Managing static files and media in production with Whitenoise
- ✅ Git version control and GitHub for collaboration

---

## 🎓 Internship

This project was built as **Task 1** of my internship at **CodeAlpha**.

**Intern:** Ashutosh  
**GitHub:** [@Ashutosh467](https://github.com/Ashutosh467)  
**Internship:** [CodeAlpha](https://codealpha.tech)  
**Task:** Build a Basic E-Commerce Store

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**⭐ If you found this project helpful, please give it a star! ⭐**

Made with ❤️ by [Ashutosh](https://github.com/Ashutosh467) during CodeAlpha Internship

</div>
