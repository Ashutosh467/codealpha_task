from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'product_name', 'product_price', 'quantity', 'item_total')
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'user', 'status', 'payment_status', 'total', 'created_at')
    list_filter = ('status', 'payment_status', 'created_at')
    search_fields = ('order_number', 'first_name', 'last_name', 'email')
    readonly_fields = ('order_number', 'created_at', 'updated_at')
    inlines = [OrderItemInline]
    actions = ['mark_as_shipped', 'mark_as_delivered']

    def mark_as_shipped(self, request, queryset):
        updated = queryset.update(status='SHIPPED')
        self.message_user(request, f"{updated} orders have been marked as SHIPPED.")
    mark_as_shipped.short_description = "Mark selected orders as SHIPPED"

    def mark_as_delivered(self, request, queryset):
        updated = queryset.update(status='DELIVERED')
        # Also mark payment status as PAID if it was cash on delivery
        for order in queryset:
            if order.status == 'DELIVERED' and order.payment_status != 'PAID':
                order.payment_status = 'PAID'
                order.save()
        self.message_user(request, f"{updated} orders have been marked as DELIVERED.")
    mark_as_delivered.short_description = "Mark selected orders as DELIVERED"
