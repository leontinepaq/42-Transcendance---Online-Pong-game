import random
import string
from django.shortcuts import render, redirect, get_object_or_404
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
from django.http import JsonResponse
from django.urls import reverse
from .models import UserProfile, Tournament, Game, MatchHistory

#----------------------------LOGIN----------------------------
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



#----------------------------HOME----------------------------
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
    return render(request, 'play.html')

@login_required
def history_view(request):
    history = MatchHistory.objects.filter(user=request.user)

    return render(request, 'history.html', {'history': history})

@login_required
def profile_view(request):
    user_profile = UserProfile.objects.get(user=request.user)

    return render(request, 'profile.html', {'user_profile': user_profile})

#----------------------------PLAY----------------------------
#main play page
@login_required
def play_view(request):
	friends = request.user.userprofile.friends.all()
	return render(request, 'play.html', {'friends': friends})


#quick game vs IA
@login_required
def quick_game(request):
	#placeholder logic for IA
	return render(request, 'quick_game_ia.html')

#Quick game vs friend, invite and play
@login_required
def quick_game_friend(request):
    friends = request.user.userprofile.friends.all()
    return render(request, 'quick_game_friend.html', {'friends': friends})


#Create a game with friend
@login_required
def play_game_with_friends(request):
	friend_id = request.POST['friend']
	friend = get_object_or_404(UserProfile, id=friend_id)

	game = Game.objects.create(
		player1=request.user.userprofile,
		player2=friend
	)
	return JsonResponse({'status': 'success', 'game_id':game.id})

#Create a tournament
@login_required
def create_tournament(request):
    if request.method == 'POST':
        tournament_name = request.POST['tournament_name']
        invited_friends_ids = request.POST.getlist('friends')
        friends = UserProfile.objects.filter(id__in=invited_friends_ids)

        tournament = Tournament.objects.create(name=tournament_name, creator=request.user.userprofile)
        tournament.participants.add(request.user.userprofile, *friends)
        return JsonResponse({'status': 'success', 'tournament_id': tournament.id})

    friends = request.user.userprofile.friends.all()
    return render(request, 'create_tournament.html', {'friends': friends})


#----------------------------HISTORY----------------------------
#Main history page
@login_required
def history_view(request):
	return render(request, 'history.html')

#display all matches the user has played
@login_required
def match_history_view(request):
	match_history = MatchHistory.objets.filter(user=request.user.userprofile).order_by('-created_at')
	return render(request, 'match-history.html', {'matches':match_history})

#Display all tournaments the user has participated in
@login_required
def tournament_history_view(request):
    tournaments = Tournament.objects.filter(participants=request.user.userprofile).order_by('-created_at')
    return render(request, 'tournament_history.html', {'tournaments': tournaments})

#Display all games played in a specific tournament
@login_required
def tournament_recap_view(request, tournament_id):
    tournament = Tournament.objects.get(id=tournament_id)
    games = tournament.games.all()
    return render(request, 'tournament_recap.html', {'tournament': tournament, 'games': games})


#--------------------------------PROFILE----------------------------
#Main profile page
@login_required
def profile_view(request):
    user_profile = request.user.userprofile
    return render(request, 'profile.html', {'user_profile': user_profile})

#update profile
@login_required
def update_profile(request):
    user_profile = request.user.userprofile
    if request.method == 'POST':
        form = UserProfileForm(request.POST, instance=user_profile)
        if form.is_valid():
            form.save()
            messages.success(request, 'Profile updated successfully!')
            return redirect('profile')
    else:
        form = UserProfileForm(instance=user_profile)
    return render(request, 'update_profile.html', {'form': form})


#change password
@login_required
def change_password(request):
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # Keep the user logged in
            messages.success(request, 'Your password was successfully updated!')
            return redirect('profile')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = PasswordChangeForm(request.user)
    return render(request, 'change_password.html', {'form': form})

#customize
@login_required
def customize_profile(request):
    user_profile = request.user.userprofile
    if request.method == 'POST':
        form = CustomizationForm(request.POST, request.FILES, instance=user_profile)
        if form.is_valid():
            form.save()
            messages.success(request, 'Customization saved successfully!')
            return redirect('profile')
    else:
        form = CustomizationForm(instance=user_profile)
    return render(request, 'customize_profile.html', {'form': form})

#do we really need this ? ai settings change
# @login_required
# def ai_settings(request):
#     user_profile = request.user.userprofile
#     if request.method == 'POST':
#         form = AISettingsForm(request.POST, instance=user_profile)
#         if form.is_valid():
#             form.save()
#             messages.success(request, 'AI settings updated successfully!')
#             return redirect('profile')
#     else:
#         form = AISettingsForm(instance=user_profile)
#     return render(request, 'ai_settings.html', {'form': form})

@login_required
def sign_out(request):
    logout(request)
    return redirect('login')

#----------------------------FRIENDS PROFILE----------------------------
#view friend profile
@login_required
def friend_profile(request):
	friend = get_object_or_404(UserProfile, id=friend_id)
	match_history = MatchHistory.objects.filter(user=friend)
	tournament_history = TournamentHistory.objects.filter(user=friend)

	return render(request, 'friend_profile.html', {
		'friend': friend,
		'match_history': match_history,
		'tournament_history': tournament_history,
	})

#remove friend from friendlist
#/!\ implement differently if user not in friendlist
@login_required
def remove_friend(request, friend_id):
    user_profile = request.user.userprofile
    friend = get_object_or_404(UserProfile, id=friend_id)

    # Remove the friend from the user's friend list
    if friend in user_profile.friends.all():
        user_profile.friends.remove(friend)
        messages.success(request, f'{friend.username} has been removed from your friends list.')
    else:
        messages.error(request, 'You are not friends with this user.')

    return redirect('profile')