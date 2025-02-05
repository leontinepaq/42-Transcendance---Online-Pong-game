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
                    "theme")
    search_fields = ("email", "username")
    ordering = ("email",)
    
admin.site.register(UserProfile, CustomUserAdmin)