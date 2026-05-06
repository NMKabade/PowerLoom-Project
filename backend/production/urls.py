from django.urls import path
from .views import (
    ProductionCreateView, MyProductionListView, AllProductionListView,
    ProductionApprovalView, SalarySummaryView, OwnerDashboardView,
    MachineMasterListCreateView, MachineMasterDetailView, MachineMasterPublicListView
)

urlpatterns = [
    # Production
    path('create/', ProductionCreateView.as_view(), name='production_create'),
    path('my-list/', MyProductionListView.as_view(), name='my_production_list'),
    path('all/', AllProductionListView.as_view(), name='all_production_list'),
    path('approve/<uuid:pk>/', ProductionApprovalView.as_view(), name='production_approve'),
    path('salary/summary/', SalarySummaryView.as_view(), name='salary_summary'),
    path('dashboard/owner/', OwnerDashboardView.as_view(), name='owner_dashboard'),

    # Machine Master
    path('machines/', MachineMasterListCreateView.as_view(), name='machine_list_create'),
    path('machines/<int:pk>/', MachineMasterDetailView.as_view(), name='machine_detail'),
    path('machines/dropdown/', MachineMasterPublicListView.as_view(), name='machine_dropdown'),
]
