import os
from datetime import datetime, date, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from accounts.models import User
from expenses.models import Category, Expense
from budgets.models import Budget
from goals.models import Goal

class Command(BaseCommand):
    help = "Seeds database with demo data matching the UI specification and screenshot"

    def handle(self, *args, **options):
        # Create or update user Dinesh
        user, created = User.objects.get_or_create(
            username='dinesh',
            defaults={
                'email': 'dinesh@example.com',
                'first_name': 'Dinesh',
                'last_name': 'Kumar',
                'currency': 'INR',
            }
        )
        user.set_password('Password123!')
        user.save()

        self.stdout.write(f"User dinesh {'created' if created else 'updated'}.")

        # Current date info (use November 2025 as in screenshot, or today's year/month with dates)
        today = timezone.localdate()
        # Seed both for current date and Nov 2025 so it displays perfectly in any date view
        months_to_seed = [
            (today.year, today.month),
            (2025, 11),
        ]

        # Categories
        cat_configs = [
            {"name": "Food & Dining", "color": "#A855F7", "icon": "Utensils"},
            {"name": "Travel", "color": "#EC4899", "icon": "Bus"},
            {"name": "Shopping", "color": "#3B82F6", "icon": "ShoppingBag"},
            {"name": "Entertainment", "color": "#F97316", "icon": "Film"},
            {"name": "Others", "color": "#10B981", "icon": "MoreHorizontal"},
            {"name": "Salary", "color": "#10B981", "icon": "Briefcase"},
            {"name": "Utilities", "color": "#6366F1", "icon": "Zap"},
            {"name": "Health", "color": "#EF4444", "icon": "HeartPulse"},
            {"name": "Education", "color": "#14B8A6", "icon": "GraduationCap"},
            {"name": "Rent", "color": "#8B5CF6", "icon": "Home"},
        ]

        categories = {}
        for c in cat_configs:
            cat, _ = Category.objects.get_or_create(
                user=user,
                name=c["name"],
                defaults={"color": c["color"], "icon": c["icon"]}
            )
            categories[c["name"]] = cat

        # Clear existing expenses/budgets/goals for user to make seeding idempotent
        Expense.objects.filter(user=user).delete()
        Budget.objects.filter(user=user).delete()
        Goal.objects.filter(user=user).delete()

        for yr, mo in months_to_seed:
            # Income: ₹21,000
            Expense.objects.create(
                user=user,
                category=categories["Salary"],
                amount=21000.00,
                date=date(yr, mo, 1),
                payment_method="Net Banking",
                description="Salary Credit",
                transaction_type="INCOME"
            )

            # Food & Dining: ₹2,800 total (Zomato 320 + Groceries 1500 + Swiggy 500 + Cafe 480)
            Expense.objects.create(
                user=user, category=categories["Food & Dining"],
                amount=320.00, date=date(yr, mo, min(28, today.day if yr == today.year and mo == today.month else 25)),
                payment_method="UPI", description="Zomato", transaction_type="EXPENSE"
            )
            Expense.objects.create(
                user=user, category=categories["Food & Dining"],
                amount=1500.00, date=date(yr, mo, 10),
                payment_method="Card", description="Fresh Supermarket Groceries", transaction_type="EXPENSE"
            )
            Expense.objects.create(
                user=user, category=categories["Food & Dining"],
                amount=500.00, date=date(yr, mo, 18),
                payment_method="UPI", description="Swiggy Dinner", transaction_type="EXPENSE"
            )
            Expense.objects.create(
                user=user, category=categories["Food & Dining"],
                amount=480.00, date=date(yr, mo, 22),
                payment_method="Card", description="Blue Tokai Coffee & Bakery", transaction_type="EXPENSE"
            )

            # Travel: ₹1,800 total (Bus ticket 50 + Petrol 1200 + Uber 550)
            Expense.objects.create(
                user=user, category=categories["Travel"],
                amount=50.00, date=date(yr, mo, min(27, today.day - 1 if yr == today.year and mo == today.month and today.day > 1 else 24)),
                payment_method="UPI", description="Bus Ticket", transaction_type="EXPENSE"
            )
            Expense.objects.create(
                user=user, category=categories["Travel"],
                amount=1200.00, date=date(yr, mo, 5),
                payment_method="Card", description="Shell Fuel Station", transaction_type="EXPENSE"
            )
            Expense.objects.create(
                user=user, category=categories["Travel"],
                amount=550.00, date=date(yr, mo, 15),
                payment_method="UPI", description="Uber City Ride", transaction_type="EXPENSE"
            )

            # Shopping: ₹1,500 total (Metro Cash & Carry 750 + Myntra 750)
            Expense.objects.create(
                user=user, category=categories["Shopping"],
                amount=750.00, date=date(yr, mo, min(28, today.day if yr == today.year and mo == today.month else 25)),
                payment_method="Card", description="Metro Cash & Carry", transaction_type="EXPENSE"
            )
            Expense.objects.create(
                user=user, category=categories["Shopping"],
                amount=750.00, date=date(yr, mo, 12),
                payment_method="Card", description="Myntra Essentials", transaction_type="EXPENSE"
            )

            # Entertainment: ₹1,200 total (Netflix 650 + Movie 550)
            Expense.objects.create(
                user=user, category=categories["Entertainment"],
                amount=650.00, date=date(yr, mo, 3),
                payment_method="Card", description="Netflix Subscription", transaction_type="EXPENSE"
            )
            Expense.objects.create(
                user=user, category=categories["Entertainment"],
                amount=550.00, date=date(yr, mo, 20),
                payment_method="UPI", description="PVR IMAX Movie Tickets", transaction_type="EXPENSE"
            )

            # Others: ₹1,250 total (Pharmacy 550 + Utilities 700)
            Expense.objects.create(
                user=user, category=categories["Others"],
                amount=550.00, date=date(yr, mo, 8),
                payment_method="UPI", description="Apollo Pharmacy", transaction_type="EXPENSE"
            )
            Expense.objects.create(
                user=user, category=categories["Others"],
                amount=700.00, date=date(yr, mo, 16),
                payment_method="Net Banking", description="Broadband Internet Bill", transaction_type="EXPENSE"
            )

            # Budgets
            Budget.objects.create(
                user=user, category=categories["Food & Dining"],
                amount=4000.00, month=mo, year=yr
            )
            Budget.objects.create(
                user=user, category=categories["Shopping"],
                amount=3000.00, month=mo, year=yr
            )
            Budget.objects.create(
                user=user, category=categories["Travel"],
                amount=2500.00, month=mo, year=yr
            )
            Budget.objects.create(
                user=user, category=categories["Entertainment"],
                amount=1500.00, month=mo, year=yr
            )

        # Savings Goal
        Goal.objects.create(
            user=user,
            name="Trip to Japan ✈️",
            target_amount=50000.00,
            current_amount=25000.00,
            target_date=date(2026, 12, 31),
            icon="Trophy",
            color="#EAB308"
        )
        Goal.objects.create(
            user=user,
            name="MacBook Pro M3",
            target_amount=150000.00,
            current_amount=45000.00,
            target_date=date(2026, 8, 15),
            icon="Laptop",
            color="#A855F7"
        )

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully!"))

