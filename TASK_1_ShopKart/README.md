cat > /Users/ashutosh/Desktop/e-store/README.md << 'EOF'
# ShopKart 🛒

A full-stack e-commerce web application built with Django and Python.

## 🌐 Live Demo
[ShopKart Live](https://shopkart-39k3.onrender.com)

## 📋 Features
- 🛍️ Product listings with categories and search
- 🔍 Product detail page with image gallery
- 🛒 Shopping cart (session-based)
- 👤 User registration and login
- 📦 Order processing and history
- 💳 Cash on Delivery and Online Payment (UPI)
- 🔐 Secure authentication
- 📱 Fully responsive design
- 🛠️ Admin panel for managing products and orders

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Backend | Django 4.2, Django REST Framework |
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Database | SQLite (dev), PostgreSQL (prod) |
| Auth | Django Session Auth + JWT |
| Deployment | Render.com |
| Version Control | Git + GitHub |

## 🚀 Local Setup

### Prerequisites
- Python 3.11+
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/Ashutosh467/shopkart.git
cd shopkart

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env and add your SECRET_KEY

# Run migrations
python manage.py migrate

# Load sample data
python manage.py seed_data

# Download product images
python manage.py download_images

# Start server
python manage.py runserver 8080
```

Visit `http://127.0.0.1:8080`

## 👤 Test Credentials
| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| User | user1 | pass123 |
| User | user2 | pass123 |

## 📁 Project Structure
shopkart/
├── apps/
│   ├── accounts/     # User auth
│   ├── products/     # Product catalog
│   ├── cart/         # Shopping cart
│   └── orders/       # Order processing
├── templates/        # HTML templates
├── static/           # CSS, JS, images
├── media/            # Product images
└── ecommerce/        # Django settings
