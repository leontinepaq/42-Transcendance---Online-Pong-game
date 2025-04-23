from django.contrib import admin
from .models import Participant, Game, Tournament
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin

# Register your models here.

# Participant Admin
class ParticipantAdmin(admin.ModelAdmin):
    list_display = ("id", 'name', 'is_ai', 'user')  # Customize columns you want to display in the list view
    search_fields = ('name', 'user__username')  # Allow search by name and user
    list_filter = ('is_ai',)  # Filter by AI status
    ordering = ('name',)  # Order by name

admin.site.register(Participant, ParticipantAdmin)

# Game Admin
class GameAdmin(admin.ModelAdmin):
    list_display = ('player1', 'player2', 'winner', 'score_player1', 'score_player2', 'created_at', 'finished', 'tournament')
    list_filter = ('finished', 'created_at', 'winner')  # Filter by game finish status, date, winner
    search_fields = ('player1__name', 'player2__name')  # Allow search by player names
    ordering = ('created_at',)  # Order by creation date

admin.site.register(Game, GameAdmin)

# Tournament Admin
class TournamentAdmin(admin.ModelAdmin):
    list_display = ('name', 'creator', 'finished', 'winner','created_at')  # Customize the columns to display
    list_filter = ('finished', 'created_at')  # Filter by finished status and creation date
    search_fields = ('name', 'creator__username')  # Allow search by tournament name and creator username
    ordering = ('created_at',)  # Order by creation date

admin.site.register(Tournament, TournamentAdmin)
