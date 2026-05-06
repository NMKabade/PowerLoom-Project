from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .models import JoberProfile

User = get_user_model()

class JoberProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = JoberProfile
        fields = ['phone', 'address']

class UserSerializer(serializers.ModelSerializer):
    profile = JoberProfileSerializer(required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'password', 'profile']
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        profile_data = validated_data.pop('profile', None)
        validated_data['is_active'] = False
        user = User.objects.create_user(**validated_data)
        if profile_data:
            JoberProfile.objects.create(user=user, **profile_data)
        else:
            JoberProfile.objects.create(user=user)
        return user
    
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        
        for attr, value in validated_data.items():
            if attr == 'password':
                instance.set_password(value)
            else:
                setattr(instance, attr, value)
        instance.save()

        if profile_data is not None:
            profile, created = JoberProfile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
            
        return instance
