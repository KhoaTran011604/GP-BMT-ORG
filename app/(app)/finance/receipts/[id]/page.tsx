'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Printer, Home, Calendar, User, Building, CreditCard, FileText, Image as ImageIcon, List, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCompactCurrency } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TransactionInfo {
  _id: string;
  incomeCode?: string;
  expenseCode?: string;
  amount: number;
  paymentMethod: string;
  bankAccount?: string;
  payerName?: string;
  payeeName?: string;
  description?: string;
  fiscalYear?: number;
  fiscalPeriod?: number;
  incomeDate?: string;
  expenseDate?: string;
  images?: string[];
  notes?: string;
  sourceType?: string;
  rentalContractId?: string;
}

interface ReceiptItem {
  referenceId: string;
  code: string;
  amount: number;
  date: string;
  payerPayee?: string;
  description?: string;
}

interface ReceiptDetail {
  receipt: {
    _id: string;
    receiptNo: string;
    receiptType: 'income' | 'expense';
    referenceId?: string;
    referenceIds?: string[];
    parishId: string;
    amount: number;
    receiptDate: string;
    payerPayee: string;
    description?: string;
    items?: ReceiptItem[];
    createdAt: string;
  };
  transaction: TransactionInfo | null;
  transactions: TransactionInfo[];
  isCombined: boolean;
  parish: {
    _id: string;
    parishCode: string;
    parishName: string;
  } | null;
  fund: {
    _id: string;
    fundCode: string;
    fundName: string;
  } | null;
  mediaFiles: Array<{
    _id: string;
    fileName: string;
    fileUrl: string;
  }>;
}

export default function ReceiptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<ReceiptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchReceiptDetail();
      fetchUserInfo();
    }
  }, [params.id]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const result = await response.json();
        setUserRole(result.user?.role || '');
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
    }
  };

  const fetchReceiptDetail = async () => {
    try {
      const response = await fetch(`/api/receipts/${params.id}`);
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else {
        setError('Không tìm thấy phiếu thu/chi');
      }
    } catch (err) {
      console.error('Error fetching receipt:', err);
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCancelReceipt = async () => {
    setIsCancelling(true);
    try {
      const response = await fetch(`/api/receipts/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Đã hủy phiếu thành công. Các khoản thu/chi liên quan đã được đưa về trạng thái chờ duyệt.');
        router.push('/finance/transactions');
      } else {
        const result = await response.json();
        alert(`Lỗi: ${result.error || 'Không thể hủy phiếu'}`);
      }
    } catch (err) {
      console.error('Error cancelling receipt:', err);
      alert('Có lỗi xảy ra khi hủy phiếu');
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft size={16} className="mr-2" />
          Quay lại
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-500">{error || 'Không tìm thấy dữ liệu'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { receipt, transaction, transactions, isCombined, parish, fund, mediaFiles } = data;
  const isIncome = receipt.receiptType === 'income';
  const transactionCode = transaction
    ? (isIncome ? transaction.incomeCode : transaction.expenseCode)
    : 'N/A';

  // Combine images from all transactions and media files
  const allImages = [
    ...transactions.flatMap(t => t.images || []),
    ...mediaFiles.map(f => f.fileUrl)
  ];

  // Format date for items
  const formatItemDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header - hidden when printing */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft size={16} className="mr-2" />
          Quay lại
        </Button>
        <div className="flex gap-2">
          {userRole === 'super_admin' && (
            <Button
              variant="destructive"
              onClick={() => setShowCancelDialog(true)}
            >
              <XCircle size={16} className="mr-2" />
              Hủy phiếu
            </Button>
          )}
          <Button variant="outline" onClick={handlePrint}>
            <Printer size={16} className="mr-2" />
            In phiếu
          </Button>
        </div>
      </div>

      {/* Receipt Content */}
      <Card className="print:shadow-none print:border-2">
        <CardHeader className="text-center border-b print:border-b-2">
          <div className="mb-2">
            <p className="text-sm text-gray-600">TOÀ GIÁM MỤC BUÔN MA THUỘT</p>
            <p className="font-bold text-lg">GIÁO PHẬN BUÔN MA THUỘT</p>
          </div>
          <CardTitle className="text-2xl">
            {isIncome ? 'PHIẾU THU' : 'PHIẾU CHI'}
            {isCombined && (
              <Badge className="ml-3 bg-purple-100 text-purple-700 text-sm font-normal">
                Tổng hợp {receipt.items?.length || transactions.length} khoản
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-base">
            Số: <span className="font-mono font-bold">{receipt.receiptNo}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Receipt Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Ngày lập phiếu</p>
                  <p className="font-medium">{formatDate(receipt.receiptDate)}</p>
                </div>
              </div>

              {parish && (
                <div className="flex items-start gap-3">
                  <Building size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Giáo xứ</p>
                    <p className="font-medium">{parish.parishName}</p>
                  </div>
                </div>
              )}

              {fund && (
                <div className="flex items-start gap-3">
                  <Home size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Loại quỹ</p>
                    <p className="font-medium">{fund.fundName}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">{isIncome ? 'Người nộp tiền' : 'Người nhận tiền'}</p>
                  <p className="font-medium">{receipt.payerPayee || 'Không có thông tin'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CreditCard size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Hình thức thanh toán</p>
                  <p className="font-medium">
                    {transaction?.paymentMethod === 'offline' || transaction?.paymentMethod === 'cash'
                      ? 'Tiền mặt'
                      : 'Chuyển khoản'}
                  </p>
                </div>
              </div>

              {transaction?.bankAccount && (
                <div className="flex items-start gap-3">
                  <Building size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Tài khoản ngân hàng</p>
                    <p className="font-mono font-medium">{transaction.bankAccount}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amount - Highlighted */}
          <div className="text-center bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border-2 print:bg-white">
            <p className="text-sm text-gray-600 mb-2 font-medium">TỔNG SỐ TIỀN</p>
            <p className={`text-4xl font-bold ${isIncome ? 'text-green-600' : 'text-red-600'} print:text-black`}>
              {formatCurrency(receipt.amount)}
            </p>
            <Badge className={`mt-2 ${isIncome ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isIncome ? 'Thu vào' : 'Chi ra'}
            </Badge>
          </div>

          {/* Description */}
          {receipt.description && (
            <div className="border rounded-lg p-4 bg-amber-50 border-amber-200 print:bg-white">
              <div className="flex items-start gap-3">
                <FileText size={18} className="text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-medium">Nội dung</p>
                  <p className="text-base">{receipt.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Notes - only for single transaction receipts */}
          {!isCombined && transaction?.notes && (
            <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200 print:bg-white">
              <div className="flex items-start gap-3">
                <FileText size={18} className="text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-medium">Ghi chú</p>
                  <p className="text-sm italic">{transaction.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Combined Receipt Items Table */}
          {isCombined && receipt.items && receipt.items.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-4">
                <List size={18} className="text-gray-400" />
                <h3 className="text-sm font-medium text-gray-600">
                  Chi tiết các khoản {isIncome ? 'thu' : 'chi'} ({receipt.items.length} khoản)
                </h3>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 ml-2">
                  Phiếu tổng hợp
                </Badge>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">STT</TableHead>
                      <TableHead className="font-semibold">Mã</TableHead>
                      <TableHead className="font-semibold">Ngày</TableHead>
                      <TableHead className="font-semibold">{isIncome ? 'Người nộp' : 'Người nhận'}</TableHead>
                      <TableHead className="font-semibold">Nội dung</TableHead>
                      <TableHead className="text-right font-semibold">Số tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receipt.items.map((item, idx) => (
                      <TableRow key={item.referenceId} className="hover:bg-gray-50">
                        <TableCell className="text-gray-500">{idx + 1}</TableCell>
                        <TableCell className="font-mono text-sm">{item.code}</TableCell>
                        <TableCell className="text-sm">{formatItemDate(item.date)}</TableCell>
                        <TableCell className="text-sm">{item.payerPayee || '-'}</TableCell>
                        <TableCell className="text-sm max-w-xs truncate" title={item.description}>
                          {item.description || '-'}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCompactCurrency(item.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-gray-100 font-semibold">
                      <TableCell colSpan={5} className="text-right">TỔNG CỘNG:</TableCell>
                      <TableCell className={`text-right ${isIncome ? 'text-green-700' : 'text-red-700'}`}>
                        {formatCurrency(receipt.amount)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Related Transaction - only for single transaction receipts */}
          {!isCombined && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Giao dịch liên quan</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Mã giao dịch</p>
                  <p className="font-mono font-medium">{transactionCode}</p>
                </div>
                {transaction?.fiscalYear && (
                  <div>
                    <p className="text-gray-500">Năm tài chính</p>
                    <p className="font-medium">{transaction.fiscalYear}</p>
                  </div>
                )}
                {transaction?.fiscalPeriod && (
                  <div>
                    <p className="text-gray-500">Kỳ tài chính</p>
                    <p className="font-medium">Tháng {transaction.fiscalPeriod}</p>
                  </div>
                )}
                {transaction?.sourceType === 'rental_contract' && (
                  <div>
                    <p className="text-gray-500">Nguồn</p>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Hợp đồng thuê
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Images - hidden when printing */}
          {allImages.length > 0 && (
            <div className="border-t pt-4 print:hidden">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon size={18} className="text-gray-400" />
                <h3 className="text-sm font-medium text-gray-500">
                  Hình ảnh chứng từ ({allImages.length})
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {allImages.map((img, idx) => (
                  <a
                    key={idx}
                    href={img}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={img}
                      alt={`Chứng từ ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg border hover:opacity-80 transition-opacity"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Signature Section */}
          <div className="border-t-2 border-gray-300 pt-6 mt-8 print:mt-12">
            <div className="grid grid-cols-3 gap-8 text-sm text-gray-600">
              <div className="text-center">
                <p className="font-semibold mb-2">Người lập phiếu</p>
                <div className="h-20 border-b border-gray-400 mb-2"></div>
                <p className="italic text-xs">(Ký và ghi rõ họ tên)</p>
              </div>
              <div className="text-center">
                <p className="font-semibold mb-2">
                  {isIncome ? 'Người nộp tiền' : 'Người nhận tiền'}
                </p>
                <div className="h-20 border-b border-gray-400 mb-2"></div>
                <p className="italic text-xs">(Ký và ghi rõ họ tên)</p>
              </div>
              <div className="text-center">
                <p className="font-semibold mb-2">Cha xứ</p>
                <div className="h-20 border-b border-gray-400 mb-2"></div>
                <p className="italic text-xs">(Ký và đóng dấu)</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 border-t pt-4">
            <p>Phiếu được tạo tự động bởi hệ thống GPBMT.ORG</p>
            <p className="mt-1">Ngày tạo: {formatDate(receipt.createdAt)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Receipt Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle size={20} />
              Xác nhận hủy phiếu
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Bạn có chắc chắn muốn hủy phiếu <strong>{receipt.receiptNo}</strong>?</p>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                  <p className="text-sm text-amber-800 font-medium">Lưu ý:</p>
                  <ul className="text-sm text-amber-700 list-disc list-inside mt-1">
                    <li>Phiếu sẽ bị hủy và không thể khôi phục</li>
                    <li>Các khoản {isIncome ? 'thu' : 'chi'} liên quan sẽ được đưa về trạng thái "Chờ duyệt"</li>
                    <li>Bạn có thể duyệt lại các khoản này sau</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Đóng</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelReceipt}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCancelling ? 'Đang xử lý...' : 'Xác nhận hủy phiếu'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
