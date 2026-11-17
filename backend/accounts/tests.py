from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .models import User

class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_user_success(self):
        url = reverse('auth_register')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'SecurePassword123!',
            'confirm_password': 'SecurePassword123!',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_register_password_mismatch(self):
        url = reverse('auth_register')
        data = {
            'username': 'failuser',
            'email': 'fail@example.com',
            'password': 'Password123!',
            'confirm_password': 'DifferentPassword123!',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        User.objects.create_user(username='loginuser', email='login@example.com', password='Password123!')
        url = reverse('auth_login')
        response = self.client.post(url, {'username': 'loginuser', 'password': 'Password123!'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
