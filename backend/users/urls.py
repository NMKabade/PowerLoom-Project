from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CustomTokenObtainPairView, RegisterView, JoberListView, JoberDetailView, ActivateUserView, SendOTPView, ResetPasswordOTPView, ProfileView, PasswordResetConfirmLinkView

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('activate/', ActivateUserView.as_view(), name='activate'),
    path('jobers/', JoberListView.as_view(), name='jober_list'),
    path('jobers/<uuid:pk>/', JoberDetailView.as_view(), name='jober_detail'),
    path('password-reset/send-otp/', SendOTPView.as_view(), name='send_otp'),
    path('password-reset/reset/', ResetPasswordOTPView.as_view(), name='reset_password_otp'),
    path('password-reset/confirm/', PasswordResetConfirmLinkView.as_view(), name='password_reset_confirm_link'),
    path('profile/', ProfileView.as_view(), name='profile'),
]
