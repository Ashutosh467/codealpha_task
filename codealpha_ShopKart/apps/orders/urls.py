from django.urls import path
from . import views

app_name = 'orders'

urlpatterns = [
    path('checkout/', views.CheckoutView.as_view(), name='checkout'),
    path('confirm/<str:order_number>/', views.OrderConfirmView.as_view(), name='order_confirm'),
    path('history/', views.OrderHistoryView.as_view(), name='order_history'),
]
