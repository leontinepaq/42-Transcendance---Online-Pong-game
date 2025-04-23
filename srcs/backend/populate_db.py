from django.contrib.auth import get_user_model
from dashboards.models import Game, Participant, Tournament
import random
import datetime
from django.utils import timezone

UserModel = get_user_model()
usernames = ["sami", "jeanantoine", "leontine", "thomas",
             "mathieu", "jeanjacques", "lorene", "michel"]
users = []
ids = []
UserModel.objects.all().delete()
Game.objects.all().delete()
Participant.objects.all().delete()
Tournament.objects.all().delete()

admin = UserModel.objects.create_superuser("admin", "admin@admin.fr", "admin")
admin.avatar_url = "/media/avatars/admin.jpg"
admin.is_active = False
admin.save()

for name in usernames:
    if not UserModel.objects.filter(username=name).exists():
        user = UserModel.objects.create_user(
            name, name + "@test.com", password='test')
        user.avatar_url = f"/media/avatars/{name}.jpg"
        user.save()
        ids.append(user.id)
        users.append(user)


for i in range(0, 50):
    score_1 = random.randint(0, 2)
    score_2 = random.randint(0, 2)
    longest_exchange = random.randint(2, 50)
    duration = datetime.timedelta(minutes=random.randint(0, 5),
                                  seconds=random.randint(0, 60))
    if random.randint(0, 1):
        score_1 = 3
    else:
        score_2 = 3
    if random.randint(0, 1):
        game = Game.create_ai(ids[random.randint(0, 3)],
                              score_1,
                              score_2,
                              duration,
                              longest_exchange)
    else:
        players = random.sample(ids, 2)
        game, tournament_winner = Game.create(players[0],
                                              players[1],
                                              score_1,
                                              score_2,
                                              duration,
                                              longest_exchange)
    game.created_at = timezone.now() - datetime.timedelta(days=random.randint(0, 10))
    game.save()

for i in range(0, 6):
    players = random.sample(ids, random.randint(2, 4))
    tournament = Tournament.create_tournament(f"Tournament {i}", players[0])
    for player in players[1:]:
        tournament.players.add(Participant.get(player))
        tournament.save()


for i in range(0, 4):
    tournaments = Tournament.objects.filter(finished=False)
    for tournament in tournaments:
        next = tournament.get_next_match()
        for match in next:
            if match.id:
                continue
            score_1 = random.randint(0, 3)
            score_2 = random.randint(0, 2) if score_1 == 3 else 3
            longest_exchange = random.randint(0, 100)
            duration = datetime.timedelta(minutes=random.randint(0, 5),
                                          seconds=random.randint(0, 60))
            game, tournament_winner = Game.create(match.player1.user.id,
                                                  match.player2.user.id,
                                                  score_1,
                                                  score_2,
                                                  duration,
                                                  longest_exchange,
                                                  tournament.id)
