from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)

    class Meta:
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    stock = models.PositiveIntegerField()
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return self.name

    @property
    def is_in_stock(self):
        return self.stock > 0

    @property
    def discount_percent(self):
        if self.discount_price and self.price > 0:
            discount = self.price - self.discount_price
            return int((discount / self.price) * 100)
        return 0

    @property
    def image_url(self):
        unsplash = {
            'UltraHD Smart TV': 'https://images.unsplash.com/photo-1571415060716-baff5f717c37?w=600&q=80',
            'Noise Cancelling Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
            'Wireless Charging Pad': 'https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=600&q=80',
            'Mechanical Gaming Keyboard': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
            'Ergonomic Wireless Mouse': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80',
            'Classic Cotton T-Shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
            'Slim Fit Denim Jeans': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
            'Cozy Woolen Sweater': 'https://images.unsplash.com/photo-1608744882201-52a7f7f3dd60?w=600&q=80',
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
        return unsplash.get(self.name, 'https://images.unsplash.com/photo-1560472355-536de3962603?w=600&q=80')

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='product_images/')
    alt_text = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"Image for {self.product.name}"
