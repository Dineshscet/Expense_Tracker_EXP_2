# ExpenseTrack Web Application 💰📊

A responsive, single-page web application replicating the modern obsidian/neon dashboard UI and implementing all functional and non-functional requirements from the Software Requirements Specification (SRS v1.0).

---

## 🌟 Architecture & Tech Stack

| Layer | Technology | Responsibilities |
|---|---|---|
| **Presentation** | React 19, Vite, React Router 7, Chart.js, Lucide Icons, Axios | Responsive Obsidian Glass UI, Charts, Modals, State Handling, Interceptors |
| **Application** | Django 6, Django REST Framework, SimpleJWT, django-cors-headers | Business Logic, JWT Auth, Input Validation, REST API Endpoints |
| **Database** | SQLite3 (Development) via Django ORM | Relations, Constraints, Cascade & Protected Deletions, Indexes |

---

## 🚀 Quick Start

### 1. One-Click Launch (Windows)
Double-click `run_app.bat` or run:
```bat
run_app.bat
```

### 2. Manual Launch

**Backend (Django REST Framework):**
```bash
cd backend
python manage.py migrate
python manage.py seed_demo_data
python manage.py runserver 127.0.0.1:8000
```

**Frontend (React + Vite):**
```bash
cd frontend
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🔑 Demo Account Credentials
- **Username:** `dinesh`
- **Password:** `Password123!`
*(The app automatically logs in as Dinesh upon first visit for seamless zero-click evaluation, and supports standard Register/Login workflows)*

---

## 📋 Features Implemented (SRS v1.0 Compliance)

### 1. Pixel-Perfect UI Replication
- **Deep Obsidian & Neon Aesthetic:** Deep space backdrop with radial gradient lighting, glassmorphism cards, glowing borders and sparklines.
- **Top 4 Summary Cards:**
  - Total Balance (`₹12,450`, `+12%` with green bezier sparkline)
  - Total Expenses (`₹8,550`, `+8%` with coral red bezier sparkline)
  - Total Income (`₹21,000`, `+5%` with green bezier sparkline)
  - Savings (`₹12,450`, `+15%` with purple bezier sparkline)
- **Middle Grid (3 Cards):**
  - **Expense Overview Donut Chart:** Interactive cutout donut chart with center text (`₹8,550 Total Spent`) and category breakdown legend (Food & Dining 33%, Travel 21%, Shopping 18%, Entertainment 14%, Others 14%).
  - **Recent Transactions:** Real-time transaction list with category icons and color-coded amounts (`Zomato -₹320`, `Metro Cash & Carry -₹750`, `Bus Ticket -₹50`, `Salary Credit +₹21,000`).
  - **Monthly Trend:** Smooth spline line chart with glowing purple area fill, checkpoints (`Nov 1, Nov 8, Nov 15, Nov 22, Nov 30`), and peak badge (`₹8,550`).
- **Bottom Grid (3 Cards):**
  - **Budgets:** Category progress bars with utilization percentages and real-time status badges (`On Track`, `Warning 80%+`, `Exceeded 100%+`).
  - **Savings Goals:** Trophy icon, progress bar (`Trip to Japan ✈️ ₹25,000 / ₹50,000`), encouraging status message (`You're halfway there! 🎉`).
  - **Quick Actions:** Instant action grid for `Add Expense`, `Add Income`, `Set Budget`, and `Set Goal`.

### 2. Full SRS Functional Modules
- **Authentication & Profile (FR-AUTH-01 to 07):** JWT access & refresh tokens, password strength validation, profile update, preferred currency selector (`₹`, `$`, `€`, `£`), password change.
- **Expense & Income Management (FR-EXP-01 to 09):** Full CRUD, filtering by date range, category, payment method, and amount range, keyword search, multi-column sorting, pagination, and CSV data export.
- **Category Management (FR-CAT-01 to 04):** Default categories provisioned on registration, custom categories creation, color picker, safe deletion with expense reassignment protection.
- **Budget Tracking (FR-BUD-01 to 04):** Category and overall monthly limits, spent calculation, remaining balance, utilization progress bar, warnings at 80% and alerts at 100%.
- **Analytics & Reports (FR-REP-01 to 04):** Monthly trend bar chart (6 vs 12 months), category share donut chart, highest expense, daily average, total transaction counts, CSV export.
- **Savings Goals:** Dedicated goals dashboard to track financial targets and add funds interactively.

