import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'powerloom_backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

email = 'kabade.niranjan1715@gmail.com'
password = 'Jober@1234'
username = email.split('@')[0]

if not User.objects.filter(email=email).exists():
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        role='JOBER'
    )
    from users.models import JoberProfile
    JoberProfile.objects.create(user=user)
    print(f"Jober user created successfully! Username: {username}")
else:
    print(f"Jober user already exists. Username: {username}")
