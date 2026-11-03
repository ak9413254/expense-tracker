USE expense_tracker;

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
  full_name = VALUES(full_name),
  phone = VALUES(phone),
  location = VALUES(location),
  department = VALUES(department),
  currency_code = VALUES(currency_code),
  role = VALUES(role),
  status = VALUES(status),
  last_login = VALUES(last_login),
  updated_at = CURRENT_TIMESTAMP;

SELECT id, full_name, email, role, status, created_at
FROM users
WHERE email = 'anuj@example.com';
