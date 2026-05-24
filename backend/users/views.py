from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from .serializers import UserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .permissions import IsAdminUserRole
from django.utils import timezone
import random

User = get_user_model()

def send_password_reset_link(user):
    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    reset_link = f"http://localhost:4200/reset-password?uid={uidb64}&token={token}"
    
    subject = 'Set Your PowerLoom Password'
    message = f'Hi {user.first_name},\n\nYour account has been activated! Please set your password using the link below:\n{reset_link}\n\nThanks,\nPowerLoom Team'
    send_mail(
        subject, 
        message, 
        getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@powerloom.local'), 
        [user.email],
        fail_silently=False
    )

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['username'] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['username'] = self.user.username
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Send activation email
            uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            activation_link = f"http://localhost:4200/activate?uid={uidb64}&token={token}"
            
            subject = 'Activate Your PowerLoom Account'
            message = f'Hi {user.first_name},\n\nPlease click the link below to activate your account:\n{activation_link}\n\nThanks,\nPowerLoom Team'
            send_mail(
                subject, 
                message, 
                getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@powerloom.local'), 
                [user.email],
                fail_silently=False
            )
            
            return Response({"message": "User registered successfully. Please check your email to activate."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ActivateUserView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        
        if not uidb64 or not token:
            return Response({"error": "Missing activation parameters."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            
            # Automatically send password reset link after activation
            send_password_reset_link(user)
            
            return Response({"message": "Account activated successfully. A password setup link has been sent to your email."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Activation link is invalid or expired!"}, status=status.HTTP_400_BAD_REQUEST)

from django.shortcuts import get_object_or_404

from production.pagination import CustomPagination

class JoberListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    def get(self, request):
        jobers = User.objects.filter(role='JOBER').order_by('username')
        paginator = CustomPagination()
        page = paginator.paginate_queryset(jobers, request)
        if page is not None:
            serializer = UserSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        serializer = UserSerializer(jobers, many=True)
        return Response(serializer.data)

class JoberDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    def get_object(self, pk):
        return get_object_or_404(User, pk=pk, role='JOBER')

    def get(self, request, pk):
        jober = self.get_object(pk)
        serializer = UserSerializer(jober)
        return Response(serializer.data)

    def put(self, request, pk):
        jober = self.get_object(pk)
        serializer = UserSerializer(jober, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        jober = self.get_object(pk)
        serializer = UserSerializer(jober, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        jober = self.get_object(pk)
        jober.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
        otp_code = str(random.randint(100000, 999999))
        user.reset_otp = otp_code
        user.reset_otp_created_at = timezone.now()
        user.save()

        subject = 'PowerLoom Password Reset OTP'
        message = f'Hi {user.first_name},\n\nYour OTP for password reset is: {otp_code}\n\nThis OTP is valid for 10 minutes.\n\nThanks,\nPowerLoom Team'
        send_mail(
            subject, 
            message, 
            getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@powerloom.local'), 
            [user.email],
            fail_silently=False
        )
        return Response({"message": "OTP sent to your email successfully."}, status=status.HTTP_200_OK)

class ResetPasswordOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp')
        new_password = request.data.get('new_password')

        if not all([email, otp_code, new_password]):
            return Response({"error": "Email, OTP and new password are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
        if user.reset_otp != otp_code:
            return Response({"error": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)
        
        if not user.is_reset_otp_valid():
            return Response({"error": "OTP has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.reset_otp = None
        user.reset_otp_created_at = None
        user.save()

        return Response({"message": "Password reset successfully. You can now login."}, status=status.HTTP_200_OK)

class PasswordResetConfirmLinkView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not all([uidb64, token, new_password]):
            return Response({"error": "Missing required parameters."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid or expired reset link."}, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
