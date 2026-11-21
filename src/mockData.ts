import { 
  SocietyConfig, 
  Wing, 
  FlatShopConfig, 
  Member, 
  MaintenanceChargeHead, 
  MaintenanceBill, 
  PaymentReceipt, 
  PostDatedCheque, 
  BankReconciliationItem, 
  VisitorLog, 
  Amenity, 
  AmenityBooking, 
  SystemVersionRelease, 
  SuperAdminSettings, 
  SystemAuditLog,
  UserProfile,
  ComplaintTicket,
  SocietyStaffMember
} from './types';

export const INITIAL_SUPER_ADMIN_SETTINGS: SuperAdminSettings = {
  appName: "SocietyPrime SaaS Suite",
  companyAddress: "Tech Park Avenue, Bandra-Kurla Complex (BKC), Mumbai, Maharashtra 400051",
  companyPhone: "+91 98765 43210",
  companyEmail: "support@societyprime.in",
  platformUpiId: "societyprime.saas@icici",
  platformUpiPayee: "SocietyPrime Enterprise Solutions Pvt Ltd",
  monthlySubscriptionRate: 2499,
  annualSubscriptionRate: 24990,
  promotionalFreeMonthEnabled: true,
  maintenanceMode: false,
  systemReleaseVersion: "v2.8.4-TallyPrimeLive"
};

export const INITIAL_SOCIETIES: SocietyConfig[] = [
  {
    id: "soc-001",
    name: "Gokuldham Heights Co-operative Housing Society Ltd.",
    registrationNumber: "BOM/HSG/TC/12894/2018",
    address: "Plot 42, Powder Gali, Goregaon East",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400063",
    upiId: "gokuldham.society@sbi",
    upiPayeeName: "Gokuldham Heights CHS Ltd",
    bankName: "State Bank of India",
    accountNumber: "30894567210",
    ifscCode: "SBIN0001890",
    branch: "Goregaon East Branch",
    contactEmail: "secretary@gokuldhamheights.org",
    contactPhone: "+91 98200 11223",
    subscription: {
      planId: "trial_monthly",
      planName: "1st Month Promotional Free Tier",
      pricePerMonth: 0,
      billingCycle: "monthly",
      status: "trialing",
      trialEndsAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
      currentPeriodEnd: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
      autoRenew: true,
      paymentMethod: "UPI Recurring Auto-Debit"
    },
    gstConfig: {
      enabled: true,
      gstin: "27AABCG1234F1Z9",
      cgstRate: 9,
      sgstRate: 9,
      thresholdPerMonth: 7500
    },
    interestConfig: {
      enabled: true,
      ratePercentPerAnnum: 21,
      basis: "due_date",
      calculationFrequency: "daily",
      applyOnOpeningBalance: true,
      applyOnArrearsOnly: true
    },
    lateFeeConfig: {
      enabled: true,
      type: "per_month",
      flatRate: 150,
      shopRate: 300,
      gracePeriodDays: 5
    },
    billingCycle: "monthly",
    defaultDueDays: 15,
    liveVersion: "v2.8.4-TallyPrimeLive",
    createdAt: "2026-01-15T09:00:00.000Z"
  },
  {
    id: "soc-002",
    name: "Silver Oak Residency CHS Ltd.",
    registrationNumber: "MAH/PUN/HSG/7789/2021",
    address: "Baner-Pashan Link Road",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411045",
    upiId: "silveroak.pune@hdfcbank",
    upiPayeeName: "Silver Oak Residency CHS",
    bankName: "HDFC Bank",
    accountNumber: "50100234891102",
    ifscCode: "HDFC0000240",
    branch: "Baner Road Branch",
    contactEmail: "admin@silveroakpune.com",
    contactPhone: "+91 94220 55667",
    subscription: {
      planId: "society_pro_monthly",
      planName: "Society Pro Monthly Subscription",
      pricePerMonth: 2499,
      billingCycle: "monthly",
      status: "active",
      trialEndsAt: "2026-02-15T00:00:00.000Z",
      currentPeriodEnd: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      autoRenew: true,
      paymentMethod: "HDFC Corporate NetBanking"
    },
    gstConfig: {
      enabled: false,
      gstin: "",
      cgstRate: 9,
      sgstRate: 9,
      thresholdPerMonth: 7500
    },
    interestConfig: {
      enabled: true,
      ratePercentPerAnnum: 18,
      basis: "due_date",
      calculationFrequency: "yearly",
      applyOnOpeningBalance: true,
      applyOnArrearsOnly: true
    },
    lateFeeConfig: {
      enabled: true,
      type: "per_day",
      flatRate: 10,
      shopRate: 25,
      gracePeriodDays: 7
    },
    billingCycle: "monthly",
    defaultDueDays: 10,
    liveVersion: "v2.8.4-TallyPrimeLive",
    createdAt: "2026-02-01T10:30:00.000Z"
  }
];

export const INITIAL_WINGS: Wing[] = [
  { id: "wing-01", societyId: "soc-001", name: "Wing A (Carnation)", floorsCount: 7, flatsPerFloor: 4 },
  { id: "wing-02", societyId: "soc-001", name: "Wing B (Daffodil)", floorsCount: 7, flatsPerFloor: 4 },
  { id: "wing-03", societyId: "soc-001", name: "Wing C (Commercial Plaza)", floorsCount: 2, flatsPerFloor: 3 }
];

export const INITIAL_FLATS: FlatShopConfig[] = [
  {
    id: "flat-101",
    societyId: "soc-001",
    wingId: "wing-01",
    wingName: "Wing A",
    flatNumber: "A-101",
    floorNumber: 1,
    type: "2BHK",
    carpetAreaSqFt: 750,
    builtUpAreaSqFt: 950,
    occupancyStatus: "owner_occupied",
    primaryMemberId: "mem-001",
    parkingSlotId: "P-A101",
    openingPrincipalArrears: 0,
    openingInterestArrears: 0,
    advanceBalance: 500
  },
  {
    id: "flat-102",
    societyId: "soc-001",
    wingId: "wing-01",
    wingName: "Wing A",
    flatNumber: "A-102",
    floorNumber: 1,
    type: "3BHK",
    carpetAreaSqFt: 1100,
    builtUpAreaSqFt: 1400,
    occupancyStatus: "rented_tenant",
    primaryMemberId: "mem-002",
    parkingSlotId: "P-A102",
    openingPrincipalArrears: 4500,
    openingInterestArrears: 380,
    advanceBalance: 0
  },
  {
    id: "flat-201",
    societyId: "soc-001",
    wingId: "wing-01",
    wingName: "Wing A",
    flatNumber: "A-201",
    floorNumber: 2,
    type: "2BHK",
    carpetAreaSqFt: 750,
    builtUpAreaSqFt: 950,
    occupancyStatus: "owner_occupied",
    primaryMemberId: "mem-003",
    parkingSlotId: "P-A201",
    openingPrincipalArrears: 0,
    openingInterestArrears: 0,
    advanceBalance: 0
  },
  {
    id: "flat-202",
    societyId: "soc-001",
    wingId: "wing-01",
    wingName: "Wing A",
    flatNumber: "A-202",
    floorNumber: 2,
    type: "Penthouse",
    carpetAreaSqFt: 1850,
    builtUpAreaSqFt: 2350,
    occupancyStatus: "owner_occupied",
    primaryMemberId: "mem-004",
    parkingSlotId: "P-A202-Double",
    openingPrincipalArrears: 0,
    openingInterestArrears: 0,
    advanceBalance: 1200
  },
  {
    id: "shop-001",
    societyId: "soc-001",
    wingId: "wing-03",
    wingName: "Wing C",
    flatNumber: "Shop-01",
    floorNumber: 0,
    type: "Commercial_Shop",
    carpetAreaSqFt: 450,
    builtUpAreaSqFt: 580,
    occupancyStatus: "owner_occupied",
    primaryMemberId: "mem-005",
    parkingSlotId: "P-Shop01",
    openingPrincipalArrears: 7200,
    openingInterestArrears: 630,
    advanceBalance: 0
  }
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: "mem-001",
    societyId: "soc-001",
    flatId: "flat-101",
    flatNumber: "A-101",
    wingName: "Wing A",
    memberType: "owner",
    fullName: "Amrut Shinde",
    email: "businesssoftsolutions@gmail.com",
    phone: "+91 98201 23456",
    aadhaarNumber: "7890 1234 5678",
    panNumber: "ABCPS1234F",
    voterIdNumber: "MH/04/123/987654",
    shareCertificateNo: "SC-0042",
    shareDistinctiveFrom: 201,
    shareDistinctiveTo: 210,
    totalShares: 10,
    jointOwnerName: "Sunita A. Shinde",
    jointOwnerPan: "ABCPS5678K",
    jointOwnerPhone: "+91 98201 98765",
    familyMembers: [
      { id: "fam-1", name: "Sunita Shinde", relation: "Wife", age: 46, phone: "+91 98201 98765" },
      { id: "fam-2", name: "Rohan Shinde", relation: "Son", age: 21, phone: "+91 98201 44556" }
    ],
    vehicles: [
      { type: "4_wheeler", regNumber: "MH-02-CP-8842", makeModel: "Hyundai Creta", parkingSlotNumber: "P-A101" },
      { type: "2_wheeler", regNumber: "MH-02-EL-1102", makeModel: "Honda Activa 6G" }
    ],
    documents: [
      { name: "Share_Certificate_A101.pdf", type: "application/pdf", url: "#", uploadedAt: "2026-01-20" },
      { name: "Aadhaar_PAN_Amrut.pdf", type: "application/pdf", url: "#", uploadedAt: "2026-01-20" }
    ],
    createdAt: "2026-01-18T10:00:00.000Z"
  },
  {
    id: "mem-002",
    societyId: "soc-001",
    flatId: "flat-102",
    flatNumber: "A-102",
    wingName: "Wing A",
    memberType: "tenant",
    fullName: "Rajeshwar Iyer (Landlord: K. Raman)",
    email: "rajeshwariyer@gmail.com",
    phone: "+91 99304 88776",
    aadhaarNumber: "4567 8901 2345",
    panNumber: "AYZPR9988D",
    voterIdNumber: "MH/04/123/554433",
    shareCertificateNo: "SC-0043",
    shareDistinctiveFrom: 211,
    shareDistinctiveTo: 220,
    totalShares: 10,
    tenantDetails: {
      tenantName: "Rajeshwar Iyer",
      tenantPhone: "+91 99304 88776",
      tenantAadhaar: "4567 8901 2345",
      leaseStartDate: "2025-10-01",
      leaseEndDate: "2026-09-30",
      policeVerified: true,
      agreementDocUrl: "Registered_Rent_Agreement_A102.pdf"
    },
    familyMembers: [
      { id: "fam-3", name: "Meenakshi Iyer", relation: "Wife", age: 34 }
    ],
    vehicles: [
      { type: "4_wheeler", regNumber: "MH-03-AX-4490", makeModel: "Honda City", parkingSlotNumber: "P-A102" }
    ],
    documents: [
      { name: "Police_Verification_A102.pdf", type: "application/pdf", url: "#", uploadedAt: "2025-10-05" }
    ],
    createdAt: "2025-10-01T12:00:00.000Z"
  },
  {
    id: "mem-003",
    societyId: "soc-001",
    flatId: "flat-201",
    flatNumber: "A-201",
    wingName: "Wing A",
    memberType: "owner",
    fullName: "Vikramaditya Rao",
    email: "vikram.rao@enterprise.com",
    phone: "+91 98190 77665",
    aadhaarNumber: "1234 5678 9012",
    panNumber: "BKMPR3344J",
    voterIdNumber: "MH/04/123/112233",
    shareCertificateNo: "SC-0044",
    shareDistinctiveFrom: 221,
    shareDistinctiveTo: 230,
    totalShares: 10,
    familyMembers: [],
    vehicles: [
      { type: "4_wheeler", regNumber: "MH-01-DE-7788", makeModel: "Tata Nexon EV", parkingSlotNumber: "P-A201" }
    ],
    documents: [],
    createdAt: "2026-01-10T14:20:00.000Z"
  },
  {
    id: "mem-004",
    societyId: "soc-001",
    flatId: "flat-202",
    flatNumber: "A-202",
    wingName: "Wing A",
    memberType: "owner",
    fullName: "Dr. Ananya Sengupta",
    email: "dr.ananya@medicare.in",
    phone: "+91 97690 12890",
    aadhaarNumber: "3456 7890 1234",
    panNumber: "ASGPD7711Q",
    shareCertificateNo: "SC-0045",
    shareDistinctiveFrom: 231,
    shareDistinctiveTo: 250,
    totalShares: 20,
    familyMembers: [
      { id: "fam-4", name: "Prof. S. Sengupta", relation: "Father", age: 72 }
    ],
    vehicles: [
      { type: "4_wheeler", regNumber: "MH-02-FJ-9009", makeModel: "Mercedes Benz C-Class", parkingSlotNumber: "P-A202-Double" }
    ],
    documents: [],
    createdAt: "2026-01-05T09:15:00.000Z"
  },
  {
    id: "mem-005",
    societyId: "soc-001",
    flatId: "shop-001",
    flatNumber: "Shop-01",
    wingName: "Wing C",
    memberType: "owner",
    fullName: "Ganesh Medical & Provision Stores (Prop: Ganesh Patel)",
    email: "ganeshmedical42@gmail.com",
    phone: "+91 98210 99881",
    aadhaarNumber: "9012 3456 7890",
    panNumber: "AGPPM5544B",
    shareCertificateNo: "SC-0099",
    shareDistinctiveFrom: 901,
    shareDistinctiveTo: 910,
    totalShares: 10,
    familyMembers: [],
    vehicles: [
      { type: "2_wheeler", regNumber: "MH-02-CZ-4501", makeModel: "TVS Jupiter" }
    ],
    documents: [],
    createdAt: "2026-01-12T11:00:00.000Z"
  }
];

export const INITIAL_CHARGE_HEADS: MaintenanceChargeHead[] = [
  {
    id: "head-01",
    societyId: "soc-001",
    name: "Regular Maintenance Charges",
    category: "regular",
    calculationType: "flat_type_wise",
    defaultAmount: 2000,
    flatTypeRates: {
      "1BHK": 1500,
      "2BHK": 2200,
      "3BHK": 3200,
      "4BHK": 4200,
      "Penthouse": 5500,
      "Commercial_Shop": 3500,
      "Office": 3000
    },
    isTaxableGST: true,
    isActive: true
  },
  {
    id: "head-02",
    societyId: "soc-001",
    name: "Repair & Maintenance Fund (0.75% of Cost/Sq.Ft)",
    category: "repair",
    calculationType: "per_sqft",
    defaultAmount: 0,
    sqftRate: 1.5, // Rs. 1.50 per sq. ft built-up
    isTaxableGST: true,
    isActive: true
  },
  {
    id: "head-03",
    societyId: "soc-001",
    name: "Sinking Fund (0.25% of Construction Cost)",
    category: "sinking",
    calculationType: "per_sqft",
    defaultAmount: 0,
    sqftRate: 0.75, // Rs. 0.75 per sq. ft built-up
    isTaxableGST: false,
    isActive: true
  },
  {
    id: "head-04",
    societyId: "soc-001",
    name: "Water Charges (Municipal Supply & Tanker)",
    category: "water",
    calculationType: "fixed_per_flat",
    defaultAmount: 450,
    isTaxableGST: false,
    isActive: true
  },
  {
    id: "head-05",
    societyId: "soc-001",
    name: "4-Wheeler Covered Parking Charges",
    category: "parking",
    calculationType: "case_to_case",
    defaultAmount: 500,
    isTaxableGST: true,
    isActive: true
  },
  {
    id: "head-06",
    societyId: "soc-001",
    name: "Non-Occupancy Charges (10% of Service Charges)",
    category: "non_occupancy",
    calculationType: "case_to_case",
    defaultAmount: 350,
    isTaxableGST: true,
    isActive: true
  },
  {
    id: "head-07",
    societyId: "soc-001",
    name: "Security & Surveillance Apparatus Fee",
    category: "security",
    calculationType: "fixed_per_flat",
    defaultAmount: 350,
    isTaxableGST: true,
    isActive: true
  },
  {
    id: "head-08",
    societyId: "soc-001",
    name: "Lift Maintenance & AMC Charges",
    category: "lift",
    calculationType: "fixed_per_flat",
    defaultAmount: 300,
    isTaxableGST: true,
    isActive: true
  }
];

export const INITIAL_BILLS: MaintenanceBill[] = [
  {
    id: "bill-2026-04-101",
    billNumber: "MB-2026/04/001",
    societyId: "soc-001",
    societyName: "Gokuldham Heights CHS Ltd",
    flatId: "flat-101",
    flatNumber: "A-101",
    wingName: "Wing A",
    memberId: "mem-001",
    memberName: "Amrut Shinde",
    memberEmail: "businesssoftsolutions@gmail.com",
    memberPhone: "+91 98201 23456",
    memberType: "owner",
    billDate: "2026-04-01",
    dueDate: "2026-04-15",
    billingPeriod: "April 2026",
    items: [
      { headId: "head-01", headName: "Regular Maintenance (2BHK)", rateOrBasis: "Fixed Rate", amount: 2200 },
      { headId: "head-02", headName: "Repair & Maintenance Fund", rateOrBasis: "950 sq.ft @ ₹1.5/sqft", amount: 1425 },
      { headId: "head-03", headName: "Sinking Fund (Non-taxable)", rateOrBasis: "950 sq.ft @ ₹0.75/sqft", amount: 712.5 },
      { headId: "head-04", headName: "Water Charges", rateOrBasis: "Fixed flat rate", amount: 450 },
      { headId: "head-05", headName: "4-Wheeler Parking (P-A101)", rateOrBasis: "1 Slot Allocated", amount: 500 },
      { headId: "head-07", headName: "Security & CCTV Surveillance", rateOrBasis: "Fixed flat rate", amount: 350 },
      { headId: "head-08", headName: "Lift AMC Charges", rateOrBasis: "Fixed flat rate", amount: 300 }
    ],
    currentChargesSubtotal: 5937.5,
    cgstAmount: 0, // below 7500 threshold
    sgstAmount: 0,
    totalCurrentCharges: 5937.5,
    principalArrears: 0,
    interestArrears: 0,
    currentBillInterest: 0,
    lateFeeCharge: 0,
    advanceAdjustment: 500,
    netPayableAmount: 5437.5,
    amountPaid: 5437.5,
    paymentStatus: "paid",
    previousReceiptNumber: "REC-2026/03/018",
    previousReceiptDate: "2026-03-08",
    previousReceiptAmount: 5437.5,
    narration: "Regular maintenance bill for April 2026 with advance adjusted.",
    isSupplementary: false,
    upiPaymentLink: "upi://pay?pa=gokuldham.society@sbi&pn=Gokuldham%20Heights%20CHS%20Ltd&am=5437.50&cu=INR&tn=MB-2026-04-001-A101",
    createdAt: "2026-04-01T08:00:00.000Z"
  },
  {
    id: "bill-2026-04-102",
    billNumber: "MB-2026/04/002",
    societyId: "soc-001",
    societyName: "Gokuldham Heights CHS Ltd",
    flatId: "flat-102",
    flatNumber: "A-102",
    wingName: "Wing A",
    memberId: "mem-002",
    memberName: "Rajeshwar Iyer (Tenant)",
    memberEmail: "rajeshwariyer@gmail.com",
    memberPhone: "+91 99304 88776",
    memberType: "tenant",
    billDate: "2026-04-01",
    dueDate: "2026-04-15",
    billingPeriod: "April 2026",
    items: [
      { headId: "head-01", headName: "Regular Maintenance (3BHK)", rateOrBasis: "Fixed Rate", amount: 3200 },
      { headId: "head-02", headName: "Repair & Maintenance Fund", rateOrBasis: "1400 sq.ft @ ₹1.5/sqft", amount: 2100 },
      { headId: "head-03", headName: "Sinking Fund (Non-taxable)", rateOrBasis: "1400 sq.ft @ ₹0.75/sqft", amount: 1050 },
      { headId: "head-04", headName: "Water Charges", rateOrBasis: "Fixed flat rate", amount: 450 },
      { headId: "head-05", headName: "4-Wheeler Parking (P-A102)", rateOrBasis: "1 Slot Allocated", amount: 500 },
      { headId: "head-06", headName: "Non-Occupancy Charges (10%)", rateOrBasis: "Tenant Flat Applicable", amount: 350 },
      { headId: "head-07", headName: "Security & CCTV Surveillance", rateOrBasis: "Fixed flat rate", amount: 350 },
      { headId: "head-08", headName: "Lift AMC Charges", rateOrBasis: "Fixed flat rate", amount: 300 }
    ],
    currentChargesSubtotal: 8300,
    cgstAmount: 652.5, // 9% on taxable 7250
    sgstAmount: 652.5,
    totalCurrentCharges: 9605,
    principalArrears: 4500,
    interestArrears: 380,
    currentBillInterest: 78.75, // 21% p.a. on 4500 for 1 month
    lateFeeCharge: 150,
    advanceAdjustment: 0,
    netPayableAmount: 14713.75,
    amountPaid: 0,
    paymentStatus: "unpaid",
    previousReceiptNumber: "REC-2026/02/094",
    previousReceiptDate: "2026-02-12",
    previousReceiptAmount: 8500,
    narration: "Includes Non-Occupancy & GST applicable above statutory limit + Overdue Interest @ 21% p.a.",
    isSupplementary: false,
    upiPaymentLink: "upi://pay?pa=gokuldham.society@sbi&pn=Gokuldham%20Heights%20CHS%20Ltd&am=14713.75&cu=INR&tn=MB-2026-04-002-A102",
    createdAt: "2026-04-01T08:00:00.000Z"
  },
  {
    id: "bill-2026-04-202",
    billNumber: "MB-2026/04/003",
    societyId: "soc-001",
    societyName: "Gokuldham Heights CHS Ltd",
    flatId: "flat-202",
    flatNumber: "A-202",
    wingName: "Wing A",
    memberId: "mem-004",
    memberName: "Dr. Ananya Sengupta",
    memberEmail: "dr.ananya@medicare.in",
    memberPhone: "+91 97690 12890",
    memberType: "owner",
    billDate: "2026-04-01",
    dueDate: "2026-04-15",
    billingPeriod: "April 2026",
    items: [
      { headId: "head-01", headName: "Regular Maintenance (Penthouse)", rateOrBasis: "Fixed Rate", amount: 5500 },
      { headId: "head-02", headName: "Repair & Maintenance Fund", rateOrBasis: "2350 sq.ft @ ₹1.5/sqft", amount: 3525 },
      { headId: "head-03", headName: "Sinking Fund", rateOrBasis: "2350 sq.ft @ ₹0.75/sqft", amount: 1762.5 },
      { headId: "head-04", headName: "Water Charges", rateOrBasis: "Fixed flat rate", amount: 450 },
      { headId: "head-05", headName: "Covered Double Parking", rateOrBasis: "2 Slots Allocated", amount: 1000 },
      { headId: "head-07", headName: "Security & CCTV Surveillance", rateOrBasis: "Fixed flat rate", amount: 350 },
      { headId: "head-08", headName: "Lift AMC Charges", rateOrBasis: "Fixed flat rate", amount: 300 }
    ],
    currentChargesSubtotal: 12887.5,
    cgstAmount: 990,
    sgstAmount: 990,
    totalCurrentCharges: 14867.5,
    principalArrears: 0,
    interestArrears: 0,
    currentBillInterest: 0,
    lateFeeCharge: 0,
    advanceAdjustment: 1200,
    netPayableAmount: 13667.5,
    amountPaid: 0,
    paymentStatus: "unpaid",
    narration: "Penthouse April 2026 maintenance bill with double parking and advance credited.",
    isSupplementary: false,
    upiPaymentLink: "upi://pay?pa=gokuldham.society@sbi&pn=Gokuldham%20Heights%20CHS%20Ltd&am=13667.50&cu=INR&tn=MB-2026-04-003-A202",
    createdAt: "2026-04-01T08:00:00.000Z"
  }
];

export const INITIAL_RECEIPTS: PaymentReceipt[] = [
  {
    id: "rec-001",
    receiptNumber: "REC-2026/04/001",
    societyId: "soc-001",
    billId: "bill-2026-04-101",
    billNumber: "MB-2026/04/001",
    flatId: "flat-101",
    flatNumber: "A-101",
    memberId: "mem-001",
    memberName: "Amrut Shinde",
    receiptDate: "2026-04-05",
    paymentMode: "UPI",
    referenceTransactionNo: "UPI/260405118942/YESB",
    bankName: "State Bank of India",
    totalAmountReceived: 5437.5,
    allocatedToInterest: 0,
    allocatedToPrincipal: 5437.5,
    allocatedToAdvance: 0,
    reconciledWithBank: true,
    bankReconciliationDate: "2026-04-06",
    status: "cleared",
    remarks: "Paid via Google Pay QR scan. Auto-reconciled.",
    createdAt: "2026-04-05T14:30:00.000Z"
  },
  {
    id: "rec-002",
    receiptNumber: "REC-2026/03/018",
    societyId: "soc-001",
    flatId: "flat-101",
    flatNumber: "A-101",
    memberId: "mem-001",
    memberName: "Amrut Shinde",
    receiptDate: "2026-03-08",
    paymentMode: "NEFT_RTGS",
    referenceTransactionNo: "HDFCN2606781290",
    bankName: "HDFC Bank",
    totalAmountReceived: 6000,
    allocatedToInterest: 0,
    allocatedToPrincipal: 5500,
    allocatedToAdvance: 500,
    reconciledWithBank: true,
    bankReconciliationDate: "2026-03-09",
    status: "cleared",
    remarks: "Advance ₹500 credited to member ledger for future bill.",
    createdAt: "2026-03-08T11:15:00.000Z"
  }
];

export const INITIAL_PDCS: PostDatedCheque[] = [
  {
    id: "pdc-01",
    societyId: "soc-001",
    memberId: "mem-002",
    memberName: "Rajeshwar Iyer",
    flatNumber: "A-102",
    chequeNumber: "000452",
    bankName: "ICICI Bank",
    branch: "Andheri West",
    chequeAmount: 14713.75,
    chequeDate: "2026-04-20",
    expectedDepositDate: "2026-04-20",
    status: "in_hand",
    remarks: "Post-dated cheque received for April overdue settlement."
  },
  {
    id: "pdc-02",
    societyId: "soc-001",
    memberId: "mem-005",
    memberName: "Ganesh Patel (Shop-01)",
    flatNumber: "Shop-01",
    chequeNumber: "449120",
    bankName: "Bank of Baroda",
    branch: "Goregaon Station",
    chequeAmount: 7830,
    chequeDate: "2026-04-25",
    expectedDepositDate: "2026-04-25",
    status: "in_hand",
    remarks: "Shop commercial maintenance quarterly installment."
  }
];

export const INITIAL_BANK_RECONCILIATION: BankReconciliationItem[] = [
  {
    id: "bank-rec-01",
    societyId: "soc-001",
    statementDate: "2026-04-05",
    description: "UPI-YESB-260405118942-AMRUT SHINDE",
    creditAmount: 5437.5,
    debitAmount: 0,
    matchedReceiptId: "rec-001",
    isReconciled: true,
    reconciledAt: "2026-04-06T10:00:00.000Z"
  },
  {
    id: "bank-rec-02",
    societyId: "soc-001",
    statementDate: "2026-04-07",
    description: "NEFT-AXISP889912001-VIKRAMADITYA RAO",
    creditAmount: 5850.0,
    debitAmount: 0,
    isReconciled: false
  },
  {
    id: "bank-rec-03",
    societyId: "soc-001",
    statementDate: "2026-04-08",
    description: "CHQ CLG 001928-OTIS ELEVATOR AMC",
    creditAmount: 0,
    debitAmount: 18500.0,
    isReconciled: true,
    reconciledAt: "2026-04-08T16:00:00.000Z"
  }
];

export const INITIAL_STAFF_MEMBERS: SocietyStaffMember[] = [
  {
    id: "staff-01",
    name: "Rajesh Kumar",
    role: "Chief Electrician & DG Operator",
    phone: "+91 98200 44111",
    specialization: ["electrical", "elevator", "amenity_defect"],
    available: true
  },
  {
    id: "staff-02",
    name: "Santosh Patil",
    role: "Lead Society Plumber & Pump Tech",
    phone: "+91 98200 44222",
    specialization: ["plumbing", "civil_seepage"],
    available: true
  },
  {
    id: "staff-03",
    name: "Anita More",
    role: "Housekeeping & Waste Supervisor",
    phone: "+91 98200 44333",
    specialization: ["housekeeping", "other"],
    available: true
  },
  {
    id: "staff-04",
    name: "Bahadur Singh",
    role: "Head Security Supervisor",
    phone: "+91 98920 33445",
    specialization: ["security", "noise_nuisance"],
    available: true
  },
  {
    id: "staff-05",
    name: "Ramesh Yadav",
    role: "Civil & Lift Maintenance Engineer (Otis Vendor)",
    phone: "+91 98200 44555",
    specialization: ["elevator", "civil_seepage", "carpentry"],
    available: true
  }
];

export const INITIAL_COMPLAINTS: ComplaintTicket[] = [
  {
    id: "tkt-001",
    societyId: "soc-001",
    ticketNumber: "TKT-2026-0041",
    flatNumber: "A-101",
    wingName: "Wing A",
    memberId: "mem-001",
    memberName: "Amrut Shinde",
    memberPhone: "+91 98201 23456",
    memberEmail: "businesssoftsolutions@gmail.com",
    category: "plumbing",
    priority: "high",
    title: "Master Bathroom Geyser Pipe Valve Leakage & Low Pressure",
    description: "In the master bedroom attached toilet, the inlet pipe of the water heater is leaking continuously, causing dampness in the false ceiling wall. Water supply pressure has dropped significantly.",
    status: "in_progress",
    preferredVisitTime: "Morning (09:00 AM - 12:00 PM)",
    assignedStaffName: "Santosh Patil",
    assignedStaffRole: "Lead Society Plumber & Pump Tech",
    assignedStaffPhone: "+91 98200 44222",
    assignedAt: "2026-04-09T09:30:00.000Z",
    slaHours: 24,
    targetResolutionDate: "2026-04-10T12:00:00.000Z",
    attachments: [
      {
        id: "att-01",
        name: "geyser_pipe_leak.jpg",
        type: "image",
        url: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=80",
        size: "2.4 MB",
        uploadedAt: "2026-04-09T08:15:00.000Z"
      }
    ],
    timeline: [
      {
        id: "tl-01",
        timestamp: "2026-04-09T08:15:00.000Z",
        action: "Ticket Created",
        performedBy: "Amrut Shinde",
        role: "resident",
        notes: "Ticket raised via Resident Self-Service Portal.",
        notificationSent: "SMS & In-App alert sent to Society Maintenance Desk"
      },
      {
        id: "tl-02",
        timestamp: "2026-04-09T09:30:00.000Z",
        action: "Staff Assigned",
        performedBy: "Bhide Secretary",
        role: "society_admin",
        notes: "Assigned to Santosh Patil (Plumber) with High Priority SLA of 24h.",
        notificationSent: "WhatsApp notification dispatched to resident (+91 98201 23456)"
      },
      {
        id: "tl-03",
        timestamp: "2026-04-09T11:00:00.000Z",
        action: "Work Started",
        performedBy: "Santosh Patil",
        role: "staff",
        notes: "Inspected site. Washer replacement & Teflon tape required for 0.5 inch angle valve. Parts fetched from society store.",
        notificationSent: "Status updated to In Progress"
      }
    ],
    createdAt: "2026-04-09T08:15:00.000Z",
    updatedAt: "2026-04-09T11:00:00.000Z"
  },
  {
    id: "tkt-002",
    societyId: "soc-001",
    ticketNumber: "TKT-2026-0042",
    flatNumber: "A-202",
    wingName: "Wing A",
    memberId: "mem-003",
    memberName: "Dr. Ananya Sengupta",
    memberPhone: "+91 98203 45678",
    memberEmail: "ananya.sengupta@society.in",
    category: "elevator",
    priority: "emergency",
    title: "Passenger Lift #2 Jerking & Floor Level Disalignment at 2nd Floor",
    description: "Lift #2 makes a strange screeching noise and stops 2 inches below floor level on floor 2. High risk of tripping for elderly residents.",
    status: "assigned",
    preferredVisitTime: "Immediate / Any time",
    assignedStaffName: "Ramesh Yadav",
    assignedStaffRole: "Civil & Lift Maintenance Engineer (Otis Vendor)",
    assignedStaffPhone: "+91 98200 44555",
    assignedAt: "2026-04-10T10:15:00.000Z",
    slaHours: 4,
    targetResolutionDate: "2026-04-10T14:15:00.000Z",
    attachments: [
      {
        id: "att-02",
        name: "lift_level_gap.jpg",
        type: "image",
        url: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=80",
        size: "1.8 MB",
        uploadedAt: "2026-04-10T10:00:00.000Z"
      }
    ],
    timeline: [
      {
        id: "tl-04",
        timestamp: "2026-04-10T10:00:00.000Z",
        action: "Ticket Created",
        performedBy: "Dr. Ananya Sengupta",
        role: "resident",
        notes: "Marked as Emergency / Urgent safety hazard.",
        notificationSent: "Emergency SMS sent to Managing Committee & Lift Vendor"
      },
      {
        id: "tl-05",
        timestamp: "2026-04-10T10:15:00.000Z",
        action: "Staff Assigned",
        performedBy: "Bhide Secretary",
        role: "society_admin",
        notes: "Otis technician Ramesh Yadav dispatched with 4-hour Emergency SLA.",
        notificationSent: "Automated alert sent to Resident"
      }
    ],
    createdAt: "2026-04-10T10:00:00.000Z",
    updatedAt: "2026-04-10T10:15:00.000Z"
  },
  {
    id: "tkt-003",
    societyId: "soc-001",
    ticketNumber: "TKT-2026-0039",
    flatNumber: "A-102",
    wingName: "Wing A",
    memberId: "mem-002",
    memberName: "Rajeshwar Iyer",
    memberPhone: "+91 98202 34567",
    memberEmail: "rajeshwar.iyer@society.in",
    category: "electrical",
    priority: "medium",
    title: "Corridor Light Sensor Flickering in Wing A 1st Floor",
    description: "The automated motion sensor light outside Flat 101/102 is rapidly flickering at night. Needs replacement or sensor reset.",
    status: "resolved",
    preferredVisitTime: "Evening (04:00 PM - 07:00 PM)",
    assignedStaffName: "Rajesh Kumar",
    assignedStaffRole: "Chief Electrician & DG Operator",
    assignedStaffPhone: "+91 98200 44111",
    assignedAt: "2026-04-07T14:00:00.000Z",
    slaHours: 48,
    resolvedAt: "2026-04-08T16:30:00.000Z",
    resolutionNotes: "Replaced 18W Philips LED driver and cleaned microwave sensor lens. Tested 100% functional.",
    residentRating: 5,
    residentFeedback: "Fast prompt service by Rajesh Kumar. Fully resolved same day!",
    attachments: [],
    timeline: [
      {
        id: "tl-06",
        timestamp: "2026-04-07T11:20:00.000Z",
        action: "Ticket Created",
        performedBy: "Rajeshwar Iyer",
        role: "resident"
      },
      {
        id: "tl-07",
        timestamp: "2026-04-08T16:30:00.000Z",
        action: "Ticket Resolved",
        performedBy: "Rajesh Kumar",
        role: "staff",
        notes: "Driver replaced and sensor recalibrated.",
        notificationSent: "WhatsApp resolution notification sent to resident"
      }
    ],
    createdAt: "2026-04-07T11:20:00.000Z",
    updatedAt: "2026-04-08T16:30:00.000Z"
  },
  {
    id: "tkt-004",
    societyId: "soc-001",
    ticketNumber: "TKT-2026-0043",
    flatNumber: "A-101",
    wingName: "Wing A",
    memberId: "mem-001",
    memberName: "Amrut Shinde",
    memberPhone: "+91 98201 23456",
    memberEmail: "businesssoftsolutions@gmail.com",
    category: "security",
    priority: "low",
    title: "Visitor Intercom Audio Static at Security Main Gate",
    description: "When the security guard calls from the gate intercom, there is slight crackling noise on the receiver hand-set.",
    status: "open",
    preferredVisitTime: "Weekend Morning",
    slaHours: 72,
    attachments: [],
    timeline: [
      {
        id: "tl-08",
        timestamp: "2026-04-10T14:00:00.000Z",
        action: "Ticket Created",
        performedBy: "Amrut Shinde",
        role: "resident",
        notes: "Ticket logged. Awaiting admin assignment."
      }
    ],
    createdAt: "2026-04-10T14:00:00.000Z",
    updatedAt: "2026-04-10T14:00:00.000Z"
  }
];

export const INITIAL_VISITORS: VisitorLog[] = [
  {
    id: "vis-001",
    societyId: "soc-001",
    flatNumber: "A-101",
    wingName: "Wing A",
    visitorName: "Sunil Verma",
    visitorPhone: "+91 98700 44332",
    phone: "+91 98700 44332",
    visitorType: "guest",
    type: "guest",
    purpose: "Family visit & dinner gathering",
    numberOfPersons: 2,
    expectedDate: "2026-04-10",
    expectedTimeSlot: "06:00 PM - 10:00 PM",
    entryTimestamp: "2026-04-10T18:45:00.000Z",
    checkInTime: "2026-04-10T18:45:00.000Z",
    status: "inside",
    gatePassOtp: "784192",
    passCode: "784192",
    approvedByResident: true,
    approvedByResidentName: "Amrut Shinde",
    residentNotifiedEntry: true,
    entryGate: "Main Gate 1",
    guardName: "Bahadur Singh",
    createdAt: "2026-04-10T16:00:00.000Z"
  },
  {
    id: "vis-002",
    societyId: "soc-001",
    flatNumber: "A-102",
    wingName: "Wing A",
    visitorName: "Amazon Delivery Agent (Ramesh)",
    visitorPhone: "+91 97655 12009",
    phone: "+91 97655 12009",
    visitorType: "delivery",
    type: "delivery",
    purpose: "Parcel delivery (Amazon Order #402-88)",
    companyName: "Amazon India",
    vehicleNumber: "MH-02-BQ-3321",
    numberOfPersons: 1,
    entryTimestamp: "2026-04-10T19:10:00.000Z",
    checkInTime: "2026-04-10T19:10:00.000Z",
    exitTimestamp: "2026-04-10T19:24:00.000Z",
    checkOutTime: "2026-04-10T19:24:00.000Z",
    status: "checked_out",
    gatePassOtp: "331980",
    passCode: "331980",
    approvedByResident: true,
    approvedByResidentName: "Rajeshwar Iyer",
    residentNotifiedEntry: true,
    residentNotifiedExit: true,
    entryGate: "Main Gate 1",
    exitGate: "Main Gate 1",
    guardName: "Bahadur Singh",
    createdAt: "2026-04-10T19:10:00.000Z"
  },
  {
    id: "vis-003",
    societyId: "soc-001",
    flatNumber: "A-202",
    wingName: "Wing A",
    visitorName: "Urban Company AC Service (Pradeep)",
    visitorPhone: "+91 99870 33211",
    phone: "+91 99870 33211",
    visitorType: "service_technician",
    type: "service",
    purpose: "Split AC filter cleaning & gas recharge",
    companyName: "Urban Company",
    vehicleNumber: "MH-03-CD-8910",
    numberOfPersons: 1,
    expectedDate: "2026-04-12",
    expectedTimeSlot: "10:00 AM - 01:00 PM",
    status: "pre_approved",
    gatePassOtp: "902451",
    passCode: "902451",
    approvedByResident: true,
    approvedByResidentName: "Dr. Ananya Sengupta",
    residentNotifiedEntry: false,
    entryGate: "Service Gate 2",
    guardName: "Bahadur Singh",
    createdAt: "2026-04-10T20:00:00.000Z"
  }
];

export const INITIAL_AMENITIES: Amenity[] = [
  {
    id: "amenity-01",
    societyId: "soc-001",
    name: "Clubhouse Grand Banquet Hall",
    description: "Air-conditioned 120-capacity hall with acoustic sound system, buffet tables, mood lighting & high-res ceiling projector.",
    capacity: 120,
    hourlyRate: 1500,
    dailyRate: 12000,
    securityDeposit: 5000,
    category: "community_hall",
    operationalHours: { open: "08:00", close: "23:30" },
    availableTimeSlots: [
      "09:00 AM - 01:00 PM (Morning Slot)",
      "02:00 PM - 06:00 PM (Afternoon Slot)",
      "07:00 PM - 11:30 PM (Evening Party Slot)",
      "Full Day (09:00 AM - 11:30 PM)"
    ],
    bookingRules: {
      maxDurationHours: 8,
      minLeadTimeHours: 24,
      maxBookingsPerMonthPerFlat: 2,
      requiresAdminApproval: true,
      cancellationCutoffHours: 48
    },
    rules: [
      "Strict Rule: No loud DJ music after 10:00 PM per city police noise regulations.",
      "Catering cleaning must be completed within 1 hour of slot finish.",
      "Full security deposit of ₹5,000 refunded within 48h after zero-damage physical inspection.",
      "Alcohol consumption requires valid state one-day event permit."
    ],
    imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=80",
    isActive: true
  },
  {
    id: "amenity-02",
    societyId: "soc-001",
    name: "Olympic Size Swimming Pool",
    description: "Ozone filter-treated temperature regulated pool with certified lifeguard, kids splash zone, and sun loungers.",
    capacity: 25,
    hourlyRate: 100,
    dailyRate: 0,
    securityDeposit: 0,
    category: "wellness",
    operationalHours: { open: "06:00", close: "21:00" },
    availableTimeSlots: [
      "06:00 AM - 08:00 AM (Adults Lap Fitness)",
      "08:00 AM - 10:00 AM (Ladies Only Session)",
      "04:00 PM - 06:00 PM (Kids Coaching & Beginners)",
      "06:00 PM - 08:30 PM (Open General Swimming)"
    ],
    bookingRules: {
      maxDurationHours: 2,
      minLeadTimeHours: 1,
      maxBookingsPerMonthPerFlat: 15,
      requiresAdminApproval: false,
      cancellationCutoffHours: 2
    },
    rules: [
      "Proper Nylon / Lycra swimwear is mandatory before stepping into water.",
      "Mandatory shower required before entering the pool.",
      "Children under 12 must be accompanied by an adult guardian at all times."
    ],
    imageUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&auto=format&fit=crop&q=80",
    isActive: true
  },
  {
    id: "amenity-03",
    societyId: "soc-001",
    name: "Floodlit Tennis & Pickleball Court",
    description: "Synthetic cushioned hard court with high-lumen anti-glare LED floodlights, umpire chair, and ball machine.",
    capacity: 4,
    hourlyRate: 250,
    dailyRate: 0,
    securityDeposit: 500,
    category: "sports",
    operationalHours: { open: "06:00", close: "22:00" },
    availableTimeSlots: [
      "06:00 AM - 07:00 AM (Morning Slot 1)",
      "07:00 AM - 08:00 AM (Morning Slot 2)",
      "06:00 PM - 07:00 PM (Evening Floodlit 1)",
      "07:00 PM - 08:00 PM (Evening Floodlit 2)",
      "08:00 PM - 09:00 PM (Evening Floodlit 3)",
      "09:00 PM - 10:00 PM (Evening Floodlit 4)"
    ],
    bookingRules: {
      maxDurationHours: 2,
      minLeadTimeHours: 2,
      maxBookingsPerMonthPerFlat: 8,
      requiresAdminApproval: false,
      cancellationCutoffHours: 6
    },
    rules: [
      "Non-marking rubber court shoes strictly required.",
      "Maximum 4 players on court simultaneously.",
      "Please switch off floodlights on departure if next slot is unoccupied."
    ],
    imageUrl: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80",
    isActive: true
  },
  {
    id: "amenity-04",
    societyId: "soc-001",
    name: "Indoor Badminton & Squash Arena",
    description: "Double wooden flooring badminton court with air cooling, digital scoreboard, and spectator gallery.",
    capacity: 6,
    hourlyRate: 200,
    dailyRate: 0,
    securityDeposit: 300,
    category: "sports",
    operationalHours: { open: "06:00", close: "22:00" },
    availableTimeSlots: [
      "06:00 AM - 07:30 AM",
      "07:30 AM - 09:00 AM",
      "05:00 PM - 06:30 PM",
      "06:30 PM - 08:00 PM",
      "08:00 PM - 09:30 PM"
    ],
    bookingRules: {
      maxDurationHours: 1.5,
      minLeadTimeHours: 3,
      maxBookingsPerMonthPerFlat: 10,
      requiresAdminApproval: false,
      cancellationCutoffHours: 4
    },
    rules: [
      "Only gum-sole or non-marking sports shoes allowed on wooden surface.",
      "Rackets & shuttlecocks must be brought by members."
    ],
    imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
    isActive: true
  }
];

export const INITIAL_BOOKINGS: AmenityBooking[] = [
  {
    id: "book-001",
    societyId: "soc-001",
    amenityId: "amenity-01",
    amenityName: "Clubhouse Grand Banquet Hall",
    memberId: "mem-001",
    memberName: "Amrut Shinde",
    flatNumber: "A-101",
    memberPhone: "+91 98201 23456",
    bookingDate: "2026-05-02",
    timeSlot: "07:00 PM - 11:30 PM (Evening Party Slot)",
    durationHours: 4.5,
    numberOfGuests: 65,
    totalRentAmount: 6750,
    totalCharge: 6750,
    depositAmount: 5000,
    paymentStatus: "paid",
    bookingStatus: "confirmed",
    status: "confirmed",
    bookingCode: "AMN-84219",
    purpose: "10th Wedding Anniversary & Family Get-Together",
    transactionRef: "UPI/AMENITY/260502/YESB4910",
    paymentMode: "UPI",
    confirmationNotificationSent: true,
    notificationChannel: "both",
    approvedBy: "Bhide Secretary",
    approvedAt: "2026-04-08T16:00:00.000Z",
    createdAt: "2026-04-08T15:20:00.000Z"
  },
  {
    id: "book-002",
    societyId: "soc-001",
    amenityId: "amenity-03",
    amenityName: "Floodlit Tennis & Pickleball Court",
    memberId: "mem-002",
    memberName: "Rajeshwar Iyer",
    flatNumber: "A-102",
    memberPhone: "+91 98202 34567",
    bookingDate: "2026-04-15",
    timeSlot: "07:00 PM - 08:00 PM (Evening Floodlit 2)",
    durationHours: 1,
    numberOfGuests: 2,
    totalRentAmount: 250,
    totalCharge: 250,
    depositAmount: 500,
    paymentStatus: "paid",
    bookingStatus: "confirmed",
    status: "confirmed",
    bookingCode: "AMN-99103",
    purpose: "Evening Tennis Singles Match",
    transactionRef: "UPI/AMENITY/260415/HDFC8819",
    paymentMode: "UPI",
    confirmationNotificationSent: true,
    notificationChannel: "whatsapp",
    createdAt: "2026-04-10T12:00:00.000Z"
  }
];

export const INITIAL_VERSION_RELEASES: SystemVersionRelease[] = [
  {
    id: "rel-001",
    versionNumber: "v2.8.4-TallyPrimeLive",
    title: "GST 18% Statutory Split & FIFO Receipts Engine",
    description: "Standardized Co-operative Housing Society billing engine with interest-before-principal validation and direct Tally XML export format.",
    status: "approved_and_live",
    requestedByRole: "System Architect",
    requestedByEmail: "architect@societyprime.in",
    requestedAt: "2026-03-20T10:00:00.000Z",
    createdAt: "2026-03-20T10:00:00.000Z",
    reviewedBySuperAdminEmail: "superadmin@societyprime.in",
    reviewedAt: "2026-03-21T11:00:00.000Z",
    changesPayload: {
      featureCategory: "statutory_rules",
      details: "Enables automated RWA GST thresholds (₹7,500/month exemption), 21% p.a. compounding late interest on due dates, and FIFO ledger adjustments.",
      effectiveDate: "2026-04-01"
    }
  },
  {
    id: "rel-002",
    versionNumber: "v2.9.0-WhatsAppGateway",
    title: "Instant WhatsApp Maintenance Invoices & Form J Export Patch",
    description: "Automated WhatsApp API billing reminders with QR deep links + Statutory Form 'J' Register of Members compliant with State Co-operative Societies Act.",
    status: "pending_super_admin_approval",
    requestedByRole: "Society Secretary (Gokuldham Heights)",
    requestedByEmail: "secretary@gokuldhamheights.org",
    requestedAt: "2026-04-09T14:30:00.000Z",
    createdAt: "2026-04-09T14:30:00.000Z",
    changesPayload: {
      featureCategory: "billing_schema",
      details: "Adds WhatsApp direct dispatch queue with dynamic UPI payment QR attachments and 1-click Form J Excel/PDF downloads.",
      effectiveDate: "2026-05-01"
    }
  }
];

export const INITIAL_AUDIT_LOGS: SystemAuditLog[] = [
  {
    id: "log-001",
    societyId: "soc-001",
    userEmail: "secretary@gokuldhamheights.org",
    userRole: "society_admin",
    action: "BULK_BILLS_GENERATED",
    module: "BILLING",
    details: "Generated 5 maintenance bills for April 2026 totaling ₹28,910.00 with interest & arrears.",
    timestamp: "2026-04-01T08:05:00.000Z"
  },
  {
    id: "log-002",
    societyId: "soc-001",
    userEmail: "businesssoftsolutions@gmail.com",
    userRole: "resident",
    action: "UPI_PAYMENT_SUCCESS",
    module: "COLLECTIONS",
    details: "Received ₹5,437.50 for Bill MB-2026/04/001 (Flat A-101) via UPI.",
    timestamp: "2026-04-05T14:31:00.000Z"
  },
  {
    id: "log-003",
    userEmail: "superadmin@societyprime.in",
    userRole: "super_admin",
    action: "SUBSCRIPTION_PROMO_EXTENDED",
    module: "SUPER_ADMIN",
    details: "Activated 1st Month Free Promotional Tier for new society registration 'Gokuldham Heights CHS'.",
    timestamp: "2026-01-15T09:05:00.000Z"
  }
];

export const INITIAL_NOTICES = [
  {
    id: "not-001",
    societyId: "soc-001",
    title: "Annual General Body Meeting (AGM) Notice 2026-27",
    category: "agm" as const,
    content: "All bona-fide members are requested to attend the AGM on Sunday, 26th April at 10:30 AM in the Clubhouse Banquet Hall. Agenda includes audited balance sheet approval and committee elections.",
    publishedAt: "2026-04-05T10:00:00.000Z",
    isUrgent: false,
    authorName: "Managing Committee"
  },
  {
    id: "not-002",
    societyId: "soc-001",
    title: "Scheduled Overhead Water Tank Cleaning",
    category: "maintenance" as const,
    content: "Please note that overhead water supply will be suspended on Tuesday from 10:00 AM to 04:00 PM for deep sanitization & cleaning.",
    publishedAt: "2026-04-08T09:00:00.000Z",
    isUrgent: true,
    authorName: "Secretary Office"
  }
];

export const DEMO_USERS: (UserProfile & { password?: string })[] = [
  {
    id: "usr-superadmin",
    email: "businesssoftsolutions@gmail.com",
    fullName: "Super Admin (Business Soft Solutions)",
    name: "Super Admin Director",
    phone: "+91 98765 00001",
    role: "super_admin",
    isEmailVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    createdAt: "2026-01-01T00:00:00.000Z",
    password: "ADmin@#123"
  },
  {
    id: "usr-secretary",
    email: "secretary@gokuldhamheights.org",
    fullName: "Aatmaram Bhide (Society Secretary & Admin)",
    name: "Aatmaram Bhide",
    phone: "+91 98200 11223",
    role: "society_admin",
    societyId: "soc-001",
    isEmailVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    createdAt: "2026-01-15T09:00:00.000Z",
    password: "Admin@123"
  },
  {
    id: "usr-resident",
    email: "resident@gokuldhamheights.org",
    fullName: "Jethalal Gada (Resident Flat A-101)",
    name: "Jethalal Gada",
    phone: "+91 98201 23456",
    role: "resident",
    societyId: "soc-001",
    flatId: "flat-101",
    flatNumber: "A-101",
    wing: "Wing A",
    isEmailVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    createdAt: "2026-01-18T10:00:00.000Z",
    password: "Resident@123"
  },
  {
    id: "usr-security",
    email: "security.gate@gokuldhamheights.org",
    fullName: "Bahadur Singh (Head Gate Security)",
    name: "Bahadur Singh",
    phone: "+91 98920 33445",
    role: "security",
    societyId: "soc-001",
    isEmailVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
    createdAt: "2026-01-20T08:00:00.000Z",
    password: "Security@123"
  }
];

// Aliases for convenient importing
export const initialSocieties = INITIAL_SOCIETIES;
export const initialWings = INITIAL_WINGS;
export const initialFlats = INITIAL_FLATS;
export const initialMembers = INITIAL_MEMBERS;
export const initialChargeHeads = INITIAL_CHARGE_HEADS;
export const initialBills = INITIAL_BILLS;
export const initialReceipts = INITIAL_RECEIPTS;
export const initialAmenities = INITIAL_AMENITIES;
export const initialBookings = INITIAL_BOOKINGS;
export const initialVisitors = INITIAL_VISITORS;
export const initialComplaints = INITIAL_COMPLAINTS;
export const initialStaffMembers = INITIAL_STAFF_MEMBERS;
export const initialNotices = INITIAL_NOTICES;
export const initialReleases = INITIAL_VERSION_RELEASES;
export const initialSaaSSettings = INITIAL_SUPER_ADMIN_SETTINGS;
export const initialAuditLogs = INITIAL_AUDIT_LOGS;

