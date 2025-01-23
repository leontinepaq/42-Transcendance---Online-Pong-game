
# !!!!!! IF ANYTHIHNG WRONG GO BACK TO https://claude.ai/chat/9380f71a-b04a-451d-881d-2376956769a5

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_201_CREATED
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import get_object_or_404
from .serializers import (
    UserProfileSerializer, GameSerializer, TournamentSerializer,
    MatchHistorySerializer, PlayerStatisticsSerializer, FriendshipSerializer
)
from .models import (
    UserProfile, Game, Tournament, MatchHistory,
    PlayerStatistics, Friendship
)

# -------------------------------------- Authentication Views --------------------------------------
# signup
@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    serializer = UserProfileSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# login
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user:
        # Generate and send 2FA code
        code = generate_2fa_code()
        request.session['2fa_code'] = code
        request.session['user_id'] = user.id

        code_expiry = timezone.now() + timedelta(minutes=5)
        request.session['2fa_expiry'] = code_expiry
        
        try:
            send_mail(
                'Your 2FA Code',
                f'Your 2FA code is: {code}',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            return Response({'message': '2FA code sent'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

#verify 2fa
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_2fa(request):
    code = request.data.get('code')
    user_id = request.session.get('user_id')
    correct_code = request.session.get('2fa_code')
    code_expiry = request.session.get('2fa_expiry')

    if not all([code, user_id, correct_code, code_expiry]):
        return Response({'error': 'Session expired'}, status=status.HTTP_400_BAD_REQUEST)

    if timezone.now() > code_expiry:
        return Response({'error': '2FA code has expired'}, status=status.HTTP_400_BAD_REQUEST)

    if code == correct_code:
        try:
            user = UserProfile.objects.get(id=user_id)
            login(request, user)

            del request.session['2fa_code']
            del request.session['user_id']
            del request.session['2fa_expiry']

            serializer = UserProfileSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    return Response({'error': 'Invalid 2FA code'}, status=status.HTTP_400_BAD_REQUEST)

#signout
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sign_out(request):
    logout(request)
    del request.session['2fa_code']
    del request.session['user_id']
    del request.session['2fa_expiry']
    return Response(status=status.HTTP_200_OK)


# -------------------------------------- Game Views --------------------------------------
#Game View
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def game_view(request):
	games = Game.objects.filter(player1=request.user) | Game.objects.filter(player2=request.user)
	serializer = GameSerializer(games, many=True)
	return Response(serializer.data)

# Invite to game
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_game_invitation(request):
    friend_id = request.data.get('friend_id')
    friend = get_object_or_404(UserProfile, id=friend_id)

    is_friend = Friendship.objects.filter(
        (Q(user=request.user) & Q(friend=friend) & Q(status='accepted')) |
        (Q(user=friend) & Q(friend=request.user) & Q(status='accepted'))
    ).exists()

    if not is_friend:
        return Response({'error': 'Not friends with this user'}, status=status.HTTP_400_BAD_REQUEST)

    # Create a game in "pending" status
    game = Game.objects.create(player1=request.user, player2=friend, status=Game.STATUS_PENDING)
    serializer = GameSerializer(game)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

# Accept invitation
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_game_invitation(request, game_id):
    game = get_object_or_404(Game, id=game_id, player2=request.user, status=Game.STATUS_PENDING)

    game.status = Game.STATUS_ACTIVE
    game.save()

    serializer = GameSerializer(game)
    return Response(serializer.data, status=status.HTTP_200_OK)

# Show friendlist
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def friends_list(request):
    friendships = Friendship.objects.filter(
        Q(user=request.user, status='accepted') | Q(friend=request.user, status='accepted')
    )
    friends = [fs.friend if fs.user == request.user else fs.user for fs in friendships]
    serializer = UserProfileSerializer(friends, many=True)
    return Response(serializer.data)


# -------------------------------------- Tournament View --------------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tournament_view(request):
    tournaments = Tournament.objects.filter(participants=request.user)
    serializer = TournamentSerializer(tournaments, many=True)
    return Response(serializer.data)

# Create tourney
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_tournament_view(request):
    organizer = request.user
    tournament_name = request.data.get('name')
    invited_player_ids = request.data.get('invited_players', [])  # List of player IDs for remote players
    local_player_count = request.data.get('local_players', 0)  # Number of local players (on the same keyboard)

    # Validate that the tournament name is provided
    if not tournament_name:
        return Response({'error': 'Tournament name is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Create the tournament
    tournament = Tournament.objects.create(
        name=tournament_name,
        organizer=organizer
    )

    # Add the organizer to the tournament as a participant
    tournament.participants.add(organizer)

    # Add invited players to the tournament
    if invited_player_ids:
        invited_players = UserProfile.objects.filter(id__in=invited_player_ids, is_active=True).exclude(id=organizer.id)
        tournament.participants.add(*invited_players)

    # Add placeholders for local players
    for i in range(local_player_count):
        local_player_name = f"Local Player {i + 1}"
        local_player = LocalPlayer.objects.create(name=local_player_name, tournament=tournament)
        tournament.local_players.add(local_player)

    # Serialize and return the tournament details
    serializer = TournamentSerializer(tournament)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


# Invite to tourney
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def invite_to_tournament(request, tournament_id):
    tournament = get_object_or_404(Tournament, id=tournament_id, organizer=request.user, status='pending')
    
    # Invite remote player by username
    username = request.data.get('username', None)
    if username:
        participant = get_object_or_404(UserProfile, username=username)

        if participant in tournament.participants.all():
            return Response({'error': 'User is already a participant.'}, status=status.HTTP_400_BAD_REQUEST)

        tournament.participants.add(participant)
        tournament.save()
        return Response({'message': f'{username} invited to the tournament.'}, status=status.HTTP_200_OK)

    # Add local players directly
    local_player_names = request.data.get('local_players', [])
    for name in local_player_names:
        local_player, _ = LocalPlayer.objects.get_or_create(name=name, organizer=request.user)
        tournament.local_players.add(local_player)

    tournament.save()
    return Response({'message': 'Players added to the tournament.'}, status=status.HTTP_200_OK)



# Accept tourney invite
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_tournament_invitation(request, tournament_id):
    tournament = get_object_or_404(Tournament, id=tournament_id, status='pending')

    # Ensure the user is a remote participant
    if request.user not in tournament.participants.all():
        return Response({'error': 'You are not a participant of this tournament.'}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'message': 'Tournament invitation accepted.'}, status=status.HTTP_200_OK)


# Launch tourney after everyone accepted
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def launch_tournament(request, tournament_id):
    tournament = get_object_or_404(Tournament, id=tournament_id, organizer=request.user, status='pending')

    # Ensure there are exactly 4 players (remote + local)
    total_players = tournament.participants.count() + tournament.local_players.count()
    if total_players != 4:
        return Response({'error': 'Tournament must have exactly 4 players (remote + local).'}, status=status.HTTP_400_BAD_REQUEST)

    tournament.status = 'active'
    tournament.save()
    return Response({'message': 'Tournament launched successfully.'}, status=status.HTTP_200_OK)



# -------------------------------------- History Views --------------------------------------
#history view
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def history_view(request):
    # Fetch match history
    match_history = MatchHistory.objects.filter(user=request.user)
    match_serializer = MatchHistorySerializer(match_history, many=True)

    # Fetch tournament history
    tournaments = Tournament.objects.filter(participants=request.user)
    tournament_serializer = TournamentSerializer(tournaments, many=True)

    # Combine both histories into a single response
    return Response({
        'match_history': match_serializer.data,
        'tournament_history': tournament_serializer.data,
    })


# -------------------------------------- Profile Views --------------------------------------
#Profile View
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    if request.method == 'GET':
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    elif request.method == 'PUT':
        # Create a copy of the data to avoid modifying the original
        data = request.data.copy()
        
        # If email is being updated ensure it's unique
        if 'email' in data:
            if UserProfile.objects.exclude(id=request.user.id).filter(email=data['email']).exists():
                return Response(
                    {'error': 'This email is already in use'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if 'username' in data:
            if UserProfile.objects.exclude(id=request.user.id).filter(username=data['username']).exists():
                return Response(
                    {'error': 'This username is already taken'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if 'avatar_url' in data:
            try:
                URLValidator()(data['avatar_url'])
            except ValidationError:
                return Response(
                    {'error': 'Invalid URL format for avatar'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if 'theme' in data:
            allowed_themes = ['light', 'dark', 'system']  # Add your allowed themes
            if data['theme'] not in allowed_themes:
                return Response(
                    {'error': f'Theme must be one of: {", ".join(allowed_themes)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = UserProfileSerializer(request.user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def friend_profile(request, friend_id):
    friend = get_object_or_404(UserProfile, id=friend_id)
    serializer = UserProfileSerializer(friend)
    return Response(serializer.data)

# Friend Management Views
@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_friend(request, friend_id):
    friend = get_object_or_404(UserProfile, id=friend_id)
    
    if request.user == friend:
        return Response({'error': 'You cannot add yourself as a friend.'}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'POST':
        if Friendship.objects.filter(user=request.user, friend=friend).exists():
            return Response({'error': 'Friendship already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        
        friendship = Friendship.objects.create(user=request.user, friend=friend)
        serializer = FriendshipSerializer(friendship)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    elif request.method == 'DELETE':
        friendship = get_object_or_404(Friendship, user=request.user, friend=friend)
        friendship.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# -------------------------------------- Updating Profile Views --------------------------------------
#update password
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_password(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    # verify old password
    if not user.check_password(old_password):
        return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate and set new password
    try:
        validate_password(new_password, user)
        user.set_password(new_password)
        user.save()
        
        update_session_auth_hash(request, user)
        
        return Response({'message': 'Password updated successfully'}, status=status.HTTP_200_OK)
    except ValidationError as e:
        return Response({'error': e.messages}, status=status.HTTP_400_BAD_REQUEST)