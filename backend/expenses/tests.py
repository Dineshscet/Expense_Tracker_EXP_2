from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from accounts.models import User
from .models import Category, Expense

class ExpenseTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username='user1', email='u1@test.com', password='Password123!')
        self.user2 = User.objects.create_user(username='user2', email='u2@test.com', password='Password123!')

        self.cat1 = Category.objects.create(user=self.user1, name='Dining', color='#A855F7')
        self.cat2 = Category.objects.create(user=self.user2, name='Travel', color='#EC4899')

        self.exp1 = Expense.objects.create(
            user=self.user1, category=self.cat1, amount=300.00, date='2025-11-10', payment_method='UPI'
        )

    def test_user_can_list_only_own_expenses(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse('expense_list_create'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], self.exp1.id)

    def test_user_cannot_access_other_user_expense(self):
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(reverse('expense_detail', kwargs={'pk': self.exp1.id}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_expense_validation(self):
        self.client.force_authenticate(user=self.user1)
        data = {
            'category': self.cat1.id,
            'amount': '-50.00', # invalid
            'date': '2025-11-15',
            'payment_method': 'UPI'
        }
        response = self.client.post(reverse('expense_list_create'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
