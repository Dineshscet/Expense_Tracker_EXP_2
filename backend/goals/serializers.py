from rest_framework import serializers
from .models import Goal

class GoalSerializer(serializers.ModelSerializer):
    percentage = serializers.SerializerMethodField()

    class Meta:
        model = Goal
        fields = ['id', 'name', 'target_amount', 'current_amount', 'target_date', 'icon', 'color', 'percentage', 'created_at']
        read_only_fields = ['id', 'percentage', 'created_at']

    def get_percentage(self, obj):
        target = float(obj.target_amount)
        if target <= 0:
            return 0.0
        return min(100.0, round((float(obj.current_amount) / target) * 100, 1))

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

