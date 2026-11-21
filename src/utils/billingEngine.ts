import { 
  SocietyConfig, 
  FlatShopConfig, 
  Member, 
  MaintenanceChargeHead, 
  MaintenanceBill, 
  PaymentReceipt 
} from '../types';
import * as XLSX from 'xlsx';

export function calculateMaintenanceBill(params: {
  society: SocietyConfig;
  flat: FlatShopConfig;
  member: Member;
  chargeHeads: MaintenanceChargeHead[];
  billDate: string;
  dueDate: string;
  billingPeriod: string;
  isSupplementary?: boolean;
  supplementaryItems?: Array<{ headName: string; amount: number; isTaxable?: boolean }>;
  narration?: string;
  billSequenceNumber: number;
}): MaintenanceBill {
  const { society, flat, member, chargeHeads, billDate, dueDate, billingPeriod, isSupplementary, supplementaryItems, narration, billSequenceNumber } = params;

  let items: Array<{ headId: string; headName: string; rateOrBasis: string; amount: number }> = [];
  let taxableSubtotal = 0;
  let nonTaxableSubtotal = 0;

  if (isSupplementary && supplementaryItems && supplementaryItems.length > 0) {
    supplementaryItems.forEach((sup, idx) => {
      items.push({
        headId: `sup-${idx}`,
        headName: sup.headName,
        rateOrBasis: 'Special Contribution Surcharge',
        amount: sup.amount
      });
      if (sup.isTaxable) {
        taxableSubtotal += sup.amount;
      } else {
        nonTaxableSubtotal += sup.amount;
      }
    });
  } else {
    // Regular Maintenance Calculation
    chargeHeads.filter(h => h.isActive).forEach(head => {
      let amount = 0;
      let basis = 'Standard Rate';

      if (head.calculationType === 'fixed_per_flat') {
        amount = head.defaultAmount;
        basis = 'Fixed Flat Rate';
      } else if (head.calculationType === 'per_sqft') {
        const area = flat.builtUpAreaSqFt || flat.carpetAreaSqFt || 1000;
        const rate = head.sqftRate || 1.5;
        amount = Math.round(area * rate * 100) / 100;
        basis = `${area} sq.ft @ ₹${rate}/sqft`;
      } else if (head.calculationType === 'flat_type_wise') {
        const typeRate = head.flatTypeRates ? head.flatTypeRates[flat.type] : head.defaultAmount;
        amount = typeRate || head.defaultAmount;
        basis = `${flat.type} Standard Tier`;
      } else if (head.calculationType === 'case_to_case') {
        if (head.category === 'parking') {
          const vehicleCount = member.vehicles.filter(v => v.type === '4_wheeler').length;
          if (vehicleCount > 0) {
            amount = head.defaultAmount * vehicleCount;
            basis = `${vehicleCount} Four-Wheeler Slot(s)`;
          } else {
            amount = 0;
            basis = 'No 4-Wheeler Slot';
          }
        } else if (head.category === 'non_occupancy') {
          if (flat.occupancyStatus === 'rented_tenant' || member.memberType === 'tenant') {
            // Statutory rule in Maharashtra / India: Non-occupancy charges cannot exceed 10% of standard service charges
            amount = head.defaultAmount || 350;
            basis = 'Rented Property (10% Non-Occupancy)';
          } else {
            amount = 0;
            basis = 'Owner Occupied (Exempt)';
          }
        }
      }

      if (amount > 0) {
        items.push({
          headId: head.id,
          headName: head.name,
          rateOrBasis: basis,
          amount
        });

        if (head.isTaxableGST) {
          taxableSubtotal += amount;
        } else {
          nonTaxableSubtotal += amount;
        }
      }
    });
  }

  const currentChargesSubtotal = taxableSubtotal + nonTaxableSubtotal;

  // GST Calculation (Threshold check: if monthly maintenance > threshold or GST strictly enabled on taxable heads)
  let cgstAmount = 0;
  let sgstAmount = 0;
  if (society.gstConfig.enabled) {
    if (currentChargesSubtotal > (society.gstConfig.thresholdPerMonth || 7500)) {
      cgstAmount = Math.round((taxableSubtotal * (society.gstConfig.cgstRate / 100)) * 100) / 100;
      sgstAmount = Math.round((taxableSubtotal * (society.gstConfig.sgstRate / 100)) * 100) / 100;
    }
  }

  const totalCurrentCharges = currentChargesSubtotal + cgstAmount + sgstAmount;

  // Interest calculation on opening principal arrears
  let currentBillInterest = 0;
  const principalArrears = flat.openingPrincipalArrears || 0;
  const interestArrears = flat.openingInterestArrears || 0;

  if (society.interestConfig.enabled && principalArrears > 0) {
    const annualRate = society.interestConfig.ratePercentPerAnnum || 21; // 21% p.a.
    // 1 month interest: (P * R) / 12
    currentBillInterest = Math.round(((principalArrears * (annualRate / 100)) / 12) * 100) / 100;
  }

  // Late fee charge calculation
  let lateFeeCharge = 0;
  if (society.lateFeeConfig.enabled && (principalArrears > 0 || interestArrears > 0)) {
    const isShop = flat.type === 'Commercial_Shop' || flat.type === 'Office';
    lateFeeCharge = isShop ? society.lateFeeConfig.shopRate : society.lateFeeConfig.flatRate;
  }

  // Advance adjustment
  const availableAdvance = flat.advanceBalance || 0;
  const grossPayable = totalCurrentCharges + principalArrears + interestArrears + currentBillInterest + lateFeeCharge;
  const advanceAdjustment = Math.min(availableAdvance, grossPayable);
  const netPayableAmount = Math.max(0, Math.round((grossPayable - advanceAdjustment) * 100) / 100);

  const billNumber = `MB-${billDate.slice(0, 7).replace('-', '/')}/${String(billSequenceNumber).padStart(3, '0')}`;
  
  // UPI QR String
  const upiId = society.upiId || 'societyprime.saas@icici';
  const payeeName = encodeURIComponent(society.upiPayeeName || society.name);
  const upiNote = encodeURIComponent(`${billNumber}-${flat.flatNumber}-${member.fullName}`);
  const upiPaymentLink = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${netPayableAmount.toFixed(2)}&cu=INR&tn=${upiNote}`;

  return {
    id: `bill-${Date.now()}-${flat.id}`,
    billNumber,
    societyId: society.id,
    societyName: society.name,
    flatId: flat.id,
    flatNumber: flat.flatNumber,
    wingName: flat.wingName,
    memberId: member.id,
    memberName: member.fullName,
    memberEmail: member.email,
    memberPhone: member.phone,
    memberType: member.memberType === 'tenant' ? 'tenant' : 'owner',
    billDate,
    dueDate,
    billingPeriod,
    items,
    currentChargesSubtotal,
    cgstAmount,
    sgstAmount,
    totalCurrentCharges,
    principalArrears,
    interestArrears,
    currentBillInterest,
    lateFeeCharge,
    advanceAdjustment,
    netPayableAmount,
    amountPaid: 0,
    paymentStatus: 'unpaid',
    narration: narration || `Society maintenance bill for ${billingPeriod}`,
    isSupplementary: !!isSupplementary,
    upiPaymentLink,
    createdAt: new Date().toISOString()
  };
}

/**
 * FIFO Receipt Allocation
 * Standard Indian Housing Society Accounting Rule:
 * 1. Interest Arrears is cleared FIRST.
 * 2. Principal Arrears & Current Principal is cleared SECOND.
 * 3. Any excess amount is credited to Advance Balance.
 */
export function allocateReceiptFIFO(params: {
  amountReceived: number;
  totalInterestOutstanding: number;
  totalPrincipalOutstanding: number;
}): {
  allocatedToInterest: number;
  allocatedToPrincipal: number;
  allocatedToAdvance: number;
} {
  const { amountReceived, totalInterestOutstanding, totalPrincipalOutstanding } = params;

  let remaining = amountReceived;
  
  // Step 1: Allocate to Interest
  const interestPortion = Math.min(remaining, Math.max(0, totalInterestOutstanding));
  remaining -= interestPortion;

  // Step 2: Allocate to Principal
  const principalPortion = Math.min(remaining, Math.max(0, totalPrincipalOutstanding));
  remaining -= principalPortion;

  // Step 3: Any leftover goes to Advance
  const advancePortion = Math.max(0, remaining);

  return {
    allocatedToInterest: Math.round(interestPortion * 100) / 100,
    allocatedToPrincipal: Math.round(principalPortion * 100) / 100,
    allocatedToAdvance: Math.round(advancePortion * 100) / 100
  };
}

export function allocateFIFOPayment(bill: MaintenanceBill | null, amountReceived: number) {
  if (!bill) {
    return {
      updatedBill: null,
      allocation: {
        interestSettled: 0,
        principalSettled: amountReceived,
        currentChargesSettled: 0
      },
      advanceExcess: 0
    };
  }

  let remaining = amountReceived;
  const interestDue = (bill.interestArrears || 0) + (bill.currentBillInterest || 0);
  const interestSettled = Math.min(remaining, interestDue);
  remaining -= interestSettled;

  const principalArrearsDue = bill.principalArrears || 0;
  const principalSettled = Math.min(remaining, principalArrearsDue);
  remaining -= principalSettled;

  const currentChargesDue = (bill.totalCurrentCharges || 0) + (bill.lateFeeCharge || 0);
  const currentChargesSettled = Math.min(remaining, currentChargesDue);
  remaining -= currentChargesSettled;

  const advanceExcess = Math.max(0, remaining);

  const totalBillPaid = (bill.amountPaid || 0) + (amountReceived - advanceExcess);
  const isPaid = totalBillPaid >= bill.netPayableAmount;

  const updatedBill: MaintenanceBill = {
    ...bill,
    amountPaid: Math.min(bill.netPayableAmount, totalBillPaid),
    paymentStatus: isPaid ? 'paid' : totalBillPaid > 0 ? 'partially_paid' : 'unpaid'
  };

  return {
    updatedBill,
    allocation: {
      interestSettled: Math.round(interestSettled * 100) / 100,
      principalSettled: Math.round(principalSettled * 100) / 100,
      currentChargesSettled: Math.round(currentChargesSettled * 100) / 100
    },
    advanceExcess: Math.round(advanceExcess * 100) / 100
  };
}

/**
 * Export data to Excel (.xlsx)
 */
export function exportToExcel(sheetData: Array<Record<string, any>>, fileName: string, sheetName: string = 'Sheet1') {
  const worksheet = XLSX.utils.json_to_sheet(sheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

/**
 * Export Housing Society Maintenance Bills to TallyPrime XML Format
 */
export function generateTallyPrimeXML(bills: MaintenanceBill[], society: SocietyConfig): string {
  const vouchersXml = bills.map(bill => `
    <TALLYMESSAGE xmlns:UDF="TallyUDF">
      <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Accounting Voucher View">
        <DATE>${bill.billDate.replace(/-/g, '')}</DATE>
        <VOUCHERTYPENAME>Maintenance Bill</VOUCHERTYPENAME>
        <VOUCHERNUMBER>${bill.billNumber}</VOUCHERNUMBER>
        <PARTYLEDGERNAME>${bill.memberName} (${bill.flatNumber})</PARTYLEDGERNAME>
        <NARRATION>${bill.narration || 'Society Maintenance Bill'} - ${society.name}</NARRATION>
        
        <!-- Member Ledger Debit -->
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>${bill.memberName} (${bill.flatNumber})</LEDGERNAME>
          <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
          <AMOUNT>-${bill.netPayableAmount.toFixed(2)}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>

        <!-- Society Maintenance Income Credit -->
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>Society Maintenance Charges Account</LEDGERNAME>
          <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
          <AMOUNT>${bill.currentChargesSubtotal.toFixed(2)}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>

        ${bill.currentBillInterest > 0 ? `
        <!-- Overdue Interest Income Credit -->
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>Interest On Delayed Maintenance Account</LEDGERNAME>
          <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
          <AMOUNT>${bill.currentBillInterest.toFixed(2)}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>` : ''}

        ${bill.cgstAmount > 0 ? `
        <!-- CGST Liability -->
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>Output CGST @ ${society.gstConfig.cgstRate}%</LEDGERNAME>
          <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
          <AMOUNT>${bill.cgstAmount.toFixed(2)}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>` : ''}

        ${bill.sgstAmount > 0 ? `
        <!-- SGST Liability -->
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>Output SGST @ ${society.gstConfig.sgstRate}%</LEDGERNAME>
          <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
          <AMOUNT>${bill.sgstAmount.toFixed(2)}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>` : ''}
      </VOUCHER>
    </TALLYMESSAGE>
  `).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${society.name}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        ${vouchersXml}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
}

export function formatINR(amount: number | undefined): string {
  if (amount === undefined || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}
