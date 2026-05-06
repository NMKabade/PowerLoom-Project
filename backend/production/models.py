import uuid
from django.db import models
from django.conf import settings

class MachineMaster(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    machine_id = models.CharField(max_length=50, unique=True)
    rate_per_meter = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.machine_id} @ ₹{self.rate_per_meter}/m"

class Production(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )

    jober = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='productions')
    date = models.DateField()
    machine_id = models.CharField(max_length=50)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    proof_file = models.FileField(upload_to='production_proofs/', blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.jober.username} - {self.date} - {self.quantity} units"
