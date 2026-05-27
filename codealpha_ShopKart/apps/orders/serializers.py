from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    item_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'product_price', 'quantity', 'item_total')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'user', 'order_number', 'status', 'first_name', 'last_name',
            'email', 'phone', 'address', 'city', 'state', 'zip_code', 'country',
            'payment_method', 'payment_status', 'stripe_payment_intent',
            'subtotal', 'shipping_cost', 'tax', 'total', 'notes',
            'items', 'created_at', 'updated_at'
        )
