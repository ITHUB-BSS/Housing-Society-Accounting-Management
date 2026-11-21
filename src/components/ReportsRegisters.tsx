import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Search, 
  FileText, 
  AlertTriangle, 
  Car, 
  BookOpen, 
  Printer, 
  ShieldCheck,
  CheckCircle,
  Clock
} from 'lucide-react';
import { 
  SocietyConfig, 
  Member, 
  MaintenanceBill, 
  CollectionReceipt, 
  FlatShopConfig 
} from '../types';
import { formatINR, exportToExcel } from '../utils/billingEngine';

interface ReportsRegistersProps {
  society: SocietyConfig;
  members: Member[];
  bills: MaintenanceBill[];
  receipts: CollectionReceipt[];
  flats: FlatShopConfig[];
}

export const ReportsRegisters: React.FC<ReportsRegistersProps> = ({
  society,
  members,
  bills,
  receipts,
  flats
}) => {
  const [activeReport, setActiveReport] = useState<'form_i' | 'form_j' | 'defaulters' | 'bill_register' | 'parking'>('defaulters');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. FORM 'I' REGISTER (Statutory Register of Members & Shares)
  const handleExportFormI = () => {
    const data = members.map((m, idx) => ({
      "Sr No": idx + 1,
      "Member Full Name": m.fullName,
      "Flat / Tenement No": `${m.flatNumber} (${m.wingName})`,
      "Share Certificate No": m.shareCertificateNo || `SC-${String(idx + 1).padStart(4, '0')}`,
      "Distinctive No From": m.shareDistinctiveFrom || (idx * 10) + 1,
      "Distinctive No To": m.shareDistinctiveTo || (idx * 10) + 10,
      "Total Shares Held": m.totalShares || 10,
      "Date of Admission": (m.createdAt || new Date().toISOString()).slice(0, 10),
      "PAN Number": m.panNumber || 'N/A',
      "Aadhaar Number": m.aadhaarNumber || 'N/A',
      "Joint Owner": m.jointOwnerName || 'None',
      "Status / Transfer": m.isSoldOrTransferred ? `Transferred to ${m.transferredToMemberName} on ${m.transferDate}` : 'Active'
    }));
    exportToExcel(data, `Form_I_Register_Of_Members_${(society?.name || 'Society').slice(0, 15)}`, "Form_I_Register");
  };

  // 2. FORM 'J' LIST (List of Members entitled to vote)
  const handleExportFormJ = () => {
    const data = members.filter(m => !m.isSoldOrTransferred && m.memberType === 'owner').map((m, idx) => ({
      "Sr No": idx + 1,
      "Voter / Member Name": m.fullName,
      "Flat Number": m.flatNumber,
      "Wing": m.wingName,
      "Shares Held": m.totalShares || 10,
      "Voting Eligibility": "Eligible (Active Primary Owner)",
      "Contact": m.phone
    }));
    exportToExcel(data, `Form_J_List_Of_Members_${society.name.slice(0, 15)}`, "Form_J_List");
  };

  // 3. DEFAULTERS & ARREARS REGISTER
  const unpaidBills = bills.filter(b => b.paymentStatus !== 'paid');
  const handleExportDefaulters = () => {
    const data = unpaidBills.map(b => ({
      "Flat No": b.flatNumber,
      "Wing": b.wingName,
      "Member Name": b.memberName,
      "Contact": b.memberPhone,
      "Bill No": b.billNumber,
      "Due Date": b.dueDate,
      "Principal Arrears (₹)": b.principalArrears,
      "Interest Arrears (₹)": b.interestArrears,
      "Current Charges (₹)": b.totalCurrentCharges,
      "Current Interest (₹)": b.currentBillInterest,
      "Total Outstanding (₹)": b.netPayableAmount - b.amountPaid,
      "Days Overdue": Math.max(0, Math.floor((Date.now() - new Date(b.dueDate).getTime()) / (1000 * 3600 * 24)))
    }));
    exportToExcel(data, `Defaulters_Arrears_Register_${society.name.slice(0, 15)}`, "DefaultersRegister");
  };

  // 4. PARKING REGISTER
  const handleExportParking = () => {
    const data = members.flatMap(m => (m.vehicles || []).map(v => ({
      "Flat No": m.flatNumber,
      "Member Name": m.fullName,
      "Vehicle Type": v.type === '4_wheeler' ? '4-Wheeler Car' : '2-Wheeler',
      "Registration No": v.regNumber,
      "Make & Model": v.makeModel || 'N/A',
      "Slot Number": v.parkingSlotNumber || 'Unassigned',
      "Sticker Issued": v.stickerIssued ? 'Yes' : 'Pending'
    })));
    exportToExcel(data, `Parking_Slot_Vehicles_Register_${society.name.slice(0, 15)}`, "ParkingRegister");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md border border-blue-200">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Statutory Society Registers & Compliance Audit</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Government Co-operative Act compliance: Form 'I' Share Register, Form 'J' Voter List, Defaulters Notice Book, and Vehicle Slot Master.
          </p>
        </div>

        {/* Report Selector Pills */}
        <div className="flex flex-wrap bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveReport('defaulters')}
            className={`px-3 py-1 rounded transition text-xs flex items-center gap-1.5 ${
              activeReport === 'defaulters' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Defaulters Register ({unpaidBills.length})</span>
          </button>
          <button
            onClick={() => setActiveReport('form_i')}
            className={`px-3 py-1 rounded transition text-xs ${
              activeReport === 'form_i' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Form 'I' (Shares)
          </button>
          <button
            onClick={() => setActiveReport('form_j')}
            className={`px-3 py-1 rounded transition text-xs ${
              activeReport === 'form_j' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Form 'J' (Voter List)
          </button>
          <button
            onClick={() => setActiveReport('parking')}
            className={`px-3 py-1 rounded transition text-xs flex items-center gap-1.5 ${
              activeReport === 'parking' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Parking Register</span>
          </button>
        </div>
      </div>

      {/* REPORT 1: DEFAULTERS REGISTER */}
      {activeReport === 'defaulters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-700">
              Showing <strong className="text-rose-600">{unpaidBills.length} Overdue Accounts</strong> with cumulative interest arrears.
            </div>
            <button
              onClick={handleExportDefaulters}
              className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 border border-slate-300 shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Defaulters Excel</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Flat & Member</th>
                    <th className="px-4 py-3">Bill Details</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Principal Due</th>
                    <th className="px-4 py-3">Interest Arrears</th>
                    <th className="px-4 py-3">Total Outstanding</th>
                    <th className="px-4 py-3 text-right">Notice Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {unpaidBills.map((b) => {
                    const dueTime = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                    const daysOverdue = !isNaN(dueTime) && dueTime > 0 
                      ? Math.max(0, Math.floor((Date.now() - dueTime) / (1000 * 3600 * 24))) 
                      : 0;
                    return (
                      <tr key={b.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 font-bold text-slate-900">
                          <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 rounded text-blue-700 font-mono text-[11px] font-bold mr-1.5">
                            {b.flatNumber}
                          </span>
                          {b.memberName}
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-mono">
                          {b.billNumber} ({b.billingPeriod})
                        </td>
                        <td className="px-4 py-3 text-rose-600 font-medium">
                          {b.dueDate || 'N/A'} ({daysOverdue} days late)
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-mono">
                          {formatINR((b.principalArrears || 0) + (b.totalCurrentCharges || 0))}
                        </td>
                        <td className="px-4 py-3 text-rose-600 font-mono font-bold">
                          {formatINR((b.interestArrears || 0) + (b.currentBillInterest || 0))}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-rose-600 font-mono">
                          {formatINR((b.netPayableAmount || 0) - (b.amountPaid || 0))}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => alert(`Statutory 101 Defaulter Notice drafted for ${b.memberName} (${b.flatNumber}). Ready to dispatch.`)}
                            className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[11px] font-bold transition"
                          >
                            Draft Sec 101 Notice
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: FORM 'I' REGISTER */}
      {activeReport === 'form_i' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-700">
              <strong>Form 'I' Register:</strong> Statutory Record of Shares and Member Admissions maintained under Rule 32 of MCS Rules 1961.
            </div>
            <button
              onClick={handleExportFormI}
              className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 border border-slate-300 shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Form 'I' (Excel)</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Flat & Member Name</th>
                    <th className="px-4 py-3">Share Cert. No.</th>
                    <th className="px-4 py-3">Distinctive Range</th>
                    <th className="px-4 py-3">Shares Count</th>
                    <th className="px-4 py-3">Joint Owner</th>
                    <th className="px-4 py-3">Admission Date</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((m, i) => (
                    <tr key={m.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {m.flatNumber} - {m.fullName}
                      </td>
                      <td className="px-4 py-3 font-mono text-blue-700 font-bold">
                        {m.shareCertificateNo || `SC-${String(i + 1).padStart(4, '0')}`}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {m.shareDistinctiveFrom || (i * 10) + 1} to {m.shareDistinctiveTo || (i * 10) + 10}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">{m.totalShares || 10}</td>
                      <td className="px-4 py-3 text-slate-500">{m.jointOwnerName || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{m.createdAt.slice(0, 10)}</td>
                      <td className="px-4 py-3">
                        {m.isSoldOrTransferred ? (
                          <span className="text-rose-600 font-bold text-[10px]">Transferred</span>
                        ) : (
                          <span className="text-emerald-600 font-bold text-[10px]">Active Holder</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3: FORM 'J' LIST */}
      {activeReport === 'form_j' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-700">
              <strong>Form 'J' Register:</strong> Official list of active society members eligible to attend General Body Meetings and vote.
            </div>
            <button
              onClick={handleExportFormJ}
              className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 border border-slate-300 shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Form 'J' (Excel)</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Sr.</th>
                    <th className="px-4 py-3">Voter / Member Name</th>
                    <th className="px-4 py-3">Flat & Wing</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Shares Count</th>
                    <th className="px-4 py-3">Voting Right</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.filter(m => !m.isSoldOrTransferred && m.memberType === 'owner').map((m, i) => (
                    <tr key={m.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-slate-400 font-mono">{i + 1}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{m.fullName}</td>
                      <td className="px-4 py-3 text-slate-600">{m.flatNumber} ({m.wingName})</td>
                      <td className="px-4 py-3 text-slate-500">{m.phone}</td>
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">{m.totalShares || 10}</td>
                      <td className="px-4 py-3">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded font-bold">
                          Eligible (1 Vote)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 4: PARKING REGISTER */}
      {activeReport === 'parking' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-700">
              <strong>Vehicle Parking Slot Master:</strong> Registration numbers, RFID tag passes, and designated bays.
            </div>
            <button
              onClick={handleExportParking}
              className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 border border-slate-300 shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Parking (Excel)</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Flat & Owner</th>
                    <th className="px-4 py-3">Vehicle Type</th>
                    <th className="px-4 py-3">Registration Number</th>
                    <th className="px-4 py-3">Make / Model</th>
                    <th className="px-4 py-3">Slot Allocated</th>
                    <th className="px-4 py-3">RFID Tag Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.flatMap(m => (m.vehicles || []).map((v, i) => (
                    <tr key={`${m.id}-${i}`} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {m.flatNumber} - {m.fullName}
                      </td>
                      <td className="px-4 py-3">
                        <span className="uppercase text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-700">
                          {v.type === '4_wheeler' ? '4-Wheeler' : '2-Wheeler'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{v.regNumber}</td>
                      <td className="px-4 py-3 text-slate-500">{v.makeModel || '—'}</td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-600">{v.parkingSlotNumber || 'P-OPEN'}</td>
                      <td className="px-4 py-3">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded font-semibold">
                          Active Pass
                        </span>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
