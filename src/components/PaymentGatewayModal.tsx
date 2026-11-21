import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  Sparkles,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MaintenanceBill, SocietyConfig, CollectionReceipt } from '../types';
import { formatINR, allocateFIFOPayment } from '../utils/billingEngine';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: MaintenanceBill | null;
  society: SocietyConfig;
  onPaymentSuccess: (receipt: CollectionReceipt, updatedBill: MaintenanceBill) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  bill,
  society,
  onPaymentSuccess
}) => {
  if (!isOpen || !bill) return null;

  const [paymentMode, setPaymentMode] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiVpa, setUpiVpa] = useState('user@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8842');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('842');
  const [bankSelected, setBankSelected] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<CollectionReceipt | null>(null);

  const amountToPay = bill.netPayableAmount - bill.amountPaid;

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      // Execute FIFO Allocation
      const { updatedBill, allocation, advanceExcess } = allocateFIFOPayment(bill, amountToPay);
      
      const receiptNo = `REC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const txnId = `TXN_${Date.now()}_${Math.floor(Math.random() * 9999)}`;

      const receipt: CollectionReceipt = {
        id: `rec-${Date.now()}`,
        societyId: society.id,
        receiptNumber: receiptNo,
        receiptDate: new Date().toISOString().slice(0, 10),
        billId: bill.id,
        billNumber: bill.billNumber,
        flatNumber: bill.flatNumber,
        wingName: bill.wingName,
        memberName: bill.memberName,
        amountReceived: amountToPay,
        paymentMode: paymentMode,
        chequeOrTxnNumber: txnId,
        bankName: paymentMode === 'netbanking' ? bankSelected : 'Online PG / UPI Gateway',
        clearingStatus: 'cleared',
        clearingDate: new Date().toISOString().slice(0, 10),
        allocation: {
          interestCleared: allocation.interestSettled,
          principalCleared: allocation.principalSettled,
          currentChargesCleared: allocation.currentChargesSettled,
          advanceCreditAdded: advanceExcess
        },
        narration: `Instant online payment gateway settlement via ${paymentMode.toUpperCase()}.`,
        createdAt: new Date().toISOString()
      };

      setGeneratedReceipt(receipt);
      setIsProcessing(false);
      setIsCompleted(true);

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      onPaymentSuccess(receipt, updatedBill);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-2xl overflow-hidden text-slate-800">
        {/* Header */}
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md border border-blue-200">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Secure Society Payment Gateway</h3>
              <p className="text-[11px] text-slate-500">256-Bit SSL Encrypted Transaction</p>
            </div>
          </div>
          {!isCompleted && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-md">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* CONTENT */}
        {!isCompleted ? (
          <div className="p-5 space-y-4">
            {/* Bill Summary Strip */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">Paying Bill for Flat:</span>
                <strong className="text-slate-900 text-xs sm:text-sm">{bill.flatNumber} ({bill.memberName})</strong>
                <span className="text-[10px] text-slate-400 block font-mono">{bill.billNumber} • {bill.billingPeriod}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Amount Due</span>
                <div className="text-lg sm:text-xl font-bold text-blue-700 font-mono">
                  {formatINR(amountToPay)}
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode('upi')}
                className={`p-2.5 rounded-md border text-center transition flex flex-col items-center gap-1 ${
                  paymentMode === 'upi'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-xs">UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('card')}
                className={`p-2.5 rounded-md border text-center transition flex flex-col items-center gap-1 ${
                  paymentMode === 'card'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-xs">Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('netbanking')}
                className={`p-2.5 rounded-md border text-center transition flex flex-col items-center gap-1 ${
                  paymentMode === 'netbanking'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="text-xs">NetBanking</span>
              </button>
            </div>

            {/* Mode-specific Fields */}
            <form onSubmit={handleProcessPayment} className="space-y-3.5">
              {paymentMode === 'upi' && (
                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-700">Enter your UPI Virtual Address (VPA)</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. mobile@upi / username@okhdfcbank"
                      value={upiVpa}
                      onChange={(e) => setUpiVpa(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-blue-600" />
                    <span>Or authorize in Google Pay / PhonePe / Paytm / BHIM</span>
                  </div>
                </div>
              )}

              {paymentMode === 'card' && (
                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 font-mono text-center focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        required
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 font-mono text-center focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMode === 'netbanking' && (
                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-700">Select Banking Partner</label>
                  <select
                    value={bankSelected}
                    onChange={(e) => setBankSelected(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                    <option value="Punjab National Bank">Punjab National Bank</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-md shadow-xs transition flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Secure Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay {formatINR(amountToPay)} & Settle Bill</span>
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
              <span>Direct settlement into {society.bankName} (A/C •••• {society.accountNumber.slice(-4)})</span>
            </div>
          </div>
        ) : (
          /* PAYMENT SUCCESS VIEW */
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Payment Successful!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your maintenance payment has been settled and credited to the society account.
              </p>
            </div>

            {generatedReceipt && (
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Receipt Number:</span>
                  <strong className="text-blue-700 font-mono">{generatedReceipt.receiptNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <strong className="text-slate-900 font-mono">{formatINR(generatedReceipt.amountReceived)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Ref:</span>
                  <span className="text-slate-700 font-mono text-[11px]">{generatedReceipt.chequeOrTxnNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Allocation:</span>
                  <span className="text-emerald-700 font-medium">FIFO Applied (Interest + Principal Settled)</span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-md text-xs transition border border-slate-200"
              >
                Close Gateway
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
