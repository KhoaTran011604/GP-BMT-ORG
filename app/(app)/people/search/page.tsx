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
        <h1 className="text-2xl font-bold">Tra cuu Giao dan</h1>
        <p className="text-gray-600">Tim kiem thong tin giao dan trong toan Giao phan</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bo loc tim kiem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label>Tu khoa tim kiem</Label>
              <Input
                value={searchParams.keyword}
                onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
                placeholder="Nhap ten, ten thanh, so dien thoai..."
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div>
              <Label>Tim theo</Label>
              <Select
                value={searchParams.searchType}
                onValueChange={(value) => setSearchParams({ ...searchParams, searchType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Ho ten</SelectItem>
                  <SelectItem value="saint_name">Ten thanh</SelectItem>
                  <SelectItem value="phone">So dien thoai</SelectItem>
                  <SelectItem value="family_code">Ma gia dinh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={loading} className="w-full">
                {loading ? 'Dang tim...' : 'Tim kiem'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {searched && (
        <Card>
          <CardHeader>
            <CardTitle>Ket qua tim kiem ({results.length} ket qua)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-4">🔍</p>
                <p>Khong tim thay ket qua phu hop</p>
                <p className="text-sm mt-2">Thu thay doi tu khoa hoac bo loc</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ten Thanh</TableHead>
                    <TableHead>Ho va Ten</TableHead>
                    <TableHead>Gioi tinh</TableHead>
                    <TableHead>Ngay sinh</TableHead>
                    <TableHead>Gia dinh</TableHead>
                    <TableHead>Giao xu</TableHead>
                    <TableHead>Dien thoai</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((person) => (
                    <TableRow key={person._id}>
                      <TableCell className="font-medium">{person.saintName}</TableCell>
                      <TableCell>{person.fullName}</TableCell>
                      <TableCell>
                        {person.gender === 'male' ? 'Nam' : 'Nu'}
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
            <h3 className="font-semibold text-blue-800">Huong dan</h3>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>- Tim theo ho ten: Nhap day du hoac mot phan ten</li>
              <li>- Tim theo ten thanh: Nhap ten thanh bo mang</li>
              <li>- Tim theo SDT: Nhap so dien thoai</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-green-800">Meo tim kiem</h3>
            <ul className="text-sm text-green-700 mt-2 space-y-1">
              <li>- Su dung dau * de tim kiem mo rong</li>
              <li>- Ket hop voi bo loc Giao xu de thu hep</li>
              <li>- Kiem tra chinh ta neu khong tim thay</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-purple-800">Lien he ho tro</h3>
            <p className="text-sm text-purple-700 mt-2">
              Neu can ho tro them, lien he Van phong TGM
              <br />
              Email: support@gpbmt.org
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
