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

// Sub-Parish Schema
export interface SubParish {
  _id?: ObjectId;
  subParishCode: string;
  subParishName: string;
  parishId: ObjectId;
  patronSaint?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Family Schema
export interface Family {
  _id?: ObjectId;
  familyCode: string;
  familyName: string;
  parishId: ObjectId;
  subParishId?: ObjectId;
  address: string;
  phone?: string;
  registrationDate: Date;
  status: 'active' | 'moved' | 'deceased';
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

// Expense Category Schema
export interface ExpenseCategory {
  _id?: ObjectId;
  categoryCode: string;
  categoryName: string;
  parentId?: ObjectId;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Income Schema
export interface Income {
  _id?: ObjectId;
  incomeCode: string;
  parishId: ObjectId;
  fundId: ObjectId;
  amount: number;
  paymentMethod: 'online' | 'offline';
  bankAccount?: string;
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
  createdAt: Date;
  updatedAt: Date;
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
  bankAccount?: string;
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

// Clergy Schema
export interface Clergy {
  _id?: ObjectId;
  saintName: string;
  fullName: string;
  dob: Date;
  birthplace: string;
  ordinationDate: Date;
  trainingClass: string;
  currentAssignmentId?: ObjectId;
  phone?: string;
  email?: string;
  photoUrl?: string;
  status: 'active' | 'retired' | 'deceased';
  createdAt: Date;
  updatedAt: Date;
}

// Assignment (Bổ nhiệm) Schema
export interface Assignment {
  _id?: ObjectId;
  clergyId: ObjectId;
  parishId: ObjectId;
  role: 'cha_xu' | 'cha_pho' | 'quan_nhiem' | 'dac_trach';
  startDate: Date;
  endDate?: Date;
  decreeNo?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Sacrament Base
export interface BaseSacrament {
  _id?: ObjectId;
  personId?: ObjectId;
  minister: string;
  registerBook: string;
  registerNo: string;
  createdAt: Date;
  updatedAt: Date;
}

// Baptism Schema
export interface Baptism extends BaseSacrament {
  baptismName: string;
  fullName: string;
  dob: Date;
  baptismDate: Date;
  baptismPlace: string;
  godfather?: string;
  godmother?: string;
  fatherName: string;
  motherName: string;
  notes?: string;
}

// Marriage Schema
export interface Marriage extends BaseSacrament {
  groomName: string;
  groomParish: string;
  brideName: string;
  brideParish: string;
  marriageDate: Date;
  marriagePlace: string;
  witness1: string;
  witness2: string;
  dispensation?: string;
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

// AuditLog Schema
export interface AuditLog {
  _id?: ObjectId;
  userId: ObjectId;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject';
  module: string;
  recordId: ObjectId;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Receipt Schema (Auto-generated from approved incomes/expenses)
export interface Receipt {
  _id?: ObjectId;
  receiptNo: string;
  receiptType: 'income' | 'expense';
  referenceId: ObjectId;
  parishId: ObjectId;
  amount: number;
  receiptDate: Date;
  payerPayee: string;
  description?: string;
  createdBy: ObjectId;
  createdAt: Date;
  printedAt?: Date;
}
