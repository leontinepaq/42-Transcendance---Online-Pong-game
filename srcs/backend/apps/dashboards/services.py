from datetime import timedelta
from collections import defaultdict
from .models import Game, Participant
from django.db.models import Q
from django.utils import timezone # @leontinepaq : pourrait etre + robuste avec timezone -> game_date = timezone.localtime(game.created_at).date()


# Fonction principale pour obtenir les statistiques
def get_user_stats(user):
    participant = Participant.get(user.id)

    user_data = {
        "user": user.username,
        "avatar_url": user.avatar_url,
        "wins": 0,
        "losses": 0,
        "winrate": 0,
        "winstreak": 0,
        "total_time_played": "0:00",
        "solo_games": 0,
        "online_games": 0,
        "unique_opponents_count": 0,
        "daily_results": [],
        "games": []
    }
    games = Game.objects.filter(
        (Q(player1=participant) | Q(player2=participant)) & Q(winner__isnull=False)
    )

    user_data["wins"], user_data["losses"], user_data["winrate"] = calculate_win_loss(games, participant)
    user_data["winstreak"] = calculate_win_streak(games, participant)
    user_data["total_time_played"] = calculate_total_time_played(games)
    user_data["solo_games"], user_data["online_games"] = count_game_types(games)
    user_data["unique_opponents_count"] = count_unique_opponents(games, participant)
    user_data["daily_results"] = get_daily_results(games, participant)
    return user_data


def calculate_win_loss(games, participant):
    total_games_played = games.count()
    wins = games.filter(winner=participant).count()
    losses = total_games_played - wins
    win_rate = (wins / total_games_played) * 100 if total_games_played > 0 else 0
    return wins, losses, win_rate


def calculate_win_streak(games, participant):
    streak_games = games.order_by("-created_at")
    win_streak = 0
    for game in streak_games:
        if game.winner == participant:
            win_streak += 1
        else:
            break
    return win_streak


def calculate_total_time_played(games):
    total_time_played = sum((game.duration for game in games if game.duration is not None), timedelta())
    return str(total_time_played)

def is_solo_game(game):
    return game.player1.is_ai or game.player2.is_ai

def count_game_types(games):
    solo_games = sum(1 for game in games if is_solo_game(game))
    online_games = len(games) - solo_games
    return solo_games, online_games

def count_unique_opponents(games, participant):
    unique_opponents = set()
    for game in games:
        opponent = game.player2 if game.player1 == participant else game.player1
        if opponent.user:
            unique_opponents.add(opponent)
    return len(unique_opponents)

def get_daily_results(games, participant):
    daily_results = defaultdict(lambda: {"wins": 0, "losses": 0})

    for game in games:
        game_date = game.created_at.date()
        if game.winner.id == participant.id:
            daily_results[game_date]["wins"] += 1
        else:
            daily_results[game_date]["losses"] += 1

    return [
        {"created_at": date.isoformat(), "wins": result["wins"], "losses": result["losses"]}
        for date, result in sorted(daily_results.items())
    ]

def get_match_history(user):
    participant = Participant.get(user.id)
    games = Game.objects.filter(
        (Q(player1=participant) | Q(player2=participant)) & Q(winner__isnull=False)
    ).order_by("-created_at")
    return games
