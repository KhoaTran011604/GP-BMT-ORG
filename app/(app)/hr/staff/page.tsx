'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  FormSection,
  FormField,
  FormLabel,
  FormGrid,
} from '@/components/ui/form-section';
import { formatCompactCurrency, formatCurrency } from '@/lib/utils';
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
  bankBranch?: string;
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
    bankBranch: '',
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
      bankBranch: staffMember.bankBranch || '',
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
      bankBranch: '',
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
          <h1 className="page-title">Danh sách Nhân sự</h1>
          <p className="page-description">Quản lý nhân sự và hợp đồng lao động</p>
        </div>
        <Button onClick={() => { resetStaffForm(); setIsStaffDialogOpen(true); }} className="h-12 px-6 text-base font-semibold">
          <Plus size={20} className="mr-2" />
          Thêm Nhân sự
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <div className="stat-value text-blue-600">{staff.length}</div>
                <p className="stat-label">Tổng nhân sự</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <div className="stat-value text-green-600">{staffWithContract}</div>
                <p className="stat-label">Có HDLD</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <XCircle className="text-amber-600" size={24} />
              </div>
              <div>
                <div className="stat-value text-amber-600">{staffWithoutContract}</div>
                <p className="stat-label">Chưa có HDLD</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Receipt className="text-purple-600" size={24} />
              </div>
              <div>
                <div className="stat-value text-purple-600">{formatCompactCurrency(totalSalary)}</div>
                <p className="stat-label">Tổng lương/tháng</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning for staff without contracts */}
      {staffWithoutContract > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <XCircle className="text-amber-600" size={28} />
              <div>
                <h3 className="font-semibold text-lg text-amber-800">
                  Có {staffWithoutContract} nhân sự chưa có hợp đồng lao động
                </h3>
                <p className="text-base text-amber-700">
                  Vui lòng tạo HDLD để có thể phát hành phiếu chi lương
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm theo tên hoặc mã nhân sự..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={(v: 'all' | 'has_contract' | 'no_contract') => setFilterStatus(v)}>
              <SelectTrigger className="w-[200px] h-12 text-base">
                <SelectValue placeholder="Lọc theo HDLD" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-base py-3">Tất cả</SelectItem>
                <SelectItem value="has_contract" className="text-base py-3">Có HDLD</SelectItem>
                <SelectItem value="no_contract" className="text-base py-3">Chưa có HDLD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Danh sách Nhân sự ({filteredStaff.length})</CardTitle>
          <CardDescription className="text-base mt-1">
            Nhân sự có HDLD mới có thể tạo phiếu chi lương
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStaff.length === 0 ? (
            <div className="empty-state">
              <Users size={64} className="mx-auto mb-4 opacity-50" />
              <p className="empty-state-text">Chưa có nhân sự nào</p>
              <Button className="h-12 px-6 text-base font-semibold mt-4" onClick={() => setIsStaffDialogOpen(true)}>
                <Plus size={20} className="mr-2" />
                Thêm nhân sự đầu tiên
              </Button>
            </div>
          ) : (
            <Table className="table-lg">
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
                        <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
                          <CheckCircle size={14} className="mr-1" />
                          Có HDLD
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 text-sm px-3 py-1">
                          <XCircle size={14} className="mr-1" />
                          Chưa có
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {s.basicSalary ? formatCompactCurrency(s.basicSalary) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-sm px-3 py-1 ${
                        s.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {s.status === 'active' ? 'Hoạt động' : 'Nghỉ việc'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="action-btn">
                            <MoreHorizontal size={20} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetail(s)} className="text-base py-2">
                            <Eye size={16} className="mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditStaff(s)} className="text-base py-2">
                            <Pencil size={16} className="mr-2" />
                            Sửa thông tin
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {!s.hasActiveContract && s.status === 'active' && (
                            <DropdownMenuItem onClick={() => handleOpenContractDialog(s)} className="text-base py-2">
                              <FileSignature size={16} className="mr-2" />
                              Tạo HDLD
                            </DropdownMenuItem>
                          )}
                          {s.hasActiveContract && (
                            <DropdownMenuItem onClick={() => handleOpenContractDialog(s)} className="text-base py-2">
                              <FileSignature size={16} className="mr-2" />
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
        <DialogContent size="xl" className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStaffId ? 'Cập nhật thông tin Nhân sự' : 'Thêm Nhân sự mới'}</DialogTitle>
            <DialogDescription>
              {editingStaffId
                ? 'Chỉnh sửa thông tin nhân sự.'
                : 'Nhập thông tin nhân sự. Sau khi thêm, bạn có thể tạo HDLD cho nhân sự này.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitStaff} className="space-y-6">
            <FormSection title="Thông tin cơ bản">
              <FormGrid columns={2}>
                <FormField>
                  <FormLabel required>Mã Nhân sự</FormLabel>
                  <Input
                    value={staffFormData.staffCode}
                    onChange={(e) => setStaffFormData({ ...staffFormData, staffCode: e.target.value.toUpperCase() })}
                    placeholder="VD: NV001"
                    required
                    className="h-12 text-base"
                  />
                </FormField>
                <FormField>
                  <FormLabel required>Họ và Tên</FormLabel>
                  <Input
                    value={staffFormData.fullName}
                    onChange={(e) => setStaffFormData({ ...staffFormData, fullName: e.target.value })}
                    placeholder="Nhập họ và tên"
                    required
                    className="h-12 text-base"
                  />
                </FormField>
              </FormGrid>
              <FormGrid columns={3}>
                <FormField>
                  <FormLabel required>Giới tính</FormLabel>
                  <Select
                    value={staffFormData.gender}
                    onValueChange={(value) => setStaffFormData({ ...staffFormData, gender: value })}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male" className="text-base py-3">Nam</SelectItem>
                      <SelectItem value="female" className="text-base py-3">Nữ</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField>
                  <FormLabel required>Ngày sinh</FormLabel>
                  <Input
                    type="date"
                    value={staffFormData.dob}
                    onChange={(e) => setStaffFormData({ ...staffFormData, dob: e.target.value })}
                    required
                    className="h-12 text-base"
                  />
                </FormField>
                <FormField>
                  <FormLabel required>CCCD/CMND</FormLabel>
                  <Input
                    value={staffFormData.idNumber}
                    onChange={(e) => setStaffFormData({ ...staffFormData, idNumber: e.target.value })}
                    placeholder="Số CCCD"
                    required
                    className="h-12 text-base"
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            <FormSection title="Thông tin liên hệ">
              <FormGrid columns={2}>
                <FormField>
                  <FormLabel required>Điện thoại</FormLabel>
                  <Input
                    value={staffFormData.phone}
                    onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                    placeholder="Số điện thoại"
                    required
                    className="h-12 text-base"
                  />
                </FormField>
                <FormField>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={staffFormData.email}
                    onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                    placeholder="Email"
                    className="h-12 text-base"
                  />
                </FormField>
              </FormGrid>
              <FormField>
                <FormLabel required>Địa chỉ</FormLabel>
                <Input
                  value={staffFormData.address}
                  onChange={(e) => setStaffFormData({ ...staffFormData, address: e.target.value })}
                  placeholder="Địa chỉ thường trú"
                  required
                  className="h-12 text-base"
                />
              </FormField>
            </FormSection>

            <FormSection title="Thông tin ngân hàng">
              <FormGrid columns={3}>
                <FormField>
                  <FormLabel>Tên ngân hàng</FormLabel>
                  <Input
                    value={staffFormData.bankName}
                    onChange={(e) => setStaffFormData({ ...staffFormData, bankName: e.target.value })}
                    placeholder="VD: Vietcombank..."
                    className="h-12 text-base"
                  />
                </FormField>
                <FormField>
                  <FormLabel>Chi nhánh</FormLabel>
                  <Input
                    value={staffFormData.bankBranch}
                    onChange={(e) => setStaffFormData({ ...staffFormData, bankBranch: e.target.value })}
                    placeholder="VD: BMT"
                    className="h-12 text-base"
                  />
                </FormField>
                <FormField>
                  <FormLabel>Số tài khoản</FormLabel>
                  <Input
                    value={staffFormData.bankAccountNumber}
                    onChange={(e) => setStaffFormData({ ...staffFormData, bankAccountNumber: e.target.value })}
                    placeholder="Số tài khoản"
                    className="h-12 text-base"
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            <FormSection title="Thông tin công việc">
              <FormGrid columns={3}>
                <FormField>
                  <FormLabel required>Chức vụ</FormLabel>
                  <Select
                    value={staffFormData.position}
                    onValueChange={(value) => setStaffFormData({ ...staffFormData, position: value })}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Chọn chức vụ" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={pos} value={pos} className="text-base py-3">{pos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField>
                  <FormLabel required>Bộ phận</FormLabel>
                  <Select
                    value={staffFormData.department}
                    onValueChange={(value) => setStaffFormData({ ...staffFormData, department: value })}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Chọn bộ phận" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept} className="text-base py-3">{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField>
                  <FormLabel required>Ngày vào làm</FormLabel>
                  <Input
                    type="date"
                    value={staffFormData.hireDate}
                    onChange={(e) => setStaffFormData({ ...staffFormData, hireDate: e.target.value })}
                    required
                    className="h-12 text-base"
                  />
                </FormField>
              </FormGrid>
              {editingStaffId && (
                <FormField>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select
                    value={staffFormData.status}
                    onValueChange={(value: 'active' | 'resigned') => setStaffFormData({ ...staffFormData, status: value })}
                  >
                    <SelectTrigger className="h-12 text-base w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active" className="text-base py-3">Hoạt động</SelectItem>
                      <SelectItem value="resigned" className="text-base py-3">Nghỉ việc</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            </FormSection>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsStaffDialogOpen(false)} className="h-12 px-8 text-base sm:w-auto w-full">
                Hủy bỏ
              </Button>
              <Button type="submit" className="h-12 px-8 text-base sm:w-auto w-full">{editingStaffId ? 'Cập nhật' : 'Thêm Nhân sự'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Contract Dialog */}
      <Dialog open={isContractDialogOpen} onOpenChange={(open) => { if (!open) setEditingContractId(null); setIsContractDialogOpen(open); }}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>{editingContractId ? 'Cập nhật Hợp đồng Lao động' : 'Tạo Hợp đồng Lao động'}</DialogTitle>
            <DialogDescription>
              {editingContractId
                ? `Cập nhật HDLD cho nhân sự: `
                : `Tạo HDLD cho nhân sự: `}
              <strong>{selectedStaff?.fullName}</strong>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitContract} className="space-y-6">
            <FormSection title="Thông tin hợp đồng">
              <FormField>
                <FormLabel required>Số Hợp đồng</FormLabel>
                <Input
                  value={contractFormData.contractNo}
                  onChange={(e) => setContractFormData({ ...contractFormData, contractNo: e.target.value })}
                  required
                  className="h-12 text-base"
                />
              </FormField>
              <FormField>
                <FormLabel required>Loại Hợp đồng</FormLabel>
                <Select
                  value={contractFormData.contractType}
                  onValueChange={(value: 'full_time' | 'part_time' | 'fixed_term' | 'seasonal') =>
                    setContractFormData({ ...contractFormData, contractType: value })
                  }
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(contractTypes).map(([key, { label }]) => (
                      <SelectItem key={key} value={key} className="text-base py-3">{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </FormSection>

            <FormSection title="Thời hạn & Lương">
              <FormGrid columns={2}>
                <FormField>
                  <FormLabel required>Ngày bắt đầu</FormLabel>
                  <Input
                    type="date"
                    value={contractFormData.startDate}
                    onChange={(e) => setContractFormData({ ...contractFormData, startDate: e.target.value })}
                    required
                    className="h-12 text-base"
                  />
                </FormField>
                <FormField>
                  <FormLabel>Ngày kết thúc</FormLabel>
                  <Input
                    type="date"
                    value={contractFormData.endDate}
                    onChange={(e) => setContractFormData({ ...contractFormData, endDate: e.target.value })}
                    placeholder="Bỏ trống nếu không xác định"
                    className="h-12 text-base"
                  />
                  <p className="text-sm text-gray-500 mt-1">Bỏ trống nếu không xác định thời hạn</p>
                </FormField>
              </FormGrid>
              <FormField>
                <FormLabel required>Lương cơ bản (VND)</FormLabel>
                <Input
                  type="number"
                  value={contractFormData.basicSalary}
                  onChange={(e) => setContractFormData({ ...contractFormData, basicSalary: parseInt(e.target.value) || 0 })}
                  placeholder="VD: 5000000"
                  required
                  className="h-12 text-base"
                />
                {contractFormData.basicSalary > 0 && (
                  <p className="text-base text-green-600 mt-2 font-semibold">
                    = {formatCurrency(contractFormData.basicSalary)}
                  </p>
                )}
              </FormField>
            </FormSection>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsContractDialogOpen(false)} className="h-12 px-8 text-base sm:w-auto w-full">
                Hủy bỏ
              </Button>
              <Button type="submit" className="h-12 px-8 text-base sm:w-auto w-full gap-2">
                <FileSignature size={18} />
                {editingContractId ? 'Cập nhật Hợp đồng' : 'Tạo Hợp đồng'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Staff Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết Nhân sự</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết của nhân sự
            </DialogDescription>
          </DialogHeader>
          {detailStaff && (
            <div className="space-y-6">
              {/* Basic Info */}
              <FormSection title="Thông tin cá nhân">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-base text-gray-500">Mã nhân sự</p>
                    <p className="font-mono font-semibold text-lg">{detailStaff.staffCode}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base text-gray-500">Họ và tên</p>
                    <p className="font-semibold text-lg">{detailStaff.fullName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base text-gray-500">Giới tính</p>
                    <p className="text-base">{detailStaff.gender === 'male' ? 'Nam' : 'Nữ'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base text-gray-500">Ngày sinh</p>
                    <p className="text-base">{formatDate(detailStaff.dob)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base text-gray-500">CCCD/CMND</p>
                    <p className="font-mono text-base">{detailStaff.idNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base text-gray-500">Điện thoại</p>
                    <p className="text-base">{detailStaff.phone}</p>
                  </div>
                  {detailStaff.email && (
                    <div className="space-y-1">
                      <p className="text-base text-gray-500">Email</p>
                      <p className="text-base">{detailStaff.email}</p>
                    </div>
                  )}
                  <div className="space-y-1 col-span-2">
                    <p className="text-base text-gray-500">Địa chỉ</p>
                    <p className="text-base">{detailStaff.address}</p>
                  </div>
                </div>
              </FormSection>

              {/* Work Info */}
              <FormSection title="Thông tin công việc">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-base text-gray-500">Chức vụ</p>
                    <p className="text-base">{detailStaff.position}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base text-gray-500">Bộ phận</p>
                    <p className="text-base">{detailStaff.department}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base text-gray-500">Ngày vào làm</p>
                    <p className="text-base">{formatDate(detailStaff.hireDate)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base text-gray-500">Trạng thái</p>
                    <Badge className={`text-sm px-3 py-1 ${
                      detailStaff.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {detailStaff.status === 'active' ? 'Hoạt động' : 'Nghỉ việc'}
                    </Badge>
                  </div>
                </div>
              </FormSection>

              {/* Bank Info */}
              <FormSection title="Thông tin Ngân hàng">
                {(detailStaff.bankName || detailStaff.bankAccountNumber) ? (
                  <div className="grid grid-cols-3 gap-4 bg-blue-50 p-5 rounded-lg">
                    <div className="space-y-1">
                      <p className="text-base text-gray-500">Tên ngân hàng</p>
                      <p className="font-semibold text-base">{detailStaff.bankName || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-base text-gray-500">Chi nhánh</p>
                      <p className="font-semibold text-base">{detailStaff.bankBranch || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-base text-gray-500">Số tài khoản</p>
                      <p className="font-mono font-semibold text-base">{detailStaff.bankAccountNumber || '-'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 p-5 rounded-lg">
                    <p className="text-base text-gray-600">
                      Chưa có thông tin ngân hàng. Thông tin này dùng để chi lương qua chuyển khoản.
                    </p>
                  </div>
                )}
              </FormSection>

              {/* Contract Info */}
              <FormSection title="Thông tin Hợp đồng Lao động">
                {staffContract ? (
                  <div className="grid grid-cols-2 gap-4 bg-green-50 p-5 rounded-lg">
                    <div className="space-y-1">
                      <p className="text-base text-gray-500">Số hợp đồng</p>
                      <p className="font-mono font-semibold text-base">{staffContract.contractNo}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-base text-gray-500">Loại hợp đồng</p>
                      <Badge className={`text-sm px-3 py-1 ${contractTypes[staffContract.contractType]?.color || 'bg-gray-100'}`}>
                        {contractTypes[staffContract.contractType]?.label || staffContract.contractType}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-base text-gray-500">Ngày bắt đầu</p>
                      <p className="text-base">{formatDate(staffContract.startDate)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-base text-gray-500">Ngày kết thúc</p>
                      <p className="text-base">{staffContract.endDate ? formatDate(staffContract.endDate) : 'Không xác định'}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-base text-gray-500">Lương cơ bản</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(staffContract.basicSalary)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 p-5 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-800">
                      <XCircle size={20} />
                      <p className="font-semibold text-lg">Chưa có Hợp đồng Lao động</p>
                    </div>
                    <p className="text-base text-amber-700 mt-2">
                      Nhân sự cần có HDLD để được tính vào bảng lương hàng tháng
                    </p>
                    <Button
                      className="mt-4 h-12 px-6 text-base gap-2"
                      onClick={() => {
                        setIsDetailDialogOpen(false);
                        handleOpenContractDialog(detailStaff);
                      }}
                    >
                      <FileSignature size={18} />
                      Tạo HDLD ngay
                    </Button>
                  </div>
                )}
              </FormSection>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)} className="h-12 px-8 text-base">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
