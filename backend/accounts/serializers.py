from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User
from expenses.models import Category

DEFAULT_CATEGORIES = [
    {"name": "Food & Dining", "color": "#A855F7", "icon": "Utensils"},
    {"name": "Travel", "color": "#EC4899", "icon": "Bus"},
    {"name": "Shopping", "color": "#3B82F6", "icon": "ShoppingBag"},
    {"name": "Entertainment", "color": "#F97316", "icon": "Film"},
    {"name": "Utilities", "color": "#6366F1", "icon": "Zap"},
    {"name": "Rent", "color": "#8B5CF6", "icon": "Home"},
    {"name": "Health", "color": "#EF4444", "icon": "HeartPulse"},
    {"name": "Education", "color": "#14B8A6", "icon": "GraduationCap"},
    {"name": "Salary", "color": "#10B981", "icon": "Briefcase"},
    {"name": "Others", "color": "#10B981", "icon": "MoreHorizontal"},
]

def create_default_categories_for_user(user):
    for cat in DEFAULT_CATEGORIES:
        Category.objects.get_or_create(
            user=user,
            name=cat["name"],
            defaults={"color": cat["color"], "icon": cat["icon"]}
        )

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'currency', 'avatar', 'date_joined']
        read_only_fields = ['id', 'date_joined']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'currency', 'password', 'confirm_password']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        
        try:
            validate_password(attrs['password'])
        except ValidationError as err:
            raise serializers.ValidationError({"password": list(err.messages)})

        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        create_default_categories_for_user(user)
        return user

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "New passwords do not match."})
        try:
            validate_password(attrs['new_password'])
        except ValidationError as err:
            raise serializers.ValidationError({"new_password": list(err.messages)})
        return attrs

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data

