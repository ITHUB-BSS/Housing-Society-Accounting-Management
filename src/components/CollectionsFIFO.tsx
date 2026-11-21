import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Download, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Printer, 
  Layers, 
  ArrowDownRight,
  Landmark,
  FileCheck
} from 'lucide-react';
import { 
  CollectionReceipt, 
  MaintenanceBill, 
  SocietyConfig, 
  FlatShopConfig, 
  Member 
} from '../types';
import { formatINR, allocateFIFOPayment, exportToExcel } from '../utils/billingEngine';

interface CollectionsFIFOProps {
  society: SocietyConfig;
  receipts: CollectionReceipt[];
  onUpdateReceipts: (receipts: CollectionReceipt[]) => void;
  bills: MaintenanceBill[];
  onUpdateBills: (bills: MaintenanceBill[]) => void;
  flats: FlatShopConfig[];
  members: Member[];
}

export const CollectionsFIFO: React.FC<CollectionsFIFOProps> = ({
  society,
  receipts,
  onUpdateReceipts,
  bills,
  onUpdateBills,
  flats,
  members
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'receipts' | 'fifo_entry' | 'brs' | 'pdc'>('receipts');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<CollectionReceipt | null>(null);

  // FIFO Entry Form State
  const [entryFlatId, setEntryFlatId] = useState<string>(flats?.[0]?.id || '');
  const [entryAmount, setEntryAmount] = useState<number>(3500);
  const [entryPaymentMode, setEntryPaymentMode] = useState<any>('cheque');
  const [entryChequeOrTxn, setEntryChequeOrTxn] = useState('');
  const [entryBankName, setEntryBankName] = useState('HDFC Bank');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [entryPdcDate, setEntryPdcDate] = useState('');
  const [entryNarration, setEntryNarration] = useState('Monthly maintenance payment received via Cheque.');

  // Find active unpaid bill for chosen flat
  const selectedFlat = flats.find(f => f.id === entryFlatId);
  const activeBill = bills.find(b => b.flatNumber === selectedFlat?.flatNumber && b.paymentStatus !== 'paid');

  // Preview FIFO Allocation live
  const fifoPreview = activeBill ? allocateFIFOPayment(activeBill, Number(entryAmount) || 0) : null;

  const handleRecordFIFOPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBill) {
      alert('No active outstanding bill found for the selected flat. You can still record an advance credit.');
    }

    const { updatedBill, allocation, advanceExcess } = activeBill 
      ? allocateFIFOPayment(activeBill, Number(entryAmount) || 0)
      : {
          updatedBill: null,
          allocation: { interestSettled: 0, principalSettled: 0, currentChargesSettled: 0 },
          advanceExcess: Number(entryAmount) || 0
        };

    const isPDC = Boolean(entryPdcDate && entryPdcDate > new Date().toISOString().slice(0, 10));
    const receiptNo = `REC-${new Date().getFullYear()}-${String(receipts.length + 1).padStart(4, '0')}`;

    const newReceipt: CollectionReceipt = {
      id: `rec-${Date.now()}`,
      societyId: society.id,
      receiptNumber: receiptNo,
      receiptDate: entryDate,
      billId: activeBill?.id,
      billNumber: activeBill?.billNumber || 'ADV-CREDIT',
      flatNumber: selectedFlat?.flatNumber || 'A-101',
      wingName: selectedFlat?.wingName || 'Wing A',
      memberName: activeBill?.memberName || members.find(m => m.flatNumber === selectedFlat?.flatNumber)?.fullName || 'Member',
      amountReceived: Number(entryAmount) || 0,
      paymentMode: entryPaymentMode,
      chequeOrTxnNumber: entryChequeOrTxn || `REF-${Math.floor(Math.random() * 89999 + 10000)}`,
      bankName: entryBankName,
      clearingStatus: isPDC ? 'uncleared' : entryPaymentMode === 'cash' ? 'cleared' : 'uncleared',
      clearingDate: entryPaymentMode === 'cash' ? entryDate : undefined,
      isPDC: isPDC,
      pdcDate: entryPdcDate || undefined,
      allocation: {
        interestCleared: allocation.interestSettled,
        principalCleared: allocation.principalSettled,
        currentChargesCleared: allocation.currentChargesSettled,
        advanceCreditAdded: advanceExcess
      },
      narration: entryNarration,
      createdAt: new Date().toISOString()
    };

    onUpdateReceipts([newReceipt, ...receipts]);

    if (updatedBill) {
      onUpdateBills(bills.map(b => b.id === updatedBill.id ? updatedBill : b));
    }

    alert(`Receipt ${receiptNo} recorded successfully! FIFO allocation applied.`);
    setActiveSubTab('receipts');
  };

  // BRS Action: Mark Cleared / Bounced
  const handleUpdateBRSStatus = (receiptId: string, newStatus: 'cleared' | 'bounced' | 'uncleared') => {
    onUpdateReceipts(receipts.map(r => {
      if (r.id !== receiptId) return r;
      return {
        ...r,
        clearingStatus: newStatus,
        clearingDate: newStatus === 'cleared' ? new Date().toISOString().slice(0, 10) : undefined,
        bouncedCharges: newStatus === 'bounced' ? 250 : undefined
      };
    }));
  };

  // Excel Export
  const handleExportReceiptsExcel = () => {
    const data = receipts.map(r => ({
      "Receipt No": r.receiptNumber,
      "Date": r.receiptDate,
      "Flat No": r.flatNumber,
      "Member Name": r.memberName,
      "Amount (₹)": r.amountReceived,
      "Mode": r.paymentMode.toUpperCase(),
      "Cheque/Txn No": r.chequeOrTxnNumber,
      "Bank Name": r.bankName,
      "Clearing Status": r.clearingStatus.toUpperCase(),
      "Clearing Date": r.clearingDate || 'Pending',
      "Interest Settled": r.allocation.interestCleared,
      "Principal Settled": r.allocation.principalCleared,
      "Current Charges Settled": r.allocation.currentChargesCleared,
      "Advance Excess": r.allocation.advanceCreditAdded
    }));
    exportToExcel(data, `Collection_Receipts_Register_${society.name.slice(0, 15)}`, "Receipts");
  };

  const filteredReceipts = receipts.filter(r => {
    const matchesSearch = 
      r.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.chequeOrTxnNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ? true : r.clearingStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md border border-blue-200">
              <Landmark className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Collections, FIFO Accounting & Bank Reconciliation</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated statutory FIFO hierarchy allocation: Delayed Interest &rarr; Principal Arrears &rarr; Current Bill &rarr; Advance Credit.
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveSubTab('receipts')}
            className={`px-3 py-1 rounded transition text-xs ${
              activeSubTab === 'receipts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Receipts Register ({receipts.length})
          </button>
          <button
            onClick={() => setActiveSubTab('fifo_entry')}
            className={`px-3 py-1 rounded transition text-xs flex items-center gap-1 ${
              activeSubTab === 'fifo_entry' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record FIFO Receipt</span>
          </button>
          <button
            onClick={() => setActiveSubTab('brs')}
            className={`px-3 py-1 rounded transition text-xs ${
              activeSubTab === 'brs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bank Reconciliation (BRS)
          </button>
          <button
            onClick={() => setActiveSubTab('pdc')}
            className={`px-3 py-1 rounded transition text-xs ${
              activeSubTab === 'pdc' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Post-Dated Cheques (PDC)
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: RECEIPTS REGISTER */}
      {activeSubTab === 'receipts' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
              <input
                type="text"
                placeholder="Search receipt no, flat, member, cheque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="all">All Clearance States</option>
                <option value="cleared">Cleared in Bank</option>
                <option value="uncleared">Uncleared / In Transit</option>
                <option value="bounced">Bounced / Dishonoured</option>
              </select>

              <button
                onClick={handleExportReceiptsExcel}
                className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 border border-slate-300 shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Receipt No. & Date</th>
                    <th className="px-4 py-3">Flat & Member</th>
                    <th className="px-4 py-3">Amount Received</th>
                    <th className="px-4 py-3">Payment Instrument</th>
                    <th className="px-4 py-3">FIFO Settlement Allocation</th>
                    <th className="px-4 py-3">Clearing Status</th>
                    <th className="px-4 py-3 text-right">Receipt View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReceipts.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-slate-900">{r.receiptNumber}</div>
                        <span className="text-[11px] text-slate-400 block">{r.receiptDate}</span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 rounded text-blue-700 font-mono text-[11px] font-bold">
                            {r.flatNumber}
                          </span>
                          {r.memberName}
                        </div>
                        <span className="text-[11px] text-slate-400 block">{r.wingName}</span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-mono text-sm font-bold text-emerald-600">
                          {formatINR(r.amountReceived)}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                          {r.paymentMode}
                        </span>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          Ref: <strong className="text-slate-800">{r.chequeOrTxnNumber}</strong>
                        </div>
                        <div className="text-[10px] text-slate-400">{r.bankName}</div>
                      </td>

                      <td className="px-4 py-3 text-[11px] space-y-0.5">
                        {r.allocation.interestCleared > 0 && (
                          <div className="text-rose-600">
                            Int Settled: <strong>{formatINR(r.allocation.interestCleared)}</strong>
                          </div>
                        )}
                        {r.allocation.principalCleared > 0 && (
                          <div className="text-amber-600">
                            Principal Settled: <strong>{formatINR(r.allocation.principalCleared)}</strong>
                          </div>
                        )}
                        {r.allocation.currentChargesCleared > 0 && (
                          <div className="text-emerald-600">
                            Current Charges: <strong>{formatINR(r.allocation.currentChargesCleared)}</strong>
                          </div>
                        )}
                        {r.allocation.advanceCreditAdded > 0 && (
                          <div className="text-blue-600">
                            Advance Added: <strong>{formatINR(r.allocation.advanceCreditAdded)}</strong>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {r.clearingStatus === 'cleared' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3 h-3" /> Cleared ({r.clearingDate || 'Yes'})
                          </span>
                        ) : r.clearingStatus === 'bounced' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" /> Bounced (₹250 Fee)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" /> Uncleared / Transit
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedReceiptForPrint(r)}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                          title="Print Official Society Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: FIFO RECEIPT RECORDING */}
      {activeSubTab === 'fifo_entry' && (
        <form onSubmit={handleRecordFIFOPayment} className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                Record Member Payment with Automated FIFO Engine
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically knocks off earliest outstanding interest, overdue principal, and current maintenance charges.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Flat Unit</label>
              <select
                value={entryFlatId || ''}
                onChange={(e) => setEntryFlatId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                {flats.map(f => (
                  <option key={f.id} value={f.id}>{f.flatNumber} ({f.wingName})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Amount Received (₹)</label>
              <input
                type="number"
                required
                value={entryAmount ?? 0}
                onChange={(e) => setEntryAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-emerald-600 font-bold focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Mode</label>
              <select
                value={entryPaymentMode || 'cheque'}
                onChange={(e) => setEntryPaymentMode(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="cheque">Cheque</option>
                <option value="neft">NEFT / RTGS</option>
                <option value="upi">UPI / QR</option>
                <option value="cash">Cash</option>
                <option value="dd">Demand Draft (DD)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cheque / Txn / UTR Number</label>
              <input
                type="text"
                required
                placeholder="e.g. 000482 / UTR123490"
                value={entryChequeOrTxn || ''}
                onChange={(e) => setEntryChequeOrTxn(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payer Bank Name</label>
              <input
                type="text"
                placeholder="e.g. State Bank of India"
                value={entryBankName || ''}
                onChange={(e) => setEntryBankName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Deposit / Entry Date</label>
              <input
                type="date"
                required
                value={entryDate || ''}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">PDC Cheque Date (If Post-Dated)</label>
              <input
                type="date"
                value={entryPdcDate || ''}
                onChange={(e) => setEntryPdcDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* LIVE FIFO ALLOCATION BREAKDOWN PREVIEW */}
          {activeBill && fifoPreview && (
            <div className="bg-slate-50 p-4 rounded-lg border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">
                  Target Bill: {activeBill.billNumber} (Total Due: {formatINR(activeBill.netPayableAmount)})
                </span>
                <span className="text-xs text-slate-500">Automated Priority Allocation</span>
              </div>

              <div className="grid grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-3 rounded-md border border-slate-200 shadow-xs">
                  <span className="text-slate-500 block">1. Interest Arrears</span>
                  <strong className="text-rose-600 font-mono text-sm">{formatINR(fifoPreview.allocation.interestSettled)}</strong>
                  <span className="text-[10px] text-slate-400 block">Priority 1</span>
                </div>
                <div className="bg-white p-3 rounded-md border border-slate-200 shadow-xs">
                  <span className="text-slate-500 block">2. Principal Arrears</span>
                  <strong className="text-amber-600 font-mono text-sm">{formatINR(fifoPreview.allocation.principalSettled)}</strong>
                  <span className="text-[10px] text-slate-400 block">Priority 2</span>
                </div>
                <div className="bg-white p-3 rounded-md border border-slate-200 shadow-xs">
                  <span className="text-slate-500 block">3. Current Maintenance</span>
                  <strong className="text-emerald-600 font-mono text-sm">{formatINR(fifoPreview.allocation.currentChargesSettled)}</strong>
                  <span className="text-[10px] text-slate-400 block">Priority 3</span>
                </div>
                <div className="bg-white p-3 rounded-md border border-slate-200 shadow-xs">
                  <span className="text-slate-500 block">4. Advance Credit</span>
                  <strong className="text-blue-600 font-mono text-sm">{formatINR(fifoPreview.advanceExcess)}</strong>
                  <span className="text-[10px] text-slate-400 block">Excess to Next Bill</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('receipts')}
              className="px-3.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm"
            >
              Save Receipt & Apply FIFO
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 3: BANK RECONCILIATION STATEMENT (BRS) */}
      {activeSubTab === 'brs' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-blue-600" />
                Bank Reconciliation Statement (BRS) Desk
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Match deposited cheques and NEFT credits with bank statement records. Mark cleared or bounced with penalty.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {receipts.map((r) => (
              <div key={r.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 font-mono text-xs">{r.receiptNumber}</strong>
                    <span className="text-xs font-bold text-blue-700">({r.flatNumber} - {r.memberName})</span>
                    <span className="uppercase text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                      {r.paymentMode} • {r.chequeOrTxnNumber}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Amount: <strong className="text-emerald-600 font-mono">{formatINR(r.amountReceived)}</strong> on {r.receiptDate} | Bank: {r.bankName}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateBRSStatus(r.id, 'cleared')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 ${
                      r.clearingStatus === 'cleared'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 hover:text-emerald-700 border border-slate-200'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Cleared</span>
                  </button>

                  <button
                    onClick={() => handleUpdateBRSStatus(r.id, 'bounced')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 ${
                      r.clearingStatus === 'bounced'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-600 hover:text-rose-700 border border-slate-200'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Mark Bounced (Debit ₹250)</span>
                  </button>

                  <button
                    onClick={() => handleUpdateBRSStatus(r.id, 'uncleared')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                      r.clearingStatus === 'uncleared'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    In Transit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: POST-DATED CHEQUES (PDC) */}
      {activeSubTab === 'pdc' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Post-Dated Cheques (PDC) Vault & Deposit Alerts
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cheques handed over in advance for future quarterly/monthly installments.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {receipts.filter(r => r.isPDC || r.pdcDate).length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No Post-Dated Cheques currently pending in deposit vault.
              </div>
            ) : (
              receipts.filter(r => r.isPDC || r.pdcDate).map(pdc => (
                <div key={pdc.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{pdc.flatNumber} - {pdc.memberName}</div>
                    <div className="text-[11px] text-slate-500">
                      Cheque: <strong className="text-slate-800">{pdc.chequeOrTxnNumber}</strong> | Bank: {pdc.bankName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-600 font-mono font-bold">{formatINR(pdc.amountReceived)}</div>
                    <div className="text-blue-700 text-xs font-semibold">Presentation Date: {pdc.pdcDate}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* OFFICIAL SOCIETY PAYMENT RECEIPT PRINT MODAL */}
      {selectedReceiptForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-xl shadow-2xl p-6 text-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Official Society Maintenance Receipt</h3>
              <button onClick={() => setSelectedReceiptForPrint(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            {/* Printable Body */}
            <div className="bg-white text-slate-900 p-6 rounded-lg border border-slate-200 space-y-4 text-xs" id="printable-receipt">
              <div className="text-center border-b border-slate-200 pb-3">
                <h2 className="text-base font-extrabold uppercase text-slate-900">{society.name}</h2>
                <p className="text-[11px] text-slate-500">Reg. No: {society.registrationNumber}</p>
                <div className="inline-block bg-blue-600 text-white text-[10px] font-bold px-3 py-0.5 rounded mt-1">
                  OFFICIAL RECEIPT
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-500">Receipt No:</span> <strong className="font-mono text-slate-900">{selectedReceiptForPrint.receiptNumber}</strong></div>
                <div className="text-right"><span className="text-slate-500">Date:</span> <strong className="text-slate-900">{selectedReceiptForPrint.receiptDate}</strong></div>
                <div><span className="text-slate-500">Received From:</span> <strong className="text-slate-900">{selectedReceiptForPrint.memberName}</strong></div>
                <div className="text-right"><span className="text-slate-500">Flat / Unit No:</span> <strong className="text-slate-900">{selectedReceiptForPrint.flatNumber}</strong></div>
              </div>

              <div className="border border-slate-200 p-3 rounded-md bg-slate-50 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Sum of Rupees:</span>
                  <strong className="text-base font-mono font-bold text-emerald-700">{formatINR(selectedReceiptForPrint.amountReceived)}</strong>
                </div>
                <div className="text-[11px] text-slate-500">
                  Mode: <strong className="uppercase text-slate-800">{selectedReceiptForPrint.paymentMode}</strong> ({selectedReceiptForPrint.chequeOrTxnNumber} - {selectedReceiptForPrint.bankName})
                </div>
              </div>

              <div className="text-[11px] text-slate-600 border-t border-slate-200 pt-2">
                <strong>Allocation:</strong> Settled Interest: {formatINR(selectedReceiptForPrint.allocation.interestCleared)} | Principal: {formatINR(selectedReceiptForPrint.allocation.principalCleared)} | Current Charges: {formatINR(selectedReceiptForPrint.allocation.currentChargesCleared)}
              </div>

              <div className="flex justify-between items-end pt-4 text-[10px] text-slate-500">
                <span>Subject to Realization of Cheque</span>
                <span className="border-t border-slate-300 pt-1 font-bold text-slate-800">Hon. Treasurer / Manager</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedReceiptForPrint(null)}
                className="px-3.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
