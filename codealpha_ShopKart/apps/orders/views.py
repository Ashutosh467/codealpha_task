from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.contrib import messages
from decimal import Decimal

from apps.cart.cart import Cart
from .models import Order, OrderItem
from apps.products.models import Product

@method_decorator(login_required, name='dispatch')
class CheckoutView(View):
    template_name = 'orders/checkout.html'

    def get(self, request):
        cart = Cart(request)
        if len(cart) == 0:
            messages.warning(request, "Your cart is empty. Add products before checkout.")
            return redirect('cart:cart_detail')

        # Calculate totals in Rupees
        subtotal = cart.get_total_price()
        if subtotal < Decimal('500.00'):
            shipping_cost = Decimal('49.00')
            subtotal_diff = Decimal('500.00') - subtotal
        else:
            shipping_cost = Decimal('0.00')
            subtotal_diff = Decimal('0.00')
            
        tax = (subtotal * Decimal('0.18')).quantize(Decimal('0.01'))
        total = subtotal + shipping_cost + tax

        # Prefill user details from profile
        user = request.user
        prefill_data = {
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'phone': user.phone_number or '',
            'address': user.address or '',
        }

        context = {
            'cart': cart,
            'subtotal': subtotal,
            'shipping_cost': shipping_cost,
            'subtotal_diff': subtotal_diff,
            'tax': tax,
            'total': total,
            'prefill_data': prefill_data,
        }
        return render(request, self.template_name, context)

    def post(self, request):
        cart = Cart(request)
        if len(cart) == 0:
            messages.error(request, "Your cart is empty.")
            return redirect('cart:cart_detail')

        # Read fields from form
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        address = request.POST.get('address')
        city = request.POST.get('city')
        state = request.POST.get('state')
        zip_code = request.POST.get('zip_code')  # PIN Code
        country = request.POST.get('country')
        notes = request.POST.get('notes', '')
        payment_method = request.POST.get('payment_method', 'cod')
        upi_transaction_id = request.POST.get('upi_transaction_id', '').strip()

        # Validations
        if not all([first_name, last_name, email, phone, address, city, state, zip_code, country]):
            messages.error(request, "Please fill out all shipping address fields.")
            return redirect('orders:checkout')

        if payment_method == 'online' and not upi_transaction_id:
            messages.error(request, "Please enter the UPI Transaction ID to confirm online payment.")
            return redirect('orders:checkout')

        # Recalculate totals for order
        subtotal = cart.get_total_price()
        if subtotal < Decimal('500.00'):
            shipping_cost = Decimal('49.00')
        else:
            shipping_cost = Decimal('0.00')
            
        tax = (subtotal * Decimal('0.18')).quantize(Decimal('0.01'))
        total = subtotal + shipping_cost + tax

        # Determine payment status based on payment method
        if payment_method == 'online':
            payment_status = 'PAID'
        else:
            payment_status = 'UNPAID'

        # Create Order record
        order = Order.objects.create(
            user=request.user,
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            address=address,
            city=city,
            state=state,
            zip_code=zip_code,
            country=country,
            payment_method=payment_method,
            payment_status=payment_status,
            upi_transaction_id=upi_transaction_id if payment_method == 'online' else '',
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            tax=tax,
            total=total,
            notes=notes,
            status='PENDING'
        )

        # Create Order Items and decrease product inventory
        for item in cart:
            product = item['product']
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                product_price=item['price'],
                quantity=item['quantity']
            )
            # Update stock
            product.stock -= item['quantity']
            if product.stock <= 0:
                product.stock = 0
                product.is_available = False
            product.save()

        # Clear cart session
        cart.clear()

        # Add success message and redirect to confirmation
        messages.success(request, f"Thank you! Your order {order.order_number} has been created successfully.")
        return redirect('orders:order_confirm', order_number=order.order_number)


class OrderConfirmView(View):
    template_name = 'orders/order_confirm.html'

    def get(self, request, order_number):
        order = get_object_or_404(Order, order_number=order_number)
        return render(request, self.template_name, {'order': order})


@method_decorator(login_required, name='dispatch')
class OrderHistoryView(View):
    template_name = 'orders/order_history.html'

    def get(self, request):
        orders = Order.objects.filter(user=request.user)
        return render(request, self.template_name, {'orders': orders})
