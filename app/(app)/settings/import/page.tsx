'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ImportHistory {
  id: string;
  type: string;
  fileName: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  status: 'completed' | 'failed' | 'processing';
  importedAt: string;
  importedBy: string;
}

const importTypes = [
  { id: 'parishes', label: 'Giáo xứ', icon: '🏛️', fields: ['parish_code', 'parish_name', 'address', 'phone'] },
  { id: 'families', label: 'Gia đình', icon: '👨‍👩‍👧‍👦', fields: ['family_code', 'family_name', 'parish_code', 'address'] },
  { id: 'people', label: 'Giáo dân', icon: '👤', fields: ['saint_name', 'full_name', 'dob', 'gender', 'family_code'] },
  { id: 'clergy', label: 'Linh mục', icon: '⛪', fields: ['saint_name', 'full_name', 'ordination_date', 'training_class'] },
  { id: 'baptism', label: 'Sổ Rửa tội', icon: '💧', fields: ['baptism_name', 'full_name', 'dob', 'baptism_date', 'register_no'] },
  { id: 'marriage', label: 'Sổ Hôn phối', icon: '💒', fields: ['groom_name', 'bride_name', 'marriage_date', 'register_no'] },
];

export default function ImportPage() {
  const [selectedType, setSelectedType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !selectedType) return;

    setImporting(true);
    setProgress(0);

    // Simulate import progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setImporting(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const selectedTypeInfo = importTypes.find(t => t.id === selectedType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Import Dữ liệu Lịch sử</h1>
          <p className="text-gray-600">Nhập dữ liệu từ file Excel hoặc CSV</p>
        </div>
      </div>

      <Tabs defaultValue="import">
        <TabsList>
          <TabsTrigger value="import">Import mới</TabsTrigger>
          <TabsTrigger value="history">Lịch sử Import</TabsTrigger>
          <TabsTrigger value="templates">Mẫu file</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          {/* Step 1: Select Type */}
          <Card>
            <CardHeader>
              <CardTitle>Bước 1: Chọn loại dữ liệu</CardTitle>
              <CardDescription>Chọn loại dữ liệu bạn muốn import</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {importTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-all ${
                      selectedType === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <p className="text-sm font-medium">{type.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Upload File */}
          {selectedType && (
            <Card>
              <CardHeader>
                <CardTitle>Bước 2: Tải lên file</CardTitle>
                <CardDescription>
                  Chọn file Excel (.xlsx) hoặc CSV để import {selectedTypeInfo?.label}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-4xl mb-4">📁</div>
                    <p className="text-gray-600 mb-2">
                      Kéo thả file vào đây hoặc click để chọn file
                    </p>
                    <p className="text-sm text-gray-400">
                      Hỗ trợ: .xlsx, .xls, .csv (Tối đa 10MB)
                    </p>
                  </label>
                </div>

                {selectedFile && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl">📄</div>
                    <div className="flex-1">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedFile(null)}>
                      Xóa
                    </Button>
                  </div>
                )}

                {selectedTypeInfo && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Các trường bắt buộc:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTypeInfo.fields.map((field) => (
                        <Badge key={field} variant="outline" className="bg-white">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Import */}
          {selectedFile && (
            <Card>
              <CardHeader>
                <CardTitle>Bước 3: Thực hiện Import</CardTitle>
                <CardDescription>Xem trước và thực hiện import dữ liệu</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {importing ? (
                  <div className="space-y-4">
                    <Progress value={progress} />
                    <p className="text-center text-gray-600">
                      Đang import... {progress}%
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <Button variant="outline">Xem trước dữ liệu</Button>
                    <Button onClick={handleImport}>Bắt đầu Import</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử Import</CardTitle>
              <CardDescription>Các lần import trước đó</CardDescription>
            </CardHeader>
            <CardContent>
              {importHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-4xl mb-4">📋</p>
                  <p>Chưa có lịch sử import nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {importHistory.map((h) => (
                    <div key={h.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{h.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {h.type} - {h.importedAt}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          <span className="text-green-600">{h.successRows}</span> thành công /
                          <span className="text-red-600"> {h.failedRows}</span> lỗi
                        </p>
                      </div>
                      <Badge className={
                        h.status === 'completed' ? 'bg-green-100 text-green-800' :
                        h.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {h.status === 'completed' ? 'Hoàn thành' :
                         h.status === 'failed' ? 'Lỗi' : 'Đang xử lý'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Tải mẫu file</CardTitle>
              <CardDescription>Tải mẫu file Excel để điền dữ liệu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {importTypes.map((type) => (
                  <div key={type.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{type.icon}</span>
                      <h3 className="font-medium">{type.label}</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      Các trường: {type.fields.join(', ')}
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Tải mẫu .xlsx
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Instructions */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-amber-800 mb-2">Lưu ý quan trọng</h3>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Đảm bảo dữ liệu đúng định dạng trước khi import</li>
            <li>• Kiểm tra kỹ các trường bắt buộc</li>
            <li>• Sao lưu dữ liệu hiện tại trước khi import</li>
            <li>• Nếu có lỗi, hệ thống sẽ tự động rollback</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
