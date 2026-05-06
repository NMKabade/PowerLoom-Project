from rest_framework import serializers
from .models import Production, MachineMaster
from users.serializers import UserSerializer

class MachineMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = MachineMaster
        fields = '__all__'

class ProductionSerializer(serializers.ModelSerializer):
    jober_details = UserSerializer(source='jober', read_only=True)
    
    class Meta:
        model = Production
        fields = '__all__'
        read_only_fields = ['jober', 'status', 'remarks']
