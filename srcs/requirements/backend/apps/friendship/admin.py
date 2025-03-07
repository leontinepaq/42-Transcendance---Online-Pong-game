from django.contrib import admin
from .models import FriendRequest

class CustomFriendRequestAdmin(admin.ModelAdmin):
    model = FriendRequest
    list_display = ("id", "sender", "receiver", "created_at")
    list_filter = ("sender", "receiver", "created_at")
    search_fields = ("sender__username", "receiver__username")
    ordering = ("-created_at",)
    
    fields = ('sender', "receiver")
    
admin.site.register(FriendRequest, CustomFriendRequestAdmin)
