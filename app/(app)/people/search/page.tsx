'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SearchResult {
  _id: string;
  saintName: string;
  fullName: string;
  gender: string;
  dob: string;
  familyName?: string;
  parishName?: string;
  phone?: string;
}

export default function PeopleSearchPage() {
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    searchType: 'name',
    parishId: '',
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchParams.keyword.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const query = new URLSearchParams({
        keyword: searchParams.keyword,
        type: searchParams.searchType,
        ...(searchParams.parishId && { parishId: searchParams.parishId }),
      });

      const res = await fetch(`/api/people/search?${query}`);
      if (res.ok) {
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Error searching:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tra cứu Giáo dân</h1>
        <p className="text-gray-600">Tìm kiếm thông tin giáo dân trong toàn Giáo phận</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label>Từ khóa tìm kiếm</Label>
              <Input
                value={searchParams.keyword}
                onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
                placeholder="Nhập tên, tên thánh, số điện thoại..."
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div>
              <Label>Tìm theo</Label>
              <Select
                value={searchParams.searchType}
                onValueChange={(value) => setSearchParams({ ...searchParams, searchType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Họ tên</SelectItem>
                  <SelectItem value="saint_name">Tên thánh</SelectItem>
                  <SelectItem value="phone">Số điện thoại</SelectItem>
                  <SelectItem value="family_code">Mã gia đình</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={loading} className="w-full">
                {loading ? 'Đang tìm...' : 'Tìm kiếm'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {searched && (
        <Card>
          <CardHeader>
            <CardTitle>Kết quả tìm kiếm ({results.length} kết quả)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-4">🔍</p>
                <p>Không tìm thấy kết quả phù hợp</p>
                <p className="text-sm mt-2">Thử thay đổi từ khóa hoặc bộ lọc</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên Thánh</TableHead>
                    <TableHead>Họ và Tên</TableHead>
                    <TableHead>Giới tính</TableHead>
                    <TableHead>Ngày sinh</TableHead>
                    <TableHead>Gia đình</TableHead>
                    <TableHead>Giáo xứ</TableHead>
                    <TableHead>Điện thoại</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((person) => (
                    <TableRow key={person._id}>
                      <TableCell className="font-medium">{person.saintName}</TableCell>
                      <TableCell>{person.fullName}</TableCell>
                      <TableCell>
                        {person.gender === 'male' ? 'Nam' : 'Nữ'}
                      </TableCell>
                      <TableCell>{formatDate(person.dob)}</TableCell>
                      <TableCell>{person.familyName || '-'}</TableCell>
                      <TableCell>{person.parishName || '-'}</TableCell>
                      <TableCell>{person.phone || '-'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Xem</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-800">Hướng dẫn</h3>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>- Tìm theo họ tên: Nhập đầy đủ hoặc một phần tên</li>
              <li>- Tìm theo tên thánh: Nhập tên thánh bổ mạng</li>
              <li>- Tìm theo SDT: Nhập số điện thoại</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-green-800">Mẹo tìm kiếm</h3>
            <ul className="text-sm text-green-700 mt-2 space-y-1">
              <li>- Sử dụng dấu * để tìm kiếm mở rộng</li>
              <li>- Kết hợp với bộ lọc Giáo xứ để thu hẹp</li>
              <li>- Kiểm tra chính tả nếu không tìm thấy</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-purple-800">Liên hệ hỗ trợ</h3>
            <p className="text-sm text-purple-700 mt-2">
              Nếu cần hỗ trợ thêm, liên hệ Văn phòng TGM
              <br />
              Email: support@gpbmt.org
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
