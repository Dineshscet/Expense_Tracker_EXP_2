from django.urls import path
from .views import (
    CategoryListCreateView,
    CategoryDetailView,
    ExpenseListCreateView,
    ExpenseDetailView,
    ExpenseExportView
)

urlpatterns = [
    path('categories/', CategoryListCreateView.as_view(), name='category_list_create'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category_detail'),
    path('expenses/', ExpenseListCreateView.as_view(), name='expense_list_create'),
    path('expenses/<int:pk>/', ExpenseDetailView.as_view(), name='expense_detail'),
    path('expenses/export/', ExpenseExportView.as_view(), name='expense_export'),
]

