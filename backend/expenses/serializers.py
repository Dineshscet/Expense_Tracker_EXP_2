from rest_framework import serializers
from .models import Category, Expense

class CategorySerializer(serializers.ModelSerializer):
    expense_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'color', 'icon', 'expense_count']
        read_only_fields = ['id', 'expense_count']

    def get_expense_count(self, obj):
        return obj.expenses.count()

    def validate_name(self, value):
        user = self.context['request'].user
        category_id = self.instance.id if self.instance else None
        existing = Category.objects.filter(user=user, name__iexact=value.strip())
        if category_id:
            existing = existing.exclude(id=category_id)
        if existing.exists():
            raise serializers.ValidationError("A category with this name already exists.")
        return value.strip()

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    category_color = serializers.ReadOnlyField(source='category.color')
    category_icon = serializers.ReadOnlyField(source='category.icon')

    class Meta:
        model = Expense
        fields = [
            'id', 'category', 'category_name', 'category_color', 'category_icon',
            'amount', 'date', 'payment_method', 'description', 'transaction_type',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def validate_category(self, value):
        user = self.context['request'].user
        if value.user != user:
            raise serializers.ValidationError("Selected category is invalid.")
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

