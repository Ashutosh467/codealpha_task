from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_protect
from apps.products.models import Product
from .cart import Cart
import json

def cart_detail(request):
    cart = Cart(request)
    return render(request, 'cart/cart_detail.html', {'cart': cart})


@require_POST
def cart_add(request):
    cart = Cart(request)
    product_id = request.POST.get('product_id')
    quantity = int(request.POST.get('quantity', 1))
    override_quantity = request.POST.get('override', 'False') == 'True'
    
    product = get_object_or_404(Product, id=product_id)
    
    if quantity <= 0:
        return JsonResponse({'success': False, 'error': 'Quantity must be positive.'}, status=400)
        
    if product.stock < quantity:
        return JsonResponse({
            'success': False, 
            'error': f'Only {product.stock} items are in stock.'
        }, status=400)
        
    cart.add(product=product, quantity=quantity, override_quantity=override_quantity)
    
    return JsonResponse({
        'success': True,
        'cart_count': len(cart),
        'message': f'Added {product.name} to cart.'
    })


@require_POST
def cart_remove(request):
    cart = Cart(request)
    product_id = request.POST.get('product_id')
    product = get_object_or_404(Product, id=product_id)
    cart.remove(product)
    
    return JsonResponse({
        'success': True,
        'cart_count': len(cart),
        'cart_total': str(cart.get_total_price()),
        'message': f'Removed {product.name} from cart.'
    })


@require_POST
def cart_update(request):
    cart = Cart(request)
    product_id = request.POST.get('product_id')
    quantity = int(request.POST.get('quantity', 1))
    
    product = get_object_or_404(Product, id=product_id)
    
    if quantity <= 0:
        cart.remove(product)
        return JsonResponse({
            'success': True,
            'cart_count': len(cart),
            'cart_total': str(cart.get_total_price()),
            'removed': True,
            'message': f'Removed {product.name} from cart.'
        })
        
    if product.stock < quantity:
        return JsonResponse({
            'success': False, 
            'error': f'Only {product.stock} items are in stock.'
        }, status=400)
        
    cart.add(product=product, quantity=quantity, override_quantity=True)
    
    # Calculate total for the specific item
    price = product.discount_price if product.discount_price else product.price
    item_total = price * quantity
    
    return JsonResponse({
        'success': True,
        'cart_count': len(cart),
        'cart_total': str(cart.get_total_price()),
        'item_total': str(item_total),
        'message': f'Updated quantity for {product.name}.'
    })
