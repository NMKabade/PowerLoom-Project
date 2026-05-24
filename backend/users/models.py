import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ROLE_CHOICES = (
        ('ADMIN', 'Owner/Admin'),
        ('JOBER', 'Jober'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='JOBER')
    reset_otp = models.CharField(max_length=6, blank=True, null=True)
    reset_otp_created_at = models.DateTimeField(blank=True, null=True)
    
    def is_reset_otp_valid(self):
        if not self.reset_otp_created_at:
            return False
        return timezone.now() <= self.reset_otp_created_at + timedelta(minutes=10)

    def __str__(self):
        return self.username

class JoberProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"


