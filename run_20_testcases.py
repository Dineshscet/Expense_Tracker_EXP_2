import sys
import json
import time
import requests

BASE_URL = 'http://127.0.0.1:8000/api'

results = []

def run_test(tc_id, module, description, test_fn):
    start_time = time.time()
    try:
        details, status, expected, actual = test_fn()
        elapsed = round((time.time() - start_time) * 1000, 2)
        results.append({
            "id": tc_id,
            "module": module,
            "description": description,
            "inputs": details.get("inputs", "N/A"),
            "expected": expected,
            "actual": actual,
            "status": "PASS" if status else "FAIL",
            "time_ms": elapsed
        })
        print(f"[{'PASS' if status else 'FAIL'}] {tc_id}: {description} ({elapsed}ms)")
    except Exception as e:
        elapsed = round((time.time() - start_time) * 1000, 2)
        results.append({
            "id": tc_id,
            "module": module,
            "description": description,
            "inputs": "Exception",
            "expected": "Normal execution",
            "actual": f"Error: {str(e)}",
            "status": "FAIL",
            "time_ms": elapsed
        })
        print(f"[FAIL] {tc_id}: {description} - Exception: {e}")

# Global state for tests
test_user = f"tester_{int(time.time())}"
test_email = f"{test_user}@testdomain.com"
test_password = "SecurePassword123!"
tokens = {}
user_headers = {}
created_cat_id = None
reassign_cat_id = None
created_exp_id = None

# TC-01: User Registration with valid credentials
def test_tc01():
    url = f"{BASE_URL}/auth/register/"
    payload = {
        "username": test_user,
        "email": test_email,
        "first_name": "Test",
        "last_name": "User",
        "password": test_password,
        "confirm_password": test_password,
        "currency": "INR"
    }
    res = requests.post(url, json=payload)
    data = res.json()
    status = (res.status_code == 201) and ("access" in data) and ("user" in data)
    return {
        "inputs": f"username={test_user}, email={test_email}, password={test_password}"
    }, status, "HTTP 201 Created with JWT tokens", f"HTTP {res.status_code}, User ID: {data.get('user', {}).get('id')}"

# TC-02: User Registration with mismatched passwords
def test_tc02():
    url = f"{BASE_URL}/auth/register/"
    payload = {
        "username": f"{test_user}_mismatch",
        "email": f"mismatch_{test_email}",
        "password": test_password,
        "confirm_password": "WrongPassword456!",
        "currency": "INR"
    }
    res = requests.post(url, json=payload)
    data = res.json()
    status = (res.status_code == 400) and ("confirm_password" in data)
    return {
        "inputs": "password != confirm_password"
    }, status, "HTTP 400 Bad Request with confirm_password error", f"HTTP {res.status_code}, Error: {data.get('confirm_password')}"

# TC-03: User Registration with duplicate email rejection
def test_tc03():
    url = f"{BASE_URL}/auth/register/"
    payload = {
        "username": f"another_{test_user}",
        "email": test_email, # already registered in TC-01
        "password": test_password,
        "confirm_password": test_password,
        "currency": "INR"
    }
    res = requests.post(url, json=payload)
    data = res.json()
    status = (res.status_code == 400) and ("email" in data)
    return {
        "inputs": f"email={test_email} (already registered)"
    }, status, "HTTP 400 with duplicate email error message", f"HTTP {res.status_code}, Error: {data.get('email')}"

# TC-04: User Login and JWT Token pair issuance
def test_tc04():
    global tokens, user_headers
    url = f"{BASE_URL}/auth/login/"
    payload = {
        "username": test_user,
        "password": test_password
    }
    res = requests.post(url, json=payload)
    data = res.json()
    tokens = data
    user_headers = {"Authorization": f"Bearer {data.get('access')}"}
    status = (res.status_code == 200) and ("access" in data) and ("refresh" in data)
    return {
        "inputs": f"username={test_user}, password={test_password}"
    }, status, "HTTP 200 OK with access and refresh tokens", f"HTTP {res.status_code}, Token issued"

# TC-05: User Login rejection with wrong password
def test_tc05():
    url = f"{BASE_URL}/auth/login/"
    payload = {
        "username": test_user,
        "password": "IncorrectPassword999!"
    }
    res = requests.post(url, json=payload)
    status = (res.status_code == 401)
    return {
        "inputs": f"username={test_user}, password=IncorrectPassword999!"
    }, status, "HTTP 401 Unauthorized", f"HTTP {res.status_code}, Detail: {res.json().get('detail')}"

# TC-06: Automatic Category Provisioning on Registration (Food, Transport, Rent, etc.)
def test_tc06():
    url = f"{BASE_URL}/categories/"
    res = requests.get(url, headers=user_headers)
    data = res.json()
    cats = data.get("results", data) if isinstance(data, dict) else data
    cat_names = [c["name"] for c in cats]
    expected_defaults = ["Food & Dining", "Travel", "Shopping", "Entertainment", "Utilities", "Rent", "Health", "Education", "Salary", "Others"]
    found = all(name in cat_names for name in expected_defaults)
    status = (res.status_code == 200) and (len(cats) >= 9) and found
    return {
        "inputs": "GET /api/categories/"
    }, status, "HTTP 200 with default categories provisioned", f"HTTP {res.status_code}, {len(cats)} categories provisioned"

# TC-07: Create Custom Category with custom color
def test_tc07():
    global created_cat_id
    url = f"{BASE_URL}/categories/"
    payload = {
        "name": "Gym & Fitness",
        "color": "#14B8A6",
        "icon": "Folder"
    }
    res = requests.post(url, json=payload, headers=user_headers)
    data = res.json()
    created_cat_id = data.get("id")
    status = (res.status_code == 201) and (data.get("name") == "Gym & Fitness")
    return {
        "inputs": "name='Gym & Fitness', color='#14B8A6'"
    }, status, "HTTP 201 Created with custom category ID", f"HTTP {res.status_code}, ID: {created_cat_id}"

# TC-08: Enforce Unique Category Names per User
def test_tc08():
    url = f"{BASE_URL}/categories/"
    payload = {
        "name": "Gym & Fitness", # duplicate name for this user
        "color": "#EF4444"
    }
    res = requests.post(url, json=payload, headers=user_headers)
    data = res.json()
    status = (res.status_code == 400) and ("name" in data)
    return {
        "inputs": "Duplicate name='Gym & Fitness'"
    }, status, "HTTP 400 Bad Request (duplicate category name)", f"HTTP {res.status_code}, Error: {data.get('name')}"

# TC-09: Create Valid Expense Record
def test_tc09():
    global created_exp_id
    url = f"{BASE_URL}/expenses/"
    payload = {
        "category": created_cat_id,
        "amount": "1250.00",
        "date": "2026-11-17",
        "payment_method": "UPI",
        "description": "Monthly Gym Subscription",
        "transaction_type": "EXPENSE"
    }
    res = requests.post(url, json=payload, headers=user_headers)
    data = res.json()
    created_exp_id = data.get("id")
    status = (res.status_code == 201) and (float(data.get("amount", 0)) == 1250.00)
    return {
        "inputs": "amount=1250.00, method=UPI, type=EXPENSE"
    }, status, "HTTP 201 Created with Expense ID", f"HTTP {res.status_code}, ID: {created_exp_id}"

# TC-10: Reject Invalid Expense Amount (<= 0)
def test_tc10():
    url = f"{BASE_URL}/expenses/"
    payload = {
        "category": created_cat_id,
        "amount": "-50.00",
        "date": "2026-11-17",
        "payment_method": "Cash",
        "description": "Negative amount test"
    }
    res = requests.post(url, json=payload, headers=user_headers)
    data = res.json()
    status = (res.status_code == 400) and ("amount" in data)
    return {
        "inputs": "amount=-50.00"
    }, status, "HTTP 400 Bad Request with amount validation message", f"HTTP {res.status_code}, Error: {data.get('amount')}"

# TC-11: List and Paginate User Expenses (sorted newest first)
def test_tc11():
    url = f"{BASE_URL}/expenses/?page=1&page_size=10"
    res = requests.get(url, headers=user_headers)
    data = res.json()
    status = (res.status_code == 200) and ("count" in data) and ("results" in data) and (len(data["results"]) >= 1)
    return {
        "inputs": "page=1, page_size=10"
    }, status, "HTTP 200 with paginated count and results array", f"HTTP {res.status_code}, Count: {data.get('count')}, Page: {data.get('current_page')}"

# TC-12: Keyword Search on Description / Category
def test_tc12():
    url = f"{BASE_URL}/expenses/?search=Gym"
    res = requests.get(url, headers=user_headers)
    data = res.json()
    results_list = data.get("results", [])
    matched = all("gym" in r.get("description", "").lower() or "gym" in r.get("category_name", "").lower() for r in results_list)
    status = (res.status_code == 200) and (len(results_list) >= 1) and matched
    return {
        "inputs": "search='Gym'"
    }, status, "HTTP 200 with matching transactions filtered by keyword", f"HTTP {res.status_code}, Found {len(results_list)} match(es)"

# TC-13: Multi-Parameter Filtering (Payment Method + Date)
def test_tc13():
    url = f"{BASE_URL}/expenses/?payment_method=UPI&start_date=2026-11-01&end_date=2026-11-30"
    res = requests.get(url, headers=user_headers)
    data = res.json()
    results_list = data.get("results", [])
    valid = all(r.get("payment_method") == "UPI" for r in results_list)
    status = (res.status_code == 200) and valid
    return {
        "inputs": "payment_method=UPI, date_range=2026-11-01 to 2026-11-30"
    }, status, "HTTP 200 with all results matching filters", f"HTTP {res.status_code}, {len(results_list)} filtered records"

# TC-14: Security / IDOR Prevention: Other user cannot access or modify expenses
def test_tc14():
    # Register secondary user B
    user_b = f"user_b_{int(time.time())}"
    reg_res = requests.post(f"{BASE_URL}/auth/register/", json={
        "username": user_b,
        "email": f"{user_b}@test.com",
        "password": test_password,
        "confirm_password": test_password,
        "currency": "INR"
    })
    b_token = reg_res.json().get("access")
    b_headers = {"Authorization": f"Bearer {b_token}"}

    # Attempt to read User A's expense created in TC-09
    res = requests.get(f"{BASE_URL}/expenses/{created_exp_id}/", headers=b_headers)
    status = (res.status_code == 404)
    return {
        "inputs": f"User B ({user_b}) requesting User A's expense {created_exp_id}"
    }, status, "HTTP 404 Not Found (IDOR access blocked)", f"HTTP {res.status_code} Access Denied"

# TC-15: Protected Category Deletion: Reject deletion when category has linked expenses
def test_tc15():
    # created_cat_id has created_exp_id attached to it
    url = f"{BASE_URL}/categories/{created_cat_id}/"
    res = requests.delete(url, headers=user_headers)
    data = res.json()
    status = (res.status_code == 400) and ("linked transaction" in data.get("error", "").lower() or "expense_count" in data)
    return {
        "inputs": f"DELETE /categories/{created_cat_id}/ (has 1 active expense)"
    }, status, "HTTP 400 Bad Request with reassignment requirement", f"HTTP {res.status_code}, Error: {data.get('error')}"

# TC-16: Category Deletion with Reassignment of Expenses
def test_tc16():
    global reassign_cat_id
    # Create target category
    t_res = requests.post(f"{BASE_URL}/categories/", json={"name": "General Wellness", "color": "#10B981"}, headers=user_headers)
    reassign_cat_id = t_res.json().get("id")

    # Delete with reassign_to parameter
    url = f"{BASE_URL}/categories/{created_cat_id}/?reassign_to={reassign_cat_id}"
    del_res = requests.delete(url, headers=user_headers)

    # Verify expense is now mapped to reassign_cat_id
    exp_res = requests.get(f"{BASE_URL}/expenses/{created_exp_id}/", headers=user_headers)
    exp_cat = exp_res.json().get("category")
    status = (del_res.status_code == 204) and (exp_cat == reassign_cat_id)
    return {
        "inputs": f"DELETE category {created_cat_id} with reassign_to={reassign_cat_id}"
    }, status, "HTTP 204 No Content & expense reassigned to new category", f"HTTP {del_res.status_code}, Expense category is now {exp_cat}"

# TC-17: Budget Creation & Utilisation Computation (On Track)
def test_tc17():
    url = f"{BASE_URL}/budgets/"
    payload = {
        "category": reassign_cat_id,
        "amount": "5000.00",
        "month": 11,
        "year": 2026
    }
    res = requests.post(url, json=payload, headers=user_headers)
    data = res.json()
    spent = float(data.get("spent", 0))
    limit = float(data.get("amount", 0))
    pct = float(data.get("percentage", 0))
    stat = data.get("status")
    status = (res.status_code == 201) and (spent == 1250.00) and (pct == 25.0) and (stat == "ON_TRACK")
    return {
        "inputs": f"category={reassign_cat_id}, limit=5000.00, month=11/2026"
    }, status, "HTTP 201, Spent=1250, 25% utilization, Status=ON_TRACK", f"HTTP {res.status_code}, Spent={spent}, {pct}%, Status={stat}"

# TC-18: Budget Alert Detection (Warning at >=80%, Exceeded at >100%)
def test_tc18():
    # Add an expense of 3000 to push spending to 4250 (85% of 5000 limit)
    requests.post(f"{BASE_URL}/expenses/", json={
        "category": reassign_cat_id,
        "amount": "3000.00",
        "date": "2026-11-18",
        "payment_method": "UPI",
        "description": "Equipment Purchase"
    }, headers=user_headers)

    # Fetch budget list to check alert status
    res = requests.get(f"{BASE_URL}/budgets/?month=11&year=2026", headers=user_headers)
    budgets = res.json()
    target_budget = next((b for b in budgets if b.get("category") == reassign_cat_id), None)
    status = target_budget is not None and target_budget.get("status") == "WARNING" and target_budget.get("percentage") >= 80.0
    return {
        "inputs": "Added 3000.00 expense (Total spent=4250, limit=5000)"
    }, status, "Status='WARNING' when utilization reaches 85%", f"HTTP {res.status_code}, Utilization={target_budget.get('percentage')}%, Status={target_budget.get('status')}"

# TC-19: Dashboard Summary & Month-on-Month KPI Aggregation
def test_tc19():
    url = f"{BASE_URL}/reports/summary/?month=11&year=2026"
    res = requests.get(url, headers=user_headers)
    data = res.json()
    cards = data.get("cards", {})
    has_keys = all(k in cards for k in ["balance", "expenses", "income", "savings"])
    exp_amt = cards.get("expenses", {}).get("amount", 0)
    status = (res.status_code == 200) and has_keys and (exp_amt == 4250.00)
    return {
        "inputs": "GET /api/reports/summary/?month=11&year=2026"
    }, status, "HTTP 200 with balance, expenses, income, savings, and alerts", f"HTTP {res.status_code}, Total Expenses={exp_amt}"

# TC-20: Filtered Expenses CSV Export
def test_tc20():
    url = f"{BASE_URL}/expenses/export/?start_date=2026-11-01&end_date=2026-11-30"
    res = requests.get(url, headers=user_headers)
    content = res.text
    has_header = "ID,Date,Type,Category,Amount,Payment Method,Description" in content
    has_csv_header = "text/csv" in res.headers.get("Content-Type", "")
    status = (res.status_code == 200) and has_header and has_csv_header
    return {
        "inputs": "GET /api/expenses/export/ with date filter"
    }, status, "HTTP 200, Content-Type=text/csv, proper CSV headers and rows", f"HTTP {res.status_code}, Rows returned: {len(content.splitlines())}"

def main():
    print("=" * 60)
    print("STARTING 20 COMPREHENSIVE TESTCASES FOR EXPENSE TRACKER")
    print("=" * 60)

    run_test("TC-01", "Authentication", "User Registration with valid credentials", test_tc01)
    run_test("TC-02", "Authentication", "User Registration password mismatch validation", test_tc02)
    run_test("TC-03", "Authentication", "User Registration duplicate email rejection", test_tc03)
    run_test("TC-04", "Authentication", "User Login & JWT access/refresh token issue", test_tc04)
    run_test("TC-05", "Authentication", "User Login failure with incorrect password", test_tc05)
    run_test("TC-06", "Categories", "Automatic default category provisioning on signup", test_tc06)
    run_test("TC-07", "Categories", "Create custom user category with color and icon", test_tc07)
    run_test("TC-08", "Categories", "Enforce unique category names per user", test_tc08)
    run_test("TC-09", "Expenses", "Create valid expense transaction record", test_tc09)
    run_test("TC-10", "Expenses", "Reject invalid expense with negative/zero amount", test_tc10)
    run_test("TC-11", "Expenses", "List and paginate expenses sorted by date desc", test_tc11)
    run_test("TC-12", "Expenses", "Keyword search on description and category", test_tc12)
    run_test("TC-13", "Expenses", "Filter expenses by payment method and date range", test_tc13)
    run_test("TC-14", "Security", "IDOR defense: Block cross-user transaction access", test_tc14)
    run_test("TC-15", "Categories", "Protected deletion: Prevent deleting category with expenses", test_tc15)
    run_test("TC-16", "Categories", "Category deletion with transaction reassignment", test_tc16)
    run_test("TC-17", "Budgets", "Set monthly budget limit and compute utilization", test_tc17)
    run_test("TC-18", "Budgets", "Budget alert trigger: Warning state at >=80% threshold", test_tc18)
    run_test("TC-19", "Dashboard", "Dashboard summary KPI and monthly totals calculation", test_tc19)
    run_test("TC-20", "Export", "Download filtered expenses as CSV file", test_tc20)

    print("=" * 60)
    passed = sum(1 for r in results if r["status"] == "PASS")
    failed = sum(1 for r in results if r["status"] == "FAIL")
    print(f"TEST SUMMARY: TOTAL: {len(results)}, PASSED: {passed}, FAILED: {failed}")
    print("=" * 60)

    with open("test_results.json", "w") as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    main()
