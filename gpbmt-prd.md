# PRD - HỆ THỐNG QUẢN LÝ GIÁO PHẬN BUÔN MA THUỘT
## Product Requirements Document v1.0

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1. Thông tin chung
| Hạng mục | Chi tiết |
|----------|----------|
| **Tên dự án** | Hệ thống Quản lý Giáo phận Buôn Ma Thuột |
| **Tên miền** | gpbmt.org |
| **Đơn vị quản lý** | Tòa Giám mục Buôn Ma Thuột (TGM BMT) |
| **Phiên bản** | 1.0 |
| **Loại hệ thống** | Web Application (SaaS-like CRM) |

### 1.2. Mục tiêu
Số hóa toàn diện quy trình:
- ✅ Quản trị Tài chính
- ✅ Quản lý Nhân sự
- ✅ Quản lý Hành chính
- ✅ Mục vụ Bí tích
- ✅ Quản lý Giáo xứ & Giáo dân

### 1.3. Đối tượng sử dụng
| Vai trò | Mô tả | Quyền hạn |
|---------|-------|-----------|
| **Super Admin** | TGM BMT | Toàn quyền hệ thống |
| **Cha Quản lý** | Quản lý tài chính GP | Phê duyệt, đối soát |
| **Cha xứ** | Quản lý Giáo xứ | CRUD dữ liệu GX |
| **Kế toán VP** | Văn phòng TGM | Nhập liệu, báo cáo |
| **Thư ký GX** | Hỗ trợ Cha xứ | Nhập liệu cơ bản |

---

## 2. KIẾN TRÚC MODULE

### 2.1. Sơ đồ tổng quan
```
┌─────────────────────────────────────────────────────────────┐
│                      GPBMT.ORG                              │
├─────────────────────────────────────────────────────────────┤
│  📊 DASHBOARD                                               │
├──────────┬──────────┬──────────┬──────────┬────────────────┤
│ 🏛️ GIÁO  │ 👨‍👩‍👧‍👦 GIÁO │ 💰 TÀI   │ 👥 NHÂN  │ ⛪ MỤC VỤ     │
│ XỨ       │ DÂN      │ CHÍNH    │ SỰ       │ & LINH MỤC    │
├──────────┼──────────┼──────────┼──────────┼────────────────┤
│ 📅 LỊCH  │ 📋 HÀNH  │ 📈 BÁO   │ ⚙️ CÀI   │                │
│ SỰ KIỆN  │ CHÍNH    │ CÁO      │ ĐẶT      │                │
└──────────┴──────────┴──────────┴──────────┴────────────────┘
```

### 2.2. Danh sách Module
| # | Module | Mã | Độ ưu tiên |
|---|--------|-----|------------|
| 1 | Tổng quan (Dashboard) | DASH | P0 |
| 2 | Giáo xứ & Giáo họ | PARISH | P0 |
| 3 | Giáo dân | PEOPLE | P1 |
| 4 | Quản lý Tài chính | FINANCE | P0 |
| 5 | Nhân sự & Tiền lương | HR | P1 |
| 6 | Mục vụ & Linh mục đoàn | PASTORAL | P0 |
| 7 | Lịch & Sự kiện | CALENDAR | P2 |
| 8 | Hành chính & Tài sản | ADMIN | P1 |
| 9 | Báo cáo & Thống kê | REPORT | P1 |
| 10 | Cài đặt Hệ thống | SETTINGS | P0 |

---

## 3. CHI TIẾT CHỨC NĂNG

### 3.1. MODULE: GIÁO XỨ & GIÁO HỌ (PARISH)

#### 3.1.1. Danh sách Giáo xứ
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| parish_code | String | ✅ | Mã Giáo xứ (unique) |
| parish_name | String | ✅ | Tên Giáo xứ |
| patron_saint | String | ✅ | Bổn mạng |
| feast_day | Date | ✅ | Ngày lễ bổn mạng |
| established_date | Date | | Ngày thành lập |
| address | Text | ✅ | Địa chỉ |
| phone | String | | Điện thoại |
| email | String | | Email |
| pastor_id | FK | ✅ | Cha xứ hiện tại |
| status | Enum | ✅ | active/inactive |

#### 3.1.2. Giáo họ trực thuộc
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| sub_parish_code | String | ✅ | Mã Giáo họ |
| sub_parish_name | String | ✅ | Tên Giáo họ |
| parish_id | FK | ✅ | Thuộc Giáo xứ |
| patron_saint | String | | Bổn mạng |
| address | Text | | Địa chỉ |

---

### 3.2. MODULE: GIÁO DÂN (PEOPLE)

#### 3.2.1. Sổ Gia đình Công giáo
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| family_code | String | ✅ | Mã gia đình (unique) |
| family_name | String | ✅ | Tên chủ hộ |
| parish_id | FK | ✅ | Thuộc Giáo xứ |
| sub_parish_id | FK | | Thuộc Giáo họ |
| address | Text | ✅ | Địa chỉ |
| phone | String | | Điện thoại |
| registration_date | Date | ✅ | Ngày đăng ký |
| status | Enum | ✅ | active/moved/deceased |

#### 3.2.2. Thông tin Giáo dân
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| person_id | UUID | ✅ | ID định danh |
| family_id | FK | ✅ | Thuộc gia đình |
| saint_name | String | ✅ | Tên thánh |
| full_name | String | ✅ | Họ và tên |
| gender | Enum | ✅ | male/female |
| dob | Date | ✅ | Ngày sinh |
| birthplace | String | | Nơi sinh |
| relationship | Enum | ✅ | Quan hệ với chủ hộ |
| phone | String | | Điện thoại |
| email | String | | Email |
| occupation | String | | Nghề nghiệp |
| notes | Text | | Ghi chú |

---

### 3.3. MODULE: QUẢN LÝ TÀI CHÍNH (FINANCE)

#### 3.3.1. Danh mục Quỹ
**A. Quỹ chuyển HĐGMVN (4 quỹ):**
| Mã quỹ | Tên quỹ | Chu kỳ |
|--------|---------|--------|
| FUND_01 | Quỹ Liên hiệp Truyền giáo | Năm |
| FUND_02 | Quỹ Thiếu nhi Truyền giáo | Năm |
| FUND_03 | Quỹ Lễ Thánh Phêrô và Phaolô | Năm |
| FUND_04 | Quỹ Truyền giáo | Năm |

**B. Quỹ chuyển TGM BMT (3 quỹ):**
| Mã quỹ | Tên quỹ | Chu kỳ |
|--------|---------|--------|
| FUND_05 | Quỹ Giúp Đại Chủng viện | Năm |
| FUND_06 | Quỹ Phòng thu Tòa Giám mục | Tháng |
| FUND_07 | Quỹ Tôn chân Chúa | Năm |

**C. Quỹ nội bộ & Nguồn thu (4 loại):**
| Mã quỹ | Tên quỹ | Mô tả |
|--------|---------|-------|
| FUND_08 | Quỹ giúp Cha hưu | An sinh giáo sĩ |
| FUND_09 | Tiền xin lễ | Mass Stipends |
| FUND_10 | Tiền rổ & Quyên góp | Collections |
| FUND_11 | Ân nhân & Tài trợ | Donations |

#### 3.3.2. Giao dịch & Xác thực
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| transaction_id | UUID | ✅ | ID giao dịch |
| parish_id | FK | ✅ | Giáo xứ |
| fund_id | FK | ✅ | Loại quỹ |
| amount | Decimal | ✅ | Số tiền |
| payment_method | Enum | ✅ | online/offline |
| screenshot_url | String | | Ảnh chụp biên lai |
| receipt_no | String | | Số phiếu thu |
| fiscal_year | Int | ✅ | Năm tài chính |
| fiscal_period | Int | ✅ | Kỳ (tháng/quý) |
| status | Enum | ✅ | pending/verified/rejected |
| submitted_by | FK | ✅ | Người nộp |
| verified_by | FK | | Người duyệt |
| submitted_at | DateTime | ✅ | Thời gian nộp |
| verified_at | DateTime | | Thời gian duyệt |
| notes | Text | | Ghi chú |

#### 3.3.3. Quy trình Xác thực
```
[Cha xứ/Thư ký]     [Hệ thống]        [Cha Quản lý]
      │                  │                  │
      │ 1. Tạo GD        │                  │
      ├─────────────────>│                  │
      │                  │                  │
      │ 2. Upload ảnh    │                  │
      ├─────────────────>│                  │
      │                  │ 3. Đối chiếu     │
      │                  │    số tiền       │
      │                  │                  │
      │                  │ 4. Gửi duyệt     │
      │                  ├─────────────────>│
      │                  │                  │
      │                  │ 5. Phê duyệt/    │
      │                  │    Từ chối       │
      │                  │<─────────────────┤
      │                  │                  │
      │ 6. Thông báo     │                  │
      │<─────────────────┤                  │
```

---

### 3.4. MODULE: NHÂN SỰ & TIỀN LƯƠNG (HR)

#### 3.4.1. Quản lý Nhân viên
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| staff_id | UUID | ✅ | ID nhân viên |
| staff_code | String | ✅ | Mã nhân viên |
| full_name | String | ✅ | Họ tên |
| gender | Enum | ✅ | male/female |
| dob | Date | ✅ | Ngày sinh |
| id_number | String | ✅ | CCCD/CMND |
| phone | String | ✅ | Điện thoại |
| email | String | | Email |
| address | Text | ✅ | Địa chỉ |
| position | Enum | ✅ | Chức vụ |
| department | String | ✅ | Bộ phận |
| hire_date | Date | ✅ | Ngày vào làm |
| contract_type | Enum | ✅ | Loại HĐ |
| status | Enum | ✅ | active/resigned |

**Enum position:** Bảo vệ, Phục vụ, Văn phòng, Tài xế, Kế toán, Khác

#### 3.4.2. Bảng lương
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| payroll_id | UUID | ✅ | ID bảng lương |
| staff_id | FK | ✅ | Nhân viên |
| period | String | ✅ | Kỳ lương (MM/YYYY) |
| basic_salary | Decimal | ✅ | Lương cơ bản |
| responsibility_allowance | Decimal | | Phụ cấp trách nhiệm |
| meal_allowance | Decimal | | Phụ cấp ăn uống |
| transport_allowance | Decimal | | Phụ cấp xăng xe |
| advance | Decimal | | Tạm ứng |
| deductions | Decimal | | Khấu trừ |
| net_salary | Decimal | ✅ | Thực lĩnh |
| status | Enum | ✅ | draft/approved/paid |
| approved_by | FK | | Người duyệt |
| paid_at | DateTime | | Ngày chi trả |

---

### 3.5. MODULE: MỤC VỤ & LINH MỤC ĐOÀN (PASTORAL)

#### 3.5.1. Linh mục đoàn
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| clergy_id | UUID | ✅ | ID Linh mục |
| saint_name | String | ✅ | Tên thánh |
| full_name | String | ✅ | Họ tên |
| dob | Date | ✅ | Ngày sinh |
| birthplace | String | ✅ | Quê quán |
| ordination_date | Date | ✅ | Ngày thụ phong |
| training_class | String | ✅ | Khóa/Lớp đào tạo |
| current_assignment | FK | | Bổ nhiệm hiện tại |
| phone | String | | Điện thoại |
| email | String | | Email |
| photo_url | String | | Ảnh chân dung |
| status | Enum | ✅ | active/retired/deceased |

#### 3.5.2. Lịch sử Bổ nhiệm
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| assignment_id | UUID | ✅ | ID bổ nhiệm |
| clergy_id | FK | ✅ | Linh mục |
| parish_id | FK | ✅ | Giáo xứ |
| role | Enum | ✅ | Chức vụ |
| start_date | Date | ✅ | Ngày bắt đầu |
| end_date | Date | | Ngày kết thúc |
| decree_no | String | | Số quyết định |
| notes | Text | | Ghi chú |

**Enum role:** Cha xứ, Cha phó, Quản nhiệm, Đặc trách

#### 3.5.3. Sổ bộ Bí tích
**a) Rửa tội (Baptism)**
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| baptism_id | UUID | ✅ | ID |
| person_id | FK | | Liên kết giáo dân |
| baptism_name | String | ✅ | Tên thánh rửa tội |
| full_name | String | ✅ | Họ tên |
| dob | Date | ✅ | Ngày sinh |
| baptism_date | Date | ✅ | Ngày rửa tội |
| baptism_place | String | ✅ | Nơi rửa tội |
| minister | String | ✅ | Linh mục cử hành |
| godfather | String | | Cha đỡ đầu |
| godmother | String | | Mẹ đỡ đầu |
| father_name | String | ✅ | Tên cha |
| mother_name | String | ✅ | Tên mẹ |
| register_book | String | ✅ | Số sổ |
| register_no | String | ✅ | Số thứ tự |
| notes | Text | | Ghi chú bên lề |

**b) Thêm sức (Confirmation)** - Tương tự + Bishop field

**c) Hôn phối (Marriage)**
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| marriage_id | UUID | ✅ | ID |
| groom_name | String | ✅ | Tên chú rể |
| groom_parish | String | ✅ | Giáo xứ chú rể |
| bride_name | String | ✅ | Tên cô dâu |
| bride_parish | String | ✅ | Giáo xứ cô dâu |
| marriage_date | Date | ✅ | Ngày cử hành |
| marriage_place | String | ✅ | Nơi cử hành |
| minister | String | ✅ | Linh mục chứng hôn |
| witness_1 | String | ✅ | Người chứng 1 |
| witness_2 | String | ✅ | Người chứng 2 |
| dispensation | Text | | Phép chuẩn (nếu có) |
| register_book | String | ✅ | Số sổ |
| register_no | String | ✅ | Số thứ tự |

**d) An táng (Funeral)** - Fields tương ứng

#### 3.5.4. Hồ sơ Hôn phối
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| case_id | UUID | ✅ | ID hồ sơ |
| groom_id | FK | | Chú rể (nếu có) |
| bride_id | FK | | Cô dâu (nếu có) |
| investigation_form | JSON | ✅ | Biểu mẫu điều tra |
| banns_form | JSON | ✅ | Mẫu rao hôn phối |
| dispensation_request | JSON | | Đơn xin phép chuẩn |
| status | Enum | ✅ | Trạng thái |
| submitted_at | DateTime | ✅ | Ngày nộp |
| approved_at | DateTime | | Ngày duyệt |

---

### 3.6. MODULE: LỊCH & SỰ KIỆN (CALENDAR)

#### 3.6.1. Lịch Phụng vụ
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| event_id | UUID | ✅ | ID |
| title | String | ✅ | Tên lễ/sự kiện |
| event_type | Enum | ✅ | liturgical/diocesan/parish |
| liturgical_rank | Enum | | Bậc lễ |
| start_date | DateTime | ✅ | Bắt đầu |
| end_date | DateTime | | Kết thúc |
| location | String | | Địa điểm |
| description | Text | | Mô tả |
| parish_id | FK | | Giáo xứ (nếu GX) |
| is_recurring | Boolean | | Lặp hàng năm |
| color | String | | Màu hiển thị |

---

### 3.7. MODULE: HÀNH CHÍNH & TÀI SẢN (ADMIN)

#### 3.7.1. E-Office (Đơn từ)
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| request_id | UUID | ✅ | ID đơn |
| request_type | Enum | ✅ | Loại đơn |
| form_data | JSON | ✅ | Dữ liệu biểu mẫu |
| parish_id | FK | ✅ | Giáo xứ |
| submitted_by | FK | ✅ | Người nộp |
| status | Enum | ✅ | Trạng thái |
| workflow_step | Int | ✅ | Bước xử lý |
| attachments | JSON | | File đính kèm |
| created_at | DateTime | ✅ | Ngày tạo |
| updated_at | DateTime | ✅ | Cập nhật |

#### 3.7.2. Quản lý Hội đoàn
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| association_id | UUID | ✅ | ID |
| name | String | ✅ | Tên hội đoàn |
| parish_id | FK | ✅ | Thuộc Giáo xứ |
| patron_saint | String | | Bổn mạng |
| established_date | Date | | Ngày thành lập |
| leader_name | String | | Trưởng ban |
| member_count | Int | | Số thành viên |
| budget | Decimal | | Ngân sách |
| status | Enum | ✅ | active/inactive |

#### 3.7.3. Công trình & Dự án
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| project_id | UUID | ✅ | ID |
| project_name | String | ✅ | Tên công trình |
| parish_id | FK | ✅ | Giáo xứ |
| project_type | Enum | ✅ | construction/renovation |
| description | Text | | Mô tả |
| budget | Decimal | ✅ | Ngân sách |
| actual_cost | Decimal | | Chi phí thực tế |
| start_date | Date | | Ngày khởi công |
| expected_end | Date | | Dự kiến hoàn thành |
| actual_end | Date | | Thực tế hoàn thành |
| permit_status | Enum | ✅ | Trạng thái phép |
| progress | Int | | % hoàn thành |
| status | Enum | ✅ | Trạng thái |

#### 3.7.4. Quản lý Tài sản
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| asset_id | UUID | ✅ | ID |
| asset_code | String | ✅ | Mã tài sản |
| asset_name | String | ✅ | Tên tài sản |
| asset_type | Enum | ✅ | land/building/vehicle/equipment |
| parish_id | FK | ✅ | Thuộc đơn vị |
| location | String | ✅ | Vị trí |
| area | Decimal | | Diện tích (m²) |
| acquisition_date | Date | | Ngày mua/nhận |
| acquisition_value | Decimal | | Giá trị |
| current_value | Decimal | | Giá trị hiện tại |
| legal_docs | JSON | | Giấy tờ pháp lý |
| status | Enum | ✅ | Trạng thái |
| notes | Text | | Ghi chú |

---

### 3.8. MODULE: BÁO CÁO & THỐNG KÊ (REPORT)

#### 3.8.1. Danh sách Báo cáo
| Mã BC | Tên báo cáo | Loại | Tần suất |
|-------|-------------|------|----------|
| RPT_FIN_01 | Tổng hợp thu các Quỹ | Tài chính | Tháng/Quý/Năm |
| RPT_FIN_02 | Chi tiết theo Giáo xứ | Tài chính | Tháng/Quý/Năm |
| RPT_FIN_03 | Đối soát Giao dịch | Tài chính | Realtime |
| RPT_FIN_04 | Báo cáo Trễ hạn | Tài chính | Realtime |
| RPT_HR_01 | Bảng lương tổng hợp | Nhân sự | Tháng |
| RPT_PAS_01 | Thống kê Bí tích | Mục vụ | Năm |
| RPT_PAS_02 | Danh sách Linh mục | Mục vụ | Realtime |
| RPT_PAR_01 | Tổng quan Giáo xứ | Giáo xứ | Năm |
| RPT_PAR_02 | Biến động Giáo dân | Giáo xứ | Năm |

---

### 3.9. MODULE: CÀI ĐẶT HỆ THỐNG (SETTINGS)

#### 3.9.1. Phân quyền RBAC
| Role | Dashboard | Parish | People | Finance | HR | Pastoral | Admin | Report | Settings |
|------|-----------|--------|--------|---------|-----|----------|-------|--------|----------|
| Super Admin | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Cha Quản lý | ✅ View | ✅ View | ✅ View | ✅ Full | ✅ Full | ✅ View | ✅ Approve | ✅ Full | ❌ |
| Cha xứ | ✅ View | ✅ Own | ✅ Own | ✅ Own | ❌ | ✅ Own | ✅ Own | ✅ Own | ❌ |
| Kế toán VP | ✅ View | ✅ View | ❌ | ✅ Edit | ✅ Edit | ❌ | ❌ | ✅ View | ❌ |
| Thư ký GX | ✅ View | ✅ Own | ✅ Own | ✅ Create | ❌ | ✅ Own | ✅ Create | ❌ | ❌ |

#### 3.9.2. Nhật ký Hệ thống (Audit Log)
| Field | Type | Mô tả |
|-------|------|-------|
| log_id | UUID | ID log |
| user_id | FK | Người thực hiện |
| action | Enum | create/update/delete/approve/reject |
| module | String | Module tác động |
| record_id | UUID | ID bản ghi |
| old_value | JSON | Giá trị cũ |
| new_value | JSON | Giá trị mới |
| ip_address | String | Địa chỉ IP |
| user_agent | String | Thiết bị |
| created_at | DateTime | Thời gian |

#### 3.9.3. Nhắc nhở Tự động
| Loại nhắc nhở | Điều kiện | Kênh |
|---------------|-----------|------|
| Chưa nộp quỹ | Quá hạn 7 ngày | Email + Notification |
| Chờ phê duyệt | Tồn > 3 ngày | Notification |
| Sắp hết hạn HĐ | Còn 30 ngày | Email |
| Lễ bổn mạng GX | Trước 7 ngày | Email |

#### 3.9.4. Import Dữ liệu Lịch sử
- Hỗ trợ format: Excel (.xlsx), CSV
- Các loại import: Giáo dân, Sổ Bí tích, Linh mục
- Validation & Preview trước khi import
- Rollback nếu lỗi

---

## 4. YÊU CẦU KỸ THUẬT

### 4.1. Tech Stack đề xuất
| Layer | Technology |
|-------|------------|
| Frontend | React/Next.js + TypeScript + TailwindCSS |
| Backend | Node.js (NestJS) hoặc Laravel |
| Database | PostgreSQL |
| Cache | Redis |
| Storage | S3-compatible (MinIO/AWS S3) |
| Auth | JWT + OAuth2 |
| Hosting | VPS hoặc Cloud (AWS/GCP) |

### 4.2. Yêu cầu Bảo mật
- ✅ Mã hóa dữ liệu nhạy cảm (Bí tích, Tiền lương)
- ✅ HTTPS/TLS cho tất cả kết nối
- ✅ Audit Log cho mọi thao tác quan trọng
- ✅ Backup tự động hàng ngày
- ✅ 2FA cho Super Admin và Cha Quản lý

### 4.3. Yêu cầu Hiệu năng
- Response time < 2s cho các thao tác thông thường
- Hỗ trợ đồng thời 100+ users
- Uptime ≥ 99.5%

### 4.4. Offline Support
- Service Worker cho cached resources
- IndexedDB cho local data storage
- Background sync khi có kết nối

---

## 5. PHÂN GIAI ĐOẠN TRIỂN KHAI

### Phase 1: MVP (8-10 tuần)
- [ ] Authentication & Authorization
- [ ] Giáo xứ & Giáo họ (PARISH)
- [ ] Quản lý Tài chính (FINANCE) - Core
- [ ] Linh mục đoàn (PASTORAL - Clergy)
- [ ] Dashboard cơ bản
- [ ] Cài đặt hệ thống (SETTINGS)

### Phase 2: Expansion (6-8 tuần)
- [ ] Giáo dân (PEOPLE)
- [ ] Sổ bộ Bí tích (PASTORAL - Sacraments)
- [ ] Nhân sự & Tiền lương (HR)
- [ ] Báo cáo & Thống kê (REPORT)

### Phase 3: Enhancement (4-6 tuần)
- [ ] Lịch & Sự kiện (CALENDAR)
- [ ] Hành chính & Tài sản (ADMIN)
- [ ] E-Office
- [ ] Import dữ liệu lịch sử
- [ ] Offline support

### Phase 4: Optimization (Ongoing)
- [ ] Performance tuning
- [ ] Mobile app (nếu cần)
- [ ] API cho third-party integration
- [ ] Advanced reporting

---

## 6. PHỤ LỤC

### 6.1. Danh sách 11 Quỹ (Chi tiết)
| # | Mã | Tên đầy đủ | Nhóm | Đơn vị nhận |
|---|-----|-----------|------|-------------|
| 1 | FUND_01 | Quỹ Liên hiệp Truyền giáo | A | HĐGMVN |
| 2 | FUND_02 | Quỹ Thiếu nhi Truyền giáo | A | HĐGMVN |
| 3 | FUND_03 | Quỹ Lễ Thánh Phêrô và Phaolô | A | HĐGMVN |
| 4 | FUND_04 | Quỹ Truyền giáo | A | HĐGMVN |
| 5 | FUND_05 | Quỹ Giúp Đại Chủng viện | B | TGM BMT |
| 6 | FUND_06 | Quỹ Phòng thu Tòa Giám mục | B | TGM BMT |
| 7 | FUND_07 | Quỹ Tôn chân Chúa | B | TGM BMT |
| 8 | FUND_08 | Quỹ giúp Cha hưu | C | Nội bộ |
| 9 | FUND_09 | Tiền xin lễ (Mass Stipends) | C | Nội bộ |
| 10 | FUND_10 | Tiền rổ & Quyên góp | C | Nội bộ |
| 11 | FUND_11 | Ân nhân & Tài trợ | C | Nội bộ |

### 6.2. Glossary
| Thuật ngữ | Giải thích |
|-----------|------------|
| TGM | Tòa Giám mục |
| HĐGMVN | Hội đồng Giám mục Việt Nam |
| GX | Giáo xứ |
| GH | Giáo họ |
| Bí tích | Sacraments (Rửa tội, Thêm sức, Hôn phối, An táng) |
| Cha xứ | Pastor - Linh mục coi sóc Giáo xứ |
| Cha phó | Assistant Pastor |
| Phép chuẩn | Dispensation - miễn chuẩn luật |

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** AI Assistant  
**Status:** Ready for Development
