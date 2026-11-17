from django.db import models
from django.conf import settings
from expenses.models import Category

class Budget(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, blank=True, related_name='budgets')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    month = models.PositiveSmallIntegerField()  # 1 - 12
    year = models.PositiveSmallIntegerField()   # e.g. 2025, 2026

    class Meta:
        unique_together = ('user', 'category', 'month', 'year')
        ordering = ['category__name']

    def __str__(self):
        cat_name = self.category.name if self.category else "Overall"
        return f"{self.user.username} - {cat_name} ({self.month}/{self.year}): ₹{self.amount}"
