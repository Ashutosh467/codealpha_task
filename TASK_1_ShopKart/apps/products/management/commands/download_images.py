import os
import urllib.request
import ssl
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.products.models import Product

class Command(BaseCommand):
    help = 'Downloads real images from Unsplash for every product and updates the product.image field.'

    def handle(self, *args, **options):
        # Product name to Unsplash URL mapping
        image_mapping = {
            'UltraHD Smart TV': 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834d?w=600&q=80',
            'Noise Cancelling Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
            'Wireless Charging Pad': 'https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=600&q=80',
            'Mechanical Gaming Keyboard': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
            'Ergonomic Wireless Mouse': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80',
            'Classic Cotton T-Shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
            'Slim Fit Denim Jeans': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
            'Cozy Woolen Sweater': 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80',
            'Waterproof Windbreaker Jacket': 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&q=80',
            'Sport Athletic Socks': 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&q=80',
            'The Art of Coding': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
            'Mystery of the Hidden Room': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80',
            'Gourmet Cooking Made Easy': 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&q=80',
            'Financial Freedom Blueprint': 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80',
            'The Space Exploration Odyssey': 'https://images.unsplash.com/photo-1446941611757-91d2c3bd3d45?w=600&q=80',
            'Stainless Steel Coffee Maker': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
            'Digital Air Fryer': 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=600&q=80',
            'Bamboo Cutting Board Set': 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=80',
            'Vacuum Insulated Water Bottle': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80',
            'Memory Foam Pillow': 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80',
        }

        media_products_dir = os.path.join(settings.MEDIA_ROOT, 'products')
        os.makedirs(media_products_dir, exist_ok=True)

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        }

        products = Product.objects.all()
        self.stdout.write(self.style.SUCCESS(f'Found {products.count()} products to process.'))

        for product in products:
            url = image_mapping.get(product.name)
            if not url:
                self.stdout.write(self.style.WARNING(f'Skipped: No mapping for "{product.name}"'))
                continue

            filename = f'{product.slug}.jpg'
            file_path = os.path.join(media_products_dir, filename)

            # Check if file exists and is not empty to be idempotent & fast
            if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
                # Update DB field if not set
                db_relative_path = f'products/{filename}'
                if not product.image or product.image.name != db_relative_path:
                    product.image = db_relative_path
                    product.save()
                self.stdout.write(self.style.SUCCESS(f'Already downloaded (skipped): {product.name}'))
                continue

            try:
                self.stdout.write(f'Downloading image for {product.name}...')
                req = urllib.request.Request(url, headers=headers)
                context = ssl._create_unverified_context()
                with urllib.request.urlopen(req, timeout=15, context=context) as response:
                    with open(file_path, 'wb') as f:
                        f.write(response.read())
                
                # Update database
                product.image = f'products/{filename}'
                product.save()
                self.stdout.write(self.style.SUCCESS(f'Successfully downloaded: {product.name}'))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Failed to download image for {product.name}: {str(e)}'))
