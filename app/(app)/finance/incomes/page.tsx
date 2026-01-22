'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Download, Eye, FileSpreadsheet, CalendarIcon } from 'lucide-react';
import { ImageGallery } from '@/components/finance/ImageGallery';
import { StatusBadge } from '@/components/finance/StatusBadge';
import { Income } from '@/lib/schemas';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function IncomesPage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('this-month');
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  // Custom date range state
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    // Only fetch if not using custom date range, or if custom dates are set
    if (filter !== 'date-range') {
      fetchIncomes();
    } else if (dateRange?.from && dateRange?.to) {
      fetchIncomes();
    }
  }, [filter, dateRange]);

  const getDateRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    switch (filter) {
      case 'this-month':
        return {
          startDate: new Date(year, month, 1).toISOString().split('T')[0],
          endDate: new Date(year, month + 1, 0).toISOString().split('T')[0]
        };
      case 'last-month':
        return {
          startDate: new Date(year, month - 1, 1).toISOString().split('T')[0],
          endDate: new Date(year, month, 0).toISOString().split('T')[0]
        };
      case 'last-quarter':
        const quarter = Math.floor(month / 3);
        const quarterStart = new Date(year, quarter * 3 - 3, 1);
        const quarterEnd = new Date(year, quarter * 3, 0);
        return {
          startDate: quarterStart.toISOString().split('T')[0],
          endDate: quarterEnd.toISOString().split('T')[0]
        };
      case 'date-range':
        return {
          startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
          endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined
        };
      default:
        return {};
    }
  };

  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const params = new URLSearchParams({
        status: 'approved',
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await fetch(`/api/incomes?${params}`);
      if (response.ok) {
        const result = await response.json();
        setIncomes(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching incomes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    alert('Export functionality will be implemented with xlsx library');
  };

  const totalAmount = incomes.reduce((sum, income) => sum + income.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Phiếu Thu</h1>
          <p className="text-gray-500">Danh sách các khoản thu đã được duyệt</p>
        </div>
        <Button onClick={handleExport} className="gap-2">
          <FileSpreadsheet size={18} />
          Xuất Excel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng số khoản thu</CardDescription>
            <CardTitle className="text-2xl">{incomes.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng số tiền</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totalAmount)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bộ lọc</CardDescription>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">Tháng này</SelectItem>
                <SelectItem value="last-month">Tháng trước</SelectItem>
                <SelectItem value="last-quarter">Quý trước</SelectItem>
                <SelectItem value="date-range">Tùy chọn khoảng ngày</SelectItem>
                <SelectItem value="all">Tất cả</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
        </Card>
      </div>

      {/* Custom Date Range Picker */}
      {filter === 'date-range' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon size={18} />
              Chọn khoảng thời gian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'dd/MM/yyyy', { locale: vi })} -{' '}
                        {format(dateRange.to, 'dd/MM/yyyy', { locale: vi })}
                      </>
                    ) : (
                      format(dateRange.from, 'dd/MM/yyyy', { locale: vi })
                    )
                  ) : (
                    <span className="text-muted-foreground">Chọn khoảng ngày</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  locale={vi}
                />
              </PopoverContent>
            </Popover>
            {dateRange?.from && dateRange?.to && (
              <p className="text-sm text-muted-foreground mt-2">
                Đã chọn: {format(dateRange.from, 'dd/MM/yyyy', { locale: vi })} đến {format(dateRange.to, 'dd/MM/yyyy', { locale: vi })}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Danh sách khoản thu</CardTitle>
          <CardDescription>
            Chỉ hiển thị các khoản thu đã được duyệt (Read-only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Đang tải...</div>
          ) : incomes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã phiếu</TableHead>
                  <TableHead>Ngày thu</TableHead>
                  <TableHead>Người nộp</TableHead>
                  <TableHead>Quỹ</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead>Hình ảnh</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.map((income) => (
                  <TableRow key={income._id?.toString()}>
                    <TableCell className="font-mono">{income.incomeCode}</TableCell>
                    <TableCell>{formatDate(income.incomeDate)}</TableCell>
                    <TableCell>{income.payerName || 'N/A'}</TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">Fund ID</span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(income.amount)}
                    </TableCell>
                    <TableCell>
                      {income.images && income.images.length > 0 ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedIncome(income);
                            setShowGallery(true);
                          }}
                        >
                          <Eye size={16} className="mr-1" />
                          {income.images.length} ảnh
                        </Button>
                      ) : (
                        <span className="text-sm text-gray-400">Không có</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={income.status} />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedIncome(income);
                          setShowDetail(true);
                        }}
                      >
                        Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedIncome && (
        <>
          <Dialog open={showDetail} onOpenChange={setShowDetail}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Chi tiết khoản thu</DialogTitle>
                <DialogDescription>
                  Mã phiếu: {selectedIncome.incomeCode}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày thu</label>
                  <p>{formatDate(selectedIncome.incomeDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Số tiền</label>
                  <p className="font-semibold">{formatCurrency(selectedIncome.amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Người nộp</label>
                  <p>{selectedIncome.payerName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Hình thức</label>
                  <p className="capitalize">{selectedIncome.paymentMethod}</p>
                </div>
                {selectedIncome.bankAccount && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Tài khoản</label>
                    <p>{selectedIncome.bankAccount}</p>
                  </div>
                )}
                {selectedIncome.description && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Diễn giải</label>
                    <p>{selectedIncome.description}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                  <div className="mt-1">
                    <StatusBadge status={selectedIncome.status} />
                  </div>
                </div>
                {selectedIncome.notes && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Ghi chú</label>
                    <p>{selectedIncome.notes}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <ImageGallery
            images={selectedIncome.images || []}
            open={showGallery}
            onClose={() => setShowGallery(false)}
          />
        </>
      )}
    </div>
  );
}
