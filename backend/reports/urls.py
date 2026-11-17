from django.urls import path
from .views import (
    DashboardSummaryView,
    CategorySpendingReportView,
    MonthlyTrendReportView,
    ReportStatsView
)

urlpatterns = [
    path('summary/', DashboardSummaryView.as_view(), name='report_summary'),
    path('by-category/', CategorySpendingReportView.as_view(), name='report_by_category'),
    path('monthly-trend/', MonthlyTrendReportView.as_view(), name='report_monthly_trend'),
    path('stats/', ReportStatsView.as_view(), name='report_stats'),
]

