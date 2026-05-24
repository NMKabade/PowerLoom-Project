from rest_framework import permissions, status
from rest_framework.response import Response
from django.db.models import Sum, F, Q
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Production, MachineMaster, CurrencyMaster
from .serializers import ProductionSerializer, MachineMasterSerializer, CurrencyMasterSerializer
from users.permissions import IsAdminUserRole, IsJoberUserRole
from users.models import User
from .pagination import CustomPagination

# ─── Currency Master Views ─────────────────────────────────────────────────────

class CurrencyMasterListView(APIView):
    """List all active currencies."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        currencies = CurrencyMaster.objects.filter(is_active=True).order_by('code')
        paginator = CustomPagination()
        page = paginator.paginate_queryset(currencies, request)
        if page is not None:
            serializer = CurrencyMasterSerializer(currencies, many=True)
            return paginator.get_paginated_response(serializer.data)
        serializer = CurrencyMasterSerializer(currencies, many=True)
        return Response(serializer.data)

# ─── Machine Master Views ────────────────────────────────────────────────────

class MachineMasterListCreateView(APIView):
    """Owner: list all machines + create new ones."""
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    def get(self, request):
        machines = MachineMaster.objects.all().order_by('machine_id')
        paginator = CustomPagination()
        page = paginator.paginate_queryset(machines, request)
        if page is not None:
            serializer = MachineMasterSerializer(page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)
        serializer = MachineMasterSerializer(machines, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = MachineMasterSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MachineMasterDetailView(APIView):
    """Owner: retrieve, update or delete a single machine."""
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    def get_object(self, pk):
        return get_object_or_404(MachineMaster, pk=pk)

    def get(self, request, pk):
        machine = self.get_object(pk)
        serializer = MachineMasterSerializer(machine, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        machine = self.get_object(pk)
        serializer = MachineMasterSerializer(machine, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        machine = self.get_object(pk)
        serializer = MachineMasterSerializer(machine, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        machine = self.get_object(pk)
        machine.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class MachineMasterPublicListView(APIView):
    """Jober: read-only list of active machines for the dropdown."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        machines = MachineMaster.objects.filter(is_active=True).order_by('machine_id')
        serializer = MachineMasterSerializer(machines, many=True, context={'request': request})
        return Response(serializer.data)

# ─── Production Views ────────────────────────────────────────────────────────

class ProductionCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsJoberUserRole]

    def post(self, request):
        serializer = ProductionSerializer(data=request.data)
        if serializer.is_valid():
            # Automatically fetch and save the current rates and peak of the machine
            machine_id = request.data.get('machine_id')
            machine = MachineMaster.objects.filter(machine_id=machine_id).first()
            peak_val = machine.peak if machine else 0
            jober_rate_val = machine.jober_rate if machine else 0
            
            serializer.save(jober=request.user, peak=peak_val, jober_rate=jober_rate_val)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MyProductionListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsJoberUserRole]

    def get(self, request):
        queryset = Production.objects.filter(jober=request.user).order_by('-date')
        
        status_filter = request.query_params.get('status')
        if status_filter and status_filter != 'ALL':
            queryset = queryset.filter(status=status_filter)

        paginator = CustomPagination()
        page = paginator.paginate_queryset(queryset, request)
        if page is not None:
            serializer = ProductionSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        serializer = ProductionSerializer(queryset, many=True)
        return Response(serializer.data)

class AllProductionListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    def get(self, request):
        queryset = Production.objects.all().order_by('-date')
        
        status_filter = request.query_params.get('status')
        if status_filter and status_filter != 'ALL':
            queryset = queryset.filter(status=status_filter)
            
        search_query = request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(jober__username__icontains=search_query) |
                Q(jober__first_name__icontains=search_query) |
                Q(jober__last_name__icontains=search_query)
            )
            
        paginator = CustomPagination()
        page = paginator.paginate_queryset(queryset, request)
        if page is not None:
            serializer = ProductionSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = ProductionSerializer(queryset, many=True)
        return Response(serializer.data)

class ProductionApprovalView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    def patch(self, request, pk):
        production = get_object_or_404(Production, pk=pk)
        status_val = request.data.get('status')
        remarks = request.data.get('remarks', production.remarks)
        
        if status_val in ['APPROVED', 'REJECTED']:
            production.status = status_val
            production.remarks = remarks
            production.save()
            serializer = ProductionSerializer(production)
            return Response(serializer.data)
        return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)

class SalarySummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsJoberUserRole]

    def get(self, request):
        jober = request.user
        productions = Production.objects.filter(jober=jober)
        total_submitted = productions.count()
        approved_prods = productions.filter(status='APPROVED')
        pending_prods = productions.filter(status='PENDING')
        
        total_salary = approved_prods.aggregate(
            total=Sum(F('quantity') * F('rate') * F('jober_rate') * F('peak'))
        )['total'] or 0

        return Response({
            'total_production_submitted': total_submitted,
            'approved_production': approved_prods.count(),
            'pending_approvals': pending_prods.count(),
            'total_salary_earned': total_salary
        })

class OwnerDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    def get(self, request):
        total_jobers = User.objects.filter(role='JOBER').count()
        total_production = Production.objects.count()
        pending_approvals = Production.objects.filter(status='PENDING').count()
        approved_prods = Production.objects.filter(status='APPROVED')
        total_salary_payout = approved_prods.aggregate(
            total=Sum(F('quantity') * F('rate') * F('jober_rate') * F('peak'))
        )['total'] or 0
        
        return Response({
            'total_jobers': total_jobers,
            'total_production': total_production,
            'pending_approvals': pending_approvals,
            'total_salary_payout': total_salary_payout
        })
