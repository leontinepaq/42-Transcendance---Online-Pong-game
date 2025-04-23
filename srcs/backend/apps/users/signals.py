from django.db.models.signals import post_save
from django.dispatch import receiver
from users.models import UserProfile
from dashboards.models import UserStatistics