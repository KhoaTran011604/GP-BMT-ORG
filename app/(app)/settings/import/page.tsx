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
  { id: 'parishes', label: 'Giao xu', icon: '🏛️', fields: ['parish_code', 'parish_name', 'address', 'phone'] },
  { id: 'families', label: 'Gia dinh', icon: '👨‍👩‍👧‍👦', fields: ['family_code', 'family_name', 'parish_code', 'address'] },
  { id: 'people', label: 'Giao dan', icon: '👤', fields: ['saint_name', 'full_name', 'dob', 'gender', 'family_code'] },
  { id: 'clergy', label: 'Linh muc', icon: '⛪', fields: ['saint_name', 'full_name', 'ordination_date', 'training_class'] },
  { id: 'baptism', label: 'So Rua toi', icon: '💧', fields: ['baptism_name', 'full_name', 'dob', 'baptism_date', 'register_no'] },
  { id: 'marriage', label: 'So Hon phoi', icon: '💒', fields: ['groom_name', 'bride_name', 'marriage_date', 'register_no'] },
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
          <h1 className="text-2xl font-bold">Import Du lieu Lich su</h1>
          <p className="text-gray-600">Nhap du lieu tu file Excel hoac CSV</p>
        </div>
      </div>

      <Tabs defaultValue="import">
        <TabsList>
          <TabsTrigger value="import">Import moi</TabsTrigger>
          <TabsTrigger value="history">Lich su Import</TabsTrigger>
          <TabsTrigger value="templates">Mau file</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          {/* Step 1: Select Type */}
          <Card>
            <CardHeader>
              <CardTitle>Buoc 1: Chon loai du lieu</CardTitle>
              <CardDescription>Chon loai du lieu ban muon import</CardDescription>
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
                <CardTitle>Buoc 2: Tai len file</CardTitle>
                <CardDescription>
                  Chon file Excel (.xlsx) hoac CSV de import {selectedTypeInfo?.label}
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
                      Keo tha file vao day hoac click de chon file
                    </p>
                    <p className="text-sm text-gray-400">
                      Ho tro: .xlsx, .xls, .csv (Toi da 10MB)
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
                      Xoa
                    </Button>
                  </div>
                )}

                {selectedTypeInfo && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Cac truong bat buoc:</h4>
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
                <CardTitle>Buoc 3: Thuc hien Import</CardTitle>
                <CardDescription>Xem truoc va thuc hien import du lieu</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {importing ? (
                  <div className="space-y-4">
                    <Progress value={progress} />
                    <p className="text-center text-gray-600">
                      Dang import... {progress}%
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <Button variant="outline">Xem truoc du lieu</Button>
                    <Button onClick={handleImport}>Bat dau Import</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Lich su Import</CardTitle>
              <CardDescription>Cac lan import truoc do</CardDescription>
            </CardHeader>
            <CardContent>
              {importHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-4xl mb-4">📋</p>
                  <p>Chua co lich su import nao</p>
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
                          <span className="text-green-600">{h.successRows}</span> thanh cong /
                          <span className="text-red-600"> {h.failedRows}</span> loi
                        </p>
                      </div>
                      <Badge className={
                        h.status === 'completed' ? 'bg-green-100 text-green-800' :
                        h.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {h.status === 'completed' ? 'Hoan thanh' :
                         h.status === 'failed' ? 'Loi' : 'Dang xu ly'}
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
              <CardTitle>Tai mau file</CardTitle>
              <CardDescription>Tai mau file Excel de dien du lieu</CardDescription>
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
                      Cac truong: {type.fields.join(', ')}
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Tai mau .xlsx
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
          <h3 className="font-semibold text-amber-800 mb-2">Luu y quan trong</h3>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Dam bao du lieu dung dinh dang truoc khi import</li>
            <li>• Kiem tra ky cac truong bat buoc</li>
            <li>• Sao luu du lieu hien tai truoc khi import</li>
            <li>• Neu co loi, he thong se tu dong rollback</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
