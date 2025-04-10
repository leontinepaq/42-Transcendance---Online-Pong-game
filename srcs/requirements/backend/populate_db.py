from django.contrib.auth import get_user_model
from dashboards.models import Game
import random
import datetime

UserModel = get_user_model()
usernames = ["sami", "jeanantoine", "leontine", "thomas",
             "mathieu", "jeanjacques", "jackie", "michel"]
users = []
ids = []
UserModel.objects.all().delete() 
Game.objects.all().delete()

for name in usernames:    
    if not UserModel.objects.filter(username=name).exists():
        user=UserModel.objects.create_user(name, name + "@test.com", password='test')
        user.save()
        ids.append(user.id)
        users.append(user)


for i in range(0,100):
    score_1 = random.randint(0, 2)
    score_2 = random.randint(0, 2)
    longest_exchange = random.randint(0, 100)
    duration = datetime.timedelta(minutes=random.randint(0, 5),
                                       seconds=random.randint(0, 60))
    if random.randint(0, 1):
        score_1 = 3
    else:
        score_2 = 3
    if random.randint(0, 1):
        game = Game.create_ai(ids[random.randint(0, 3)], score_1, score_2, duration, longest_exchange)
    else:
        players = random.sample(ids, 2)
        game = Game.create(players[0], players[1], score_1, score_2, duration, longest_exchange)
    game.created_at = datetime.datetime.now() - datetime.timedelta(days = random.randint(0, 10))
    game.save()
