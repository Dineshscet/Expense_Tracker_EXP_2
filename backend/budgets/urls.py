from django.urls import path
from .views import BudgetListCreateView, BudgetDetailView

urlpatterns = [
    path('budgets/', BudgetListCreateView.as_view(), name='budget_list_create'),
    path('budgets/<int:pk>/', BudgetDetailView.as_view(), name='budget_detail'),
]

