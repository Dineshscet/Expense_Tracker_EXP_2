from datetime import datetime, date, timedelta
from decimal import Decimal
from django.db.models import Sum, Count, Max, Avg, Q
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions

from expenses.models import Expense, Category
from expenses.serializers import ExpenseSerializer
from budgets.models import Budget
from budgets.serializers import BudgetSerializer
from goals.models import Goal
from goals.serializers import GoalSerializer

class DashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        today = timezone.localdate()

        # Month and year from query params, or default to current
        month = int(request.query_params.get('month', today.month))
        year = int(request.query_params.get('year', today.year))

        # Calculate previous month/year
        if month == 1:
            prev_month = 12
            prev_year = year - 1
        else:
            prev_month = month - 1
            prev_year = year

        # Current month querysets
        curr_expenses_qs = Expense.objects.filter(
            user=user, date__year=year, date__month=month, transaction_type='EXPENSE'
        )
        curr_income_qs = Expense.objects.filter(
            user=user, date__year=year, date__month=month, transaction_type='INCOME'
        )

        curr_expense_total = float(curr_expenses_qs.aggregate(Sum('amount'))['amount__sum'] or 0)
        curr_income_total = float(curr_income_qs.aggregate(Sum('amount'))['amount__sum'] or 0)
        curr_balance = curr_income_total - curr_expense_total
        curr_savings = max(0.0, curr_balance)

        # Previous month querysets
        prev_expenses_qs = Expense.objects.filter(
            user=user, date__year=prev_year, date__month=prev_month, transaction_type='EXPENSE'
        )
        prev_income_qs = Expense.objects.filter(
            user=user, date__year=prev_year, date__month=prev_month, transaction_type='INCOME'
        )

        prev_expense_total = float(prev_expenses_qs.aggregate(Sum('amount'))['amount__sum'] or 0)
        prev_income_total = float(prev_income_qs.aggregate(Sum('amount'))['amount__sum'] or 0)
        prev_balance = prev_income_total - prev_expense_total
        prev_savings = max(0.0, prev_balance)

        def calc_pct_change(curr, prev):
            if prev <= 0:
                return 100.0 if curr > 0 else 0.0
            diff = ((curr - prev) / prev) * 100
            return round(diff, 1)

        # 5 Recent Transactions
        recent_txs = Expense.objects.filter(user=user).order_by('-date', '-created_at')[:5]
        recent_data = ExpenseSerializer(recent_txs, many=True).data

        # Budgets for this month
        budgets = Budget.objects.filter(user=user, month=month, year=year)
        budget_data = BudgetSerializer(budgets, many=True, context={'request': request}).data

        # Goals
        goals = Goal.objects.filter(user=user)[:3]
        goal_data = GoalSerializer(goals, many=True).data

        # Budget alerts (FR-BUD-03 / FR-DASH-05)
        budget_alerts = [b for b in budget_data if b['status'] in ['WARNING', 'EXCEEDED']]

        # Sparkline dummy curve data
        sparklines = {
            'balance': [10000, 10500, 11200, 11800, 12000, 12450],
            'expenses': [2000, 3500, 4800, 6200, 7500, 8550],
            'income': [0, 0, 0, 21000, 21000, 21000],
            'savings': [8000, 9200, 10100, 11000, 11900, 12450],
        }

        return Response({
            'period': {
                'month': month,
                'year': year,
                'formatted': f"{datetime(year, month, 1).strftime('%b %Y')}"
            },
            'cards': {
                'balance': {
                    'amount': curr_balance,
                    'change_pct': calc_pct_change(curr_balance, prev_balance),
                    'is_increase': curr_balance >= prev_balance,
                },
                'expenses': {
                    'amount': curr_expense_total,
                    'change_pct': calc_pct_change(curr_expense_total, prev_expense_total),
                    'is_increase': curr_expense_total >= prev_expense_total,
                },
                'income': {
                    'amount': curr_income_total,
                    'change_pct': calc_pct_change(curr_income_total, prev_income_total),
                    'is_increase': curr_income_total >= prev_income_total,
                },
                'savings': {
                    'amount': curr_savings,
                    'change_pct': calc_pct_change(curr_savings, prev_savings),
                    'is_increase': curr_savings >= prev_savings,
                },
            },
            'sparklines': sparklines,
            'recent_transactions': recent_data,
            'budgets': budget_data,
            'goals': goal_data,
            'budget_alerts': budget_alerts,
        })

class CategorySpendingReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        today = timezone.localdate()

        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        month = request.query_params.get('month')
        year = request.query_params.get('year')

        qs = Expense.objects.filter(user=user, transaction_type='EXPENSE')

        if start_date and end_date:
            qs = qs.filter(date__gte=start_date, date__lte=end_date)
        elif month and year:
            qs = qs.filter(date__year=year, date__month=month)
        else:
            qs = qs.filter(date__year=today.year, date__month=today.month)

        total_spent = float(qs.aggregate(Sum('amount'))['amount__sum'] or 0)

        # Group by category
        cat_data = (
            qs.values('category__id', 'category__name', 'category__color', 'category__icon')
            .annotate(total=Sum('amount'), count=Count('id'))
            .order_by('-total')
        )

        results = []
        for item in cat_data:
            amt = float(item['total'])
            pct = round((amt / total_spent) * 100, 1) if total_spent > 0 else 0.0
            results.append({
                'category_id': item['category__id'],
                'name': item['category__name'],
                'color': item['category__color'] or '#8B5CF6',
                'icon': item['category__icon'] or 'Folder',
                'amount': amt,
                'count': item['count'],
                'percentage': pct,
            })

        return Response({
            'total_spent': total_spent,
            'categories': results
        })

class MonthlyTrendReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        months_count = int(request.query_params.get('months', 6))
        today = timezone.localdate()

        # Generate last N months trend
        trend = []
        for i in range(months_count - 1, -1, -1):
            # calculate date for each month
            m = today.month - i
            y = today.year
            while m <= 0:
                m += 12
                y -= 1
            
            exp_sum = float(Expense.objects.filter(
                user=user, date__year=y, date__month=m, transaction_type='EXPENSE'
            ).aggregate(Sum('amount'))['amount__sum'] or 0)

            inc_sum = float(Expense.objects.filter(
                user=user, date__year=y, date__month=m, transaction_type='INCOME'
            ).aggregate(Sum('amount'))['amount__sum'] or 0)

            month_label = datetime(y, m, 1).strftime('%b %Y')
            trend.append({
                'month': m,
                'year': y,
                'label': month_label,
                'expenses': exp_sum,
                'income': inc_sum,
                'balance': inc_sum - exp_sum,
            })

        # Breakdown by week/milestone for the current month (matches UI screenshot points: Nov 1, Nov 8, Nov 15, Nov 22, Nov 30)
        curr_month = int(request.query_params.get('month', today.month))
        curr_year = int(request.query_params.get('year', today.year))

        month_name = datetime(curr_year, curr_month, 1).strftime('%b')
        checkpoints = [1, 8, 15, 22, 30]
        cumulative_points = []
        running_total = 0

        for day in checkpoints:
            spent_up_to_day = float(Expense.objects.filter(
                user=user,
                date__year=curr_year,
                date__month=curr_month,
                date__day__lte=day,
                transaction_type='EXPENSE'
            ).aggregate(Sum('amount'))['amount__sum'] or 0)

            cumulative_points.append({
                'label': f"{month_name} {day}",
                'amount': spent_up_to_day
            })

        return Response({
            'trend': trend,
            'current_month_points': cumulative_points
        })

class ReportStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        qs = Expense.objects.filter(user=user, transaction_type='EXPENSE')
        if start_date and end_date:
            qs = qs.filter(date__gte=start_date, date__lte=end_date)

        total_amount = float(qs.aggregate(Sum('amount'))['amount__sum'] or 0)
        transaction_count = qs.count()

        # Highest expense
        highest = qs.order_by('-amount').first()
        highest_data = ExpenseSerializer(highest).data if highest else None

        # Daily average
        if start_date and end_date:
            d1 = datetime.strptime(start_date, '%Y-%m-%d').date()
            d2 = datetime.strptime(end_date, '%Y-%m-%d').date()
            days = max(1, (d2 - d1).days + 1)
        else:
            days = 30
        daily_average = round(total_amount / days, 2)

        return Response({
            'total_amount': total_amount,
            'transaction_count': transaction_count,
            'highest_expense': highest_data,
            'daily_average': daily_average,
        })
