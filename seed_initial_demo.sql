USE expense_tracker;

START TRANSACTION;

-- Demo admin user
-- Email: anuj@example.com
-- Password: admin123
INSERT INTO users (
  full_name,
  email,
  password_hash,
  phone,
  location,
  department,
  currency_code,
  role,
  status,
  last_login
) VALUES (
  'Anuj Kumar',
  'anuj@example.com',
  'scrypt:32768:8:1$yB0PHwedNWkXFcOy$429a44a325f25ff71c525b6addce5d632a092fa08cd15aea12bdfcaa9ca028868d3321c548cf1a0f92aed96eedc06618b45b836532d85f4f64cda709623ae193',
  '+91 9876543210',
  'Patna, India',
  'Finance Operations',
  'INR',
  'admin',
  'active',
  '2026-03-24 10:00:00'
)
ON DUPLICATE KEY UPDATE
  id = LAST_INSERT_ID(id),
  full_name = VALUES(full_name),
  phone = VALUES(phone),
  location = VALUES(location),
  department = VALUES(department),
  currency_code = VALUES(currency_code),
  role = VALUES(role),
  status = VALUES(status),
  last_login = VALUES(last_login),
  updated_at = CURRENT_TIMESTAMP;

SET @user_id = LAST_INSERT_ID();

-- One account for the user
INSERT INTO accounts (
  user_id,
  account_name,
  account_type,
  bank_name,
  account_number,
  opening_balance,
  status
)
SELECT
  @user_id,
  'SBI Savings',
  'savings',
  'State Bank of India',
  'SA1234567890',
  5000.00,
  'active'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1
  FROM accounts
  WHERE user_id = @user_id AND account_name = 'SBI Savings'
);

SET @account_id = (
  SELECT id
  FROM accounts
  WHERE user_id = @user_id AND account_name = 'SBI Savings'
  LIMIT 1
);

-- One income category and one expense category
INSERT INTO categories (user_id, name, kind, icon, is_system)
VALUES
  (@user_id, 'Salary', 'income', 'wallet', TRUE),
  (@user_id, 'Food & Dining', 'expense', 'utensils', FALSE)
ON DUPLICATE KEY UPDATE
  icon = VALUES(icon),
  updated_at = CURRENT_TIMESTAMP;

SET @income_category_id = (
  SELECT id
  FROM categories
  WHERE user_id = @user_id AND name = 'Salary' AND kind = 'income'
  LIMIT 1
);

SET @expense_category_id = (
  SELECT id
  FROM categories
  WHERE user_id = @user_id AND name = 'Food & Dining' AND kind = 'expense'
  LIMIT 1
);

-- One income and one expense transaction
INSERT INTO transactions (
  user_id,
  account_id,
  category_id,
  amount,
  transaction_date,
  note
)
SELECT
  @user_id,
  @account_id,
  @income_category_id,
  42000.00,
  '2026-03-01',
  'Monthly salary credited'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1
  FROM transactions
  WHERE user_id = @user_id
    AND account_id = @account_id
    AND category_id = @income_category_id
    AND amount = 42000.00
    AND transaction_date = '2026-03-01'
);

INSERT INTO transactions (
  user_id,
  account_id,
  category_id,
  amount,
  transaction_date,
  note
)
SELECT
  @user_id,
  @account_id,
  @expense_category_id,
  1200.00,
  '2026-03-13',
  'Dinner at restaurant'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1
  FROM transactions
  WHERE user_id = @user_id
    AND account_id = @account_id
    AND category_id = @expense_category_id
    AND amount = 1200.00
    AND transaction_date = '2026-03-13'
);

-- Budget for the expense category
INSERT INTO budgets (
  user_id,
  category_id,
  limit_amount,
  period,
  start_date,
  end_date,
  status
)
VALUES (
  @user_id,
  @expense_category_id,
  5000.00,
  'monthly',
  '2026-03-01',
  '2026-03-31',
  'active'
)
ON DUPLICATE KEY UPDATE
  limit_amount = VALUES(limit_amount),
  status = VALUES(status),
  updated_at = CURRENT_TIMESTAMP;

-- One saving goal
INSERT INTO goals (
  user_id,
  goal_name,
  target_amount,
  saved_amount,
  deadline,
  status
)
SELECT
  @user_id,
  'New Laptop',
  80000.00,
  20000.00,
  '2026-10-15',
  'active'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1
  FROM goals
  WHERE user_id = @user_id AND goal_name = 'New Laptop'
);

-- One activity log entry
INSERT INTO activity_logs (
  user_id,
  action,
  entity_type,
  entity_id,
  level,
  details
)
SELECT
  @user_id,
  'Seed demo data inserted',
  'system',
  NULL,
  'success',
  'Initial records for dashboard testing'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1
  FROM activity_logs
  WHERE user_id = @user_id
    AND action = 'Seed demo data inserted'
    AND details = 'Initial records for dashboard testing'
);

COMMIT;

-- Quick checks
SELECT id, full_name, email, role, status
FROM users
WHERE id = @user_id;

SELECT id, account_name, account_type, opening_balance, status
FROM accounts
WHERE user_id = @user_id;

SELECT id, name, kind
FROM categories
WHERE user_id = @user_id
ORDER BY id;

SELECT
  t.id,
  a.account_name,
  c.name AS category_name,
  c.kind,
  t.amount,
  t.transaction_date,
  t.note
FROM transactions t
JOIN accounts a ON a.id = t.account_id
JOIN categories c ON c.id = t.category_id
WHERE t.user_id = @user_id
ORDER BY t.transaction_date;

SELECT
  b.id,
  c.name AS budget_category,
  b.limit_amount,
  COALESCE(SUM(t.amount), 0) AS spent_in_period
FROM budgets b
JOIN categories c ON c.id = b.category_id
LEFT JOIN transactions t
  ON t.user_id = b.user_id
  AND t.category_id = b.category_id
  AND t.transaction_date BETWEEN b.start_date AND b.end_date
WHERE b.user_id = @user_id
GROUP BY b.id, c.name, b.limit_amount;

SELECT id, goal_name, target_amount, saved_amount, deadline, status
FROM goals
WHERE user_id = @user_id;

SELECT id, action, level, created_at
FROM activity_logs
WHERE user_id = @user_id
ORDER BY created_at DESC;
