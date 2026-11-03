import os
from collections import defaultdict
from datetime import date, datetime, timedelta

import mysql.connector
from flask import Flask, jsonify, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        port=3306,
        user="root",
        password="anuj",
        database="expense_tracker"
    )

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "expense-tracker-dev-secret")

transactions = [
    {"id": 1, "date": "2025-12-03", "category": "Salary", "amount": 42000},
    {"id": 2, "date": "2025-12-05", "category": "Rent", "amount": -12000},
    {"id": 3, "date": "2025-12-12", "category": "Food & Dining", "amount": -2800},
    {"id": 4, "date": "2026-01-03", "category": "Salary", "amount": 42000},
    {"id": 5, "date": "2026-01-08", "category": "Transport", "amount": -1800},
    {"id": 6, "date": "2026-01-15", "category": "Freelance", "amount": 12000},
    {"id": 7, "date": "2026-01-19", "category": "Internet Bill", "amount": -1200},
    {"id": 8, "date": "2026-02-03", "category": "Salary", "amount": 43000},
    {"id": 9, "date": "2026-02-09", "category": "Shopping", "amount": -4500},
    {"id": 10, "date": "2026-02-18", "category": "Food & Dining", "amount": -3200},
    {"id": 11, "date": "2026-03-03", "category": "Salary", "amount": 43000},
    {"id": 12, "date": "2026-03-09", "category": "Travel", "amount": -3500},
    {"id": 13, "date": "2026-03-12", "category": "Food & Dining", "amount": -850},
    {"id": 14, "date": "2026-03-18", "category": "Fees", "amount": -1000},
]

accounts = [
    {"id": 1, "name": "Cash Wallet", "type": "Cash", "balance": 3500},
    {"id": 2, "name": "SBI Savings", "type": "Bank", "balance": 28500},
    {"id": 3, "name": "UPI Wallet", "type": "Digital", "balance": 4200},
    {"id": 4, "name": "Emergency Savings", "type": "Reserve", "balance": 15000},
]

budget_limits = [
    {"id": 1, "category": "Food & Dining", "limit": 7000},
    {"id": 2, "category": "Transport", "limit": 2500},
    {"id": 3, "category": "Shopping", "limit": 6000},
    {"id": 4, "category": "Travel", "limit": 5000},
    {"id": 5, "category": "Rent", "limit": 12000},
    {"id": 6, "category": "Internet Bill", "limit": 2000},
]

goals = [
    {"id": 1, "name": "Emergency Fund", "target": 100000, "saved": 35000, "deadline": "2026-12-31"},
    {"id": 2, "name": "New Laptop", "target": 80000, "saved": 22000, "deadline": "2026-10-15"},
    {"id": 3, "name": "Vacation Trip", "target": 40000, "saved": 12000, "deadline": "2026-11-20"},
]

user_profile = {
    "id": 1,
    "name": "Anuj Kumar",
    "email": "anuj@example.com",
    "location": "Patna, India",
    "role": "Admin",
    "initials": "AK",
    "phone": "+91 98765 43210",
    "member_since": "2025-07-01",
    "department": "Finance Operations",
    "status": "Active",
}

other_users = [
    {
        "id": 2,
        "name": "Riya Sharma",
        "email": "riya@example.com",
        "location": "Delhi, India",
        "role": "User",
        "initials": "RS",
        "status": "Active",
    },
    {
        "id": 3,
        "name": "Aman Verma",
        "email": "aman@example.com",
        "location": "Lucknow, India",
        "role": "User",
        "initials": "AV",
        "status": "Active",
    },
    {
        "id": 4,
        "name": "Neha Singh",
        "email": "neha@example.com",
        "location": "Mumbai, India",
        "role": "User",
        "initials": "NS",
        "status": "Pending",
    },
]

demo_credentials = {
    "email": "anuj@example.com",
    "password": "admin123",
}

support_contact = {
    "name": "Anuj Kumar",
    "email": "anuj2006@gmail.com",
}

auth_audit = {
    "last_login": None,
    "last_logout": None,
}

activity_log = []

next_ids = {
    "transaction": 15,
    "account": 5,
    "budget": 7,
    "goal": 4,
    "user": 5,
}


def format_db_datetime(value, date_only=False):
    if value is None:
        return None
    if date_only:
        return value.strftime("%Y-%m-%d")
    return value.strftime("%Y-%m-%d %I:%M %p")


def db_status_to_ui(value):
    mapping = {
        "active": "Active",
        "inactive": "Pending",
        "banned": "Disabled",
    }
    return mapping.get(str(value or "").lower(), "Active")


def db_role_to_ui(value):
    return str(value or "user").title()


def fetch_current_user_db():
    user_id = session.get("user_id")
    user_email = session.get("user_email")
    if not user_id and not user_email:
        return None

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        if user_id:
            cursor.execute(
                """
                SELECT id, full_name, email, phone, location, department, role, status,
                       last_login, last_logout, created_at
                FROM users
                WHERE id = %s
                LIMIT 1
                """,
                (user_id,),
            )
        else:
            cursor.execute(
                """
                SELECT id, full_name, email, phone, location, department, role, status,
                       last_login, last_logout, created_at
                FROM users
                WHERE email = %s
                LIMIT 1
                """,
                (user_email,),
            )
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def email_exists(email, exclude_user_id=None):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        if exclude_user_id is None:
            cursor.execute("SELECT id FROM users WHERE email = %s LIMIT 1", (email,))
        else:
            cursor.execute(
                "SELECT id FROM users WHERE email = %s AND id <> %s LIMIT 1",
                (email, exclude_user_id),
            )
        return cursor.fetchone() is not None
    finally:
        cursor.close()
        conn.close()


def fetch_transactions_db(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT t.id, t.transaction_date, t.amount, t.note, c.name AS category, c.kind
            FROM transactions t
            JOIN categories c ON c.id = t.category_id
            WHERE t.user_id = %s
            ORDER BY t.transaction_date DESC, t.id DESC
            """,
            (user_id,),
        )
        rows = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

    items = []
    for row in rows:
        amount = float(row["amount"])
        if row["kind"] == "expense":
            amount = -amount
        items.append(
            {
                "id": row["id"],
                "date": format_db_datetime(row["transaction_date"], date_only=True),
                "category": row["category"],
                "amount": amount,
                "note": row.get("note") or "",
            }
        )
    return items


def fetch_accounts_db(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT
                a.id,
                a.account_name,
                a.account_type,
                a.opening_balance,
                COALESCE(SUM(
                    CASE
                        WHEN c.kind = 'income' THEN t.amount
                        ELSE -t.amount
                    END
                ), 0) AS net_flow
            FROM accounts a
            LEFT JOIN transactions t
                ON t.account_id = a.id
               AND t.user_id = a.user_id
            LEFT JOIN categories c
                ON c.id = t.category_id
            WHERE a.user_id = %s
            GROUP BY a.id, a.account_name, a.account_type, a.opening_balance
            ORDER BY a.id
            """,
            (user_id,),
        )
        rows = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

    items = []
    for row in rows:
        balance = float(row["opening_balance"]) + float(row["net_flow"])
        items.append(
            {
                "id": row["id"],
                "name": row["account_name"],
                "type": str(row["account_type"]).replace("_", " ").title(),
                "balance": round(balance, 2),
            }
        )
    return items


def fetch_budgets_db(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT
                b.id,
                c.name AS category,
                b.limit_amount,
                b.start_date,
                b.end_date,
                COALESCE(SUM(t.amount), 0) AS spent
            FROM budgets b
            JOIN categories c ON c.id = b.category_id
            LEFT JOIN transactions t
                ON t.user_id = b.user_id
               AND t.category_id = b.category_id
               AND t.transaction_date BETWEEN b.start_date AND b.end_date
            WHERE b.user_id = %s
            GROUP BY b.id, c.name, b.limit_amount, b.start_date, b.end_date
            ORDER BY b.start_date DESC, b.id DESC
            """,
            (user_id,),
        )
        rows = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

    items = []
    for row in rows:
        limit_value = float(row["limit_amount"])
        spent = float(row["spent"])
        usage_percent = round((spent / limit_value) * 100, 1) if limit_value else 0.0

        if usage_percent > 100:
            status = "over"
        elif usage_percent >= 75:
            status = "warning"
        else:
            status = "healthy"

        items.append(
            {
                "id": row["id"],
                "category": row["category"],
                "limit": limit_value,
                "spent": spent,
                "remaining": round(limit_value - spent, 2),
                "usage_percent": usage_percent,
                "status": status,
            }
        )
    return items


def fetch_goals_db(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT id, goal_name, target_amount, saved_amount, deadline
            FROM goals
            WHERE user_id = %s
            ORDER BY id DESC
            """,
            (user_id,),
        )
        rows = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

    items = []
    for row in rows:
        target = float(row["target_amount"])
        saved = float(row["saved_amount"])
        progress = round((saved / target) * 100, 1) if target else 0.0
        items.append(
            {
                "id": row["id"],
                "name": row["goal_name"],
                "target": target,
                "saved": saved,
                "deadline": format_db_datetime(row["deadline"], date_only=True) if row["deadline"] else "",
                "progress_percent": progress,
            }
        )
    return items


def fetch_users_db(current_user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT id, full_name, email, location, role, status
            FROM users
            WHERE id <> %s
            ORDER BY created_at DESC, id DESC
            """,
            (current_user_id,),
        )
        rows = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

    return [
        {
            "id": row["id"],
            "name": row["full_name"],
            "email": row["email"],
            "location": row.get("location") or "",
            "role": db_role_to_ui(row["role"]),
            "initials": make_initials(row["full_name"]),
            "status": db_status_to_ui(row["status"]),
        }
        for row in rows
    ]


def fetch_activity_db(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT action, details, level, created_at
            FROM activity_logs
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT 8
            """,
            (user_id,),
        )
        rows = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

    return [
        {
            "time": format_db_datetime(row["created_at"]),
            "message": row["details"] or row["action"],
            "level": row["level"],
        }
        for row in rows
    ]


def execute_commit(query, params=()):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(query, params)
        conn.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        conn.close()


def log_activity_db(user_id, action, level="info", entity_type=None, entity_id=None, details=None):
    execute_commit(
        """
        INSERT INTO activity_logs (user_id, action, entity_type, entity_id, level, details)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (user_id, action, entity_type, entity_id, level, details),
    )


def get_active_account_id(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT id
            FROM accounts
            WHERE user_id = %s AND status = 'active'
            ORDER BY id
            LIMIT 1
            """,
            (user_id,),
        )
        row = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()
    return row["id"] if row else None


def normalize_account_type(value):
    mapping = {
        "cash": "cash",
        "bank": "bank",
        "savings": "savings",
        "savings account": "savings",
        "wallet": "wallet",
        "digital": "wallet",
        "credit card": "credit_card",
        "credit_card": "credit_card",
        "investment": "investment",
        "reserve": "investment",
    }
    return mapping.get(str(value or "").strip().lower(), "bank")


def ui_status_to_db(value):
    mapping = {
        "active": "active",
        "pending": "inactive",
        "disabled": "banned",
        "inactive": "inactive",
        "banned": "banned",
    }
    return mapping.get(str(value or "").strip().lower(), "active")


def ui_role_to_db(value):
    normalized = str(value or "user").strip().lower()
    return normalized if normalized in {"admin", "manager", "user"} else "user"


def get_or_create_category(user_id, category_name, kind):
    conn = get_db_connection()
    read_cursor = conn.cursor(dictionary=True)
    write_cursor = None
    try:
        read_cursor.execute(
            """
            SELECT id
            FROM categories
            WHERE user_id = %s AND name = %s AND kind = %s
            LIMIT 1
            """,
            (user_id, category_name, kind),
        )
        existing = read_cursor.fetchone()
        if existing:
            return existing["id"]

        write_cursor = conn.cursor()
        write_cursor.execute(
            """
            INSERT INTO categories (user_id, name, kind, icon, is_system)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (user_id, category_name, kind, "tag", False),
        )
        conn.commit()
        return write_cursor.lastrowid
    finally:
        read_cursor.close()
        if write_cursor is not None:
            write_cursor.close()
        conn.close()


def current_month_window():
    today = datetime.now().date()
    start_date = today.replace(day=1)
    next_month = (start_date + timedelta(days=32)).replace(day=1)
    end_date = next_month - timedelta(days=1)
    return start_date, end_date


def now_label():
    return datetime.now().strftime("%Y-%m-%d %I:%M %p")


def make_initials(name):
    initials = "".join(part[0] for part in name.split()[:2]).upper()
    return initials or "NA"


def log_activity(message, level="info"):
    activity_log.insert(0, {"time": now_label(), "message": message, "level": level})
    del activity_log[20:]


def sort_transactions_desc(items):
    return sorted(items, key=lambda tx: tx["date"], reverse=True)


def is_logged_in():
    return fetch_current_user_db() is not None


def is_admin():
    current_user = fetch_current_user_db()
    return bool(current_user and str(current_user.get("role")).lower() == "admin")


def build_session_state():
    current_user = fetch_current_user_db()
    return {
        "logged_in": current_user is not None,
        "status_label": "Logged In" if current_user else "Logged Out",
        "status_class": "healthy" if current_user else "over",
        "last_login": format_db_datetime(current_user.get("last_login")) if current_user else auth_audit["last_login"],
        "last_logout": format_db_datetime(current_user.get("last_logout")) if current_user else auth_audit["last_logout"],
    }


def require_api_login():
    if fetch_current_user_db() is not None:
        return None
    return jsonify(
        {
            "status": "error",
            "message": "Please log in first.",
            "redirect": url_for("login_page"),
        }
    ), 401


def require_admin_api():
    login_error = require_api_login()
    if login_error:
        return login_error
    if is_admin():
        return None
    return jsonify({"status": "error", "message": "Only admin can manage users."}), 403


def find_by_id(items, item_id):
    return next((item for item in items if item["id"] == item_id), None)


def validate_transaction_payload(payload):
    if not isinstance(payload, dict):
        return None, "Invalid JSON payload."

    date = str(payload.get("date", "")).strip()
    category = str(payload.get("category", "")).strip()
    amount = payload.get("amount")

    if not date or not category:
        return None, "Date and category are required."

    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return None, "Amount must be a number."

    return {"date": date, "category": category, "amount": amount}, None


def validate_account_payload(payload):
    if not isinstance(payload, dict):
        return None, "Invalid JSON payload."

    name = str(payload.get("name", "")).strip()
    account_type = str(payload.get("type", "")).strip()
    balance = payload.get("balance")

    if not name or not account_type:
        return None, "Account name and type are required."

    try:
        balance = float(balance)
    except (TypeError, ValueError):
        return None, "Balance must be a number."

    return {"name": name, "type": account_type, "balance": balance}, None


def validate_budget_payload(payload):
    if not isinstance(payload, dict):
        return None, "Invalid JSON payload."

    category = str(payload.get("category", "")).strip()
    limit = payload.get("limit")

    if not category:
        return None, "Budget category is required."

    try:
        limit = float(limit)
    except (TypeError, ValueError):
        return None, "Budget limit must be a number."

    if limit < 0:
        return None, "Budget limit cannot be negative."

    return {"category": category, "limit": limit}, None


def validate_goal_payload(payload):
    if not isinstance(payload, dict):
        return None, "Invalid JSON payload."

    name = str(payload.get("name", "")).strip()
    deadline = str(payload.get("deadline", "")).strip()
    target = payload.get("target")
    saved = payload.get("saved")

    if not name or not deadline:
        return None, "Goal name and deadline are required."

    try:
        target = float(target)
        saved = float(saved)
    except (TypeError, ValueError):
        return None, "Goal target and saved values must be numbers."

    if target <= 0:
        return None, "Goal target must be greater than zero."

    if saved < 0:
        return None, "Saved amount cannot be negative."

    return {"name": name, "target": target, "saved": saved, "deadline": deadline}, None


def validate_profile_payload(payload):
    if not isinstance(payload, dict):
        return None, "Invalid JSON payload."

    name = str(payload.get("name", "")).strip()
    email = str(payload.get("email", "")).strip().lower()
    location = str(payload.get("location", "")).strip()
    phone = str(payload.get("phone", "")).strip()
    department = str(payload.get("department", "")).strip()

    if not name or not email:
        return None, "Profile name and email are required."

    return {
        "name": name,
        "email": email,
        "location": location,
        "phone": phone,
        "department": department,
        "initials": make_initials(name),
    }, None


def validate_user_payload(payload, require_password=False):
    if not isinstance(payload, dict):
        return None, "Invalid JSON payload."

    name = str(payload.get("name", "")).strip()
    email = str(payload.get("email", "")).strip().lower()
    location = str(payload.get("location", "")).strip()
    role = str(payload.get("role", "User")).strip().title() or "User"
    status = str(payload.get("status", "Active")).strip().title() or "Active"
    password = str(payload.get("password", "")).strip()

    if not name or not email:
        return None, "User name and email are required."

    if require_password and len(password) < 6:
        return None, "Password must be at least 6 characters."

    if role not in {"User", "Admin", "Manager"}:
        return None, "Role must be User, Manager, or Admin."

    if status not in {"Active", "Pending", "Disabled"}:
        return None, "Status must be Active, Pending, or Disabled."

    return {
        "name": name,
        "email": email,
        "location": location,
        "role": role,
        "status": status,
        "password": password,
        "initials": make_initials(name),
    }, None


def build_income_transactions(items=None):
    source = items if items is not None else transactions
    return sort_transactions_desc([tx for tx in source if tx["amount"] > 0])


def build_expense_transactions(items=None):
    source = items if items is not None else transactions
    return sort_transactions_desc([tx for tx in source if tx["amount"] < 0])


def build_category_spend(items=None):
    source = items if items is not None else transactions
    category_data = defaultdict(float)
    for tx in source:
        if tx["amount"] < 0:
            category_data[tx["category"]] += abs(tx["amount"])

    return [
        {"category": category, "amount": amount}
        for category, amount in sorted(category_data.items(), key=lambda item: item[1], reverse=True)
    ]


def build_monthly_cashflow(items=None):
    source = items if items is not None else transactions
    monthly_data = defaultdict(lambda: {"income": 0.0, "expense": 0.0})

    for tx in source:
        month_key = tx["date"][:7]
        if tx["amount"] >= 0:
            monthly_data[month_key]["income"] += tx["amount"]
        else:
            monthly_data[month_key]["expense"] += abs(tx["amount"])

    flow = []
    running_balance = 0.0
    for month_key in sorted(monthly_data.keys()):
        income = monthly_data[month_key]["income"]
        expense = monthly_data[month_key]["expense"]
        net = income - expense
        running_balance += net
        flow.append(
            {
                "month": month_key,
                "income": income,
                "expense": expense,
                "net": net,
                "running_balance": running_balance,
            }
        )

    return flow


def build_budget_snapshot():
    spent_by_category = defaultdict(float)
    for tx in transactions:
        if tx["amount"] < 0:
            spent_by_category[tx["category"]] += abs(tx["amount"])

    snapshots = []
    for budget in budget_limits:
        spent = spent_by_category.get(budget["category"], 0.0)
        limit = float(budget["limit"])
        usage_percent = round((spent / limit) * 100, 1) if limit else 0.0

        if usage_percent > 100:
            status = "over"
        elif usage_percent >= 75:
            status = "warning"
        else:
            status = "healthy"

        snapshots.append(
            {
                "id": budget["id"],
                "category": budget["category"],
                "limit": limit,
                "spent": spent,
                "remaining": limit - spent,
                "usage_percent": usage_percent,
                "status": status,
            }
        )

    return sorted(snapshots, key=lambda item: item["usage_percent"], reverse=True)


def build_goal_snapshot():
    snapshots = []
    for goal in goals:
        progress = round((goal["saved"] / goal["target"]) * 100, 1) if goal["target"] else 0.0
        snapshots.append({**goal, "progress_percent": progress})
    return sorted(snapshots, key=lambda item: item["progress_percent"], reverse=True)


def build_admin_summary(users_list=None):
    source = users_list if users_list is not None else other_users
    active_users = sum(1 for user in source if user.get("status") == "Active")
    pending_users = sum(1 for user in source if user.get("status") == "Pending")
    return {
        "total_users": len(source) + 1,
        "active_users": active_users + 1,
        "pending_users": pending_users,
    }


def build_finance_counts(transaction_items=None):
    income_transactions = build_income_transactions(transaction_items)
    expense_transactions = build_expense_transactions(transaction_items)
    source = transaction_items if transaction_items is not None else transactions
    return {
        "transactions": len(source),
        "income": len(income_transactions),
        "expense": len(expense_transactions),
    }


def build_summary(transaction_items=None, account_items=None, goal_items=None, budget_items=None):
    transaction_source = transaction_items if transaction_items is not None else transactions
    account_source = account_items if account_items is not None else accounts
    goal_source = goal_items if goal_items is not None else goals
    budget_source = budget_items if budget_items is not None else build_budget_snapshot()

    total_income = sum(tx["amount"] for tx in transaction_source if tx["amount"] > 0)
    total_expense = sum(abs(tx["amount"]) for tx in transaction_source if tx["amount"] < 0)
    total_balance = total_income - total_expense
    total_assets = sum(account["balance"] for account in account_source)
    budget_alerts = sum(1 for item in budget_source if item["status"] in {"warning", "over"})
    category_spend = build_category_spend(transaction_source)
    top_category = category_spend[0]["category"] if category_spend else "None"

    return {
        "balance": total_balance,
        "income": total_income,
        "expense": total_expense,
        "count": len(transaction_source),
        "assets": total_assets,
        "active_goals": len(goal_source),
        "budget_alerts": budget_alerts,
        "top_category": top_category,
    }


def build_dashboard_payload():
    current_user = fetch_current_user_db()
    if current_user is None:
        income_transactions = build_income_transactions()
        expense_transactions = build_expense_transactions()
        budget_snapshot = build_budget_snapshot()
        goal_snapshot = build_goal_snapshot()
        insights = {
            "monthly_flow": build_monthly_cashflow(),
            "category_spend": build_category_spend(),
            "budget_status": budget_snapshot,
            "goal_progress": goal_snapshot,
        }
        return {
            "user": user_profile,
            "users": other_users,
            "session": build_session_state(),
            "income_transactions": income_transactions,
            "expense_transactions": expense_transactions,
            "admin_summary": build_admin_summary(),
            "summary": build_summary(),
            "transactions": sort_transactions_desc(transactions),
            "accounts": accounts,
            "budgets": budget_snapshot,
            "goals": goal_snapshot,
            "finance_counts": build_finance_counts(),
            "recent_activity": activity_log[:8],
            "insights": insights,
        }

    transactions_db = fetch_transactions_db(current_user["id"])
    accounts_db = fetch_accounts_db(current_user["id"])
    budgets_db = fetch_budgets_db(current_user["id"])
    goals_db = fetch_goals_db(current_user["id"])
    users_db = fetch_users_db(current_user["id"]) if str(current_user["role"]).lower() == "admin" else []
    recent_activity_db = fetch_activity_db(current_user["id"])
    income_transactions = build_income_transactions(transactions_db)
    expense_transactions = build_expense_transactions(transactions_db)
    insights = {
        "monthly_flow": build_monthly_cashflow(transactions_db),
        "category_spend": build_category_spend(transactions_db),
        "budget_status": budgets_db,
        "goal_progress": goals_db,
    }

    return {
        "user": {
            "id": current_user["id"],
            "name": current_user["full_name"],
            "email": current_user["email"],
            "location": current_user.get("location") or "",
            "role": db_role_to_ui(current_user["role"]),
            "initials": make_initials(current_user["full_name"]),
            "phone": current_user.get("phone") or "",
            "member_since": format_db_datetime(current_user["created_at"], date_only=True),
            "department": current_user.get("department") or "",
            "status": db_status_to_ui(current_user["status"]),
        },
        "users": users_db,
        "session": {
            "logged_in": True,
            "status_label": "Logged In",
            "status_class": "healthy",
            "last_login": format_db_datetime(current_user.get("last_login")),
            "last_logout": format_db_datetime(current_user.get("last_logout")),
        },
        "income_transactions": income_transactions,
        "expense_transactions": expense_transactions,
        "admin_summary": build_admin_summary(users_db),
        "summary": build_summary(transactions_db, accounts_db, goals_db, budgets_db),
        "transactions": transactions_db,
        "accounts": accounts_db,
        "budgets": budgets_db,
        "goals": goals_db,
        "finance_counts": build_finance_counts(transactions_db),
        "recent_activity": recent_activity_db,
        "insights": insights,
    }


@app.route("/login", methods=["GET", "POST"])
def login_page():
    if is_logged_in():
        return redirect(url_for("dashboard"))

    error = None
    created_id = request.args.get("created_id", "").strip()
    identifier_value = request.args.get("identifier", "").strip()

    if request.method == "POST":
        identifier = request.form.get("identifier", "").strip()
        identifier_value = identifier
        password = request.form.get("password", "")
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(
                """
                SELECT id, full_name, email, password_hash, role, status
                FROM users
                WHERE email = %s OR CAST(id AS CHAR) = %s
                LIMIT 1
                """,
                (identifier.lower(), identifier),
            )
            user = cursor.fetchone()
        finally:
            cursor.close()
            conn.close()

        if user and str(user["status"]).lower() == "active" and check_password_hash(user["password_hash"], password):
            execute_commit("UPDATE users SET last_login = NOW() WHERE id = %s", (user["id"],))
            log_activity_db(
                user["id"],
                "Login successful",
                level="success",
                entity_type="auth",
                details=f"{user['full_name']} logged in.",
            )
            session["authenticated"] = True
            session["user_id"] = user["id"]
            session["user_email"] = user["email"]
            return redirect(url_for("dashboard"))

        error = "Invalid login ID or password."

    return render_template(
        "login.html",
        error=error,
        created_id=created_id,
        identifier=identifier_value,
        support_name=support_contact["name"],
        support_email=support_contact["email"],
    )


@app.route("/register", methods=["GET", "POST"])
def register_page():
    if is_logged_in():
        return redirect(url_for("dashboard"))

    error = None
    form_values = {
        "name": "",
        "email": "",
        "location": "",
    }

    if request.method == "POST":
        form_values["name"] = request.form.get("name", "").strip()
        form_values["email"] = request.form.get("email", "").strip().lower()
        form_values["location"] = request.form.get("location", "").strip()
        password = request.form.get("password", "")
        confirm_password = request.form.get("confirm_password", "")

        if not form_values["name"] or not form_values["email"] or not password:
            error = "Name, email, and password are required."
        elif len(password) < 6:
            error = "Password must be at least 6 characters."
        elif password != confirm_password:
            error = "Password and confirm password must match."
        elif email_exists(form_values["email"]):
            error = "This email is already registered."
        else:
            user_id = execute_commit(
                """
                INSERT INTO users (
                    full_name, email, password_hash, location, currency_code, role, status
                ) VALUES (%s, %s, %s, %s, 'INR', 'user', 'active')
                """,
                (
                    form_values["name"],
                    form_values["email"],
                    generate_password_hash(password),
                    form_values["location"],
                ),
            )
            log_activity_db(
                user_id,
                "User registered",
                level="success",
                entity_type="auth",
                entity_id=user_id,
                details=f"{form_values['name']} created a new account.",
            )
            return redirect(url_for("login_page", created_id=user_id, identifier=form_values["email"]))

    return render_template("register.html", error=error, values=form_values)


@app.route("/")
def home():
    if is_logged_in():
        return redirect(url_for("dashboard"))
    return redirect(url_for("login_page"))


@app.route("/dashboard")
@app.route("/workspace")
def dashboard():
    if not is_logged_in():
        return redirect(url_for("login_page"))
    return render_template("index.html")


@app.route("/logout", methods=["POST"])
def logout():
    current_user = fetch_current_user_db()
    if current_user is not None:
        execute_commit("UPDATE users SET last_logout = NOW() WHERE id = %s", (current_user["id"],))
        log_activity_db(
            current_user["id"],
            "Logout successful",
            level="info",
            entity_type="auth",
            details=f"{current_user['full_name']} logged out.",
        )
    session.clear()
    return jsonify({"status": "success", "redirect": url_for("login_page")})


@app.route("/api/dashboard-data", methods=["GET"])
def dashboard_data():
    login_error = require_api_login()
    if login_error:
        return login_error
    return jsonify(build_dashboard_payload())


@app.route("/api/summary", methods=["GET"])
def summary():
    login_error = require_api_login()
    if login_error:
        return login_error
    return jsonify(build_dashboard_payload()["summary"])


@app.route("/api/dashboard-insights", methods=["GET"])
def dashboard_insights():
    login_error = require_api_login()
    if login_error:
        return login_error
    return jsonify(build_dashboard_payload()["insights"])


@app.route("/api/transactions", methods=["GET", "POST"])
def transactions_api():
    login_error = require_api_login()
    if login_error:
        return login_error

    current_user = fetch_current_user_db()
    user_id = current_user["id"]

    if request.method == "GET":
        return jsonify(fetch_transactions_db(user_id))

    payload, error = validate_transaction_payload(request.get_json())
    if error:
        return jsonify({"status": "error", "message": error}), 400

    account_id = get_active_account_id(user_id)
    if account_id is None:
        return jsonify({"status": "error", "message": "Create an account first."}), 400

    kind = "income" if payload["amount"] >= 0 else "expense"
    category_id = get_or_create_category(user_id, payload["category"], kind)
    transaction_id = execute_commit(
        """
        INSERT INTO transactions (user_id, account_id, category_id, amount, transaction_date, note)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (user_id, account_id, category_id, abs(payload["amount"]), payload["date"], ""),
    )
    log_activity_db(
        user_id,
        "Transaction added",
        level="success",
        entity_type="transaction",
        entity_id=transaction_id,
        details=f"Added transaction for {payload['category']} ({payload['amount']}).",
    )
    return jsonify({"status": "success", "transaction": {"id": transaction_id, **payload}}), 201


@app.route("/api/transactions/<int:transaction_id>", methods=["PUT", "DELETE"])
def transaction_detail(transaction_id):
    login_error = require_api_login()
    if login_error:
        return login_error

    current_user = fetch_current_user_db()
    user_id = current_user["id"]

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT id
            FROM transactions
            WHERE id = %s AND user_id = %s
            LIMIT 1
            """,
            (transaction_id, user_id),
        )
        existing = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

    if existing is None:
        return jsonify({"status": "error", "message": "Transaction not found."}), 404

    if request.method == "DELETE":
        execute_commit("DELETE FROM transactions WHERE id = %s AND user_id = %s", (transaction_id, user_id))
        log_activity_db(
            user_id,
            "Transaction deleted",
            level="warning",
            entity_type="transaction",
            entity_id=transaction_id,
            details=f"Deleted transaction {transaction_id}.",
        )
        return jsonify({"status": "deleted", "transaction": {"id": transaction_id}})

    payload, error = validate_transaction_payload(request.get_json())
    if error:
        return jsonify({"status": "error", "message": error}), 400

    kind = "income" if payload["amount"] >= 0 else "expense"
    category_id = get_or_create_category(user_id, payload["category"], kind)
    execute_commit(
        """
        UPDATE transactions
        SET category_id = %s, amount = %s, transaction_date = %s, note = %s
        WHERE id = %s AND user_id = %s
        """,
        (category_id, abs(payload["amount"]), payload["date"], "", transaction_id, user_id),
    )
    log_activity_db(
        user_id,
        "Transaction updated",
        level="info",
        entity_type="transaction",
        entity_id=transaction_id,
        details=f"Updated transaction {transaction_id}.",
    )
    return jsonify({"status": "updated", "transaction": {"id": transaction_id, **payload}})


@app.route("/api/accounts", methods=["GET", "POST"])
def accounts_api():
    login_error = require_api_login()
    if login_error:
        return login_error

    current_user = fetch_current_user_db()
    user_id = current_user["id"]

    if request.method == "GET":
        return jsonify(fetch_accounts_db(user_id))

    payload, error = validate_account_payload(request.get_json())
    if error:
        return jsonify({"status": "error", "message": error}), 400

    account_id = execute_commit(
        """
        INSERT INTO accounts (user_id, account_name, account_type, opening_balance, status)
        VALUES (%s, %s, %s, %s, 'active')
        """,
        (user_id, payload["name"], normalize_account_type(payload["type"]), payload["balance"]),
    )
    log_activity_db(
        user_id,
        "Account added",
        level="success",
        entity_type="account",
        entity_id=account_id,
        details=f"Added account {payload['name']}.",
    )
    return jsonify({"status": "success", "account": {"id": account_id, **payload}}), 201


@app.route("/api/accounts/<int:account_id>", methods=["PUT", "DELETE"])
def account_detail(account_id):
    login_error = require_api_login()
    if login_error:
        return login_error

    current_user = fetch_current_user_db()
    user_id = current_user["id"]

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM accounts WHERE id = %s AND user_id = %s LIMIT 1",
            (account_id, user_id),
        )
        existing = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

    if existing is None:
        return jsonify({"status": "error", "message": "Account not found."}), 404

    if request.method == "DELETE":
        execute_commit("DELETE FROM accounts WHERE id = %s AND user_id = %s", (account_id, user_id))
        log_activity_db(
            user_id,
            "Account deleted",
            level="warning",
            entity_type="account",
            entity_id=account_id,
            details=f"Deleted account {account_id}.",
        )
        return jsonify({"status": "deleted", "account": {"id": account_id}})

    payload, error = validate_account_payload(request.get_json())
    if error:
        return jsonify({"status": "error", "message": error}), 400

    execute_commit(
        """
        UPDATE accounts
        SET account_name = %s, account_type = %s, opening_balance = %s
        WHERE id = %s AND user_id = %s
        """,
        (payload["name"], normalize_account_type(payload["type"]), payload["balance"], account_id, user_id),
    )
    log_activity_db(
        user_id,
        "Account updated",
        level="info",
        entity_type="account",
        entity_id=account_id,
        details=f"Updated account {payload['name']}.",
    )
    return jsonify({"status": "updated", "account": {"id": account_id, **payload}})


@app.route("/api/budgets", methods=["GET", "POST"])
def budgets_api():
    login_error = require_api_login()
    if login_error:
        return login_error

    current_user = fetch_current_user_db()
    user_id = current_user["id"]

    if request.method == "GET":
        return jsonify(fetch_budgets_db(user_id))

    payload, error = validate_budget_payload(request.get_json())
    if error:
        return jsonify({"status": "error", "message": error}), 400

    category_id = get_or_create_category(user_id, payload["category"], "expense")
    start_date, end_date = current_month_window()

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT id
            FROM budgets
            WHERE user_id = %s AND category_id = %s AND period = 'monthly'
              AND start_date = %s AND end_date = %s
            LIMIT 1
            """,
            (user_id, category_id, start_date, end_date),
        )
        existing = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

    if existing:
        budget_id = existing["id"]
        execute_commit(
            """
            UPDATE budgets
            SET limit_amount = %s, status = 'active'
            WHERE id = %s AND user_id = %s
            """,
            (payload["limit"], budget_id, user_id),
        )
        result_status = "updated"
    else:
        budget_id = execute_commit(
            """
            INSERT INTO budgets (user_id, category_id, limit_amount, period, start_date, end_date, status)
            VALUES (%s, %s, %s, 'monthly', %s, %s, 'active')
            """,
            (user_id, category_id, payload["limit"], start_date, end_date),
        )
        result_status = "success"

    log_activity_db(
        user_id,
        "Budget saved",
        level="success",
        entity_type="budget",
        entity_id=budget_id,
        details=f"Saved budget for {payload['category']}.",
    )
    return jsonify({"status": result_status, "budget": {"id": budget_id, **payload}}), 201 if result_status == "success" else 200


@app.route("/api/budgets/<int:budget_id>", methods=["PUT", "DELETE"])
def budget_detail(budget_id):
    login_error = require_api_login()
    if login_error:
        return login_error

    current_user = fetch_current_user_db()
    user_id = current_user["id"]

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM budgets WHERE id = %s AND user_id = %s LIMIT 1",
            (budget_id, user_id),
        )
        existing = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

    if existing is None:
        return jsonify({"status": "error", "message": "Budget not found."}), 404

    if request.method == "DELETE":
        execute_commit("DELETE FROM budgets WHERE id = %s AND user_id = %s", (budget_id, user_id))
        log_activity_db(
            user_id,
            "Budget deleted",
            level="warning",
            entity_type="budget",
            entity_id=budget_id,
            details=f"Deleted budget {budget_id}.",
        )
        return jsonify({"status": "deleted", "budget": {"id": budget_id}})

    payload, error = validate_budget_payload(request.get_json())
    if error:
        return jsonify({"status": "error", "message": error}), 400

    category_id = get_or_create_category(user_id, payload["category"], "expense")
    execute_commit(
        """
        UPDATE budgets
        SET category_id = %s, limit_amount = %s
        WHERE id = %s AND user_id = %s
        """,
        (category_id, payload["limit"], budget_id, user_id),
    )
    log_activity_db(
        user_id,
        "Budget updated",
        level="info",
        entity_type="budget",
        entity_id=budget_id,
        details=f"Updated budget for {payload['category']}.",
    )
    return jsonify({"status": "updated", "budget": {"id": budget_id, **payload}})


@app.route("/api/goals", methods=["GET", "POST"])
def goals_api():
    login_error = require_api_login()
    if login_error:
        return login_error

    current_user = fetch_current_user_db()
    user_id = current_user["id"]

    if request.method == "GET":
        return jsonify(fetch_goals_db(user_id))

    payload, error = validate_goal_payload(request.get_json())
    if error:
        return jsonify({"status": "error", "message": error}), 400

    goal_id = execute_commit(
        """
        INSERT INTO goals (user_id, goal_name, target_amount, saved_amount, deadline, status)
        VALUES (%s, %s, %s, %s, %s, 'active')
        """,
        (user_id, payload["name"], payload["target"], payload["saved"], payload["deadline"] or None),
    )
    log_activity_db(
        user_id,
        "Goal added",
        level="success",
        entity_type="goal",
        entity_id=goal_id,
        details=f"Added goal {payload['name']}.",
    )
    return jsonify({"status": "success", "goal": {"id": goal_id, **payload}}), 201


@app.route("/api/goals/<int:goal_id>", methods=["PUT", "DELETE"])
def goal_detail(goal_id):
    login_error = require_api_login()
    if login_error:
        return login_error

    current_user = fetch_current_user_db()
    user_id = current_user["id"]

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM goals WHERE id = %s AND user_id = %s LIMIT 1",
            (goal_id, user_id),
        )
        existing = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

    if existing is None:
        return jsonify({"status": "error", "message": "Goal not found."}), 404

    if request.method == "DELETE":
        execute_commit("DELETE FROM goals WHERE id = %s AND user_id = %s", (goal_id, user_id))
        log_activity_db(
            user_id,
            "Goal deleted",
            level="warning",
            entity_type="goal",
            entity_id=goal_id,
            details=f"Deleted goal {goal_id}.",
        )
        return jsonify({"status": "deleted", "goal": {"id": goal_id}})

    payload, error = validate_goal_payload(request.get_json())
    if error:
        return jsonify({"status": "error", "message": error}), 400

    execute_commit(
        """
        UPDATE goals
        SET goal_name = %s, target_amount = %s, saved_amount = %s, deadline = %s
        WHERE id = %s AND user_id = %s
        """,
        (payload["name"], payload["target"], payload["saved"], payload["deadline"] or None, goal_id, user_id),
    )
    log_activity_db(
        user_id,
        "Goal updated",
        level="info",
        entity_type="goal",
        entity_id=goal_id,
        details=f"Updated goal {payload['name']}.",
    )
    return jsonify({"status": "updated", "goal": {"id": goal_id, **payload}})


@app.route("/api/profile", methods=["PUT"])
def update_profile():
    login_error = require_api_login()
    if login_error:
        return login_error

    current_user = fetch_current_user_db()
    user_id = current_user["id"]
    payload, error = validate_profile_payload(request.get_json())
    if error:
        return jsonify({"status": "error", "message": error}), 400
    if email_exists(payload["email"], exclude_user_id=user_id):
        return jsonify({"status": "error", "message": "Email is already in use."}), 400

    execute_commit(
        """
        UPDATE users
        SET full_name = %s, email = %s, location = %s, phone = %s, department = %s
        WHERE id = %s
        """,
        (payload["name"], payload["email"], payload["location"], payload["phone"], payload["department"], user_id),
    )
    session["user_email"] = payload["email"]
    demo_credentials["email"] = payload["email"]
    log_activity_db(
        user_id,
        "Profile updated",
        level="info",
        entity_type="profile",
        entity_id=user_id,
        details="Updated admin profile.",
    )

    refreshed_user = fetch_current_user_db()
    return jsonify(
        {
            "status": "updated",
            "profile": {
                "id": refreshed_user["id"],
                "name": refreshed_user["full_name"],
                "email": refreshed_user["email"],
                "location": refreshed_user.get("location") or "",
                "role": db_role_to_ui(refreshed_user["role"]),
                "initials": make_initials(refreshed_user["full_name"]),
                "phone": refreshed_user.get("phone") or "",
                "member_since": format_db_datetime(refreshed_user["created_at"], date_only=True),
                "department": refreshed_user.get("department") or "",
                "status": db_status_to_ui(refreshed_user["status"]),
            },
        }
    )


@app.route("/api/users", methods=["GET", "POST"])
def users_api():
    admin_error = require_admin_api()
    if admin_error:
        return admin_error

    current_user = fetch_current_user_db()
    current_user_id = current_user["id"]

    if request.method == "GET":
        return jsonify(fetch_users_db(current_user_id))

    payload, error = validate_user_payload(request.get_json(), require_password=True)
    if error:
        return jsonify({"status": "error", "message": error}), 400
    if email_exists(payload["email"]):
        return jsonify({"status": "error", "message": "Email is already in use."}), 400

    user_id = execute_commit(
        """
        INSERT INTO users (
            full_name, email, password_hash, location, currency_code, role, status
        ) VALUES (%s, %s, %s, %s, 'INR', %s, %s)
        """,
        (
            payload["name"],
            payload["email"],
            generate_password_hash(payload["password"]),
            payload["location"],
            ui_role_to_db(payload["role"]),
            ui_status_to_db(payload["status"]),
        ),
    )
    log_activity_db(
        current_user_id,
        "User added",
        level="success",
        entity_type="user",
        entity_id=user_id,
        details=f"Added user {payload['name']} with login ID {user_id}.",
    )
    return jsonify(
        {
            "status": "success",
            "user": {
                "id": user_id,
                "name": payload["name"],
                "email": payload["email"],
                "location": payload["location"],
                "role": payload["role"],
                "status": payload["status"],
            },
        }
    ), 201


@app.route("/api/users/<int:user_id>", methods=["PUT", "DELETE"])
def user_detail(user_id):
    admin_error = require_admin_api()
    if admin_error:
        return admin_error

    current_user = fetch_current_user_db()
    current_user_id = current_user["id"]

    if user_id == current_user_id:
        return jsonify({"status": "error", "message": "Use profile settings for the signed-in admin."}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id FROM users WHERE id = %s LIMIT 1", (user_id,))
        existing = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

    if existing is None:
        return jsonify({"status": "error", "message": "User not found or admin cannot be modified here."}), 404

    if request.method == "DELETE":
        execute_commit("DELETE FROM users WHERE id = %s", (user_id,))
        log_activity_db(
            current_user_id,
            "User deleted",
            level="warning",
            entity_type="user",
            entity_id=user_id,
            details=f"Deleted user {user_id}.",
        )
        return jsonify({"status": "deleted", "user": {"id": user_id}})

    payload, error = validate_user_payload(request.get_json())
    if error:
        return jsonify({"status": "error", "message": error}), 400
    if email_exists(payload["email"], exclude_user_id=user_id):
        return jsonify({"status": "error", "message": "Email is already in use."}), 400

    if payload["password"]:
        execute_commit(
            """
            UPDATE users
            SET full_name = %s, email = %s, location = %s, role = %s, status = %s, password_hash = %s
            WHERE id = %s
            """,
            (
                payload["name"],
                payload["email"],
                payload["location"],
                ui_role_to_db(payload["role"]),
                ui_status_to_db(payload["status"]),
                generate_password_hash(payload["password"]),
                user_id,
            ),
        )
    else:
        execute_commit(
            """
            UPDATE users
            SET full_name = %s, email = %s, location = %s, role = %s, status = %s
            WHERE id = %s
            """,
            (
                payload["name"],
                payload["email"],
                payload["location"],
                ui_role_to_db(payload["role"]),
                ui_status_to_db(payload["status"]),
                user_id,
            ),
        )
    log_activity_db(
        current_user_id,
        "User updated",
        level="info",
        entity_type="user",
        entity_id=user_id,
        details=f"Updated user {payload['name']}.",
    )
    return jsonify(
        {
            "status": "updated",
            "user": {
                "id": user_id,
                "name": payload["name"],
                "email": payload["email"],
                "location": payload["location"],
                "role": payload["role"],
                "status": payload["status"],
            },
        }
    )


log_activity("Demo workspace ready.", "info")


@app.route("/api/test-db")
def test_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT id, full_name, email, role, status FROM users")
        users = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(users)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
