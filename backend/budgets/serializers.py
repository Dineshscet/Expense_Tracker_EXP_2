from rest_framework import serializers
from django.db.models import Sum
from .models import Budget
from expenses.models import Expense

class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    category_color = serializers.SerializerMethodField()
    category_icon = serializers.SerializerMethodField()
    spent = serializers.SerializerMethodField()
    remaining = serializers.SerializerMethodField()
    percentage = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = [
            'id', 'category', 'category_name', 'category_color', 'category_icon',
            'amount', 'month', 'year', 'spent', 'remaining', 'percentage', 'status'
        ]
        read_only_fields = ['id', 'spent', 'remaining', 'percentage', 'status']

    def get_category_name(self, obj):
        return obj.category.name if obj.category else "Overall Budget"

    def get_category_color(self, obj):
        return obj.category.color if obj.category else "#8B5CF6"

    def get_category_icon(self, obj):
        return obj.category.icon if obj.category else "PieChart"

    def _get_spent(self, obj):
        qs = Expense.objects.filter(
            user=obj.user,
            date__year=obj.year,
            date__month=obj.month,
            transaction_type='EXPENSE'
        )
        if obj.category:
            qs = qs.filter(category=obj.category)
        total = qs.aggregate(Sum('amount'))['amount__sum'] or 0
        return float(total)

    def get_spent(self, obj):
        return self._get_spent(obj)

    def get_remaining(self, obj):
        spent = self._get_spent(obj)
        limit = float(obj.amount)
        return max(0.0, limit - spent)

    def get_percentage(self, obj):
        spent = self._get_spent(obj)
        limit = float(obj.amount)
        if limit <= 0:
            return 0.0
        return round((spent / limit) * 100, 1)

    def get_status(self, obj):
        pct = self.get_percentage(obj)
        if pct >= 100:
            return 'EXCEEDED'
        elif pct >= 80:
            return 'WARNING'
        return 'ON_TRACK'

    def validate(self, attrs):
        user = self.context['request'].user
        category = attrs.get('category', getattr(self.instance, 'category', None))
        month = attrs.get('month', getattr(self.instance, 'month', None))
        year = attrs.get('year', getattr(self.instance, 'year', None))

        if category and category.user != user:
            raise serializers.ValidationError({"category": "Invalid category."})

        # Check unique constraint
        qs = Budget.objects.filter(user=user, category=category, month=month, year=year)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
        if qs.exists():
            cat_name = category.name if category else "Overall"
            raise serializers.ValidationError(f"A budget for {cat_name} in {month}/{year} already exists.")

        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

