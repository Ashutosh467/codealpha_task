from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import login, logout, authenticate, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from django.views import View
from django.utils.decorators import method_decorator
from .forms import CustomUserCreationForm, CustomUserLoginForm, ProfileUpdateForm

class RegisterView(View):
    def get(self, request):
        if request.user.is_authenticated:
            return redirect('products:product_list')
        form = CustomUserCreationForm()
        return render(request, 'accounts/register.html', {'form': form})

    def post(self, request):
        if request.user.is_authenticated:
            return redirect('products:product_list')
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f"Welcome to our store, {user.username}! Your account has been created.")
            return redirect('products:product_list')
        else:
            messages.error(request, "Please correct the errors below.")
        return render(request, 'accounts/register.html', {'form': form})


class LoginView(View):
    def get(self, request):
        if request.user.is_authenticated:
            return redirect('products:product_list')
        form = CustomUserLoginForm()
        return render(request, 'accounts/login.html', {'form': form})

    def post(self, request):
        if request.user.is_authenticated:
            return redirect('products:product_list')
        form = CustomUserLoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f"Welcome back, {user.username}!")
                next_url = request.GET.get('next', 'products:product_list')
                # Safety check for redirection URL
                if not next_url.startswith('/') and not next_url.startswith('http://') and not next_url.startswith('https://'):
                    next_url = 'products:product_list'
                return redirect(next_url)
            else:
                messages.error(request, "Invalid username or password.")
        else:
            messages.error(request, "Please check your credentials.")
        return render(request, 'accounts/login.html', {'form': form})


class LogoutView(View):
    def post(self, request):
        logout(request)
        messages.success(request, "You have been logged out successfully.")
        return redirect('products:product_list')

    def get(self, request):
        logout(request)
        messages.success(request, "You have been logged out successfully.")
        return redirect('products:product_list')


@method_decorator(login_required, name='dispatch')
class ProfileView(View):
    def get(self, request):
        form = ProfileUpdateForm(instance=request.user)
        return render(request, 'accounts/profile.html', {'form': form})

    def post(self, request):
        form = ProfileUpdateForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, "Your profile has been updated successfully.")
            return redirect('accounts:profile')
        else:
            messages.error(request, "Please correct the errors below.")
        return render(request, 'accounts/profile.html', {'form': form})


@method_decorator(login_required, name='dispatch')
class CustomPasswordChangeView(View):
    def get(self, request):
        form = PasswordChangeForm(user=request.user)
        return render(request, 'accounts/password_change.html', {'form': form})

    def post(self, request):
        form = PasswordChangeForm(user=request.user, data=request.POST)
        if form.is_valid():
            user = form.save()
            # Keep the user logged in after password change
            update_session_auth_hash(request, user)
            messages.success(request, "Your password has been changed successfully!")
            return redirect('accounts:profile')
        else:
            messages.error(request, "Please correct the errors below.")
        return render(request, 'accounts/password_change.html', {'form': form})
