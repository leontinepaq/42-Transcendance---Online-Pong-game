from django.db import models
from users.models import UserProfile
from django.shortcuts import get_object_or_404


class Participant(models.Model):
    user = models.ForeignKey(UserProfile,
                             on_delete=models.CASCADE,
                             null=True,
                             blank=True)
    name = models.CharField(max_length=30,
                            default="unknown",
                            null=False)
    is_ai = models.BooleanField(default=False)

    @classmethod
    def get_unknown(cls):
        unknown, created = cls.objects.get_or_create(user=None,
                                                     name="Unknown",
                                                     is_ai=False)
        return unknown

    @classmethod
    def get_unknown_pk(cls):
        unknown = cls.get_unknown()
        return unknown.pk

    @classmethod
    def get(cls, user_id):
        try:
            user = UserProfile.objects.get(id=user_id)
            participant, created = cls.objects.get_or_create(
                user=user,
                name=user.username,
                is_ai=False
            )
        except UserProfile.DoesNotExist:
            participant = cls.get_unknown()
        return participant

    @classmethod
    def get_ai(cls):
        ai, created = cls.objects.get_or_create(user=None,
                                                name="Computer",
                                                is_ai=True)
        return ai

    def get_id(self):
        return self.user.id if self.user else None


class Game(models.Model):
    id = models.AutoField(primary_key=True)
    player1 = models.ForeignKey(Participant,
                                default=Participant.get_unknown_pk,
                                on_delete=models.SET_DEFAULT,
                                related_name="games_as_player1")
    player2 = models.ForeignKey(Participant,
                                default=Participant.get_unknown_pk,
                                on_delete=models.SET_DEFAULT,
                                related_name="games_as_player2")
    winner = models.ForeignKey(Participant,
                               default=Participant.get_unknown_pk,
                               on_delete=models.SET_DEFAULT,
                               related_name="games_won")
    score_player1 = models.IntegerField(default=0)
    score_player2 = models.IntegerField(default=0)
    longest_exchange = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    duration = models.DurationField(null=True,
                                    blank=True)
    tournament = models.ForeignKey("Tournament",
                                   null=True,
                                   blank=True,
                                   on_delete=models.SET_NULL,
                                   related_name="games")
    finished = models.BooleanField(default=False)

    @classmethod
    def create(cls, id1, id2, score_1, score_2, duration=None, longest_exchange=None, tournament_id=None):
        player1 = Participant.get(id1)
        player2 = Participant.get(id2)
        winner = player1 if score_1 > score_2 else player2

        tournament = None
        if tournament_id:
            tournament = Tournament.objects.filter(id=tournament_id).first()

        game = cls.objects.create(
            player1=player1,
            player2=player2,
            winner=winner,
            score_player1=score_1,
            score_player2=score_2,
            duration=duration,
            longest_exchange=longest_exchange,
            tournament=tournament
        )

        if tournament:
            games = tournament.games.all()
            if games.count() >= 3:
                tournament.finished = True
                tournament.winner = winner
                tournament.save()
                return game, winner.user.id

        return game, None

    @classmethod
    def create_ai(cls, id_player, score_player, score_ai, duration=None, longest_exchange=None):
        return cls.objects.create(player1=Participant.get(id_player),
                                  player2=Participant.get_ai(),
                                  winner=Participant.get_ai() if score_ai > score_player
                                  else Participant.get(id_player),
                                  score_player1=score_player,
                                  score_player2=score_ai,
                                  duration=duration,
                                  longest_exchange=longest_exchange)


class Tournament(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    creator = models.ForeignKey(UserProfile,
                                null=True,
                                on_delete=models.CASCADE,
                                related_name="tournaments_created")
    players = models.ManyToManyField(Participant)
    winner = models.ForeignKey(Participant,
                               null=True,
                               blank=True,
                               on_delete=models.CASCADE,
                               related_name="winner_of_tournament")
    created_at = models.DateTimeField(auto_now_add=True)
    finished = models.BooleanField(default=False)

    @classmethod
    def create_tournament(cls, name, creator_id):
        try:
            creator_user = UserProfile.objects.get(id=creator_id)
        except UserProfile.DoesNotExist:
            raise ValueError("User not found")

        participant = Participant.get(creator_id)
        tournament = cls.objects.create(name=name, creator=creator_user)
        tournament.players.add(participant)
        return tournament


    def get_next_match(self):
        existing_games = list(self.games.all().order_by('created_at'))
        players = list(self.players.all().order_by('id'))

        if len(players) != 4:
            return []

        if len(existing_games) == 0:
            game1 = Game(player1=players[0], player2=players[1], tournament=self)
            game2 = Game(player1=players[2], player2=players[3], tournament=self)
            return [game1, game2]

        elif len(existing_games) == 1:
            first_game = existing_games[0]
            if first_game.player1 in (players[0], players[1]):
                second_game = Game(
                    player1=players[2], player2=players[3], tournament=self)
            else:
                second_game = Game(
                    player1=players[0], player2=players[1], tournament=self)
            return [first_game, second_game]

        elif len(existing_games) == 2:
            semi1 = existing_games[0]
            semi2 = existing_games[1]
            final = Game(
                player1=semi1.winner,
                player2=semi2.winner,
                tournament=self
            )
            return [semi1, semi2, final]

        elif len(existing_games) >= 3:
            return existing_games[:3]  # all matches played

        return []

    @classmethod
    def get_next_matchs_for_user(cls, user_id):
        matchups = []

        for tournament in cls.objects.filter(finished=False,
                                             players__user__id=user_id).distinct():
            next = tournament.get_next_match()
            for match in next:
                if match.id:
                    continue
                p1 = match.player1.user
                p2 = match.player2.user
                if user_id in (p1.id, p2.id):
                    matchups.append({"player": p1 if p1.id != user_id else p2,
                                     "tournament": tournament})
        return matchups
