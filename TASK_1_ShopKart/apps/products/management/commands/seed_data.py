import io
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from apps.products.models import Category, Product, ProductImage
from PIL import Image, ImageDraw

User = get_user_model()

def create_color_image(label_text, width=800, height=600, bg_color=(10, 15, 30), text_color=(245, 197, 24)):
    """
    Generates a simple JPEG image using PIL with text drawn in the middle.
    """
    img = Image.new('RGB', (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)
    # Simple line drawings to make it look premium
    draw.rectangle([10, 10, width-10, height-10], outline=text_color, width=3)
    
    # Try to draw some simple graphic elements
    draw.line([width // 4, height // 2, 3 * width // 4, height // 2], fill=text_color, width=2)
    
    # Text fallback drawing (without using external font paths to ensure compatibility)
    draw.text((30, height // 2 - 20), label_text, fill=text_color)
    
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG', quality=85)
    filename = f"{label_text.replace(' ', '_').replace('&', 'and').lower()}.jpg"
    return ContentFile(buffer.getvalue(), name=filename)


class Command(BaseCommand):
    help = 'Seeds database with default categories, 20 products, superuser, and test users.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting database seeding...")

        # 1. Create Superuser and Users
        self.stdout.write("Seeding Users...")
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'admin123', phone_number='1234567890', address='123 Admin Lane')
            self.stdout.write("Created superuser: admin / admin123")
        else:
            self.stdout.write("Superuser 'admin' already exists.")

        test_users = [
            ('user1', 'pass123', 'John Doe', 'user1@example.com', '111-222-3333', '100 Main St, New York, NY'),
            ('user2', 'pass123', 'Jane Smith', 'user2@example.com', '444-555-6666', '200 Oak Ave, Los Angeles, CA'),
            ('user3', 'pass123', 'Bob Johnson', 'user3@example.com', '777-888-9999', '300 Pine Rd, Chicago, IL'),
        ]

        for username, password, full_name, email, phone, addr in test_users:
            if not User.objects.filter(username=username).exists():
                first_name, last_name = full_name.split(' ', 1)
                User.objects.create_user(
                    username=username,
                    password=password,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    phone_number=phone,
                    address=addr
                )
                self.stdout.write(f"Created user: {username} / {password}")
            else:
                self.stdout.write(f"User '{username}' already exists.")

        # 2. Create Categories
        self.stdout.write("Seeding Categories...")
        categories_data = [
            ('Electronics', 'electronics', 'Cutting edge tech and gadgets.'),
            ('Clothing', 'clothing', 'Modern luxury threads and everyday apparel.'),
            ('Books', 'books', 'Literary worlds, tech manuals, and guidebooks.'),
            ('Home & Kitchen', 'home-and-kitchen', 'Premium items and appliances for your home.')
        ]

        categories = {}
        for name, slug, desc in categories_data:
            cat, created = Category.objects.get_or_create(slug=slug, defaults={'name': name, 'description': desc})
            if created or not cat.image:
                img_file = create_color_image(f"Category: {name}", bg_color=(20, 25, 40))
                cat.image.save(img_file.name, img_file, save=True)
            categories[slug] = cat
            self.stdout.write(f"Category '{name}' verified.")

        # 3. Create 20 Products
        self.stdout.write("Seeding Products...")
        products_data = [
            # Electronics
            ('UltraHD Smart TV', 'ultrahd-smart-tv', 'electronics', 
             'Immerse yourself in stunning 4K resolution with this smart television.', '64999', '54999', 15),
            ('Noise Cancelling Headphones', 'noise-cancelling-headphones', 'electronics', 
             'Pure sound with zero distractions. Active noise cancellation.', '32999', '24999', 30),
            ('Wireless Charging Pad', 'wireless-charging-pad', 'electronics', 
             'Fast wireless charging for all Qi-enabled mobile devices.', '3499', '2499', 100),
            ('Mechanical Gaming Keyboard', 'mechanical-gaming-keyboard', 'electronics', 
             'Tactile switches, per-key RGB backlighting, built for performance.', '12999', '8999', 25),
            ('Ergonomic Wireless Mouse', 'ergonomic-wireless-mouse', 'electronics', 
             'Reduces wrist strain, features customizable side shortcut buttons.', '4999', '3499', 45),
            
            # Clothing
            ('Classic Cotton T-Shirt', 'classic-cotton-t-shirt', 'clothing', 
             '100% organic cotton, breathable fit, available in multiple shades.', '1299', '799', 200),
            ('Slim Fit Denim Jeans', 'slim-fit-denim-jeans', 'clothing', 
             'Sturdy classic denim with a touch of stretch for day-long comfort.', '3999', '2499', 75),
            ('Cozy Woolen Sweater', 'cozy-woolen-sweater', 'clothing', 
             'Premium Merino wool blend sweater designed to keep you cozy.', '5499', '3499', 40),
            ('Waterproof Windbreaker Jacket', 'waterproof-windbreaker-jacket', 'clothing', 
             'Lightweight protective shell perfect for outdoor running or hiking.', '7999', '4999', 60),
            ('Sport Athletic Socks', 'sport-athletic-socks', 'clothing', 
             'Pack of 3 moisture-wicking compression socks for runners.', '699', '399', 150),
             
            # Books
            ('The Art of Coding', 'the-art-of-coding', 'books', 
             'A masterclass guide on design patterns, algorithms, and clean architecture.', '899', '599', 80),
            ('Mystery of the Hidden Room', 'mystery-of-the-hidden-room', 'books', 
             'An edge-of-your-seat thriller novel written by bestselling authors.', '599', '349', 120),
            ('Gourmet Cooking Made Easy', 'gourmet-cooking-made-easy', 'books', 
             'Over 100 simple recipes to transform your cooking into five-star meals.', '799', '499', 50),
            ('Financial Freedom Blueprint', 'financial-freedom-blueprint', 'books', 
             'Learn index funds, saving strategies, and retirement planning.', '699', '449', 90),
            ('The Space Exploration Odyssey', 'the-space-exploration-odyssey', 'books', 
             'A pictorial journey through humanity\'s conquest of the cosmos.', '849', '549', 35),

            # Home & Kitchen
            ('Stainless Steel Coffee Maker', 'stainless-steel-coffee-maker', 'home-and-kitchen', 
             'Programmable 12-cup drip coffee machine with auto-shutoff.', '9999', '6999', 20),
            ('Digital Air Fryer', 'digital-air-fryer', 'home-and-kitchen', 
             '8-in-1 touchscreen cooker with rapid hot air circulation.', '11999', '7999', 15),
            ('Bamboo Cutting Board Set', 'bamboo-cutting-board-set', 'home-and-kitchen', 
             'Set of 3 environment friendly cutting blocks of varying sizes.', '2299', '1499', 110),
            ('Vacuum Insulated Water Bottle', 'vacuum-insulated-water-bottle', 'home-and-kitchen', 
             'Keeps drinks ice cold for 24 hours or steaming hot for 12 hours.', '1999', '1299', 140),
            ('Memory Foam Pillow', 'memory-foam-pillow', 'home-and-kitchen', 
             'Ergonomic contour design supporting neck and back alignment.', '4499', '2999', 50),
        ]

        for name, slug, cat_slug, desc, price, disc_price, stock in products_data:
            cat = categories[cat_slug]
            disc = Decimal(disc_price) if disc_price else None
            
            prod, created = Product.objects.get_or_create(
                slug=slug,
                defaults={
                    'category': cat,
                    'name': name,
                    'description': desc,
                    'price': Decimal(price),
                    'discount_price': disc,
                    'stock': stock,
                    'is_available': True
                }
            )
            
            # Update price/discount_price if product already exists to migrate to Rupee values
            if not created:
                prod.price = Decimal(price)
                prod.discount_price = disc
                prod.save()
            
            # Save product image if missing
            if created or not prod.image:
                img_file = create_color_image(name, bg_color=(15, 20, 35))
                prod.image.save(img_file.name, img_file, save=True)
                
                # Seed additional images for detail gallery
                for idx in range(1, 3):
                    sub_img_file = create_color_image(f"{name} Detail {idx}", width=400, height=300, bg_color=(25, 30, 45))
                    pi = ProductImage.objects.create(
                        product=prod,
                        alt_text=f"Detail view {idx} of {name}"
                    )
                    pi.image.save(sub_img_file.name, sub_img_file, save=True)

            self.stdout.write(f"Product '{name}' verified.")

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
