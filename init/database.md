# 📘 Database Schema Documentation

# Tài liệu Cơ sở dữ liệu Hệ thống Quản lý Giáo xứ

> **Version:** 1.0  
> **Last Updated:** 2025-01-21  
> **Total Tables:** 28

---

## 📑 Table of Contents / Mục lục

1. [Parish Module / Module Giáo xứ](#1-parish-module--module-giáo-xứ)
2. [People Module / Module Giáo dân](#2-people-module--module-giáo-dân)
3. [Finance Module / Module Tài chính](#3-finance-module--module-tài-chính)
4. [HR Module / Module Nhân sự](#4-hr-module--module-nhân-sự)
5. [Pastoral Module / Module Mục vụ](#5-pastoral-module--module-mục-vụ)
6. [Calendar Module / Module Lịch](#6-calendar-module--module-lịch)
7. [Admin Module / Module Hành chính](#7-admin-module--module-hành-chính)
8. [Settings Module / Module Cài đặt](#8-settings-module--module-cài-đặt)
9. [Media Module / Module Tệp tin](#9-media-module--module-tệp-tin)
10. [Relationships Summary / Tổng hợp quan hệ](#10-relationships-summary--tổng-hợp-quan-hệ)

---

## 1. Parish Module / Module Giáo xứ

### 1.1 `parishes` - Giáo xứ / Parishes

| Column             | Type      | Constraints                 | VI Description   | EN Description   |
| ------------------ | --------- | --------------------------- | ---------------- | ---------------- |
| `parish_id`        | uuid      | **PK**                      | Mã Giáo xứ       | Parish ID        |
| `parish_code`      | varchar   | **UK**, NOT NULL            | Mã GX (unique)   | Parish code      |
| `parish_name`      | varchar   | NOT NULL                    | Tên Giáo xứ      | Parish name      |
| `patron_saint`     | varchar   |                             | Bổn mạng         | Patron saint     |
| `feast_day`        | date      |                             | Ngày lễ bổn mạng | Feast day        |
| `established_date` | date      |                             | Ngày thành lập   | Established date |
| `address`          | text      |                             | Địa chỉ          | Address          |
| `phone`            | varchar   |                             | Điện thoại       | Phone            |
| `email`            | varchar   |                             | Email            | Email            |
| `pastor_id`        | uuid      | **FK** → `clergy.clergy_id` | Cha xứ hiện tại  | Current pastor   |
| `status`           | enum      |                             | Trạng thái       | Status           |
| `created_at`       | timestamp | DEFAULT now()               | Ngày tạo         | Created at       |
| `updated_at`       | timestamp |                             | Ngày cập nhật    | Updated at       |

**Foreign Keys / Khóa ngoại:**

- `pastor_id` → `clergy.clergy_id` (Linh mục làm Cha xứ)

---

### 1.2 `sub_parishes` - Giáo họ / Sub-parishes

| Column            | Type      | Constraints                             | VI Description | EN Description  |
| ----------------- | --------- | --------------------------------------- | -------------- | --------------- |
| `sub_parish_id`   | uuid      | **PK**                                  | Mã Giáo họ     | Sub-parish ID   |
| `sub_parish_code` | varchar   | **UK**, NOT NULL                        | Mã GH (unique) | Sub-parish code |
| `sub_parish_name` | varchar   | NOT NULL                                | Tên Giáo họ    | Sub-parish name |
| `parish_id`       | uuid      | **FK** → `parishes.parish_id`, NOT NULL | Thuộc Giáo xứ  | Parent parish   |
| `patron_saint`    | varchar   |                                         | Bổn mạng       | Patron saint    |
| `address`         | text      |                                         | Địa chỉ        | Address         |
| `status`          | enum      |                                         | Trạng thái     | Status          |
| `created_at`      | timestamp | DEFAULT now()                           | Ngày tạo       | Created at      |

**Foreign Keys / Khóa ngoại:**

- `parish_id` → `parishes.parish_id` (Giáo họ thuộc Giáo xứ)

---

## 2. People Module / Module Giáo dân

### 2.1 `families` - Gia đình Công giáo / Catholic Families

| Column              | Type      | Constraints                             | VI Description | EN Description         |
| ------------------- | --------- | --------------------------------------- | -------------- | ---------------------- |
| `family_id`         | uuid      | **PK**                                  | Mã gia đình    | Family ID              |
| `family_code`       | varchar   | **UK**, NOT NULL                        | Số sổ gia đình | Family register number |
| `family_name`       | varchar   | NOT NULL                                | Tên chủ hộ     | Head of household name |
| `parish_id`         | uuid      | **FK** → `parishes.parish_id`, NOT NULL | Thuộc Giáo xứ  | Parish                 |
| `sub_parish_id`     | uuid      | **FK** → `sub_parishes.sub_parish_id`   | Thuộc Giáo họ  | Sub-parish             |
| `address`           | text      |                                         | Địa chỉ        | Address                |
| `phone`             | varchar   |                                         | Điện thoại     | Phone                  |
| `registration_date` | date      |                                         | Ngày đăng ký   | Registration date      |
| `status`            | enum      |                                         | Trạng thái     | Status                 |
| `created_at`        | timestamp | DEFAULT now()                           | Ngày tạo       | Created at             |
| `updated_at`        | timestamp |                                         | Ngày cập nhật  | Updated at             |

**Foreign Keys / Khóa ngoại:**

- `parish_id` → `parishes.parish_id` (Gia đình thuộc Giáo xứ)
- `sub_parish_id` → `sub_parishes.sub_parish_id` (Gia đình thuộc Giáo họ)

---

### 2.2 `parishioners` - Giáo dân / Parishioners

| Column         | Type      | Constraints                   | VI Description          | EN Description       |
| -------------- | --------- | ----------------------------- | ----------------------- | -------------------- |
| `person_id`    | uuid      | **PK**                        | Mã giáo dân             | Person ID            |
| `family_id`    | uuid      | **FK** → `families.family_id` | Thuộc gia đình          | Family               |
| `saint_name`   | varchar   |                               | Tên thánh               | Saint name           |
| `full_name`    | varchar   | NOT NULL                      | Họ và tên               | Full name            |
| `gender`       | enum      |                               | Giới tính (male/female) | Gender               |
| `dob`          | date      |                               | Ngày sinh               | Date of birth        |
| `birthplace`   | varchar   |                               | Nơi sinh                | Birthplace           |
| `relationship` | enum      |                               | Quan hệ với chủ hộ      | Relationship to head |
| `phone`        | varchar   |                               | Điện thoại              | Phone                |
| `email`        | varchar   |                               | Email                   | Email                |
| `occupation`   | varchar   |                               | Nghề nghiệp             | Occupation           |
| `notes`        | text      |                               | Ghi chú                 | Notes                |
| `status`       | enum      |                               | Trạng thái              | Status               |
| `created_at`   | timestamp | DEFAULT now()                 | Ngày tạo                | Created at           |
| `updated_at`   | timestamp |                               | Ngày cập nhật           | Updated at           |

**Foreign Keys / Khóa ngoại:**

- `family_id` → `families.family_id` (Giáo dân thuộc gia đình)

---

## 3. Finance Module / Module Tài chính

### 3.1 `funds` - Quỹ / Funds

| Column        | Type      | Constraints      | VI Description   | EN Description       |
| ------------- | --------- | ---------------- | ---------------- | -------------------- |
| `fund_id`     | uuid      | **PK**           | Mã quỹ           | Fund ID              |
| `fund_code`   | varchar   | **UK**, NOT NULL | Mã quỹ (unique)  | Fund code            |
| `fund_name`   | varchar   | NOT NULL         | Tên quỹ          | Fund name            |
| `fund_group`  | enum      |                  | Nhóm quỹ (A/B/C) | Fund group           |
| `recipient`   | varchar   |                  | Đơn vị nhận      | Recipient            |
| `frequency`   | enum      |                  | Chu kỳ nộp       | Collection frequency |
| `description` | text      |                  | Mô tả            | Description          |
| `is_active`   | boolean   | DEFAULT true     | Đang hoạt động   | Is active            |
| `created_at`  | timestamp | DEFAULT now()    | Ngày tạo         | Created at           |

**Foreign Keys / Khóa ngoại:** Không có

---

### 3.2 `expense_categories` - Danh mục chi / Expense Categories

| Column          | Type      | Constraints                               | VI Description   | EN Description  |
| --------------- | --------- | ----------------------------------------- | ---------------- | --------------- |
| `category_id`   | uuid      | **PK**                                    | Mã danh mục      | Category ID     |
| `category_code` | varchar   | **UK**, NOT NULL                          | Mã DM (unique)   | Category code   |
| `category_name` | varchar   | NOT NULL                                  | Tên danh mục chi | Category name   |
| `parent_id`     | uuid      | **FK** → `expense_categories.category_id` | Danh mục cha     | Parent category |
| `description`   | text      |                                           | Mô tả            | Description     |
| `is_active`     | boolean   | DEFAULT true                              | Đang hoạt động   | Is active       |
| `created_at`    | timestamp | DEFAULT now()                             | Ngày tạo         | Created at      |

**Foreign Keys / Khóa ngoại:**

- `parent_id` → `expense_categories.category_id` (Self-reference: Danh mục con)

---

### 3.3 `incomes` - Khoản thu / Incomes

| Column           | Type      | Constraints                             | VI Description                         | EN Description      |
| ---------------- | --------- | --------------------------------------- | -------------------------------------- | ------------------- |
| `income_id`      | uuid      | **PK**                                  | Mã khoản thu                           | Income ID           |
| `income_code`    | varchar   | **UK**, NOT NULL                        | Mã phiếu thu                           | Income voucher code |
| `parish_id`      | uuid      | **FK** → `parishes.parish_id`, NOT NULL | Giáo xứ                                | Parish              |
| `fund_id`        | uuid      | **FK** → `funds.fund_id`, NOT NULL      | Loại quỹ                               | Fund type           |
| `amount`         | decimal   | NOT NULL                                | Số tiền                                | Amount              |
| `payment_method` | enum      |                                         | Hình thức (online/offline)             | Payment method      |
| `bank_account`   | varchar   |                                         | Tài khoản nhận                         | Bank account        |
| `payer_name`     | varchar   |                                         | Người nộp                              | Payer name          |
| `description`    | text      |                                         | Diễn giải                              | Description         |
| `fiscal_year`    | int       | NOT NULL                                | Năm tài chính                          | Fiscal year         |
| `fiscal_period`  | int       |                                         | Kỳ (tháng)                             | Fiscal period       |
| `income_date`    | date      | NOT NULL                                | Ngày thu                               | Income date         |
| `status`         | enum      |                                         | Trạng thái (pending/verified/rejected) | Status              |
| `submitted_by`   | uuid      | **FK** → `users.user_id`                | Người tạo                              | Submitted by        |
| `verified_by`    | uuid      | **FK** → `users.user_id`                | Người duyệt                            | Verified by         |
| `submitted_at`   | timestamp |                                         | Ngày tạo                               | Submitted at        |
| `verified_at`    | timestamp |                                         | Ngày duyệt                             | Verified at         |
| `notes`          | text      |                                         | Ghi chú                                | Notes               |

**Foreign Keys / Khóa ngoại:**

- `parish_id` → `parishes.parish_id` (Khoản thu của Giáo xứ)
- `fund_id` → `funds.fund_id` (Khoản thu thuộc Quỹ)
- `submitted_by` → `users.user_id` (Người tạo phiếu thu)
- `verified_by` → `users.user_id` (Người duyệt phiếu thu)

---

### 3.4 `expenses` - Khoản chi / Expenses

| Column           | Type      | Constraints                                         | VI Description                               | EN Description       |
| ---------------- | --------- | --------------------------------------------------- | -------------------------------------------- | -------------------- |
| `expense_id`     | uuid      | **PK**                                              | Mã khoản chi                                 | Expense ID           |
| `expense_code`   | varchar   | **UK**, NOT NULL                                    | Mã phiếu chi                                 | Expense voucher code |
| `parish_id`      | uuid      | **FK** → `parishes.parish_id`, NOT NULL             | Giáo xứ                                      | Parish               |
| `category_id`    | uuid      | **FK** → `expense_categories.category_id`, NOT NULL | Danh mục chi                                 | Expense category     |
| `fund_id`        | uuid      | **FK** → `funds.fund_id`                            | Nguồn quỹ chi                                | Fund source          |
| `amount`         | decimal   | NOT NULL                                            | Số tiền                                      | Amount               |
| `payment_method` | enum      |                                                     | Hình thức (offline/online)                   | Payment method       |
| `bank_account`   | varchar   |                                                     | TK chi                                       | Bank account         |
| `payee_name`     | varchar   |                                                     | Người nhận                                   | Payee name           |
| `description`    | text      |                                                     | Diễn giải                                    | Description          |
| `fiscal_year`    | int       | NOT NULL                                            | Năm tài chính                                | Fiscal year          |
| `fiscal_period`  | int       |                                                     | Kỳ (tháng)                                   | Fiscal period        |
| `expense_date`   | date      | NOT NULL                                            | Ngày chi                                     | Expense date         |
| `status`         | enum      |                                                     | Trạng thái (draft/pending/approved/rejected) | Status               |
| `requested_by`   | uuid      | **FK** → `users.user_id`                            | Người đề xuất                                | Requested by         |
| `approved_by`    | uuid      | **FK** → `users.user_id`                            | Người duyệt                                  | Approved by          |
| `requested_at`   | timestamp |                                                     | Ngày đề xuất                                 | Requested at         |
| `approved_at`    | timestamp |                                                     | Ngày duyệt                                   | Approved at          |
| `notes`          | text      |                                                     | Ghi chú                                      | Notes                |

**Foreign Keys / Khóa ngoại:**

- `parish_id` → `parishes.parish_id` (Khoản chi của Giáo xứ)
- `category_id` → `expense_categories.category_id` (Danh mục chi)
- `fund_id` → `funds.fund_id` (Nguồn quỹ chi)
- `requested_by` → `users.user_id` (Người đề xuất)
- `approved_by` → `users.user_id` (Người duyệt)

---

### 3.5 `receipts` - Phiếu thu/chi / Receipts

| Column         | Type      | Constraints                             | VI Description            | EN Description |
| -------------- | --------- | --------------------------------------- | ------------------------- | -------------- |
| `receipt_id`   | uuid      | **PK**                                  | Mã phiếu                  | Receipt ID     |
| `receipt_no`   | varchar   | **UK**, NOT NULL                        | Số phiếu (unique)         | Receipt number |
| `receipt_type` | enum      | NOT NULL                                | Loại (income/expense)     | Receipt type   |
| `reference_id` | uuid      | **FK** → `incomes` or `expenses`        | income_id hoặc expense_id | Reference ID   |
| `parish_id`    | uuid      | **FK** → `parishes.parish_id`, NOT NULL | Giáo xứ                   | Parish         |
| `amount`       | decimal   | NOT NULL                                | Số tiền                   | Amount         |
| `receipt_date` | date      | NOT NULL                                | Ngày lập phiếu            | Receipt date   |
| `payer_payee`  | varchar   |                                         | Người nộp/nhận            | Payer/Payee    |
| `description`  | text      |                                         | Diễn giải                 | Description    |
| `created_by`   | uuid      | **FK** → `users.user_id`                | Người lập                 | Created by     |
| `created_at`   | timestamp | DEFAULT now()                           | Ngày tạo                  | Created at     |
| `printed_at`   | timestamp |                                         | Ngày in                   | Printed at     |

**Foreign Keys / Khóa ngoại:**

- `parish_id` → `parishes.parish_id` (Phiếu của Giáo xứ)
- `reference_id` → `incomes.income_id` OR `expenses.expense_id` (Polymorphic FK)
- `created_by` → `users.user_id` (Người lập phiếu)

---

## 4. HR Module / Module Nhân sự

### 4.1 `staff` - Nhân viên / Staff

| Column          | Type      | Constraints      | VI Description | EN Description |
| --------------- | --------- | ---------------- | -------------- | -------------- |
| `staff_id`      | uuid      | **PK**           | Mã nhân viên   | Staff ID       |
| `staff_code`    | varchar   | **UK**, NOT NULL | Mã NV (unique) | Staff code     |
| `full_name`     | varchar   | NOT NULL         | Họ tên         | Full name      |
| `gender`        | enum      |                  | Giới tính      | Gender         |
| `dob`           | date      |                  | Ngày sinh      | Date of birth  |
| `id_number`     | varchar   |                  | CCCD/CMND      | ID number      |
| `phone`         | varchar   |                  | Điện thoại     | Phone          |
| `email`         | varchar   |                  | Email          | Email          |
| `address`       | text      |                  | Địa chỉ        | Address        |
| `position`      | enum      |                  | Chức vụ        | Position       |
| `department`    | varchar   |                  | Bộ phận        | Department     |
| `hire_date`     | date      |                  | Ngày vào làm   | Hire date      |
| `contract_type` | enum      |                  | Loại HĐ        | Contract type  |
| `status`        | enum      |                  | Trạng thái     | Status         |
| `created_at`    | timestamp | DEFAULT now()    | Ngày tạo       | Created at     |
| `updated_at`    | timestamp |                  | Ngày cập nhật  | Updated at     |

**Foreign Keys / Khóa ngoại:** Không có

---

### 4.2 `contracts` - Hợp đồng lao động / Employment Contracts

| Column          | Type      | Constraints                         | VI Description | EN Description  |
| --------------- | --------- | ----------------------------------- | -------------- | --------------- |
| `contract_id`   | uuid      | **PK**                              | Mã hợp đồng    | Contract ID     |
| `contract_no`   | varchar   | **UK**, NOT NULL                    | Số HĐ (unique) | Contract number |
| `staff_id`      | uuid      | **FK** → `staff.staff_id`, NOT NULL | Nhân viên      | Staff           |
| `contract_type` | enum      |                                     | Loại HĐ        | Contract type   |
| `start_date`    | date      | NOT NULL                            | Ngày bắt đầu   | Start date      |
| `end_date`      | date      |                                     | Ngày kết thúc  | End date        |
| `salary`        | decimal   |                                     | Mức lương      | Salary          |
| `terms`         | text      |                                     | Điều khoản     | Terms           |
| `status`        | enum      |                                     | Trạng thái     | Status          |
| `created_at`    | timestamp | DEFAULT now()                       | Ngày tạo       | Created at      |

**Foreign Keys / Khóa ngoại:**

- `staff_id` → `staff.staff_id` (Hợp đồng của nhân viên)

---

### 4.3 `payrolls` - Bảng lương / Payrolls

| Column                     | Type      | Constraints                         | VI Description                   | EN Description           |
| -------------------------- | --------- | ----------------------------------- | -------------------------------- | ------------------------ |
| `payroll_id`               | uuid      | **PK**                              | Mã bảng lương                    | Payroll ID               |
| `staff_id`                 | uuid      | **FK** → `staff.staff_id`, NOT NULL | Nhân viên                        | Staff                    |
| `period`                   | varchar   | NOT NULL                            | Kỳ lương (MM/YYYY)               | Pay period               |
| `basic_salary`             | decimal   |                                     | Lương cơ bản                     | Basic salary             |
| `responsibility_allowance` | decimal   |                                     | PC trách nhiệm                   | Responsibility allowance |
| `meal_allowance`           | decimal   |                                     | PC ăn uống                       | Meal allowance           |
| `transport_allowance`      | decimal   |                                     | PC xăng xe                       | Transport allowance      |
| `other_allowance`          | decimal   |                                     | PC khác                          | Other allowance          |
| `advance`                  | decimal   |                                     | Tạm ứng                          | Advance                  |
| `deductions`               | decimal   |                                     | Khấu trừ                         | Deductions               |
| `net_salary`               | decimal   |                                     | Thực lĩnh                        | Net salary               |
| `status`                   | enum      |                                     | Trạng thái (draft/approved/paid) | Status                   |
| `approved_by`              | uuid      | **FK** → `users.user_id`            | Người duyệt                      | Approved by              |
| `paid_at`                  | timestamp |                                     | Ngày chi trả                     | Paid at                  |
| `created_at`               | timestamp | DEFAULT now()                       | Ngày tạo                         | Created at               |

**Foreign Keys / Khóa ngoại:**

- `staff_id` → `staff.staff_id` (Lương của nhân viên)
- `approved_by` → `users.user_id` (Người duyệt lương)

---

## 5. Pastoral Module / Module Mục vụ

### 5.1 `clergy` - Linh mục / Clergy

| Column            | Type      | Constraints      | VI Description                       | EN Description  |
| ----------------- | --------- | ---------------- | ------------------------------------ | --------------- |
| `clergy_id`       | uuid      | **PK**           | Mã Linh mục                          | Clergy ID       |
| `clergy_code`     | varchar   | **UK**, NOT NULL | Mã LM (unique)                       | Clergy code     |
| `saint_name`      | varchar   |                  | Tên thánh                            | Saint name      |
| `full_name`       | varchar   | NOT NULL         | Họ tên                               | Full name       |
| `dob`             | date      |                  | Ngày sinh                            | Date of birth   |
| `birthplace`      | varchar   |                  | Quê quán                             | Birthplace      |
| `ordination_date` | date      |                  | Ngày thụ phong                       | Ordination date |
| `training_class`  | varchar   |                  | Khóa đào tạo                         | Training class  |
| `phone`           | varchar   |                  | Điện thoại                           | Phone           |
| `email`           | varchar   |                  | Email                                | Email           |
| `status`          | enum      |                  | Trạng thái (active/retired/deceased) | Status          |
| `created_at`      | timestamp | DEFAULT now()    | Ngày tạo                             | Created at      |
| `updated_at`      | timestamp |                  | Ngày cập nhật                        | Updated at      |

**Foreign Keys / Khóa ngoại:** Không có

---

### 5.2 `assignments` - Bổ nhiệm / Assignments

| Column          | Type      | Constraints                             | VI Description | EN Description |
| --------------- | --------- | --------------------------------------- | -------------- | -------------- |
| `assignment_id` | uuid      | **PK**                                  | Mã bổ nhiệm    | Assignment ID  |
| `clergy_id`     | uuid      | **FK** → `clergy.clergy_id`, NOT NULL   | Linh mục       | Clergy         |
| `parish_id`     | uuid      | **FK** → `parishes.parish_id`, NOT NULL | Giáo xứ        | Parish         |
| `role`          | enum      |                                         | Chức vụ        | Role           |
| `start_date`    | date      | NOT NULL                                | Ngày bắt đầu   | Start date     |
| `end_date`      | date      |                                         | Ngày kết thúc  | End date       |
| `decree_no`     | varchar   |                                         | Số quyết định  | Decree number  |
| `notes`         | text      |                                         | Ghi chú        | Notes          |
| `created_at`    | timestamp | DEFAULT now()                           | Ngày tạo       | Created at     |

**Foreign Keys / Khóa ngoại:**

- `clergy_id` → `clergy.clergy_id` (Linh mục được bổ nhiệm)
- `parish_id` → `parishes.parish_id` (Bổ nhiệm tại Giáo xứ)

---

### 5.3 `baptisms` - Bí tích Rửa tội / Baptisms

| Column          | Type      | Constraints                             | VI Description    | EN Description     |
| --------------- | --------- | --------------------------------------- | ----------------- | ------------------ |
| `baptism_id`    | uuid      | **PK**                                  | Mã rửa tội        | Baptism ID         |
| `parish_id`     | uuid      | **FK** → `parishes.parish_id`, NOT NULL | Giáo xứ           | Parish             |
| `person_id`     | uuid      | **FK** → `parishioners.person_id`       | Liên kết giáo dân | Linked parishioner |
| `baptism_name`  | varchar   | NOT NULL                                | Tên thánh rửa tội | Baptismal name     |
| `full_name`     | varchar   | NOT NULL                                | Họ tên            | Full name          |
| `dob`           | date      |                                         | Ngày sinh         | Date of birth      |
| `baptism_date`  | date      | NOT NULL                                | Ngày rửa tội      | Baptism date       |
| `baptism_place` | varchar   |                                         | Nơi rửa tội       | Baptism place      |
| `minister`      | varchar   |                                         | Linh mục cử hành  | Minister           |
| `godfather`     | varchar   |                                         | Cha đỡ đầu        | Godfather          |
| `godmother`     | varchar   |                                         | Mẹ đỡ đầu         | Godmother          |
| `father_name`   | varchar   |                                         | Tên cha           | Father's name      |
| `mother_name`   | varchar   |                                         | Tên mẹ            | Mother's name      |
| `register_book` | varchar   |                                         | Số sổ             | Register book      |
| `register_no`   | varchar   |                                         | Số thứ tự         | Register number    |
| `notes`         | text      |                                         | Ghi chú bên lề    | Marginal notes     |
| `created_at`    | timestamp | DEFAULT now()                           | Ngày tạo          | Created at         |

**Foreign Keys / Khóa ngoại:**

- `parish_id` → `parishes.parish_id` (Rửa tội tại Giáo xứ)
- `person_id` → `parishioners.person_id` (Liên kết với hồ sơ giáo dân)

---

### 5.4 `confirmations` - Bí tích Thêm sức / Confirmations

| Column               | Type      | Constraints                             | VI Description     | EN Description     |
| -------------------- | --------- | --------------------------------------- | ------------------ | ------------------ |
| `confirmation_id`    | uuid      | **PK**                                  | Mã thêm sức        | Confirmation ID    |
| `parish_id`          | uuid      | **FK** → `parishes.parish_id`, NOT NULL | Giáo xứ            | Parish             |
| `person_id`          | uuid      | **FK** → `parishioners.person_id`       | Liên kết giáo dân  | Linked parishioner |
| `baptism_id`         | uuid      | **FK** → `baptisms.baptism_id`          | Liên kết rửa tội   | Linked baptism     |
| `confirmation_name`  | varchar   |                                         | Tên thánh thêm sức | Confirmation name  |
| `confirmation_date`  | date      | NOT NULL                                | Ngày thêm sức      | Confirmation date  |
| `confirmation_place` | varchar   |                                         | Nơi thêm sức       | Confirmation place |
| `bishop`             | varchar   |                                         | Giám mục cử hành   | Bishop             |
| `sponsor`            | varchar   |                                         | Người đỡ đầu       | Sponsor            |
| `register_book`      | varchar   |                                         | Số sổ              | Register book      |
| `register_no`        | varchar   |                                         | Số thứ tự          | Register number    |
| `notes`              | text      |                                         | Ghi chú bên lề     | Marginal notes     |
| `created_at`         | timestamp | DEFAULT now()                           | Ngày tạo           | Created at         |

**Foreign Keys / Khóa ngoại:**

- `parish_id` → `parishes.parish_id` (Thêm sức tại Giáo xứ)
- `person_id` → `parishioners.person_id` (Liên kết với giáo dân)
- `baptism_id` → `baptisms.baptism_id` (Liên kết với hồ sơ Rửa tội)

---

### 5.5 `marriages` - Bí tích Hôn phối / Marriages

| Column           | Type      | Constraints                             | VI Description | EN Description    |
| ---------------- | --------- | --------------------------------------- | -------------- | ----------------- |
| `marriage_id`    | uuid      | **PK**                                  | Mã hôn phối    | Marriage ID       |
| `parish_id`      | uuid      | **FK** → `parishes.parish_id`, NOT NULL | Giáo xứ        | Parish            |
| `groom_id`       | uuid      | **FK** → `parishioners.person_id`       | Chú rể         | Groom             |
| `bride_id`       | uuid      | **FK** → `parishioners.person_id`       | Cô dâu         | Bride             |
| `groom_name`     | varchar   | NOT NULL                                | Tên chú rể     | Groom's name      |
| `groom_parish`   | varchar   |                                         | GX chú rể      | Groom's parish    |
| `bride_name`     | varchar   | NOT NULL                                | Tên cô dâu     | Bride's name      |
| `bride_parish`   | varchar   |                                         | GX cô dâu      | Bride's parish    |
| `marriage_date`  | date      | NOT NULL                                | Ngày cử hành   | Marriage date     |
| `marriage_place` | varchar   |                                         | Nơi cử hành    | Marriage place    |
| `minister`       | varchar   |                                         | LM chứng hôn   | Witnessing priest |
| `witness_1`      | varchar   |                                         | Người chứng 1  | Witness 1         |
| `witness_2`      | varchar   |                                         | Người chứng 2  | Witness 2         |
| `dispensation`   | text      |                                         | Phép chuẩn     | Dispensation      |
| `register_book`  | varchar   |                                         | Số sổ          | Register book     |
| `register_no`    | varchar   |                                         | Số thứ tự      | Register number   |
| `notes`          | text      |                                         | Ghi chú        | Notes             |
| `created_at`     | timestamp | DEFAULT now()                           | Ngày tạo       | Created at        |

**Foreign Keys / Khóa ngoại:**

- `parish_id` → `parishes.parish_id` (Hôn phối tại Giáo xứ)
- `groom_id` → `parishioners.person_id` (Chú rể)
- `bride_id` → `parishioners.person_id` (Cô dâu)

---

### 5.6 `funerals` - Nghi thức An táng / Funerals

| Column          | Type      | Constraints                             | VI Description    | EN Description     |
| --------------- | --------- | --------------------------------------- | ----------------- | ------------------ |
| `funeral_id`    | uuid      | **PK**                                  | Mã an táng        | Funeral ID         |
| `parish_id`     | uuid      | **FK** → `parishes.parish_id`, NOT NULL | Giáo xứ           | Parish             |
| `person_id`     | uuid      | **FK** → `parishioners.person_id`       | Liên kết giáo dân | Linked parishioner |
| `deceased_name` | varchar   | NOT NULL                                | Tên người qua đời | Deceased name      |
| `dob`           | date      |                                         | Ngày sinh         | Date of birth      |
| `death_date`    | date      | NOT NULL                                | Ngày mất          | Death date         |
| `funeral_date`  | date      |                                         | Ngày an táng      | Funeral date       |
| `funeral_place` | varchar   |                                         | Nơi an táng       | Funeral place      |
| `minister`      | varchar   |                                         | LM cử hành        | Minister           |
| `cemetery`      | varchar   |                                         | Nghĩa trang       | Cemetery           |
| `register_book` | varchar   |                                         | Số sổ             | Register book      |
| `register_no`   | varchar   |                                         | Số thứ tự         | Register number    |
| `notes`         | text      |                                         | Ghi chú           | Notes              |
| `created_at`    | timestamp | DEFAULT now()                           | Ngày tạo          | Created at         |

**Foreign Keys / Khóa ngoại:**

- `parish_id` → `parishes.parish_id` (An táng tại Giáo xứ)
- `person_id` → `parishioners.person_id` (Người qua đời)

---

### 5.7 `marriage_cases` - Hồ sơ Hôn phối / Marriage Cases

| Column                 | Type      | Constraints                             | VI Description     | EN Description       |
| ---------------------- | --------- | --------------------------------------- | ------------------ | -------------------- |
| `case_id`              | uuid      | **PK**                                  | Mã hồ sơ           | Case ID              |
| `case_code`            | varchar   | **UK**, NOT NULL                        | Số hồ sơ           | Case code            |
| `parish_id`            | uuid      | **FK** → `parishes.parish_id`, NOT NULL | Giáo xứ            | Parish               |
| `groom_id`             | uuid      | **FK** → `parishioners.person_id`       | Chú rể             | Groom                |
| `bride_id`             | uuid      | **FK** → `parishioners.person_id`       | Cô dâu             | Bride                |
| `investigation_form`   | json      |                                         | Biểu mẫu điều tra  | Investigation form   |
| `banns_form`           | json      |                                         | Mẫu rao hôn phối   | Banns form           |
| `dispensation_request` | json      |                                         | Đơn xin phép chuẩn | Dispensation request |
| `status`               | enum      |                                         | Trạng thái         | Status               |
| `submitted_by`         | uuid      | **FK** → `users.user_id`                | Người nộp          | Submitted by         |
| `approved_by`          | uuid      | **FK** → `users.user_id`                | Người duyệt        | Approved by          |
| `submitted_at`         | timestamp |                                         | Ngày nộp           | Submitted at         |
| `approved_at`          | timestamp |                                         | Ngày duyệt         | Approved at          |
| `notes`                | text      |                                         | Ghi chú            | Notes                |

**Foreign Keys / Khóa ngoại:**

- `parish_id` → `parishes.parish_id` (Hồ sơ của Giáo xứ)
- `groom_id` → `parishioners.person_id` (Chú rể)
- `bride_id` → `parishioners.person_id` (Cô dâu)
- `submitted_by` → `users.user_id` (Người nộp hồ sơ)
- `approved_by` → `users.user_id` (Người duyệt hồ sơ)

---

## 6. Calendar Module / Module Lịch

### 6.1 `events` - Sự kiện / Events

| Column            | Type      | Constraints                   | VI Description                    | EN Description  |
| ----------------- | --------- | ----------------------------- | --------------------------------- | --------------- |
| `event_id`        | uuid      | **PK**                        | Mã sự kiện                        | Event ID        |
| `title`           | varchar   | NOT NULL                      | Tên sự kiện                       | Title           |
| `event_type`      | enum      |                               | Loại (liturgical/diocesan/parish) | Event type      |
| `liturgical_rank` | enum      |                               | Bậc lễ                            | Liturgical rank |
| `start_date`      | timestamp | NOT NULL                      | Bắt đầu                           | Start date      |
| `end_date`        | timestamp |                               | Kết thúc                          | End date        |
| `location`        | varchar   |                               | Địa điểm                          | Location        |
| `description`     | text      |                               | Mô tả                             | Description     |
| `parish_id`       | uuid      | **FK** → `parishes.parish_id` | Giáo xứ                           | Parish          |
| `is_recurring`    | boolean   | DEFAULT false                 | Lặp hàng năm                      | Is recurring    |
| `color`           | varchar   |                               | Màu hiển thị                      | Display color   |
| `created_by`      | uuid      | **FK** → `users.user_id`      | Người tạo                         | Created by      |
| `created_at`      | timestamp | DEFAULT now()                 | Ngày tạo                          | Created at      |

**Foreign Keys / Khóa ngoại:**

- `parish_id` → `parishes.parish_id` (Sự kiện của Giáo xứ)
- `created_by` → `users.user_id` (Người tạo sự kiện)

---

## 7. Admin Module / Module Hành chính

### 7.1 `requests` - Đơn từ / Requests

| Column          | Type      | Constraints                             | VI Description | EN Description |
| --------------- | --------- | --------------------------------------- | -------------- | -------------- |
| `request_id`    | uuid      | **PK**                                  | Mã đơn         | Request ID     |
| `request_no`    | varchar   | **UK**, NOT NULL                        | Số đơn         | Request number |
| `request_type`  | enum      | NOT NULL                                | Loại đơn       | Request type   |
| `form_data`     | json      |                                         | Dữ liệu form   | Form data      |
| `parish_id`     | uuid      | **FK** → `parishes.parish_id`, NOT NULL | Giáo xứ        | Parish         |
| `submitted_by`  | uuid      | **FK** → `users.user_id`                | Người nộp      | Submitted by   |
| `status`        | enum      |                                         | Trạng thái     | Status         |
| `workflow_step` | int       |                                         | Bước xử lý     | Workflow step  |
| `approved_by`   | uuid      | **FK** → `users.user_id`                | Người duyệt    | Approved by    |
| `created_at`    | timestamp | DEFAULT now()                           | Ngày tạo       | Created at     |
| `updated_at`    | timestamp |                                         | Ngày cập nhật  | Updated at     |

**Foreign Keys / Khóa ngoại:**

- `parish_id` → `parishes.parish_id` (Đơn từ của Giáo xứ)
- `submitted_by` → `users.user_id` (Người nộp đơn)
- `approved_by` → `users.user_id` (Người duyệt đơn)

---

### 7.2 `associations` - Hội đoàn / Associations

| Column             | Type      | Constraints                             | VI Description | EN Description   |
| ------------------ | --------- | --------------------------------------- | -------------- | ---------------- |
| `association_id`   | uuid      | **PK**                                  | Mã hội đoàn    | Association ID   |
| `name`             | varchar   | NOT NULL                                | Tên hội đoàn   | Name             |
| `parish_id`        | uuid      | **FK** → `parishes.parish_id`, NOT NULL | Thuộc Giáo xứ  | Parish           |
| `patron_saint`     | varchar   |                                         | Bổn mạng       | Patron saint     |
| `established_date` | date      |                                         | Ngày thành lập | Established date |
| `leader_name`      | varchar   |                                         | Trưởng ban     | Leader name      |
| `member_count`     | int       |                                         | Số thành viên  | Member count     |
| `budget`           | decimal   |                                         | Ngân sách      | Budget           |
| `status`           | enum      |                                         | Trạng thái     | Status           |
| `created_at`       | timestamp | DEFAULT now()                           | Ngày tạo       | Created at       |

**Foreign Keys / Khóa ngoại:**

- `parish_id` → `parishes.parish_id` (Hội đoàn thuộc Giáo xứ)

---

### 7.3 `projects` - Công trình/Dự án / Projects

| Column          | Type      | Constraints                             | VI Description                 | EN Description |
| --------------- | --------- | --------------------------------------- | ------------------------------ | -------------- |
| `project_id`    | uuid      | **PK**                                  | Mã dự án                       | Project ID     |
| `project_code`  | varchar   | **UK**, NOT NULL                        | Mã DA (unique)                 | Project code   |
| `project_name`  | varchar   | NOT NULL                                | Tên công trình                 | Project name   |
| `parish_id`     | uuid      | **FK** → `parishes.parish_id`, NOT NULL | Giáo xứ                        | Parish         |
| `project_type`  | enum      |                                         | Loại (construction/renovation) | Project type   |
| `description`   | text      |                                         | Mô tả                          | Description    |
| `budget`        | decimal   |                                         | Ngân sách                      | Budget         |
| `actual_cost`   | decimal   |                                         | Chi phí thực tế                | Actual cost    |
| `start_date`    | date      |                                         | Ngày khởi công                 | Start date     |
| `expected_end`  | date      |                                         | Dự kiến hoàn thành             | Expected end   |
| `actual_end`    | date      |                                         | Thực tế hoàn thành             | Actual end     |
| `permit_status` | enum      |                                         | Trạng thái phép                | Permit status  |
| `progress`      | int       |                                         | Phần trăm hoàn thành           | Progress %     |
| `status`        | enum      |                                         | Trạng thái                     | Status         |
| `created_at`    | timestamp | DEFAULT now()                           | Ngày tạo                       | Created at     |
| `updated_at`    | timestamp |                                         | Ngày cập nhật                  | Updated at     |

**Foreign Keys / Khóa ngoại:**

- `parish_id` → `parishes.parish_id` (Công trình của Giáo xứ)

---

### 7.4 `assets` - Tài sản / Assets

| Column              | Type      | Constraints                   | VI Description                         | EN Description    |
| ------------------- | --------- | ----------------------------- | -------------------------------------- | ----------------- |
| `asset_id`          | uuid      | **PK**                        | Mã tài sản                             | Asset ID          |
| `asset_code`        | varchar   | **UK**, NOT NULL              | Mã TS (unique)                         | Asset code        |
| `asset_name`        | varchar   | NOT NULL                      | Tên tài sản                            | Asset name        |
| `asset_type`        | enum      |                               | Loại (land/building/vehicle/equipment) | Asset type        |
| `parish_id`         | uuid      | **FK** → `parishes.parish_id` | Thuộc đơn vị                           | Parish            |
| `location`          | varchar   |                               | Vị trí                                 | Location          |
| `area`              | decimal   |                               | Diện tích (m²)                         | Area              |
| `acquisition_date`  | date      |                               | Ngày mua/nhận                          | Acquisition date  |
| `acquisition_value` | decimal   |                               | Giá trị ban đầu                        | Acquisition value |
| `current_value`     | decimal   |                               | Giá trị hiện tại                       | Current value     |
| `legal_docs`        | json      |                               | Giấy tờ pháp lý                        | Legal documents   |
| `status`            | enum      |                               | Trạng thái                             | Status            |
| `notes`             | text      |                               | Ghi chú                                | Notes             |
| `created_at`        | timestamp | DEFAULT now()                 | Ngày tạo                               | Created at        |
| `updated_at`        | timestamp |                               | Ngày cập nhật                          | Updated at        |

**Foreign Keys / Khóa ngoại:**

- `parish_id` → `parishes.parish_id` (Tài sản của Giáo xứ)

---

## 8. Settings Module / Module Cài đặt

### 8.1 `roles` - Vai trò / Roles

| Column        | Type      | Constraints      | VI Description  | EN Description |
| ------------- | --------- | ---------------- | --------------- | -------------- |
| `role_id`     | uuid      | **PK**           | Mã vai trò      | Role ID        |
| `role_name`   | varchar   | **UK**, NOT NULL | Tên vai trò     | Role name      |
| `role_code`   | varchar   |                  | Mã vai trò      | Role code      |
| `permissions` | json      |                  | Danh sách quyền | Permissions    |
| `description` | text      |                  | Mô tả           | Description    |
| `created_at`  | timestamp | DEFAULT now()    | Ngày tạo        | Created at     |

**Foreign Keys / Khóa ngoại:** Không có

---

### 8.2 `users` - Người dùng / Users

| Column          | Type      | Constraints                   | VI Description     | EN Description |
| --------------- | --------- | ----------------------------- | ------------------ | -------------- |
| `user_id`       | uuid      | **PK**                        | Mã người dùng      | User ID        |
| `username`      | varchar   | **UK**, NOT NULL              | Tên đăng nhập      | Username       |
| `email`         | varchar   | **UK**, NOT NULL              | Email              | Email          |
| `password_hash` | varchar   | NOT NULL                      | Mật khẩu (hash)    | Password hash  |
| `full_name`     | varchar   | NOT NULL                      | Họ tên             | Full name      |
| `role_id`       | uuid      | **FK** → `roles.role_id`      | Vai trò            | Role           |
| `parish_id`     | uuid      | **FK** → `parishes.parish_id` | Giáo xứ            | Parish         |
| `clergy_id`     | uuid      | **FK** → `clergy.clergy_id`   | Liên kết Linh mục  | Linked clergy  |
| `staff_id`      | uuid      | **FK** → `staff.staff_id`     | Liên kết Nhân viên | Linked staff   |
| `is_active`     | boolean   | DEFAULT true                  | Đang hoạt động     | Is active      |
| `last_login`    | timestamp |                               | Đăng nhập gần nhất | Last login     |
| `created_at`    | timestamp | DEFAULT now()                 | Ngày tạo           | Created at     |
| `updated_at`    | timestamp |                               | Ngày cập nhật      | Updated at     |

**Foreign Keys / Khóa ngoại:**

- `role_id` → `roles.role_id` (Vai trò của người dùng)
- `parish_id` → `parishes.parish_id` (Người dùng thuộc Giáo xứ)
- `clergy_id` → `clergy.clergy_id` (Liên kết với Linh mục - nếu là LM)
- `staff_id` → `staff.staff_id` (Liên kết với Nhân viên - nếu là NV)

---

### 8.3 `audit_logs` - Nhật ký hệ thống / Audit Logs

| Column       | Type      | Constraints              | VI Description                           | EN Description |
| ------------ | --------- | ------------------------ | ---------------------------------------- | -------------- |
| `log_id`     | uuid      | **PK**                   | Mã log                                   | Log ID         |
| `user_id`    | uuid      | **FK** → `users.user_id` | Người thực hiện                          | User           |
| `action`     | enum      | NOT NULL                 | Hành động (create/update/delete/approve) | Action         |
| `module`     | varchar   |                          | Module                                   | Module         |
| `record_id`  | uuid      |                          | ID bản ghi                               | Record ID      |
| `old_value`  | json      |                          | Giá trị cũ                               | Old value      |
| `new_value`  | json      |                          | Giá trị mới                              | New value      |
| `ip_address` | varchar   |                          | Địa chỉ IP                               | IP address     |
| `user_agent` | varchar   |                          | Thiết bị                                 | User agent     |
| `created_at` | timestamp | DEFAULT now()            | Thời gian                                | Created at     |

**Foreign Keys / Khóa ngoại:**

- `user_id` → `users.user_id` (Người thực hiện hành động)

---

### 8.4 `notifications` - Thông báo / Notifications

| Column            | Type      | Constraints              | VI Description | EN Description  |
| ----------------- | --------- | ------------------------ | -------------- | --------------- |
| `notification_id` | uuid      | **PK**                   | Mã thông báo   | Notification ID |
| `user_id`         | uuid      | **FK** → `users.user_id` | Người nhận     | Recipient       |
| `title`           | varchar   | NOT NULL                 | Tiêu đề        | Title           |
| `message`         | text      |                          | Nội dung       | Message         |
| `type`            | enum      |                          | Loại thông báo | Type            |
| `reference_type`  | varchar   |                          | Loại đối tượng | Reference type  |
| `reference_id`    | uuid      |                          | ID đối tượng   | Reference ID    |
| `is_read`         | boolean   | DEFAULT false            | Đã đọc         | Is read         |
| `read_at`         | timestamp |                          | Thời gian đọc  | Read at         |
| `created_at`      | timestamp | DEFAULT now()            | Ngày tạo       | Created at      |

**Foreign Keys / Khóa ngoại:**

- `user_id` → `users.user_id` (Người nhận thông báo)

---

## 9. Media Module / Module Tệp tin

### 9.1 `media_files` - Tệp tin / Media Files (AWS S3)

| Column        | Type      | Constraints              | VI Description                         | EN Description    |
| ------------- | --------- | ------------------------ | -------------------------------------- | ----------------- |
| `file_id`     | uuid      | **PK**                   | Mã file                                | File ID           |
| `file_name`   | varchar   | NOT NULL                 | Tên file gốc                           | Original filename |
| `file_key`    | varchar   | **UK**, NOT NULL         | S3 Object Key                          | S3 Object Key     |
| `bucket_name` | varchar   | NOT NULL                 | S3 Bucket                              | S3 Bucket         |
| `file_url`    | varchar   |                          | URL truy cập                           | Access URL        |
| `cdn_url`     | varchar   |                          | CloudFront URL                         | CDN URL           |
| `mime_type`   | varchar   |                          | Loại file                              | MIME type         |
| `file_size`   | bigint    |                          | Dung lượng (bytes)                     | File size         |
| `file_type`   | enum      |                          | Loại (image/document/video)            | File type         |
| `entity_type` | varchar   |                          | Loại đối tượng liên kết                | Entity type       |
| `entity_id`   | uuid      |                          | ID đối tượng liên kết                  | Entity ID         |
| `category`    | varchar   |                          | Phân loại (screenshot/avatar/document) | Category          |
| `description` | text      |                          | Mô tả                                  | Description       |
| `metadata`    | json      |                          | Thông tin bổ sung                      | Metadata          |
| `uploaded_by` | uuid      | **FK** → `users.user_id` | Người upload                           | Uploaded by       |
| `uploaded_at` | timestamp | DEFAULT now()            | Ngày upload                            | Uploaded at       |
| `is_public`   | boolean   | DEFAULT false            | Công khai                              | Is public         |
| `status`      | enum      |                          | Trạng thái (active/archived/deleted)   | Status            |

**Foreign Keys / Khóa ngoại:**

- `uploaded_by` → `users.user_id` (Người upload file)

**Polymorphic Relationship / Quan hệ đa hình:**

- `entity_type` + `entity_id` có thể liên kết đến:
  - `incomes` - Chứng từ thu
  - `expenses` - Chứng từ chi
  - `clergy` - Ảnh Linh mục
  - `staff` - Ảnh nhân viên
  - `requests` - Đính kèm đơn
  - `projects` - Hình ảnh công trình
  - `assets` - Hình ảnh tài sản

---

## 10. Relationships Summary / Tổng hợp quan hệ

### 10.1 Parish-centric Relationships / Quan hệ trung tâm Giáo xứ

| From Table | Relationship | To Table         | Description (VI)           | Description (EN)              |
| ---------- | ------------ | ---------------- | -------------------------- | ----------------------------- |
| `parishes` | 1:N          | `sub_parishes`   | Giáo xứ có nhiều Giáo họ   | Parish has many sub-parishes  |
| `parishes` | 1:N          | `families`       | Giáo xứ có nhiều Gia đình  | Parish has many families      |
| `parishes` | 1:N          | `incomes`        | Giáo xứ có nhiều Khoản thu | Parish has many incomes       |
| `parishes` | 1:N          | `expenses`       | Giáo xứ có nhiều Khoản chi | Parish has many expenses      |
| `parishes` | 1:N          | `receipts`       | Giáo xứ lập nhiều Phiếu    | Parish has many receipts      |
| `parishes` | 1:N          | `assignments`    | Giáo xứ có nhiều Bổ nhiệm  | Parish has many assignments   |
| `parishes` | 1:N          | `baptisms`       | Giáo xứ ghi nhận Rửa tội   | Parish records baptisms       |
| `parishes` | 1:N          | `confirmations`  | Giáo xứ ghi nhận Thêm sức  | Parish records confirmations  |
| `parishes` | 1:N          | `marriages`      | Giáo xứ ghi nhận Hôn phối  | Parish records marriages      |
| `parishes` | 1:N          | `funerals`       | Giáo xứ ghi nhận An táng   | Parish records funerals       |
| `parishes` | 1:N          | `marriage_cases` | Giáo xứ nộp Hồ sơ HP       | Parish submits marriage cases |
| `parishes` | 1:N          | `events`         | Giáo xứ tổ chức Sự kiện    | Parish organizes events       |
| `parishes` | 1:N          | `requests`       | Giáo xứ nộp Đơn từ         | Parish submits requests       |
| `parishes` | 1:N          | `associations`   | Giáo xứ có Hội đoàn        | Parish has associations       |
| `parishes` | 1:N          | `projects`       | Giáo xứ sở hữu Công trình  | Parish owns projects          |
| `parishes` | 1:N          | `assets`         | Giáo xứ sở hữu Tài sản     | Parish owns assets            |
| `parishes` | 1:N          | `users`          | Giáo xứ có Người dùng      | Parish has users              |
| `clergy`   | 1:1          | `parishes`       | Linh mục làm Cha xứ        | Clergy serves as pastor       |

### 10.2 People Relationships / Quan hệ Giáo dân

| From Table     | Relationship | To Table         | Description (VI)             | Description (EN)                  |
| -------------- | ------------ | ---------------- | ---------------------------- | --------------------------------- |
| `sub_parishes` | 1:N          | `families`       | Giáo họ có nhiều Gia đình    | Sub-parish has many families      |
| `families`     | 1:N          | `parishioners`   | Gia đình có nhiều Thành viên | Family has many members           |
| `parishioners` | 1:1          | `baptisms`       | Giáo dân lãnh Rửa tội        | Parishioner receives baptism      |
| `parishioners` | 1:1          | `confirmations`  | Giáo dân lãnh Thêm sức       | Parishioner receives confirmation |
| `parishioners` | 1:N          | `marriages`      | Giáo dân là Chú rể/Cô dâu    | Parishioner as groom/bride        |
| `parishioners` | 1:1          | `funerals`       | Giáo dân qua đời             | Parishioner deceased              |
| `parishioners` | 1:N          | `marriage_cases` | Giáo dân nộp Hồ sơ HP        | Parishioner in marriage case      |

### 10.3 Sacrament Chain / Chuỗi Bí tích

| From Table | Relationship | To Table        | Description (VI)   | Description (EN)              |
| ---------- | ------------ | --------------- | ------------------ | ----------------------------- |
| `baptisms` | 1:1          | `confirmations` | Rửa tội → Thêm sức | Baptism links to Confirmation |

### 10.4 Finance Relationships / Quan hệ Tài chính

| From Table           | Relationship | To Table             | Description (VI)        | Description (EN)              |
| -------------------- | ------------ | -------------------- | ----------------------- | ----------------------------- |
| `funds`              | 1:N          | `incomes`            | Quỹ phân loại Khoản thu | Fund categorizes incomes      |
| `funds`              | 1:N          | `expenses`           | Quỹ là nguồn chi        | Fund sources expenses         |
| `expense_categories` | 1:N          | `expense_categories` | Danh mục cha-con        | Parent-child categories       |
| `expense_categories` | 1:N          | `expenses`           | Danh mục phân loại Chi  | Category categorizes expenses |
| `incomes`            | 1:1          | `receipts`           | Thu sinh Phiếu thu      | Income generates receipt      |
| `expenses`           | 1:1          | `receipts`           | Chi sinh Phiếu chi      | Expense generates receipt     |

### 10.5 HR Relationships / Quan hệ Nhân sự

| From Table | Relationship | To Table    | Description (VI)       | Description (EN)       |
| ---------- | ------------ | ----------- | ---------------------- | ---------------------- |
| `staff`    | 1:N          | `contracts` | Nhân viên có Hợp đồng  | Staff has contracts    |
| `staff`    | 1:N          | `payrolls`  | Nhân viên nhận Lương   | Staff receives payroll |
| `staff`    | 1:1          | `users`     | Nhân viên có Tài khoản | Staff has user account |

### 10.6 Clergy Relationships / Quan hệ Linh mục

| From Table | Relationship | To Table      | Description (VI)       | Description (EN)            |
| ---------- | ------------ | ------------- | ---------------------- | --------------------------- |
| `clergy`   | 1:N          | `assignments` | Linh mục được Bổ nhiệm | Clergy receives assignments |
| `clergy`   | 1:1          | `users`       | Linh mục có Tài khoản  | Clergy has user account     |

### 10.7 User Relationships / Quan hệ Người dùng

| From Table | Relationship | To Table        | Description (VI)             | Description (EN)                |
| ---------- | ------------ | --------------- | ---------------------------- | ------------------------------- |
| `roles`    | 1:N          | `users`         | Vai trò có Người dùng        | Role has users                  |
| `users`    | 1:N          | `audit_logs`    | Người dùng thực hiện Log     | User performs actions           |
| `users`    | 1:N          | `notifications` | Người dùng nhận Thông báo    | User receives notifications     |
| `users`    | 1:N          | `incomes`       | Người dùng tạo/duyệt Thu     | User creates/verifies incomes   |
| `users`    | 1:N          | `expenses`      | Người dùng đề xuất/duyệt Chi | User requests/approves expenses |
| `users`    | 1:N          | `payrolls`      | Người dùng duyệt Lương       | User approves payroll           |
| `users`    | 1:N          | `requests`      | Người dùng nộp/duyệt Đơn     | User submits/approves requests  |
| `users`    | 1:N          | `events`        | Người dùng tạo Sự kiện       | User creates events             |
| `users`    | 1:N          | `receipts`      | Người dùng lập Phiếu         | User creates receipts           |
| `users`    | 1:N          | `media_files`   | Người dùng upload File       | User uploads files              |

---

## 📊 Statistics / Thống kê

| Module    | Tables Count | Description                                                                       |
| --------- | ------------ | --------------------------------------------------------------------------------- |
| Parish    | 2            | parishes, sub_parishes                                                            |
| People    | 2            | families, parishioners                                                            |
| Finance   | 5            | funds, expense_categories, incomes, expenses, receipts                            |
| HR        | 3            | staff, contracts, payrolls                                                        |
| Pastoral  | 7            | clergy, assignments, baptisms, confirmations, marriages, funerals, marriage_cases |
| Calendar  | 1            | events                                                                            |
| Admin     | 4            | requests, associations, projects, assets                                          |
| Settings  | 4            | roles, users, audit_logs, notifications                                           |
| Media     | 1            | media_files                                                                       |
| **TOTAL** | **28**       |                                                                                   |

---

## 🔑 Legend / Chú giải

| Symbol | Meaning (VI)        | Meaning (EN) |
| ------ | ------------------- | ------------ |
| **PK** | Khóa chính          | Primary Key  |
| **FK** | Khóa ngoại          | Foreign Key  |
| **UK** | Khóa duy nhất       | Unique Key   |
| 1:1    | Quan hệ 1-1         | One-to-One   |
| 1:N    | Quan hệ 1-nhiều     | One-to-Many  |
| N:N    | Quan hệ nhiều-nhiều | Many-to-Many |

---

_Generated on: 2025-01-21_  
_Document Version: 1.0_
