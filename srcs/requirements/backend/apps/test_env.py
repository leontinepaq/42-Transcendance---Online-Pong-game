from django.contrib.auth import get_user_model
from dashboards.models import Game
import random

UserModel = get_user_model()
users = ["Sami", "Jean-Antoine", "Leontine", "Thomas"]
ids = []

for name in users:
    if not UserModel.objects.filter(username=name).exists():
        user=UserModel.objects.create_user(name, name + "@test.com", password='test')
        user.is_superuser=False
        user.is_staff=False
        user.save()
        ids.append(user.id)
    else:
        ids.append(UserModel.objects.filter(username=name).first().id)

for i in range(0,100):
    score_1 = random.randint(0, 2)
    score_2 = random.randint(0, 2)
    if random.randint(0, 1):
        score_1 = 3
    else:
        score_2 = 3
    if random.randint(0, 1):
        Game.create_ai(ids[random.randint(0, 3)], score_1, score_2)
    else:
        players = random.sample(ids, 2)
        Game.create(players[0], players[1], score_1, score_2)
