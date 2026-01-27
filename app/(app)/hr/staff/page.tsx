'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import {
  Plus, Search, FileSignature, Users, Receipt,
  CheckCircle, XCircle, Eye, MoreHorizontal, Pencil
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface Staff {
  _id: string;
  staffCode: string;
  fullName: string;
  gender: 'male' | 'female';
  dob: string;
  idNumber: string;
  phone: string;
  email?: string;
  address: string;
  position: string;
  department: string;
  hireDate: string;
  contractType: string;
  status: 'active' | 'resigned';
  bankName?: string;
  bankAccountNumber?: string;
  hasActiveContract?: boolean;
  activeContractId?: string;
  basicSalary?: number;
}

interface Contract {
  _id: string;
  contractNo: string;
  staffId: string;
  staffName?: string;
  contractType: 'full_time' | 'part_time' | 'fixed_term' | 'seasonal';
  startDate: string;
  endDate?: string;
  basicSalary: number;
  status: 'active' | 'expired' | 'terminated';
}

const positions = [
  'Bảo vệ',
  'Phục vụ',
  'Văn phòng',
  'Tài xế',
  'Kế toán',
  'Khác'
];

const departments = [
  'Văn phòng TGM',
  'Nhà thờ Chính tòa',
  'Đại Chủng viện',
  'Trung tâm Mục vụ',
  'Khác'
];

const contractTypes = {
  full_time: { label: 'Không xác định thời hạn', color: 'bg-green-100 text-green-800' },
  part_time: { label: 'Bán thời gian', color: 'bg-blue-100 text-blue-800' },
  fixed_term: { label: 'Xác định thời hạn', color: 'bg-purple-100 text-purple-800' },
  seasonal: { label: 'Thời vụ', color: 'bg-orange-100 text-orange-800' },
};

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'has_contract' | 'no_contract'>('all');

  // Staff dialog
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffFormData, setStaffFormData] = useState({
    staffCode: '',
    fullName: '',
    gender: 'male',
    dob: '',
    idNumber: '',
    phone: '',
    email: '',
    address: '',
    position: '',
    department: '',
    hireDate: '',
    status: 'active' as 'active' | 'resigned',
    bankName: '',
    bankAccountNumber: '',
  });

  // Contract dialog
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [editingContractId, setEditingContractId] = useState<string | null>(null);
  const [contractFormData, setContractFormData] = useState<{
    contractNo: string;
    contractType: 'full_time' | 'part_time' | 'fixed_term' | 'seasonal';
    startDate: string;
    endDate: string;
    basicSalary: number;
  }>({
    contractNo: '',
    contractType: 'full_time',
    startDate: '',
    endDate: '',
    basicSalary: 0,
  });

  // Staff detail dialog
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [detailStaff, setDetailStaff] = useState<Staff | null>(null);
  const [staffContract, setStaffContract] = useState<Contract | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [staffRes, contractsRes] = await Promise.all([
        fetch('/api/staff'),
        fetch('/api/contracts')
      ]);

      let staffData: Staff[] = [];
      let contractsData: Contract[] = [];

      if (staffRes.ok) {
        const data = await staffRes.json();
        staffData = Array.isArray(data) ? data : [];
      }

      if (contractsRes.ok) {
        const data = await contractsRes.json();
        contractsData = Array.isArray(data) ? data : [];
      }

      // Map active contracts to staff
      const staffWithContracts = staffData.map(s => {
        const activeContract = contractsData.find(
          c => c.staffId === s._id && c.status === 'active'
        );
        return {
          ...s,
          hasActiveContract: !!activeContract,
          activeContractId: activeContract?._id,
          basicSalary: activeContract?.basicSalary
        };
      });

      setStaff(staffWithContracts);
      setContracts(contractsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingStaffId ? `/api/staff/${editingStaffId}` : '/api/staff';
      const method = editingStaffId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffFormData),
      });

      if (res.ok) {
        setIsStaffDialogOpen(false);
        resetStaffForm();
        fetchData();
        alert(editingStaffId ? 'Cập nhật nhân sự thành công!' : 'Thêm nhân sự thành công!');
      } else {
        const error = await res.json();
        alert(`Lỗi: ${error.error || 'Không thể lưu nhân sự'}`);
      }
    } catch (error) {
      console.error('Error saving staff:', error);
      alert('Lỗi khi lưu nhân sự');
    }
  };

  const handleEditStaff = (staffMember: Staff) => {
    setEditingStaffId(staffMember._id);
    setStaffFormData({
      staffCode: staffMember.staffCode,
      fullName: staffMember.fullName,
      gender: staffMember.gender,
      dob: staffMember.dob ? staffMember.dob.split('T')[0] : '',
      idNumber: staffMember.idNumber,
      phone: staffMember.phone,
      email: staffMember.email || '',
      address: staffMember.address,
      position: staffMember.position,
      department: staffMember.department,
      hireDate: staffMember.hireDate ? staffMember.hireDate.split('T')[0] : '',
      status: staffMember.status,
      bankName: staffMember.bankName || '',
      bankAccountNumber: staffMember.bankAccountNumber || '',
    });
    setIsStaffDialogOpen(true);
  };

  const handleOpenContractDialog = (staffMember: Staff) => {
    setSelectedStaff(staffMember);

    // Check if staff already has an active contract
    const existingContract = contracts.find(c => c.staffId === staffMember._id && c.status === 'active');

    if (existingContract) {
      // Edit existing contract
      setEditingContractId(existingContract._id);
      setContractFormData({
        contractNo: existingContract.contractNo,
        contractType: existingContract.contractType,
        startDate: existingContract.startDate ? existingContract.startDate.split('T')[0] : '',
        endDate: existingContract.endDate ? existingContract.endDate.split('T')[0] : '',
        basicSalary: existingContract.basicSalary,
      });
    } else {
      // Create new contract
      setEditingContractId(null);
      const today = new Date().toISOString().split('T')[0];
      setContractFormData({
        contractNo: `HD-${staffMember.staffCode}-${Date.now().toString().slice(-6)}`,
        contractType: 'full_time',
        startDate: today,
        endDate: '',
        basicSalary: 0,
      });
    }
    setIsContractDialogOpen(true);
  };

  const handleSubmitContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    try {
      const url = editingContractId ? `/api/contracts/${editingContractId}` : '/api/contracts';
      const method = editingContractId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contractFormData,
          staffId: selectedStaff._id,
          staffName: selectedStaff.fullName,
          status: 'active',
          endDate: contractFormData.endDate || undefined,
        }),
      });

      if (res.ok) {
        setIsContractDialogOpen(false);
        setSelectedStaff(null);
        setEditingContractId(null);
        fetchData();
        alert(editingContractId ? 'Cập nhật hợp đồng thành công!' : 'Tạo hợp đồng thành công!');
      } else {
        const error = await res.json();
        alert(`Lỗi: ${error.error || 'Không thể lưu hợp đồng'}`);
      }
    } catch (error) {
      console.error('Error saving contract:', error);
      alert('Lỗi khi lưu hợp đồng');
    }
  };

  const handleViewDetail = (staffMember: Staff) => {
    setDetailStaff(staffMember);
    // Find the active contract for this staff
    const contract = contracts.find(c => c.staffId === staffMember._id && c.status === 'active');
    setStaffContract(contract || null);
    setIsDetailDialogOpen(true);
  };

  const resetStaffForm = () => {
    setEditingStaffId(null);
    setStaffFormData({
      staffCode: '',
      fullName: '',
      gender: 'male',
      dob: '',
      idNumber: '',
      phone: '',
      email: '',
      address: '',
      position: '',
      department: '',
      hireDate: '',
      status: 'active',
      bankName: '',
      bankAccountNumber: '',
    });
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch = !searchTerm ||
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.staffCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'has_contract' && s.hasActiveContract) ||
      (filterStatus === 'no_contract' && !s.hasActiveContract);

    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const staffWithContract = staff.filter(s => s.hasActiveContract).length;
  const staffWithoutContract = staff.filter(s => !s.hasActiveContract && s.status === 'active').length;
  const totalSalary = staff.reduce((sum, s) => sum + (s.basicSalary || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Danh sách Nhân sự</h1>
          <p className="text-gray-600">Quản lý nhân sự và hợp đồng lao động</p>
        </div>
        <Button onClick={() => { resetStaffForm(); setIsStaffDialogOpen(true); }}>
          <Plus size={16} className="mr-2" />
          Thêm Nhân sự
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{staff.length}</p>
                <p className="text-sm text-gray-600">Tổng nhân sự</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{staffWithContract}</p>
                <p className="text-sm text-gray-600">Có HDLD</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <XCircle className="text-amber-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{staffWithoutContract}</p>
                <p className="text-sm text-gray-600">Chưa có HDLD</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Receipt className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalSalary)}</p>
                <p className="text-sm text-gray-600">Tổng lương/tháng</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning for staff without contracts */}
      {staffWithoutContract > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="text-amber-600" size={24} />
              <div>
                <h3 className="font-semibold text-amber-800">
                  Có {staffWithoutContract} nhân sự chưa có hợp đồng lao động
                </h3>
                <p className="text-sm text-amber-700">
                  Vui lòng tạo HDLD để có thể phát hành phiếu chi lương
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm theo tên hoặc mã nhân sự..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={(v: 'all' | 'has_contract' | 'no_contract') => setFilterStatus(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc theo HDLD" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="has_contract">Có HDLD</SelectItem>
                <SelectItem value="no_contract">Chưa có HDLD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Nhân sự ({filteredStaff.length})</CardTitle>
          <CardDescription>
            Nhân sự có HDLD mới có thể tạo phiếu chi lương
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStaff.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>Chưa có nhân sự nào</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsStaffDialogOpen(true)}>
                <Plus size={16} className="mr-2" />
                Thêm nhân sự đầu tiên
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã NV</TableHead>
                  <TableHead>Họ Tên</TableHead>
                  <TableHead>Chức vụ</TableHead>
                  <TableHead>Bộ phận</TableHead>
                  <TableHead>HDLD</TableHead>
                  <TableHead className="text-right">Lương cơ bản</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell className="font-mono">{s.staffCode}</TableCell>
                    <TableCell className="font-medium">{s.fullName}</TableCell>
                    <TableCell>{s.position}</TableCell>
                    <TableCell>{s.department}</TableCell>
                    <TableCell>
                      {s.hasActiveContract ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle size={12} className="mr-1" />
                          Có HDLD
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800">
                          <XCircle size={12} className="mr-1" />
                          Chưa có
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {s.basicSalary ? formatCurrency(s.basicSalary) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        s.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }>
                        {s.status === 'active' ? 'Hoạt động' : 'Nghỉ việc'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetail(s)}>
                            <Eye size={14} className="mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditStaff(s)}>
                            <Pencil size={14} className="mr-2" />
                            Sửa thông tin
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {!s.hasActiveContract && s.status === 'active' && (
                            <DropdownMenuItem onClick={() => handleOpenContractDialog(s)}>
                              <FileSignature size={14} className="mr-2" />
                              Tạo HDLD
                            </DropdownMenuItem>
                          )}
                          {s.hasActiveContract && (
                            <DropdownMenuItem onClick={() => handleOpenContractDialog(s)}>
                              <FileSignature size={14} className="mr-2" />
                              Xem/Cập nhật HDLD
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Staff Dialog */}
      <Dialog open={isStaffDialogOpen} onOpenChange={(open) => { if (!open) resetStaffForm(); setIsStaffDialogOpen(open); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStaffId ? 'Cập nhật thông tin Nhân sự' : 'Thêm Nhân sự mới'}</DialogTitle>
            <DialogDescription>
              {editingStaffId
                ? 'Chỉnh sửa thông tin nhân sự.'
                : 'Nhập thông tin nhân sự. Sau khi thêm, bạn có thể tạo HDLD cho nhân sự này.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitStaff} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mã Nhân sự *</Label>
                <Input
                  value={staffFormData.staffCode}
                  onChange={(e) => setStaffFormData({ ...staffFormData, staffCode: e.target.value.toUpperCase() })}
                  placeholder="VD: NV001"
                  required
                />
              </div>
              <div>
                <Label>Họ và Tên *</Label>
                <Input
                  value={staffFormData.fullName}
                  onChange={(e) => setStaffFormData({ ...staffFormData, fullName: e.target.value })}
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Giới tính *</Label>
                <Select
                  value={staffFormData.gender}
                  onValueChange={(value) => setStaffFormData({ ...staffFormData, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ngày sinh *</Label>
                <Input
                  type="date"
                  value={staffFormData.dob}
                  onChange={(e) => setStaffFormData({ ...staffFormData, dob: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>CCCD/CMND *</Label>
                <Input
                  value={staffFormData.idNumber}
                  onChange={(e) => setStaffFormData({ ...staffFormData, idNumber: e.target.value })}
                  placeholder="Số CCCD"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Điện thoại *</Label>
                <Input
                  value={staffFormData.phone}
                  onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                  placeholder="Số điện thoại"
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={staffFormData.email}
                  onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                  placeholder="Email"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tên ngân hàng</Label>
                <Input
                  value={staffFormData.bankName}
                  onChange={(e) => setStaffFormData({ ...staffFormData, bankName: e.target.value })}
                  placeholder="VD: Vietcombank, BIDV..."
                />
              </div>
              <div>
                <Label>Số tài khoản</Label>
                <Input
                  value={staffFormData.bankAccountNumber}
                  onChange={(e) => setStaffFormData({ ...staffFormData, bankAccountNumber: e.target.value })}
                  placeholder="Số tài khoản ngân hàng"
                />
              </div>
            </div>
            <div>
              <Label>Địa chỉ *</Label>
              <Input
                value={staffFormData.address}
                onChange={(e) => setStaffFormData({ ...staffFormData, address: e.target.value })}
                placeholder="Địa chỉ thường trú"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Chức vụ *</Label>
                <Select
                  value={staffFormData.position}
                  onValueChange={(value) => setStaffFormData({ ...staffFormData, position: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chức vụ" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Bộ phận *</Label>
                <Select
                  value={staffFormData.department}
                  onValueChange={(value) => setStaffFormData({ ...staffFormData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn bộ phận" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ngày vào làm *</Label>
                <Input
                  type="date"
                  value={staffFormData.hireDate}
                  onChange={(e) => setStaffFormData({ ...staffFormData, hireDate: e.target.value })}
                  required
                />
              </div>
              {editingStaffId && (
                <div>
                  <Label>Trạng thái</Label>
                  <Select
                    value={staffFormData.status}
                    onValueChange={(value: 'active' | 'resigned') => setStaffFormData({ ...staffFormData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="resigned">Nghỉ việc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsStaffDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">{editingStaffId ? 'Cập nhật' : 'Thêm Nhân sự'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Contract Dialog */}
      <Dialog open={isContractDialogOpen} onOpenChange={(open) => { if (!open) setEditingContractId(null); setIsContractDialogOpen(open); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingContractId ? 'Cập nhật Hợp đồng Lao động' : 'Tạo Hợp đồng Lao động'}</DialogTitle>
            <DialogDescription>
              {editingContractId
                ? `Cập nhật HDLD cho nhân sự: `
                : `Tạo HDLD cho nhân sự: `}
              <strong>{selectedStaff?.fullName}</strong>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitContract} className="space-y-4">
            <div>
              <Label>Số Hợp đồng *</Label>
              <Input
                value={contractFormData.contractNo}
                onChange={(e) => setContractFormData({ ...contractFormData, contractNo: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Loại Hợp đồng *</Label>
              <Select
                value={contractFormData.contractType}
                onValueChange={(value: 'full_time' | 'part_time' | 'fixed_term' | 'seasonal') =>
                  setContractFormData({ ...contractFormData, contractType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(contractTypes).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ngày bắt đầu *</Label>
                <Input
                  type="date"
                  value={contractFormData.startDate}
                  onChange={(e) => setContractFormData({ ...contractFormData, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Ngày kết thúc</Label>
                <Input
                  type="date"
                  value={contractFormData.endDate}
                  onChange={(e) => setContractFormData({ ...contractFormData, endDate: e.target.value })}
                  placeholder="Bỏ trống nếu không xác định"
                />
                <p className="text-xs text-gray-500 mt-1">Bỏ trống nếu không xác định thời hạn</p>
              </div>
            </div>
            <div>
              <Label>Lương cơ bản (VND) *</Label>
              <Input
                type="number"
                value={contractFormData.basicSalary}
                onChange={(e) => setContractFormData({ ...contractFormData, basicSalary: parseInt(e.target.value) || 0 })}
                placeholder="VD: 5000000"
                required
              />
              {contractFormData.basicSalary > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  = {formatCurrency(contractFormData.basicSalary)}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsContractDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">
                <FileSignature size={16} className="mr-2" />
                {editingContractId ? 'Cập nhật Hợp đồng' : 'Tạo Hợp đồng'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Staff Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết Nhân sự</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết của nhân sự
            </DialogDescription>
          </DialogHeader>
          {detailStaff && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Mã nhân sự</p>
                  <p className="font-mono font-medium">{detailStaff.staffCode}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Họ và tên</p>
                  <p className="font-medium">{detailStaff.fullName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Giới tính</p>
                  <p>{detailStaff.gender === 'male' ? 'Nam' : 'Nữ'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Ngày sinh</p>
                  <p>{formatDate(detailStaff.dob)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">CCCD/CMND</p>
                  <p className="font-mono">{detailStaff.idNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Điện thoại</p>
                  <p>{detailStaff.phone}</p>
                </div>
                {detailStaff.email && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Email</p>
                    <p>{detailStaff.email}</p>
                  </div>
                )}
                <div className="space-y-1 col-span-2">
                  <p className="text-sm text-gray-500">Địa chỉ</p>
                  <p>{detailStaff.address}</p>
                </div>
              </div>

              {/* Work Info */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Thông tin công việc</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Chức vụ</p>
                    <p>{detailStaff.position}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Bộ phận</p>
                    <p>{detailStaff.department}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Ngày vào làm</p>
                    <p>{formatDate(detailStaff.hireDate)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <Badge className={
                      detailStaff.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }>
                      {detailStaff.status === 'active' ? 'Hoạt động' : 'Nghỉ việc'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Bank Info */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Thông tin Ngân hàng</h4>
                {(detailStaff.bankName || detailStaff.bankAccountNumber) ? (
                  <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Tên ngân hàng</p>
                      <p className="font-medium">{detailStaff.bankName || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Số tài khoản</p>
                      <p className="font-mono font-medium">{detailStaff.bankAccountNumber || '-'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Chưa có thông tin ngân hàng. Thông tin này dùng để chi lương qua chuyển khoản.
                    </p>
                  </div>
                )}
              </div>

              {/* Contract Info */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Thông tin Hợp đồng Lao động</h4>
                {staffContract ? (
                  <div className="grid grid-cols-2 gap-4 bg-green-50 p-4 rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Số hợp đồng</p>
                      <p className="font-mono font-medium">{staffContract.contractNo}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Loại hợp đồng</p>
                      <Badge className={contractTypes[staffContract.contractType]?.color || 'bg-gray-100'}>
                        {contractTypes[staffContract.contractType]?.label || staffContract.contractType}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Ngày bắt đầu</p>
                      <p>{formatDate(staffContract.startDate)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Ngày kết thúc</p>
                      <p>{staffContract.endDate ? formatDate(staffContract.endDate) : 'Không xác định'}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm text-gray-500">Lương cơ bản</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(staffContract.basicSalary)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-800">
                      <XCircle size={18} />
                      <p className="font-medium">Chưa có Hợp đồng Lao động</p>
                    </div>
                    <p className="text-sm text-amber-700 mt-1">
                      Nhân sự cần có HDLD để được tính vào bảng lương hàng tháng
                    </p>
                    <Button
                      className="mt-3"
                      size="sm"
                      onClick={() => {
                        setIsDetailDialogOpen(false);
                        handleOpenContractDialog(detailStaff);
                      }}
                    >
                      <FileSignature size={14} className="mr-2" />
                      Tạo HDLD ngay
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
