import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'powerloom_backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

email = 'kabadeniranjan1998@gmail.com'
password = 'Admin@1234'
username = email.split('@')[0]

if not User.objects.filter(email=email).exists():
    # create_superuser automatically hashes pass and sets is_staff=True, is_superuser=True
    user = User.objects.create_superuser(
        username=username,
        email=email,
        password=password,
        role='ADMIN'
    )
    from users.models import JoberProfile
    JoberProfile.objects.create(user=user)
    print("Admin user created successfully.")
else:
    print("Admin user already exists.")
