from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import UserProfile

class UserProfileAdmin(UserAdmin):
    model = UserProfile
    list_display = ("id", "username", "email", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active")
    fieldsets = (
        (None, {"fields": ("username", "email", "password")}),
        ("Permissions", {"fields": ("is_staff", "is_active", "is_superuser", "groups", "user_permissions")}),
        ("Profile Info", {"fields": ("avatar_url", "theme", "friends", "blocked")}),
        ("2FA Settings", {"fields": ("is_two_factor_mail", "is_two_factor_auth", "two_factor_code", "two_factor_expiry", "totp_secret")}),
    )
    search_fields = ("username", "email")
    ordering = ("id",)
    
    # 🟢 Improves UI for adding friends
    filter_horizontal = ("friends", "blocked")

admin.site.register(UserProfile, UserProfileAdmin)
