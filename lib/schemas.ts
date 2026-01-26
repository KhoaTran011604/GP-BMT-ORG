import { ObjectId } from 'mongodb';

// User Schema
export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  fullName: string;
  role: 'super_admin' | 'cha_quan_ly' | 'cha_xu' | 'ke_toan' | 'thu_ky';
  parishId?: ObjectId;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Parish Schema
export interface Parish {
  _id?: ObjectId;
  parishCode: string;
  parishName: string;
  patronSaint: string;
  feastDay: string;
  establishedDate?: Date;
  address: string;
  phone?: string;
  email?: string;
  pastorId?: ObjectId;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Person (Giáo dân) Schema
export interface Person {
  _id?: ObjectId;
  familyId: ObjectId;
  saintName: string;
  fullName: string;
  gender: 'male' | 'female';
  dob: Date;
  birthplace?: string;
  relationship: string;
  phone?: string;
  email?: string;
  occupation?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'moved' | 'deceased';
  createdAt: Date;
  updatedAt: Date;
}

// Fund Schema
export interface Fund {
  _id?: ObjectId;
  fundCode: string;
  fundName: string;
  category: 'A' | 'B' | 'C';
  fiscalPeriod: 'monthly' | 'quarterly' | 'yearly';
  recipientUnit: string;
  createdAt: Date;
  updatedAt: Date;
}

// Thu Chi Category Schema (Danh mục Thu Chi)
export interface ThuChiCategory {
  _id?: ObjectId;
  categoryCode: string;
  categoryName: string;
  categoryType: 'income' | 'expense'; // Thu hoặc Chi
  type: 'sys' | 'user'; // sys = hệ thống (không được xóa), user = người dùng tạo
  parentId?: ObjectId;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Alias for backward compatibility
export type ExpenseCategory = ThuChiCategory;

// Income Schema
export interface Income {
  _id?: ObjectId;
  incomeCode: string;
  parishId: ObjectId;
  fundId: ObjectId;
  categoryId?: ObjectId; // FK to expense_categories (income type)
  amount: number;
  paymentMethod: 'online' | 'offline';
  bankAccountId?: ObjectId; // FK to bank_accounts
  bankAccount?: string; // Display string (for backwards compatibility)
  payerName?: string;
  description?: string;
  fiscalYear: number;
  fiscalPeriod: number;
  incomeDate: Date;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: ObjectId;
  verifiedBy?: ObjectId;
  submittedAt: Date;
  verifiedAt?: Date;
  notes?: string;
  // Reference to source contract (if income came from a rental contract)
  rentalContractId?: ObjectId;
  sourceType?: 'manual' | 'rental_contract'; // Track where the income originated
  // Reference to receipt (for quick lookup after approval)
  receiptId?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Salary Expense Item (for payroll expenses)
export interface SalaryExpenseItem {
  staffId: ObjectId;
  staffCode: string;
  staffName: string;
  basicSalary: number;
  responsibilityAllowance: number;
  mealAllowance: number;
  transportAllowance: number;
  advance: number;
  deductions: number;
  netSalary: number;
}

// Expense Schema
export interface Expense {
  _id?: ObjectId;
  expenseCode: string;
  parishId: ObjectId;
  categoryId?: ObjectId;
  fundId?: ObjectId;
  amount: number;
  paymentMethod: 'cash' | 'transfer';
  bankAccountId?: ObjectId; // FK to bank_accounts
  bankAccount?: string; // Display string (for backwards compatibility)
  payeeName?: string;
  description?: string;
  fiscalYear: number;
  fiscalPeriod: number;
  expenseDate: Date;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: ObjectId;
  approvedBy?: ObjectId;
  requestedAt: Date;
  approvedAt?: Date;
  notes?: string;
  // Reference to receipt (for quick lookup after approval)
  receiptId?: ObjectId;
  // Salary expense fields
  expenseType?: 'general' | 'salary'; // Type of expense
  salaryPeriod?: string; // e.g., "01/2026"
  salaryItems?: SalaryExpenseItem[]; // Detailed salary breakdown per employee
  createdAt: Date;
  updatedAt: Date;
}

// Transaction Schema
export interface Transaction {
  _id?: ObjectId;
  parishId: ObjectId;
  fundId: ObjectId;
  amount: number;
  paymentMethod: 'online' | 'offline';
  screenshotUrl?: string;
  receiptNo?: string;
  fiscalYear: number;
  fiscalPeriod: number;
  status: 'pending' | 'verified' | 'rejected';
  submittedBy: ObjectId;
  verifiedBy?: ObjectId;
  submittedAt: Date;
  verifiedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Staff Schema
export interface Staff {
  _id?: ObjectId;
  staffCode: string;
  fullName: string;
  gender: 'male' | 'female';
  dob: Date;
  idNumber: string;
  phone: string;
  email?: string;
  address: string;
  position: string;
  department: string;
  hireDate: Date;
  contractType: string;
  status: 'active' | 'resigned';
  createdAt: Date;
  updatedAt: Date;
}

// Payroll Schema
export interface Payroll {
  _id?: ObjectId;
  staffId: ObjectId;
  period: string;
  basicSalary: number;
  responsibilityAllowance?: number;
  mealAllowance?: number;
  transportAllowance?: number;
  advance?: number;
  deductions?: number;
  netSalary: number;
  status: 'draft' | 'approved' | 'paid';
  approvedBy?: ObjectId;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Receipt Schema (Auto-generated from approved incomes/expenses)
export interface Receipt {
  _id?: ObjectId;
  receiptNo: string;
  receiptType: 'income' | 'expense';
  referenceId?: ObjectId; // Single reference (backward compatibility)
  referenceIds?: ObjectId[]; // Multiple references for batch receipts
  parishId: ObjectId;
  amount: number; // Total amount
  receiptDate: Date;
  payerPayee: string;
  description?: string;
  // Detailed items for batch receipts
  items?: Array<{
    referenceId: ObjectId;
    code: string; // incomeCode or expenseCode
    amount: number;
    date: Date;
    payerPayee?: string;
    description?: string;
  }>;
  createdBy: ObjectId;
  createdAt: Date;
  printedAt?: Date;
  // Cancellation fields - only super_admin can cancel
  status?: 'active' | 'cancelled';
  cancelledBy?: ObjectId;
  cancelledAt?: Date;
  updatedAt?: Date;
}

// Rental Contract Schema (Hợp đồng cho thuê BDS)
export interface RentalContract {
  _id?: ObjectId;
  contractCode: string;
  parishId: ObjectId;
  // Thông tin BDS
  propertyName: string;
  propertyAddress: string;
  propertyArea?: number;
  propertyType: 'land' | 'house' | 'apartment' | 'commercial' | 'other';
  // Thông tin bên thuê
  tenantName: string;
  tenantIdNumber?: string;
  tenantPhone?: string;
  tenantAddress?: string;
  tenantEmail?: string;
  // Thông tin hợp đồng
  startDate: Date;
  endDate: Date;
  rentAmount: number;
  paymentCycle: 'monthly' | 'quarterly' | 'yearly';
  depositAmount: number;
  paymentMethod: 'cash' | 'transfer';
  bankAccount?: string;
  // Trạng thái
  status: 'active' | 'expired' | 'terminated' | 'pending';
  // File và ghi chú
  contractFiles?: string[];
  terms?: string;
  notes?: string;
  // Metadata
  createdBy: ObjectId;
  terminatedAt?: Date;
  terminatedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Rental Payment Schema (Thanh toán theo hợp đồng thuê)
export interface RentalPayment {
  _id?: ObjectId;
  contractId: ObjectId;
  parishId: ObjectId;
  amount: number;
  paymentDate: Date;
  paymentPeriod: string;
  paymentMethod: 'cash' | 'transfer';
  bankAccount?: string;
  receiptNo?: string;
  incomeId?: ObjectId;
  status: 'pending' | 'paid' | 'converted';
  notes?: string;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Bank Account Schema (Tài khoản ngân hàng)
export interface BankAccount {
  _id?: ObjectId;
  accountCode: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankBranch?: string;
  accountType: 'income' | 'expense' | 'both'; // Loại TK: thu, chi, hoặc cả hai
  parishId?: ObjectId; // Nếu null = TK chung của Giáo phận
  balance?: number;
  isDefault: boolean; // TK mặc định cho giao dịch
  status: 'active' | 'inactive';
  notes?: string;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Media File Schema (Tệp tin - AWS S3)
export interface MediaFile {
  _id?: ObjectId;
  fileName: string;
  fileKey: string; // S3 Object Key
  bucketName: string;
  fileUrl?: string;
  cdnUrl?: string;
  mimeType?: string;
  fileSize?: number;
  fileType: 'image' | 'document' | 'video';
  entityType: 'income' | 'expense' | 'receipt' | 'contract' | 'staff' | 'other';
  entityId: ObjectId;
  category?: string; // screenshot, avatar, document
  description?: string;
  metadata?: Record<string, any>;
  uploadedBy: ObjectId;
  uploadedAt: Date;
  isPublic: boolean;
  status: 'active' | 'archived' | 'deleted';
}
