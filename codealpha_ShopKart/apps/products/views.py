from django.shortcuts import render, get_object_or_404
from django.views.generic import ListView, DetailView
from django.db.models import Q, Sum
from django.db.models.functions import Coalesce
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import Product, Category, ProductImage

class ProductListView(ListView):
    model = Product
    template_name = 'products/product_list.html'
    context_object_name = 'products'
    
    def get(self, request, *args, **kwargs):
        # Determine if we are on the homepage or the search/catalog page
        path = request.path
        is_homepage = (path == '/')
        
        # Base queryset for active products
        queryset = Product.objects.filter(is_available=True)
        categories = Category.objects.all()
        
        if is_homepage:
            # Homepage: featured products (ordered by -created_at, limit 8)
            products = queryset.order_by('-created_at')[:8]
            context = {
                'products': products,
                'is_homepage': True,
                'categories': categories,
            }
            return render(request, self.template_name, context)
            
        else:
            # Catalog page with sorting, filtering, and searching
            query = request.GET.get('q', '')
            category_slug = request.GET.get('category', '')
            sort_by = request.GET.get('sort', 'newest')
            
            # Apply search
            if query:
                queryset = queryset.filter(
                    Q(name__icontains=query) | Q(description__icontains=query)
                )
            
            # Apply category filter
            active_category = None
            if category_slug:
                active_category = get_object_or_404(Category, slug=category_slug)
                queryset = queryset.filter(category=active_category)
            
            # Popularity sort utilizes order item quantity annotations
            queryset = queryset.annotate(total_sales=Coalesce(Sum('orderitem__quantity'), 0))
            
            # Apply sorting
            if sort_by == 'price_asc':
                queryset = queryset.order_by('price')
            elif sort_by == 'price_desc':
                queryset = queryset.order_by('-price')
            elif sort_by == 'popularity':
                queryset = queryset.order_by('-total_sales', '-created_at')
            else: # newest
                queryset = queryset.order_by('-created_at')
            
            # Pagination (12 per page)
            paginator = Paginator(queryset, 12)
            page = request.GET.get('page')
            try:
                paginated_products = paginator.page(page)
            except PageNotAnInteger:
                paginated_products = paginator.page(1)
            except EmptyPage:
                paginated_products = paginator.page(paginator.num_pages)
                
            context = {
                'products': paginated_products,
                'is_homepage': False,
                'categories': categories,
                'active_category': active_category,
                'query': query,
                'sort_by': sort_by,
            }
            return render(request, self.template_name, context)


class ProductDetailView(DetailView):
    model = Product
    template_name = 'products/product_detail.html'
    context_object_name = 'product'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        product = self.object
        # Retrieve extra images
        context['images'] = product.images.all()
        # Retrieve related products (same category, exclude current, limit 4)
        context['related_products'] = Product.objects.filter(
            category=product.category, 
            is_available=True
        ).exclude(id=product.id)[:4]
        return context
