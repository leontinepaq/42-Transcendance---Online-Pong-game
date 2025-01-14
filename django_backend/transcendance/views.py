import random
import string
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.core.mail import send_mail
from django.contrib import messages
from django.conf import settings
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.models import User
from .forms import CustomUserCreationForm
from django.utils.crypto import get_random_string
from .models import UserProfile
from django.contrib.auth.decorators import login_required

#LOGIN
# Custom SignUp view with confirm password
def signup(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Account created successfully! You can now log in.')
            return redirect('login')  # Redirect to login after successful sign up
    else:
        form = CustomUserCreationForm()
    return render(request, 'signup.html', {'form': form})


# Utility function to generate random 6-digit code for 2FA
def generate_2fa_code():
    return get_random_string(length=6, allowed_chars=string.digits)


# View for login (email and password)
def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            # Generate 2FA code
            code = generate_2fa_code()
            request.session['2fa_code'] = code
            request.session['user_id'] = user.id

            # Send 2FA code to user's email
            send_mail(
                'Your 2FA Code',
                f'Your 2FA code is: {code}',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            return redirect('verify_2fa')
        else:
            messages.error(request, 'Invalid credentials')

    else:
        form = AuthenticationForm()

    return render(request, 'login.html', {'form': form})


# View for 2FA code verification
def verify_2fa(request):
    if request.method == 'POST':
        code = request.POST.get('code')
        user_id = request.session.get('user_id')
        correct_code = request.session.get('2fa_code')

        if code == correct_code:
            user = User.objects.get(id=user_id)
            login(request, user)
            del request.session['2fa_code']
            del request.session['user_id']
            return redirect('home')  # Redirect to home or dashboard
        else:
            messages.error(request, 'Invalid 2FA code')

    return render(request, 'verify_2fa.html')



#HOME
@login_required
def home_view(request):
    user_profile = UserProfile.objects.get(user=request.user)

    friends = user_profile.friends.all()

    return render(reqest, 'home.html', {
        'user_profile': user_profile,
        'friends': friends,
    })

@login_required
def play_game(request):
    # add game logic here
    return render(request, 'play_game.html')

@login_required
def history_view(request):
    history = MatchHistory.objects.filter(user=request.user)

    return render(request, 'history.html', {'history': history})

@login_required
def profile_view(request):
    user_profile = UserProfile.objects.get(user=request.user)

    return render(request, 'profile.html', {'user_profile': user_profile})

