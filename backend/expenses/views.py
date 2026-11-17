import csv
from django.http import HttpResponse
from django.db.models import Q
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Category, Expense
from .serializers import CategorySerializer, ExpenseSerializer

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'page_size': self.get_page_size(self.request),
            'results': data
        })

class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        category = self.get_object()
        expense_count = category.expenses.count()

        reassign_to_id = request.query_params.get('reassign_to')
        if expense_count > 0:
            if reassign_to_id:
                try:
                    target_category = Category.objects.get(id=reassign_to_id, user=request.user)
                    category.expenses.update(category=target_category)
                except Category.DoesNotExist:
                    return Response(
                        {"error": "Target category for reassignment not found."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                return Response(
                    {
                        "error": f"Cannot delete category '{category.name}' because it has {expense_count} linked transaction(s). Reassign them first or provide 'reassign_to' ID.",
                        "expense_count": expense_count
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        return super().destroy(request, *args, **kwargs)

class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        qs = Expense.objects.filter(user=user)

        # Filters
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(description__icontains=search) | Q(category__name__icontains=search))

        category_id = self.request.query_params.get('category')
        if category_id:
            qs = qs.filter(category_id=category_id)

        payment_method = self.request.query_params.get('payment_method')
        if payment_method:
            qs = qs.filter(payment_method=payment_method)

        transaction_type = self.request.query_params.get('transaction_type')
        if transaction_type:
            qs = qs.filter(transaction_type=transaction_type)

        start_date = self.request.query_params.get('start_date')
        if start_date:
            qs = qs.filter(date__gte=start_date)

        end_date = self.request.query_params.get('end_date')
        if end_date:
            qs = qs.filter(date__lte=end_date)

        min_amount = self.request.query_params.get('min_amount')
        if min_amount:
            qs = qs.filter(amount__gte=min_amount)

        max_amount = self.request.query_params.get('max_amount')
        if max_amount:
            qs = qs.filter(amount__lte=max_amount)

        # Sorting
        sort_by = self.request.query_params.get('sort_by', 'date')
        order = self.request.query_params.get('order', 'desc')
        sort_field = {
            'date': 'date',
            'amount': 'amount',
            'category': 'category__name',
            'created_at': 'created_at',
        }.get(sort_by, 'date')

        if order == 'desc':
            sort_field = f"-{sort_field}"

        return qs.order_by(sort_field, '-created_at')

class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

class ExpenseExportView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        qs = Expense.objects.filter(user=user)

        search = request.query_params.get('search')
        if search:
            qs = qs.filter(Q(description__icontains=search) | Q(category__name__icontains=search))

        category_id = request.query_params.get('category')
        if category_id:
            qs = qs.filter(category_id=category_id)

        payment_method = request.query_params.get('payment_method')
        if payment_method:
            qs = qs.filter(payment_method=payment_method)

        transaction_type = request.query_params.get('transaction_type')
        if transaction_type:
            qs = qs.filter(transaction_type=transaction_type)

        start_date = request.query_params.get('start_date')
        if start_date:
            qs = qs.filter(date__gte=start_date)

        end_date = request.query_params.get('end_date')
        if end_date:
            qs = qs.filter(date__lte=end_date)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="expenses_export.csv"'

        writer = csv.writer(response)
        writer.writerow(['ID', 'Date', 'Type', 'Category', 'Amount', 'Payment Method', 'Description'])

        for exp in qs.order_by('-date'):
            writer.writerow([
                exp.id,
                exp.date.strftime('%d-%m-%Y'),
                exp.transaction_type,
                exp.category.name,
                f"{exp.amount:.2f}",
                exp.payment_method,
                exp.description,
            ])

        return response
