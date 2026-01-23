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
import { Expense } from '@/lib/schemas';
import { formatCompactCurrency } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('this-month');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  // Custom date range state
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    // Only fetch if not using custom date range, or if custom dates are set
    if (filter !== 'date-range') {
      fetchExpenses();
    } else if (dateRange?.from && dateRange?.to) {
      fetchExpenses();
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

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const params = new URLSearchParams({
        status: 'approved',
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await fetch(`/api/expenses?${params}`);
      if (response.ok) {
        const result = await response.json();
        setExpenses(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    alert('Export functionality will be implemented with xlsx library');
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

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
          <h1 className="text-3xl font-bold">Phiếu Chi</h1>
          <p className="text-gray-500">Danh sách các khoản chi đã được duyệt</p>
        </div>
        <Button onClick={handleExport} className="gap-2">
          <FileSpreadsheet size={18} />
          Xuất Excel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng số khoản chi</CardDescription>
            <CardTitle className="text-2xl">{expenses.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng số tiền</CardDescription>
            <CardTitle className="text-2xl text-red-600">{formatCompactCurrency(totalAmount)}</CardTitle>
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
          <CardTitle>Danh sách khoản chi</CardTitle>
          <CardDescription>
            Chỉ hiển thị các khoản chi đã được duyệt (Read-only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Đang tải...</div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã phiếu</TableHead>
                  <TableHead>Ngày chi</TableHead>
                  <TableHead>Người nhận</TableHead>
                  <TableHead>Hình thức</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead>Hình ảnh</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense._id?.toString()}>
                    <TableCell className="font-mono">{expense.expenseCode}</TableCell>
                    <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                    <TableCell>{expense.payeeName || 'N/A'}</TableCell>
                    <TableCell className="capitalize">{expense.paymentMethod}</TableCell>
                    <TableCell className="text-right font-semibold text-red-600">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>
                      {expense.images && expense.images.length > 0 ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedExpense(expense);
                            setShowGallery(true);
                          }}
                        >
                          <Eye size={16} className="mr-1" />
                          {expense.images.length} ảnh
                        </Button>
                      ) : (
                        <span className="text-sm text-gray-400">Không có</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={expense.status} />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedExpense(expense);
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

      {selectedExpense && (
        <>
          <Dialog open={showDetail} onOpenChange={setShowDetail}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Chi tiết khoản chi</DialogTitle>
                <DialogDescription>
                  Mã phiếu: {selectedExpense.expenseCode}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày chi</label>
                  <p>{formatDate(selectedExpense.expenseDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Số tiền</label>
                  <p className="font-semibold text-red-600">{formatCurrency(selectedExpense.amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Người nhận</label>
                  <p>{selectedExpense.payeeName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Hình thức</label>
                  <p className="capitalize">{selectedExpense.paymentMethod}</p>
                </div>
                {selectedExpense.bankAccount && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Tài khoản</label>
                    <p>{selectedExpense.bankAccount}</p>
                  </div>
                )}
                {selectedExpense.description && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Diễn giải</label>
                    <p>{selectedExpense.description}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                  <div className="mt-1">
                    <StatusBadge status={selectedExpense.status} />
                  </div>
                </div>
                {selectedExpense.notes && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Ghi chú</label>
                    <p>{selectedExpense.notes}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <ImageGallery
            images={selectedExpense.images || []}
            open={showGallery}
            onClose={() => setShowGallery(false)}
          />
        </>
      )}
    </div>
  );
}
