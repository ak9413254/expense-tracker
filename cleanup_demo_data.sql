USE expense_tracker;

START TRANSACTION;

SET @user_id = (
  SELECT id
  FROM users
  WHERE email = 'anuj@example.com'
  LIMIT 1
);

-- 1. Remove obvious test budgets first.
DELETE FROM budgets
WHERE user_id = @user_id
  AND category_id IN (
    SELECT id
    FROM categories
    WHERE user_id = @user_id
      AND name IN ('Test Budget')
  );

-- 2. Merge duplicate accounts: keep the smallest id, move transactions to it, delete the rest.
DROP TEMPORARY TABLE IF EXISTS temp_duplicate_accounts;
CREATE TEMPORARY TABLE temp_duplicate_accounts AS
SELECT
  g.keep_id,
  a.id AS remove_id
FROM accounts a
JOIN (
  SELECT
    MIN(id) AS keep_id,
    user_id,
    account_name,
    account_type,
    opening_balance
  FROM accounts
  WHERE user_id = @user_id
  GROUP BY user_id, account_name, account_type, opening_balance
  HAVING COUNT(*) > 1
) g
  ON a.user_id = g.user_id
 AND a.account_name = g.account_name
 AND a.account_type = g.account_type
 AND a.opening_balance = g.opening_balance
WHERE a.id <> g.keep_id;

UPDATE transactions t
JOIN temp_duplicate_accounts d
  ON t.account_id = d.remove_id
SET t.account_id = d.keep_id
WHERE t.user_id = @user_id
  AND d.keep_id <> d.remove_id;

DELETE a
FROM accounts a
JOIN temp_duplicate_accounts d
  ON a.id = d.remove_id
WHERE a.user_id = @user_id
  AND d.keep_id <> d.remove_id;

DROP TEMPORARY TABLE IF EXISTS temp_duplicate_accounts;

-- 3. Merge duplicate categories: keep the smallest id, move transactions and budgets to it, delete the rest.
DROP TEMPORARY TABLE IF EXISTS temp_duplicate_categories;
CREATE TEMPORARY TABLE temp_duplicate_categories AS
SELECT
  g.keep_id,
  c.id AS remove_id
FROM categories c
JOIN (
  SELECT
    MIN(id) AS keep_id,
    user_id,
    name,
    kind
  FROM categories
  WHERE user_id = @user_id
  GROUP BY user_id, name, kind
  HAVING COUNT(*) > 1
) g
  ON c.user_id = g.user_id
 AND c.name = g.name
 AND c.kind = g.kind
WHERE c.id <> g.keep_id;

UPDATE transactions t
JOIN temp_duplicate_categories d
  ON t.category_id = d.remove_id
SET t.category_id = d.keep_id
WHERE t.user_id = @user_id
  AND d.keep_id <> d.remove_id;

UPDATE budgets b
JOIN temp_duplicate_categories d
  ON b.category_id = d.remove_id
SET b.category_id = d.keep_id
WHERE b.user_id = @user_id
  AND d.keep_id <> d.remove_id;

DELETE c
FROM categories c
JOIN temp_duplicate_categories d
  ON c.id = d.remove_id
WHERE c.user_id = @user_id
  AND d.keep_id <> d.remove_id;

DROP TEMPORARY TABLE IF EXISTS temp_duplicate_categories;

-- 4. Remove obvious test categories that are no longer referenced.
DELETE FROM categories
WHERE user_id = @user_id
  AND name IN ('Test Expense', 'Test Expense Updated', 'Test Budget')
  AND id NOT IN (SELECT DISTINCT category_id FROM transactions)
  AND id NOT IN (SELECT DISTINCT category_id FROM budgets);

-- 5. Remove duplicate goals: keep the smallest id, delete exact duplicates.
DROP TEMPORARY TABLE IF EXISTS temp_duplicate_goals;
CREATE TEMPORARY TABLE temp_duplicate_goals AS
SELECT
  g.keep_id,
  goal.id AS remove_id
FROM goals goal
JOIN (
  SELECT
    MIN(id) AS keep_id,
    user_id,
    goal_name,
    target_amount,
    saved_amount,
    deadline,
    status
  FROM goals
  WHERE user_id = @user_id
  GROUP BY user_id, goal_name, target_amount, saved_amount, deadline, status
  HAVING COUNT(*) > 1
) g
  ON goal.user_id = g.user_id
 AND goal.goal_name = g.goal_name
 AND goal.target_amount = g.target_amount
 AND goal.saved_amount = g.saved_amount
 AND ((goal.deadline IS NULL AND g.deadline IS NULL) OR goal.deadline = g.deadline)
 AND goal.status = g.status
WHERE goal.id <> g.keep_id;

DELETE g
FROM goals g
JOIN temp_duplicate_goals d
  ON g.id = d.remove_id
WHERE g.user_id = @user_id
  AND d.keep_id <> d.remove_id;

DROP TEMPORARY TABLE IF EXISTS temp_duplicate_goals;

-- 6. Keep only one copy of the seed activity row.
DROP TEMPORARY TABLE IF EXISTS temp_duplicate_seed_logs;
CREATE TEMPORARY TABLE temp_duplicate_seed_logs AS
SELECT
  g.keep_id,
  l.id AS remove_id
FROM activity_logs l
JOIN (
  SELECT
    MIN(id) AS keep_id,
    user_id,
    action,
    details
  FROM activity_logs
  WHERE user_id = @user_id
    AND action = 'Seed demo data inserted'
    AND details = 'Initial records for dashboard testing'
  GROUP BY user_id, action, details
  HAVING COUNT(*) > 1
) g
  ON l.user_id = g.user_id
 AND l.action = g.action
 AND l.details = g.details
WHERE l.id <> g.keep_id;

DELETE l
FROM activity_logs l
JOIN temp_duplicate_seed_logs d
  ON l.id = d.remove_id
WHERE d.keep_id <> d.remove_id;

DROP TEMPORARY TABLE IF EXISTS temp_duplicate_seed_logs;

COMMIT;

-- Post-cleanup checks
SELECT id, full_name, email, role, status
FROM users
WHERE id = @user_id;

SELECT id, account_name, account_type, opening_balance, status
FROM accounts
WHERE user_id = @user_id
ORDER BY id;

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
ORDER BY t.transaction_date, t.id;

SELECT id, goal_name, target_amount, saved_amount, deadline, status
FROM goals
WHERE user_id = @user_id
ORDER BY id;

SELECT id, action, level, created_at
FROM activity_logs
WHERE user_id = @user_id
ORDER BY created_at DESC;
