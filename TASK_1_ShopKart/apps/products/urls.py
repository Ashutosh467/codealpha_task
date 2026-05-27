from django.urls import path
from . import views

app_name = 'products'

urlpatterns = [
    # root URL routes to the homepage list (limit 8, featured)
    path('', views.ProductListView.as_view(), name='product_list_root'),
    # products/ route routes to list page with full filter/search/sort
    path('products/', views.ProductListView.as_view(), name='product_list'),
    # details of a product
    path('products/<slug:slug>/', views.ProductDetailView.as_view(), name='product_detail'),
]
