from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import UserProfile

# Register your models here.
class CustomUserAdmin(UserAdmin):
    list_display = ("email",
                    "username",
                    "created_at",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "is_active",
                    "is_two_factor_active",
                    "two_factor_code",
                    "two_factor_expiry",
                    "theme")
    search_fields = ("email", "username")
    ordering = ("email",)
    
admin.site.register(UserProfile, CustomUserAdmin)