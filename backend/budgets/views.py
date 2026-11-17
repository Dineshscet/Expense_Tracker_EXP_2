from rest_framework import generics, permissions
from .models import Budget
from .serializers import BudgetSerializer

class BudgetListCreateView(generics.ListCreateAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Budget.objects.filter(user=user)

        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')

        if month:
            qs = qs.filter(month=month)
        if year:
            qs = qs.filter(year=year)

        return qs.order_by('category__name')

class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)
