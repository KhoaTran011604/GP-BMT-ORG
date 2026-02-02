'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { formatCompactCurrency } from '@/lib/utils';
import { ArrowLeft, Building2, Church, Wallet, Plus, Pencil, Trash2 } from 'lucide-react';

interface Fund {
  _id: string;
  fundCode: string;
  fundName: string;
  category: 'A' | 'B' | 'C';
}

interface FundBalance {
  _id: string;
  fundCode: string;
  fundName: string;
  category: string;
  totalIncome: number;
  totalExpense: number;
  totalAdjustmentIncrease: number;
  totalAdjustmentDecrease: number;
  balance: number;
}

const fundGroupsInfo = {
  A: {
    title: 'Quỹ chuyển HĐGMVN',
    description: 'Các quỹ được chuyển về Hội đồng Giám mục Việt Nam',
    color: 'blue',
    icon: Building2,
  },
  B: {
    title: 'Quỹ chuyển TGM BMT',
    description: 'Các quỹ được chuyển về Tòa Giám mục Buôn Ma Thuột',
    color: 'purple',
    icon: Church,
  },
  C: {
    title: 'Quỹ nội bộ & Nguồn thu',
    description: 'Các quỹ nội bộ và nguồn thu khác',
    color: 'green',
    icon: Wallet,
  }
};


export default function FundsPage() {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [balances, setBalances] = useState<Map<string, FundBalance>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<'A' | 'B' | 'C' | null>('A');

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    fundCode: '',
    fundName: '',
    category: 'A' as 'A' | 'B' | 'C',
  });

  useEffect(() => {
    fetchFunds();
  }, []);

  const fetchFunds = async () => {
    setLoading(true);
    try {
      const [fundsRes, balancesRes] = await Promise.all([
        fetch('/api/funds'),
        fetch('/api/balances?type=fund')
      ]);

      if (fundsRes.ok) {
        const data = await fundsRes.json();
        setFunds(data.data || []);
      }

      if (balancesRes.ok) {
        const balancesData = await balancesRes.json();
        const balancesList = balancesData.data || [];
        const balancesMap = new Map<string, FundBalance>();
        balancesList.forEach((b: FundBalance) => {
          balancesMap.set(b._id.toString(), b);
        });
        setBalances(balancesMap);
      }
    } catch (error) {
      console.error('Error fetching funds:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fundCode: '',
      fundName: '',
      category: selectedGroup || 'A',
    });
  };

  const handleCreate = async () => {
    if (!formData.fundCode || !formData.fundName) {
      alert('Vui lòng điền đầy đủ mã quỹ và tên quỹ');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/funds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateDialog(false);
        resetForm();
        fetchFunds();
        alert('Tạo quỹ thành công');
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể tạo quỹ'}`);
      }
    } catch (error) {
      console.error('Error creating fund:', error);
      alert('Không thể tạo quỹ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedFund || !formData.fundCode || !formData.fundName) {
      alert('Vui lòng điền đầy đủ mã quỹ và tên quỹ');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/funds/${selectedFund._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowEditDialog(false);
        setSelectedFund(null);
        resetForm();
        fetchFunds();
        alert('Cập nhật quỹ thành công');
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể cập nhật quỹ'}`);
      }
    } catch (error) {
      console.error('Error updating fund:', error);
      alert('Không thể cập nhật quỹ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (fund: Fund) => {
    if (!confirm(`Bạn có chắc muốn xóa quỹ "${fund.fundName}"?`)) return;

    try {
      const response = await fetch(`/api/funds/${fund._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchFunds();
        alert('Xóa quỹ thành công');
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể xóa quỹ'}`);
      }
    } catch (error) {
      console.error('Error deleting fund:', error);
      alert('Không thể xóa quỹ');
    }
  };

  const openEditDialog = (fund: Fund) => {
    setSelectedFund(fund);
    setFormData({
      fundCode: fund.fundCode,
      fundName: fund.fundName,
      category: fund.category,
    });
    setShowEditDialog(true);
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const base = {
      blue: {
        card: isSelected ? 'bg-blue-600 text-white border-blue-700' : 'bg-blue-50 hover:bg-blue-100 border-blue-200 cursor-pointer',
        icon: isSelected ? 'text-blue-100' : 'text-blue-600',
        badge: 'bg-blue-100 text-blue-800',
      },
      purple: {
        card: isSelected ? 'bg-purple-600 text-white border-purple-700' : 'bg-purple-50 hover:bg-purple-100 border-purple-200 cursor-pointer',
        icon: isSelected ? 'text-purple-100' : 'text-purple-600',
        badge: 'bg-purple-100 text-purple-800',
      },
      green: {
        card: isSelected ? 'bg-green-600 text-white border-green-700' : 'bg-green-50 hover:bg-green-100 border-green-200 cursor-pointer',
        icon: isSelected ? 'text-green-100' : 'text-green-600',
        badge: 'bg-green-100 text-green-800',
      },
    };
    return base[color as keyof typeof base] || base.blue;
  };

  // Filter funds by selected group
  const filteredFunds = selectedGroup
    ? funds.filter(f => f.category === selectedGroup)
    : funds;

  // Count funds by category
  const fundCounts = {
    A: funds.filter(f => f.category === 'A').length,
    B: funds.filter(f => f.category === 'B').length,
    C: funds.filter(f => f.category === 'C').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const selectedGroupInfo = selectedGroup ? fundGroupsInfo[selectedGroup] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Danh mục Quỹ</h1>
          <p className="page-description">Quản lý các loại quỹ trong Giáo phận</p>
        </div>
        <Button onClick={() => {
          resetForm();
          setShowCreateDialog(true);
        }} className="h-12 px-6 text-base font-semibold">
          <Plus size={20} className="mr-2" />
          Tạo quỹ mới
        </Button>
      </div>

      {/* Fund Group Cards - Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.entries(fundGroupsInfo) as [keyof typeof fundGroupsInfo, typeof fundGroupsInfo.A][]).map(([key, group]) => {
          const isSelected = selectedGroup === key;
          const colors = getColorClasses(group.color, isSelected);
          const Icon = group.icon;

          return (
            <Card
              key={key}
              className={`border-2 transition-all duration-200 ${colors.card}`}
              onClick={() => setSelectedGroup(isSelected ? null : key)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-white'}`}>
                    <Icon className={colors.icon} size={24} />
                  </div>
                  <div>
                    <CardTitle className={`text-lg ${isSelected ? 'text-white' : ''}`}>
                      {group.title}
                    </CardTitle>
                    <CardDescription className={isSelected ? 'text-white/80' : ''}>
                      {group.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className={`text-3xl font-bold ${isSelected ? 'text-white' : ''}`}>
                    {fundCounts[key]}
                  </span>
                  <span className={`text-sm ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                    loại quỹ
                  </span>
                </div>
                {isSelected && (
                  <p className="text-sm text-white/70 mt-2">
                    Bấm để đóng chi tiết
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Group Detail */}
      {selectedGroupInfo && selectedGroup && (
        <Card className="animate-in slide-in-from-top-2 duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedGroup(null)}
                  className="mr-2"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  Quay lại
                </Button>
                <div>
                  <CardTitle>{selectedGroupInfo.title}</CardTitle>
                  <CardDescription>{selectedGroupInfo.description}</CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormData({ ...formData, category: selectedGroup });
                  setShowCreateDialog(true);
                }}
                className="gap-1"
              >
                <Plus size={14} />
                Thêm quỹ
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredFunds.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-text">Chưa có quỹ nào trong nhóm này</p>
              </div>
            ) : (
              <Table className="table-lg">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">Mã quỹ</TableHead>
                    <TableHead>Tên quỹ</TableHead>
                    <TableHead className="text-right">Số dư</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFunds.map((fund) => {
                    const fundBalance = balances.get(fund._id);
                    return (
                      <TableRow key={fund._id}>
                        <TableCell className="font-mono font-medium">{fund.fundCode}</TableCell>
                        <TableCell>{fund.fundName}</TableCell>
                        <TableCell className={`text-right font-bold ${fundBalance && fundBalance.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          {fundBalance
                            ? formatCompactCurrency(fundBalance.balance)
                            : formatCompactCurrency(0)
                          }
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            Hoạt động
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              onClick={() => openEditDialog(fund)}
                              title="Chỉnh sửa"
                              className="action-btn"
                            >
                              <Pencil />
                            </Button>
                            <Button
                              variant="ghost"
                              className="action-btn text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(fund)}
                              title="Xóa"
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Section - Only show when no group selected */}
      {!selectedGroup && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-amber-800 mb-2">Lưu ý quan trọng</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>- Các quỹ nhóm A được chuyển về HĐGMVN theo định kỳ hàng năm</li>
              <li>- Quỹ nhóm B được chuyển về Tòa Giám mục</li>
              <li>- Mọi giao dịch cần được xác thực bởi Cha Quản lý trước khi ghi nhận</li>
              <li>- Bấm vào một nhóm quỹ để xem chi tiết các quỹ trong nhóm</li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Tạo quỹ mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo quỹ mới
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-medium">Mã quỹ *</Label>
                <Input
                  placeholder="VD: FUND_12"
                  value={formData.fundCode}
                  onChange={(e) => setFormData({ ...formData, fundCode: e.target.value })}
                  className="h-12 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-medium">Nhóm quỹ *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v as 'A' | 'B' | 'C' })}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A" className="text-base py-3">Nhóm A</SelectItem>
                    <SelectItem value="B" className="text-base py-3">Nhóm B</SelectItem>
                    <SelectItem value="C" className="text-base py-3">Nhóm C</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {formData.category === 'A' && 'Quỹ chuyển HĐGMVN'}
                  {formData.category === 'B' && 'Quỹ chuyển TGM BMT'}
                  {formData.category === 'C' && 'Quỹ nội bộ & Nguồn thu'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Tên quỹ *</Label>
              <Input
                placeholder="VD: Quỹ xây dựng nhà thờ"
                value={formData.fundName}
                onChange={(e) => setFormData({ ...formData, fundName: e.target.value })}
                className="h-12 text-base"
              />
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="h-12 px-6 text-base">
              Hủy bỏ
            </Button>
            <Button onClick={handleCreate} disabled={submitting} className="h-12 px-6 text-base">
              {submitting ? 'Đang tạo...' : 'Tạo quỹ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Sửa thông tin quỹ</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin quỹ
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-medium">Mã quỹ *</Label>
                <Input
                  placeholder="VD: FUND_12"
                  value={formData.fundCode}
                  onChange={(e) => setFormData({ ...formData, fundCode: e.target.value })}
                  className="h-12 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-medium">Nhóm quỹ *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v as 'A' | 'B' | 'C' })}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A" className="text-base py-3">Nhóm A</SelectItem>
                    <SelectItem value="B" className="text-base py-3">Nhóm B</SelectItem>
                    <SelectItem value="C" className="text-base py-3">Nhóm C</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {formData.category === 'A' && 'Quỹ chuyển HĐGMVN'}
                  {formData.category === 'B' && 'Quỹ chuyển TGM BMT'}
                  {formData.category === 'C' && 'Quỹ nội bộ & Nguồn thu'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Tên quỹ *</Label>
              <Input
                placeholder="VD: Quỹ xây dựng nhà thờ"
                value={formData.fundName}
                onChange={(e) => setFormData({ ...formData, fundName: e.target.value })}
                className="h-12 text-base"
              />
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setSelectedFund(null);
            }} className="h-12 px-6 text-base">
              Hủy bỏ
            </Button>
            <Button onClick={handleUpdate} disabled={submitting} className="h-12 px-6 text-base">
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
