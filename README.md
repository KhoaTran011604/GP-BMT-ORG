# Hệ thống Quản lý Giáo phận Buôn Ma Thuột (GPBMT)

Giải pháp quản lý toàn diện cho Giáo phận Buôn Ma Thuột, bao gồm các module quản lý tài chính, nhân sự, hành chính và mục vụ.

## Yêu cầu Hệ thống

- Node.js 18+ 
- MongoDB 5.0+
- npm hoặc yarn

## Cài đặt

### 1. Clone Repository
```bash
git clone <repository-url>
cd gpbmt-system
```

### 2. Cài đặt Dependencies
```bash
npm install
```

### 3. Cấu hình Environment Variables

Tạo file `.env.local` tại thư mục gốc:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=gpbmt

# JWT
JWT_SECRET=your-secret-key-change-in-production

# App
NODE_ENV=development
```

**Lưu ý**: Để sử dụng MongoDB Atlas (Cloud):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

### 4. Khởi tạo Database

Chạy script khởi tạo để tạo collections và thêm dữ liệu demo:

```bash
# Cài đặt ts-node nếu chưa có
npm install -g ts-node

# Chạy script khởi tạo
npx ts-node scripts/init-db.ts
```

### 5. Chạy Development Server

```bash
npm run dev
```

Mở trình duyệt và truy cập: `http://localhost:3000`

## Tài khoản Demo

- **Email**: admin@gpbmt.org
- **Mật khẩu**: demo123
- **Vai trò**: Super Admin

## Cấu trúc Dự án

```
├── app/
│   ├── (auth)/          # Auth pages (login, register)
│   ├── (app)/           # Protected routes (dashboard, modules)
│   ├── api/             # API endpoints
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── lib/
│   ├── auth.ts          # Auth utilities
│   ├── auth-context.tsx # Auth context provider
│   ├── db.ts            # MongoDB connection
│   └── schemas.ts       # TypeScript interfaces
├── components/
│   └── ui/              # Shadcn UI components
├── scripts/
│   └── init-db.ts       # Database initialization
└── proxy.ts             # Next.js middleware
```

## Các Module Chính

### 1. Dashboard
- Tổng quan hệ thống
- Thống kê cơ bản
- Liên kết nhanh đến các module

### 2. Giáo xứ & Giáo họ (Parish Module)
- Quản lý danh sách giáo xứ
- Quản lý các giáo họ trực thuộc
- CRUD operations với kiểm soát quyền hạn

### 3. Tài chính (Finance Module) - *Trong phát triển*
- Quản lý 11 quỹ khác nhau
- Theo dõi giao dịch tài chính
- Xác thực giao dịch theo quy trình

### 4. Giáo dân (People Module) - *Trong phát triển*
- Sổ gia đình công giáo
- Thông tin chi tiết giáo dân
- Quản lý mối quan hệ gia đình

### 5. Linh mục (Clergy Module) - *Trong phát triển*
- Quản lý linh mục đoàn
- Lịch sử bổ nhiệm
- Sổ bộ bí tích (rửa tội, thêm sức, hôn phối, an táng)

### 6. Nhân sự & Lương (HR Module) - *Trong phát triển*
- Quản lý nhân viên
- Bảng lương tháng

### 7. Hành chính (Admin Module) - *Trong phát triển*
- E-Office (quản lý đơn từ)
- Quản lý công trình
- Quản lý tài sản

### 8. Báo cáo (Report Module) - *Trong phát triển*
- Báo cáo tài chính
- Thống kê bí tích
- Báo cáo nhân sự

## Kiến trúc Bảo mật

### Authentication
- JWT tokens với HTTP-only cookies
- Bcrypt password hashing
- Token expiration: 7 days

### Authorization
- Role-Based Access Control (RBAC)
- 5 vai trò: Super Admin, Cha Quản lý, Cha xứ, Kế toán VP, Thư ký GX
- Middleware kiểm tra quyền hạn trên tất cả protected routes

### Data Protection
- HTTPS/TLS cho production
- Validation input trên server
- SQL injection prevention (MongoDB parameterized queries)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Parishes
- `GET /api/parishes` - Danh sách giáo xứ
- `POST /api/parishes` - Tạo giáo xứ mới (Super Admin, Cha Quản lý)
- `GET /api/parishes/[id]` - Chi tiết giáo xứ
- `PUT /api/parishes/[id]` - Cập nhật giáo xứ (Super Admin, Cha Quản lý)
- `DELETE /api/parishes/[id]` - Xóa giáo xứ (Super Admin)

## Vai trò & Quyền hạn

| Vai trò | Dashboard | Giáo xứ | Giáo dân | Tài chính | HR | Mục vụ | Hành chính | Báo cáo |
|---------|-----------|---------|---------|-----------|-----|--------|-----------|---------|
| Super Admin | Full | Full | Full | Full | Full | Full | Full | Full |
| Cha Quản lý | View | View | View | Full | Full | View | Approve | Full |
| Cha xứ | View | Own | Own | Own | - | Own | Own | Own |
| Kế toán VP | View | View | - | Edit | Edit | - | - | View |
| Thư ký GX | View | Own | Own | Create | - | Own | Create | - |

## Phát triển

### Chạy Development Server
```bash
npm run dev
```

### Build Production
```bash
npm run build
npm start
```

### Linting & Formatting
```bash
npm run lint
npm run format
```

## Giai đoạn Phát triển

### Phase 1: MVP (Hiện tại)
- [x] Authentication & Authorization
- [x] Giáo xứ & Giáo họ (PARISH)
- [x] Dashboard cơ bản
- [ ] Quản lý Tài chính (FINANCE) - Core
- [ ] Linh mục đoàn (PASTORAL - Clergy)
- [ ] Cài đặt hệ thống (SETTINGS)

### Phase 2: Expansion (Tới)
- [ ] Giáo dân (PEOPLE)
- [ ] Sổ bộ Bí tích (PASTORAL - Sacraments)
- [ ] Nhân sự & Tiền lương (HR)
- [ ] Báo cáo & Thống kê (REPORT)

### Phase 3: Enhancement
- [ ] Lịch & Sự kiện (CALENDAR)
- [ ] Hành chính & Tài sản (ADMIN)
- [ ] E-Office
- [ ] Import dữ liệu lịch sử
- [ ] Offline support

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
- Kiểm tra MongoDB service đang chạy
- Kiểm tra MONGODB_URI trong .env.local
- Nếu dùng MongoDB Atlas, kiểm tra IP whitelist

### JWT Token Invalid
- Kiểm tra JWT_SECRET trong .env.local
- Clear cookies trong trình duyệt
- Đăng nhập lại

### Permission Denied
- Kiểm tra vai trò của user
- Kiểm tra quyền hạn trong RBAC configuration
- Đảm bảo user có đủ quyền để thực hiện action

## Liên hệ & Hỗ trợ

Liên hệ bộ phận IT - Tòa Giám mục Buôn Ma Thuột:
- Email: it@gpbmt.org
- Điện thoại: (62) 500 XXXX

## License

© 2024 Tòa Giám mục Buôn Ma Thuột. All rights reserved.

## Tác giả

Phát triển bởi: IT Division - Tòa Giám mục Buôn Ma Thuột
Phiên bản: 1.0 MVP
Cập nhật: Tháng 1, 2024
