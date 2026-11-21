export type UserRole = 'super_admin' | 'superadmin' | 'society_admin' | 'admin' | 'treasurer' | 'resident' | 'security';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  name?: string;
  phone: string;
  role: UserRole;
  societyId?: string;
  flatId?: string;
  flatNumber?: string;
  wing?: string;
  isEmailVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  isFirstTime?: boolean;
  otpVerified?: boolean;
}

export interface SocietySubscription {
  planId: 'trial_monthly' | 'society_pro_monthly' | 'society_enterprise_annual' | 'lifetime_prime';
  planName: string;
  pricePerMonth: number;
  billingCycle: 'monthly' | 'annual' | 'lifetime';
  status: 'trialing' | 'active' | 'past_due' | 'cancelled';
  trialEndsAt: string; // 1st month free
  currentPeriodEnd: string;
  autoRenew: boolean;
  paymentMethod?: string;
  lastInvoiceId?: string;
}

export interface SocietyConfig {
  id: string;
  name: string;
  registrationNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  upiId: string;
  upiPayeeName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl?: string;
  subscription: SocietySubscription;
  gstConfig: GSTConfig;
  interestConfig: InterestConfig;
  lateFeeConfig: LateFeeConfig;
  billingCycle: 'monthly' | 'bi_monthly' | 'quarterly' | 'half_yearly' | 'yearly';
  defaultDueDays: number;
  liveVersion: string;
  createdAt: string;
}

export interface GSTConfig {
  enabled: boolean;
  gstin: string;
  cgstRate: number; // e.g. 9%
  sgstRate: number; // e.g. 9%
  thresholdPerMonth: number; // e.g. 7500 (RWA exemption limit)
}

export interface InterestConfig {
  enabled: boolean;
  ratePercentPerAnnum: number; // e.g. 18% or 21%
  basis: 'bill_date' | 'due_date';
  calculationFrequency: 'daily' | 'yearly';
  applyOnOpeningBalance: boolean;
  applyOnArrearsOnly: boolean;
}

export interface LateFeeConfig {
  enabled: boolean;
  type: 'per_day' | 'per_month' | 'fixed';
  flatRate: number; // For residential flats
  shopRate: number; // For commercial shops
  gracePeriodDays: number;
}

export interface Wing {
  id: string;
  societyId: string;
  name: string; // e.g. "Wing A"
  floorsCount: number;
  flatsPerFloor: number;
}

export interface FlatShopConfig {
  id: string;
  societyId: string;
  wingId: string;
  wingName: string;
  flatNumber: string; // e.g. "A-101"
  floorNumber: number;
  type: '1BHK' | '2BHK' | '3BHK' | '4BHK' | 'Penthouse' | 'Commercial_Shop' | 'Office';
  carpetAreaSqFt: number;
  builtUpAreaSqFt: number;
  occupancyStatus: 'owner_occupied' | 'rented_tenant' | 'vacant';
  primaryMemberId?: string;
  parkingSlotId?: string;
  openingPrincipalArrears: number;
  openingInterestArrears: number;
  advanceBalance: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number;
  phone?: string;
}

export interface Member {
  id: string;
  societyId: string;
  flatId: string;
  flatNumber: string;
  wingName: string;
  memberType: 'owner' | 'joint_owner' | 'tenant';
  fullName: string;
  email: string;
  phone: string;
  aadhaarNumber?: string;
  panNumber?: string;
  voterIdNumber?: string;
  shareCertificateNo?: string;
  shareDistinctiveFrom?: number;
  shareDistinctiveTo?: number;
  totalShares?: number;
  jointOwnerName?: string;
  jointOwnerPan?: string;
  jointOwnerPhone?: string;
  tenantDetails?: {
    tenantName: string;
    tenantPhone: string;
    tenantAadhaar?: string;
    leaseStartDate: string;
    leaseEndDate: string;
    policeVerified: boolean;
    agreementDocUrl?: string;
  };
  vehicles: Array<{
    type: '2_wheeler' | '4_wheeler';
    regNumber: string;
    makeModel?: string;
    parkingSlotNumber?: string;
  }>;
  familyMembers: FamilyMember[];
  documents: Array<{
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
  }>;
  isSoldOrTransferred?: boolean;
  transferDate?: string;
  transferredToMemberName?: string;
  createdAt: string;
}

export interface MaintenanceChargeHead {
  id: string;
  societyId: string;
  name: string; // e.g. "Regular Maintenance", "Repair Fund", "Sinking Fund", "Water Charges", "Parking Charges", "Non-Occupancy Charges", "Security Charges"
  category: 'regular' | 'repair' | 'sinking' | 'water' | 'parking' | 'non_occupancy' | 'security' | 'lift' | 'custom';
  calculationType: 'fixed_per_flat' | 'per_sqft' | 'flat_type_wise' | 'case_to_case';
  defaultAmount: number;
  sqftRate?: number;
  flatTypeRates?: Record<string, number>; // e.g. { '1BHK': 1500, '2BHK': 2200, '3BHK': 3000, 'Commercial_Shop': 4500 }
  isTaxableGST: boolean;
  isActive: boolean;
}

export interface BillItem {
  headId: string;
  headName: string;
  rateOrBasis: string;
  amount: number;
}

export interface MaintenanceBill {
  id: string;
  billNumber: string;
  societyId: string;
  societyName: string;
  flatId: string;
  flatNumber: string;
  wingName: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  memberType: 'owner' | 'tenant';
  billDate: string;
  dueDate: string;
  billingPeriod: string; // e.g. "April 2026", "Q1 2026-27"
  items: BillItem[];
  currentChargesSubtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  totalCurrentCharges: number;
  principalArrears: number;
  interestArrears: number;
  currentBillInterest: number;
  lateFeeCharge: number;
  advanceAdjustment: number;
  netPayableAmount: number;
  amountPaid: number;
  paymentStatus: 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
  previousReceiptNumber?: string;
  previousReceiptDate?: string;
  previousReceiptAmount?: number;
  narration?: string;
  isSupplementary: boolean;
  upiPaymentLink?: string;
  createdAt: string;
}

export interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  societyId: string;
  billId?: string;
  billNumber?: string;
  flatId?: string;
  flatNumber: string;
  wingName?: string;
  memberId?: string;
  memberName: string;
  receiptDate: string;
  paymentMode: 'UPI' | 'NEFT_RTGS' | 'Cheque' | 'PDC' | 'Debit_Credit_Card' | 'Cash' | string;
  referenceTransactionNo?: string;
  chequeOrTxnNumber?: string;
  bankName?: string;
  chequeNumber?: string;
  chequeDate?: string;
  totalAmountReceived?: number;
  amountReceived?: number;
  allocatedToInterest?: number;
  allocatedToPrincipal?: number;
  allocatedToAdvance?: number;
  allocation?: {
    interestCleared: number;
    principalCleared: number;
    currentChargesCleared: number;
    advanceCreditAdded: number;
  };
  reconciledWithBank?: boolean;
  bankReconciliationDate?: string;
  status?: 'cleared' | 'pending_clearance' | 'bounced' | string;
  clearingStatus?: 'cleared' | 'pending_clearance' | 'bounced' | 'uncleared' | string;
  clearingDate?: string;
  isPDC?: boolean;
  pdcDate?: string;
  remarks?: string;
  narration?: string;
  createdAt: string;
}

export type CollectionReceipt = PaymentReceipt;

export interface PostDatedCheque {
  id: string;
  societyId: string;
  memberId?: string;
  memberName: string;
  flatNumber: string;
  chequeNumber: string;
  bankName: string;
  branch: string;
  chequeAmount: number;
  chequeDate: string;
  expectedDepositDate: string;
  status: 'in_hand' | 'deposited' | 'cleared' | 'bounced' | 'returned';
  receiptId?: string;
  remarks?: string;
}

export interface BankReconciliationItem {
  id: string;
  societyId: string;
  statementDate: string;
  description: string;
  creditAmount: number;
  debitAmount: number;
  matchedReceiptId?: string;
  isReconciled: boolean;
  reconciledAt?: string;
}

export interface VisitorLog {
  id: string;
  societyId: string;
  flatNumber: string;
  wingName?: string;
  visitorName: string;
  visitorPhone?: string;
  phone?: string;
  visitorType?: 'guest' | 'delivery' | 'cab' | 'service_technician' | 'service' | 'other';
  type?: string;
  purpose: string;
  companyName?: string;
  vehicleNumber?: string;
  numberOfPersons?: number;
  expectedDate?: string;
  expectedTimeSlot?: string;
  entryTimestamp?: string;
  checkInTime?: string;
  exitTimestamp?: string;
  checkOutTime?: string;
  status: 'inside' | 'checked_out' | 'pre_approved' | 'rejected' | 'expired';
  gatePassOtp?: string;
  passCode?: string;
  approvedByResident?: boolean;
  approvedByResidentName?: string;
  photoUrl?: string;
  residentNotifiedEntry?: boolean;
  residentNotifiedExit?: boolean;
  entryGate?: string;
  exitGate?: string;
  guardName?: string;
  overstayAlertTriggered?: boolean;
  createdAt?: string;
}

export interface AmenityBookingRule {
  maxDurationHours: number; // e.g. max 4 hours per booking
  minLeadTimeHours: number; // e.g. at least 12 hours in advance
  maxBookingsPerMonthPerFlat: number; // e.g. 3 bookings/month
  requiresAdminApproval: boolean;
  cancellationCutoffHours: number;
}

export interface Amenity {
  id: string;
  societyId: string;
  name: string;
  description: string;
  capacity: number;
  hourlyRate?: number;
  dailyRate?: number;
  securityDeposit: number;
  availableTimeSlots?: string[];
  rules?: string[];
  bookingRules?: AmenityBookingRule;
  imageUrl?: string;
  isActive?: boolean;
  operationalHours?: { open: string; close: string };
  category?: 'recreational' | 'sports' | 'wellness' | 'community_hall';
}

export interface AmenityBooking {
  id: string;
  societyId: string;
  amenityId: string;
  amenityName: string;
  memberId?: string;
  memberName: string;
  flatNumber: string;
  memberPhone?: string;
  bookingDate: string;
  timeSlot: string;
  durationHours?: number;
  numberOfGuests?: number;
  totalRentAmount?: number;
  totalCharge?: number;
  depositAmount: number;
  paymentStatus?: 'pending' | 'paid' | 'refunded' | 'waived';
  bookingStatus?: 'pending_approval' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
  status?: 'pending_approval' | 'confirmed' | 'cancelled' | 'completed' | 'rejected' | string;
  purpose?: string;
  bookingCode?: string;
  transactionRef?: string;
  paymentMode?: string;
  confirmationNotificationSent?: boolean;
  notificationChannel?: 'whatsapp' | 'email' | 'sms' | 'both';
  approvalNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export type ComplaintCategory = 
  | 'plumbing'
  | 'electrical'
  | 'elevator'
  | 'housekeeping'
  | 'security'
  | 'civil_seepage'
  | 'carpentry'
  | 'amenity_defect'
  | 'noise_nuisance'
  | 'billing_accounts'
  | 'other';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'emergency';

export type ComplaintStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'reopened';

export interface ComplaintAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  size?: string;
  uploadedAt: string;
}

export interface ComplaintTimelineEntry {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  role: string;
  notes?: string;
  notificationSent?: string;
}

export interface ComplaintTicket {
  id: string;
  societyId: string;
  ticketNumber: string; // e.g. "TKT-2026-0042"
  flatNumber: string;
  wingName?: string;
  memberId?: string;
  memberName: string;
  memberPhone: string;
  memberEmail?: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  title: string;
  description: string;
  status: ComplaintStatus;
  preferredVisitTime?: string;
  assignedStaffName?: string;
  assignedStaffRole?: string;
  assignedStaffPhone?: string;
  assignedAt?: string;
  slaHours?: number;
  targetResolutionDate?: string;
  resolvedAt?: string;
  closedAt?: string;
  resolutionNotes?: string;
  residentRating?: number; // 1 to 5
  residentFeedback?: string;
  attachments: ComplaintAttachment[];
  timeline: ComplaintTimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface SocietyStaffMember {
  id: string;
  name: string;
  role: string; // e.g. "Chief Electrician", "Society Plumber", "Lift Tech Engineer", "Facility Supervisor"
  phone: string;
  specialization: ComplaintCategory[];
  available: boolean;
}

export interface NoticeItem {
  id: string;
  societyId: string;
  title: string;
  category: 'general' | 'agm' | 'maintenance' | 'emergency';
  content: string;
  publishedAt: string;
  isUrgent: boolean;
  authorName: string;
}

export interface SystemVersionRelease {
  id: string;
  versionNumber: string;
  title?: string;
  releaseTitle?: string;
  description: string;
  targetSocietyId?: string;
  status: 'draft' | 'pending_approval' | 'pending_super_admin_approval' | 'approved_live' | 'approved_and_live' | 'rejected';
  requestedBy?: string;
  requestedByRole?: string;
  requestedByEmail?: string;
  requestedAt?: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  reviewedBySuperAdminEmail?: string;
  reviewedAt?: string;
  features?: string[];
  changesPayload?: {
    featureCategory: 'statutory_rules' | 'rate_revision' | 'billing_schema' | 'security_patch';
    details: string;
    effectiveDate: string;
  };
}

export interface SaaSSettings {
  appName: string;
  companyAddress?: string;
  address?: string;
  companyPhone?: string;
  superAdminPhone?: string;
  companyEmail?: string;
  supportEmail?: string;
  platformUpiId?: string;
  superAdminUpiId?: string;
  platformUpiPayee?: string;
  defaultMonthlyFee?: number;
  monthlySubscriptionRate?: number;
  annualSubscriptionRate?: number;
  promotionalFreeMonthEnabled?: boolean;
  maintenanceMode?: boolean;
  systemReleaseVersion?: string;
}

export type SuperAdminSettings = SaaSSettings;

export interface SystemAuditLog {
  id: string;
  societyId?: string;
  userName?: string;
  userEmail?: string;
  userRole?: UserRole | string;
  action: string;
  module?: 'AUTH' | 'BILLING' | 'MEMBERS' | 'COLLECTIONS' | 'RECONCILIATION' | 'SUPER_ADMIN' | 'AMENITY' | 'VISITOR' | string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export type AuditLog = SystemAuditLog;
