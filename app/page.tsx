import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-900">GPBMT</h1>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="ghost">Đăng nhập</Button>
            </Link>
            <Link href="/register">
              <Button>Đăng ký</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-blue-900 mb-4">
            Hệ thống Quản lý Giáo phận Buôn Ma Thuột
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Số hóa toàn diện quy trình quản lý tài chính, nhân sự, hành chính và mục vụ cho Giáo phận
          </p>
          <div className="space-x-4">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Đăng nhập ngay
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline">
                Tìm hiểu thêm
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">⛪</div>
            <h3 className="text-xl font-bold mb-2">Giáo xứ & Giáo họ</h3>
            <p className="text-gray-600">Quản lý danh sách giáo xứ và các giáo họ trực thuộc</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Tài chính</h3>
            <p className="text-gray-600">Quản lý 11 quỹ và giao dịch tài chính chi tiết</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2">Giáo dân</h3>
            <p className="text-gray-600">Quản lý gia đình và thông tin chi tiết giáo dân</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">👨‍🎓</div>
            <h3 className="text-xl font-bold mb-2">Linh mục</h3>
            <p className="text-gray-600">Quản lý linh mục đoàn và sổ bộ bí tích</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">👔</div>
            <h3 className="text-xl font-bold mb-2">Nhân sự & Lương</h3>
            <p className="text-gray-600">Quản lý nhân viên, bảng lương và phúc lợi</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Báo cáo & Thống kê</h3>
            <p className="text-gray-600">Báo cáo chi tiết và phân tích dữ liệu toàn diện</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-white rounded-lg shadow-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">
            Bắt đầu sử dụng hệ thống ngay hôm nay
          </h2>
          <p className="text-gray-600 mb-8">
            Giải pháp quản lý toàn diện cho Giáo phận Buôn Ma Thuột
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Đăng nhập
            </Button>
          </Link>
        </div>

        {/* Footer Info */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 text-center text-gray-600">
          <div>
            <p className="text-2xl font-bold text-blue-900">11</p>
            <p>Quỹ quản lý</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-900">5</p>
            <p>Vai trò người dùng</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-900">10</p>
            <p>Module chính</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Hệ thống Quản lý Giáo phận Buôn Ma Thuột. All rights reserved.</p>
          <p className="text-sm text-blue-200 mt-2">Phát triển bởi IT Division - Tòa Giám mục BMT</p>
        </div>
      </footer>
    </div>
  );
}
