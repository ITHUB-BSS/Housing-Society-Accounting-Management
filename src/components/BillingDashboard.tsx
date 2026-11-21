import React, { useState } from 'react';
import { 
  Receipt, 
  Sparkles, 
  Printer, 
  CreditCard, 
  Download, 
  Search, 
  Filter, 
  Send, 
  FileCode, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { 
  MaintenanceBill, 
  SocietyConfig, 
  FlatShopConfig, 
  Member, 
  MaintenanceChargeHead, 
  Wing,
  UserProfile
} from '../types';
import { 
  calculateMaintenanceBill, 
  formatINR, 
  exportToExcel, 
  generateTallyPrimeXML 
} from '../utils/billingEngine';

interface BillingDashboardProps {
  society: SocietyConfig;
  bills: MaintenanceBill[];
  onUpdateBills: (bills: MaintenanceBill[]) => void;
  flats: FlatShopConfig[];
  members: Member[];
  chargeHeads: MaintenanceChargeHead[];
  wings: Wing[];
  currentUser: UserProfile;
  onOpenBillPrint: (bill: MaintenanceBill) => void;
  onOpenPaymentGateway: (bill: MaintenanceBill) => void;
  onSendReminder: (bill: MaintenanceBill, channel: 'email' | 'whatsapp') => void;
}

export const BillingDashboard: React.FC<BillingDashboardProps> = ({
  society,
  bills,
  onUpdateBills,
  flats,
  members,
  chargeHeads,
  wings,
  currentUser,
  onOpenBillPrint,
  onOpenPaymentGateway,
  onSendReminder
}) => {
  const isResident = currentUser.role === 'resident';

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [wingFilter, setWingFilter] = useState<string>('all');

  // Bulk Generation Modal
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkPeriodicity, setBulkPeriodicity] = useState<'monthly' | 'bi_monthly' | 'quarterly' | 'half_yearly' | 'yearly'>('monthly');
  const [bulkScope, setBulkScope] = useState<'all' | 'wing' | 'flat'>('all');
  const [selectedWingId, setSelectedWingId] = useState<string>(wings?.[0]?.id || '');
  const [selectedFlatId, setSelectedFlatId] = useState<string>(flats?.[0]?.id || '');
  const [bulkBillDate, setBulkBillDate] = useState(new Date().toISOString().slice(0, 10));
  const [bulkDueDate, setBulkDueDate] = useState(
    new Date(Date.now() + (society?.defaultDueDays || 15) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [bulkBillingPeriod, setBulkBillingPeriod] = useState('May 2026');
  const [bulkNarration, setBulkNarration] = useState(`Regular society maintenance billing for May 2026.`);

  // Supplementary Bill Modal
  const [suppModalOpen, setSuppModalOpen] = useState(false);
  const [suppFlatId, setSuppFlatId] = useState<string>(flats?.[0]?.id || '');
  const [suppTitle, setSuppTitle] = useState('Elevator Modernization & Surcharge Fund');
  const [suppAmount, setSuppAmount] = useState(2500);
  const [suppIsTaxable, setSuppIsTaxable] = useState(false);
  const [suppNarration, setSuppNarration] = useState('Supplementary contribution approved in AGM Resolution No. 4.');

  // Filtered Bills
  const filteredBills = bills.filter(b => {
    // If resident, only show their own flat
    if (isResident && currentUser.flatNumber && b.flatNumber !== currentUser.flatNumber) {
      return false;
    }

    const matchesSearch = 
      b.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.billNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ? true : b.paymentStatus === statusFilter;

    const matchesWing = 
      wingFilter === 'all' ? true : b.wingName.includes(wingFilter);

    return matchesSearch && matchesStatus && matchesWing;
  });

  // Calculate Metrics
  const totalBilled = filteredBills.reduce((acc, b) => acc + (b.netPayableAmount || 0), 0);
  const totalCollected = filteredBills.reduce((acc, b) => acc + (b.amountPaid || 0), 0);
  const totalOutstanding = Math.max(0, (totalBilled || 0) - (totalCollected || 0));

  // Execute Bulk Bill Generation
  const handleGenerateBulkBills = (e: React.FormEvent) => {
    e.preventDefault();

    let targetFlats = flats;
    if (bulkScope === 'wing') {
      const w = wings.find(x => x.id === selectedWingId);
      if (w) {
        const wingPrefix = (w.name || '').split(' ')?.[0] || '';
        targetFlats = flats.filter(f => f.wingId === w.id || (wingPrefix && f.wingName && f.wingName.includes(wingPrefix)));
      }
    } else if (bulkScope === 'flat') {
      targetFlats = flats.filter(f => f.id === selectedFlatId);
    }

    if (targetFlats.length === 0) {
      alert('No flats found matching selected scope.');
      return;
    }

    const generated: MaintenanceBill[] = [];
    let seq = bills.length + 1;

    targetFlats.forEach(flat => {
      // Find assigned member or use placeholder
      const mem = members.find(m => m.flatNumber === flat.flatNumber && !m.isSoldOrTransferred) || {
        id: `mem-auto-${flat.id}`,
        societyId: society.id,
        flatId: flat.id,
        flatNumber: flat.flatNumber,
        wingName: flat.wingName,
        memberType: flat.occupancyStatus === 'rented_tenant' ? 'tenant' : 'owner',
        fullName: `Member (${flat.flatNumber})`,
        email: `member.${flat.flatNumber.toLowerCase()}@society.in`,
        phone: '+91 98000 00000',
        vehicles: [],
        familyMembers: [],
        documents: [],
        createdAt: new Date().toISOString()
      };

      const bill = calculateMaintenanceBill({
        society,
        flat,
        member: mem,
        chargeHeads,
        billDate: bulkBillDate,
        dueDate: bulkDueDate,
        billingPeriod: bulkBillingPeriod,
        narration: bulkNarration,
        billSequenceNumber: seq++
      });

      generated.push(bill);
    });

    onUpdateBills([...generated, ...bills]);
    setBulkModalOpen(false);
    alert(`Successfully generated ${generated.length} maintenance bills with UPI QR codes!`);
  };

  // Execute Supplementary Bill Generation
  const handleGenerateSupplementary = (e: React.FormEvent) => {
    e.preventDefault();
    const flat = flats.find(f => f.id === suppFlatId);
    if (!flat) return;

    const mem = members.find(m => m.flatNumber === flat.flatNumber) || members[0] || {
      id: `mem-supp-${flat.id}`,
      societyId: society.id,
      flatId: flat.id,
      flatNumber: flat.flatNumber,
      wingName: flat.wingName,
      memberType: 'owner',
      fullName: `Resident (${flat.flatNumber})`,
      email: `resident.${flat.flatNumber.toLowerCase()}@society.in`,
      phone: '+91 98000 00000',
      vehicles: [],
      familyMembers: [],
      documents: [],
      createdAt: new Date().toISOString()
    };
    const bill = calculateMaintenanceBill({
      society,
      flat,
      member: mem,
      chargeHeads: [],
      billDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      billingPeriod: `Special Surcharge - ${new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}`,
      isSupplementary: true,
      supplementaryItems: [{ headName: suppTitle, amount: Number(suppAmount), isTaxable: suppIsTaxable }],
      narration: suppNarration,
      billSequenceNumber: bills.length + 1
    });

    onUpdateBills([bill, ...bills]);
    setSuppModalOpen(false);
    alert(`Supplementary bill ${bill.billNumber} created successfully!`);
  };

  // Tally XML Download
  const handleDownloadTallyXML = () => {
    const xml = generateTallyPrimeXML(bills, society);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TallyPrime_Society_Vouchers_${society.name.slice(0, 15)}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Excel Export
  const handleExportBillsExcel = () => {
    const data = bills.map(b => ({
      "Bill No": b.billNumber,
      "Flat No": b.flatNumber,
      "Wing": b.wingName,
      "Member Name": b.memberName,
      "Bill Date": b.billDate,
      "Due Date": b.dueDate,
      "Billing Period": b.billingPeriod,
      "Current Charges": b.currentChargesSubtotal,
      "CGST (₹)": b.cgstAmount,
      "SGST (₹)": b.sgstAmount,
      "Principal Arrears": b.principalArrears,
      "Interest Arrears": b.interestArrears,
      "Current Bill Interest": b.currentBillInterest,
      "Late Penalty": b.lateFeeCharge,
      "Advance Credit": b.advanceAdjustment,
      "Net Payable (₹)": b.netPayableAmount,
      "Paid Amount (₹)": b.amountPaid,
      "Payment Status": b.paymentStatus.toUpperCase()
    }));
    exportToExcel(data, `Maintenance_Bills_Register_${society.name.slice(0, 15)}`, "BillsRegister");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md border border-blue-200">
              <Receipt className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Maintenance Invoicing & TallyPrime Export</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate periodic bills with interest & GST calculation, print society receipts with dynamic UPI QR, and export XML to TallyPrime.
          </p>
        </div>

        {/* Action Buttons (Restricted for residents) */}
        {!isResident && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadTallyXML}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 shadow-xs transition"
              title="Export XML format for TallyPrime Import"
            >
              <FileCode className="w-3.5 h-3.5 text-blue-600" />
              <span>Tally XML Export</span>
            </button>

            <button
              onClick={handleExportBillsExcel}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 border border-slate-200 transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel Export</span>
            </button>

            <button
              onClick={() => setSuppModalOpen(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 border border-slate-200 transition shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>Supplementary</span>
            </button>

            <button
              onClick={() => setBulkModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-md text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Bulk Generate</span>
            </button>
          </div>
        )}
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Total Billed Volume</div>
          <div className="text-2xl font-black text-slate-900">{formatINR(totalBilled)}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">{filteredBills.length} Invoices Active</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Collections Cleared</div>
          <div className="text-2xl font-black text-emerald-600">{formatINR(totalCollected)}</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">
            {filteredBills.filter(b => b.paymentStatus === 'paid').length} Bills Fully Settled
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Pending Overdue</div>
          <div className="text-2xl font-black text-rose-600">{formatINR(totalOutstanding)}</div>
          <div className="text-[11px] text-rose-700 mt-1 font-medium">
            {filteredBills.filter(b => b.paymentStatus === 'unpaid').length} Bills Awaiting Payment
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search bill number, flat, member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
          <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('unpaid')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                statusFilter === 'unpaid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unpaid ({bills.filter(b => b.paymentStatus === 'unpaid').length})
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                statusFilter === 'paid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paid ({bills.filter(b => b.paymentStatus === 'paid').length})
            </button>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Bill No. & Period</th>
                <th className="px-4 py-3">Flat & Member</th>
                <th className="px-4 py-3">Dates (Bill / Due)</th>
                <th className="px-4 py-3">Breakup (Current / Arrears / Int)</th>
                <th className="px-4 py-3">Net Payable</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-blue-600" />
                      {bill.billNumber}
                    </div>
                    <span className="text-[11px] text-slate-500 block">{bill.billingPeriod}</span>
                    {bill.isSupplementary && (
                      <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-bold px-1.5 rounded mt-0.5">
                        Supplementary
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-mono text-[11px]">
                        {bill.flatNumber}
                      </span>
                      {bill.memberName}
                    </div>
                    <span className="text-[11px] text-slate-400 block">{bill.wingName}</span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-slate-800 font-medium">{bill.billDate}</div>
                    <div className="text-[11px] text-rose-600 font-semibold">Due: {bill.dueDate}</div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-slate-700 font-medium">Current: {formatINR(bill.totalCurrentCharges)}</div>
                    {(bill.principalArrears > 0 || bill.currentBillInterest > 0) && (
                      <div className="text-[11px] text-rose-600 font-medium">
                        Arrears: {formatINR(bill.principalArrears)} | Int: {formatINR(bill.currentBillInterest)}
                      </div>
                    )}
                    {bill.advanceAdjustment > 0 && (
                      <div className="text-[11px] text-emerald-600 font-medium">
                        Adv Adj: -{formatINR(bill.advanceAdjustment)}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-mono text-sm font-bold text-slate-900">
                      {formatINR(bill.netPayableAmount)}
                    </div>
                    {bill.amountPaid > 0 && (
                      <span className="text-[10px] text-emerald-600 block font-semibold">
                        Paid: {formatINR(bill.amountPaid)}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {bill.paymentStatus === 'paid' ? (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3" /> Unpaid
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {bill.paymentStatus !== 'paid' && (
                        <button
                          onClick={() => onOpenPaymentGateway(bill)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded text-[11px] flex items-center gap-1 shadow-xs transition"
                          title="Pay via UPI / Card Gateway"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Pay</span>
                        </button>
                      )}

                      <button
                        onClick={() => onOpenBillPrint(bill)}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition shadow-xs"
                        title="Print Society Bill with UPI QR"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {!isResident && (
                        <button
                          onClick={() => onSendReminder(bill, 'whatsapp')}
                          className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition shadow-xs"
                          title="Send WhatsApp Reminder"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1-CLICK BULK BILL GENERATION MODAL */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md border border-blue-200">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">One-Click Bulk Maintenance Bill Generator</h3>
              </div>
              <button onClick={() => setBulkModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleGenerateBulkBills} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Periodicity</label>
                  <select
                    value={bulkPeriodicity}
                    onChange={(e) => setBulkPeriodicity(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="bi_monthly">Bi-Monthly (2 Months)</option>
                    <option value="quarterly">Quarterly (3 Months)</option>
                    <option value="half_yearly">Half-Yearly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Billing Scope</label>
                  <select
                    value={bulkScope}
                    onChange={(e) => setBulkScope(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="all">All Society Units ({flats.length} Flats)</option>
                    <option value="wing">Specific Wing</option>
                    <option value="flat">Single Individual Flat</option>
                  </select>
                </div>
              </div>

              {bulkScope === 'wing' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Wing</label>
                  <select
                    value={selectedWingId}
                    onChange={(e) => setSelectedWingId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    {wings.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {bulkScope === 'flat' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Flat Unit</label>
                  <select
                    value={selectedFlatId}
                    onChange={(e) => setSelectedFlatId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    {flats.map(f => (
                      <option key={f.id} value={f.id}>{f.flatNumber} ({f.wingName})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Bill Date</label>
                  <input
                    type="date"
                    required
                    value={bulkBillDate}
                    onChange={(e) => setBulkBillDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Due Date</label>
                  <input
                    type="date"
                    required
                    value={bulkDueDate}
                    onChange={(e) => setBulkDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Period Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. May 2026 / Q1 2026-27"
                  value={bulkBillingPeriod}
                  onChange={(e) => setBulkBillingPeriod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Common Narration on Bills</label>
                <textarea
                  rows={2}
                  value={bulkNarration}
                  onChange={(e) => setBulkNarration(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-800 flex items-center justify-between">
                <span>Auto-computes area-rates, GST, parking & overdue interest.</span>
                <strong className="text-slate-900 font-mono">
                  {bulkScope === 'all' ? `${flats.length} Bills` : bulkScope === 'wing' ? 'Wing Bills' : '1 Bill'}
                </strong>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBulkModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm"
                >
                  Generate All Bills Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPPLEMENTARY BILL MODAL */}
      {suppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-2xl p-6 space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Issue Supplementary Maintenance Bill</h3>
              <button onClick={() => setSuppModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleGenerateSupplementary} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Flat Unit</label>
                <select
                  value={suppFlatId}
                  onChange={(e) => setSuppFlatId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  {flats.map(f => (
                    <option key={f.id} value={f.id}>{f.flatNumber} ({f.wingName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supplementary Charge Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Major Structural Waterproofing Fund"
                  value={suppTitle}
                  onChange={(e) => setSuppTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Charge Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={suppAmount}
                  onChange={(e) => setSuppAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={suppIsTaxable}
                  onChange={(e) => setSuppIsTaxable(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span>Subject to GST 18%</span>
              </label>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Narration / Resolution Reference</label>
                <textarea
                  rows={2}
                  value={suppNarration}
                  onChange={(e) => setSuppNarration(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSuppModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm"
                >
                  Generate Supplementary Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
