import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  QrCode, 
  Building2, 
  CheckCircle, 
  Calendar, 
  User, 
  CreditCard,
  Share2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { MaintenanceBill, SocietyConfig } from '../types';
import { formatINR } from '../utils/billingEngine';

interface BillPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: MaintenanceBill | null;
  society: SocietyConfig;
  onPayNow?: (bill: MaintenanceBill) => void;
}

export const BillPrintModal: React.FC<BillPrintModalProps> = ({
  isOpen,
  onClose,
  bill,
  society,
  onPayNow
}) => {
  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    window.print();
  };

  // UPI deep link
  const upiUrl = bill.upiPaymentLink || `upi://pay?pa=${society.upiId}&pn=${encodeURIComponent(society.upiPayeeName || society.name)}&am=${bill.netPayableAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`${bill.billNumber}-${bill.flatNumber}`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] text-slate-800">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="print:hidden bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md border border-blue-200">
              <Printer className="w-4 h-4" />
            </span>
            <span className="font-bold text-xs sm:text-sm text-slate-900">Society Maintenance Bill View & Print</span>
            <span className="text-xs text-slate-500 font-mono">({bill.billNumber})</span>
          </div>

          <div className="flex items-center gap-2">
            {onPayNow && bill.paymentStatus !== 'paid' && (
              <button
                onClick={() => onPayNow(bill)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 shadow-xs transition"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay Online / Gateway</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bill</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Bill Area */}
        <div className="overflow-y-auto p-8 bg-white text-slate-900 print:p-0 print:m-0" id="printable-society-bill">
          <div className="border-2 border-slate-800 p-6 rounded-lg space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center border-b-2 border-slate-800 pb-4">
              <h1 className="text-xl font-extrabold uppercase tracking-wide text-slate-950">
                {society.name}
              </h1>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">
                Regd. Under Co-op Societies Act | Reg. No: {society.registrationNumber}
              </p>
              <p className="text-xs text-slate-600">
                {society.address}, {society.city}, {society.state} - {society.pincode}
              </p>
              {society.gstConfig.enabled && society.gstConfig.gstin && (
                <p className="text-xs font-mono font-bold text-slate-800 mt-0.5">
                  GSTIN: {society.gstConfig.gstin}
                </p>
              )}
              <div className="mt-2 inline-block bg-slate-950 text-white text-xs font-bold px-4 py-1 rounded tracking-wider uppercase">
                {bill.isSupplementary ? 'SUPPLEMENTARY MAINTENANCE BILL' : 'REGULAR MAINTENANCE BILL'}
              </div>
            </div>

            {/* Bill Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 border border-slate-300 p-3 rounded">
                <div><span className="text-slate-500 font-medium">Member Name:</span> <strong className="text-slate-900 text-sm">{bill.memberName}</strong></div>
                <div><span className="text-slate-500 font-medium">Flat / Unit No:</span> <strong className="text-slate-900 text-sm">{bill.flatNumber} ({bill.wingName})</strong></div>
                <div><span className="text-slate-500 font-medium">Member Status:</span> <strong className="text-slate-800 uppercase">{bill.memberType}</strong></div>
                <div><span className="text-slate-500 font-medium">Phone / Email:</span> <span className="text-slate-700">{bill.memberPhone}</span></div>
              </div>

              <div className="space-y-1 border border-slate-300 p-3 rounded bg-slate-50">
                <div><span className="text-slate-500 font-medium">Bill Number:</span> <strong className="font-mono text-slate-900">{bill.billNumber}</strong></div>
                <div><span className="text-slate-500 font-medium">Bill Date:</span> <strong className="text-slate-900">{bill.billDate}</strong></div>
                <div><span className="text-slate-500 font-medium">Due Date:</span> <strong className="text-red-700 font-bold">{bill.dueDate}</strong></div>
                <div><span className="text-slate-500 font-medium">Billing Period:</span> <strong className="text-slate-800">{bill.billingPeriod}</strong></div>
              </div>
            </div>

            {/* Particulars Charges Table */}
            <div>
              <table className="w-full text-left text-xs border border-slate-400">
                <thead className="bg-slate-200 text-slate-900 font-bold border-b border-slate-400">
                  <tr>
                    <th className="p-2 border-r border-slate-400 w-12 text-center">Sr.</th>
                    <th className="p-2 border-r border-slate-400">Particulars / Head of Charges</th>
                    <th className="p-2 border-r border-slate-400">Calculation Basis</th>
                    <th className="p-2 text-right w-28">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {bill.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border-r border-slate-300 text-center font-medium text-slate-600">{idx + 1}</td>
                      <td className="p-2 border-r border-slate-300 font-medium text-slate-900">{item.headName}</td>
                      <td className="p-2 border-r border-slate-300 text-slate-600">{item.rateOrBasis}</td>
                      <td className="p-2 text-right font-mono font-medium text-slate-900">{item.amount.toFixed(2)}</td>
                    </tr>
                  ))}

                  {/* Subtotal */}
                  <tr className="bg-slate-100 font-semibold border-t-2 border-slate-400">
                    <td colSpan={3} className="p-2 border-r border-slate-400 text-right">Current Charges Subtotal:</td>
                    <td className="p-2 text-right font-mono">{bill.currentChargesSubtotal.toFixed(2)}</td>
                  </tr>

                  {/* GST (if applicable) */}
                  {bill.cgstAmount > 0 && (
                    <>
                      <tr className="text-slate-700">
                        <td colSpan={3} className="p-2 border-r border-slate-300 text-right">CGST @ {society.gstConfig.cgstRate}%:</td>
                        <td className="p-2 text-right font-mono">{bill.cgstAmount.toFixed(2)}</td>
                      </tr>
                      <tr className="text-slate-700">
                        <td colSpan={3} className="p-2 border-r border-slate-300 text-right">SGST @ {society.gstConfig.sgstRate}%:</td>
                        <td className="p-2 text-right font-mono">{bill.sgstAmount.toFixed(2)}</td>
                      </tr>
                    </>
                  )}

                  {/* Arrears & Interest Breakup */}
                  {bill.principalArrears > 0 && (
                    <tr className="text-red-800 font-medium bg-red-50/50">
                      <td colSpan={3} className="p-2 border-r border-slate-300 text-right">Principal Outstanding Arrears:</td>
                      <td className="p-2 text-right font-mono font-bold">{bill.principalArrears.toFixed(2)}</td>
                    </tr>
                  )}
                  {bill.interestArrears > 0 && (
                    <tr className="text-red-800 font-medium bg-red-50/50">
                      <td colSpan={3} className="p-2 border-r border-slate-300 text-right">Interest Outstanding Arrears:</td>
                      <td className="p-2 text-right font-mono font-bold">{bill.interestArrears.toFixed(2)}</td>
                    </tr>
                  )}
                  {bill.currentBillInterest > 0 && (
                    <tr className="text-red-800 font-medium bg-red-50/50">
                      <td colSpan={3} className="p-2 border-r border-slate-300 text-right">
                        Current Bill Overdue Interest @ {society.interestConfig.ratePercentPerAnnum}% p.a.:
                      </td>
                      <td className="p-2 text-right font-mono font-bold">{bill.currentBillInterest.toFixed(2)}</td>
                    </tr>
                  )}
                  {bill.lateFeeCharge > 0 && (
                    <tr className="text-slate-700">
                      <td colSpan={3} className="p-2 border-r border-slate-300 text-right">Late Payment Fine / Penalty:</td>
                      <td className="p-2 text-right font-mono">{bill.lateFeeCharge.toFixed(2)}</td>
                    </tr>
                  )}
                  {bill.advanceAdjustment > 0 && (
                    <tr className="text-emerald-800 font-medium bg-emerald-50">
                      <td colSpan={3} className="p-2 border-r border-slate-300 text-right">Less: Previous Advance Adjusted:</td>
                      <td className="p-2 text-right font-mono font-bold">-{bill.advanceAdjustment.toFixed(2)}</td>
                    </tr>
                  )}

                  {/* NET PAYABLE */}
                  <tr className="bg-slate-900 text-white font-extrabold text-sm border-t-2 border-slate-900">
                    <td colSpan={3} className="p-2.5 text-right tracking-wide">NET AMOUNT PAYABLE:</td>
                    <td className="p-2.5 text-right font-mono text-base">{formatINR(bill.netPayableAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Previous Receipt Acknowledgement */}
            {bill.previousReceiptNumber && (
              <div className="p-2.5 bg-slate-100 border border-slate-300 rounded text-[11px] text-slate-700 flex items-center justify-between">
                <span>
                  <strong>Previous Receipt Ack:</strong> Rec No: {bill.previousReceiptNumber} dated {bill.previousReceiptDate}
                </span>
                <span className="font-bold text-slate-900">Amount: {formatINR(bill.previousReceiptAmount)}</span>
              </div>
            )}

            {/* Narration */}
            {bill.narration && (
              <div className="text-xs text-slate-600 italic">
                <strong>Narration:</strong> {bill.narration}
              </div>
            )}

            {/* UPI QR & Bank Footer */}
            <div className="grid grid-cols-3 gap-4 border-t-2 border-slate-800 pt-4 items-center">
              {/* UPI QR CODE */}
              <div className="text-center p-3 bg-slate-50 border border-slate-300 rounded-lg flex flex-col items-center">
                <div className="bg-white p-1.5 rounded border border-slate-300 shadow-sm">
                  <QRCodeSVG value={upiUrl} size={110} level="M" />
                </div>
                <div className="text-[10px] font-bold text-slate-800 mt-1.5 flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-slate-600" />
                  <span>Scan to Pay via Any UPI App</span>
                </div>
                <p className="text-[9px] font-mono text-slate-600 truncate max-w-[180px]">{society.upiId}</p>
              </div>

              {/* Society Bank Details */}
              <div className="col-span-2 text-xs space-y-1 border-l pl-4 border-slate-300">
                <h4 className="font-bold text-slate-900 uppercase">Direct Bank NEFT / RTGS Transfer Details:</h4>
                <div><span className="text-slate-500">Account Name:</span> <strong className="text-slate-800">{society.name}</strong></div>
                <div><span className="text-slate-500">Bank:</span> <strong className="text-slate-800">{society.bankName}</strong></div>
                <div><span className="text-slate-500">Account No:</span> <strong className="font-mono text-slate-900">{society.accountNumber}</strong></div>
                <div><span className="text-slate-500">IFSC Code:</span> <strong className="font-mono text-slate-900">{society.ifscCode}</strong> ({society.branch})</div>
                
                <div className="mt-4 pt-3 flex justify-between items-end text-[11px] text-slate-600">
                  <span>Bill generated electronically via SocietyPrime.</span>
                  <span className="border-t border-slate-400 pt-1 text-center font-bold text-slate-900 w-36 block">
                    Hon. Secretary / Treasurer
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
