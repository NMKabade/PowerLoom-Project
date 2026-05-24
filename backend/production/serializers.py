from rest_framework import serializers
from .models import Production, MachineMaster, CurrencyMaster
from users.serializers import UserSerializer

class CurrencyMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CurrencyMaster
        fields = '__all__'

class MachineMasterSerializer(serializers.ModelSerializer):
    currency_details = CurrencyMasterSerializer(source='currency', read_only=True)

    class Meta:
        model = MachineMaster
        fields = '__all__'

class ProductionSerializer(serializers.ModelSerializer):
    jober_details = UserSerializer(source='jober', read_only=True)
    
    class Meta:
        model = Production
        fields = '__all__'
        read_only_fields = ['jober', 'status', 'remarks']
