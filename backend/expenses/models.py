from django.db import models
from django.conf import settings
from django.utils import timezone

class Category(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=7, default='#8B5CF6')
    icon = models.CharField(max_length=50, default='Folder')

    class Meta:
        verbose_name_plural = 'Categories'
        unique_together = ('user', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.user.username})"

class Expense(models.Model):
    PAYMENT_METHODS = [
        ('Cash', 'Cash'),
        ('Card', 'Card'),
        ('UPI', 'UPI'),
        ('Net Banking', 'Net Banking'),
        ('Other', 'Other'),
    ]

    TRANSACTION_TYPES = [
        ('EXPENSE', 'Expense'),
        ('INCOME', 'Income'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expenses', db_index=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='expenses')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField(default=timezone.now, db_index=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='UPI')
    description = models.CharField(max_length=255, blank=True)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES, default='EXPENSE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.transaction_type}: {self.category.name} - ₹{self.amount} on {self.date}"
