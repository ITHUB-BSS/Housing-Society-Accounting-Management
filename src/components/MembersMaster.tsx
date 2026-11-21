import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Search, 
  FileText, 
  Car, 
  KeyRound, 
  UserCheck, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Member, FlatShopConfig, SocietyConfig, FamilyMember } from '../types';
import { exportToExcel } from '../utils/billingEngine';
import * as XLSX from 'xlsx';

interface MembersMasterProps {
  society: SocietyConfig;
  members: Member[];
  onUpdateMembers: (members: Member[]) => void;
  flats: FlatShopConfig[];
}

export const MembersMaster: React.FC<MembersMasterProps> = ({
  society,
  members,
  onUpdateMembers,
  flats
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  // Member Form State
  const [form, setForm] = useState<Partial<Member>>({
    fullName: '',
    email: '',
    phone: '',
    memberType: 'owner',
    flatId: flats[0]?.id || '',
    flatNumber: flats[0]?.flatNumber || '',
    wingName: flats[0]?.wingName || 'Wing A',
    aadhaarNumber: '',
    panNumber: '',
    voterIdNumber: '',
    shareCertificateNo: '',
    shareDistinctiveFrom: 1,
    shareDistinctiveTo: 10,
    totalShares: 10,
    jointOwnerName: '',
    jointOwnerPan: '',
    jointOwnerPhone: '',
    familyMembers: [],
    vehicles: [],
    documents: []
  });

  // Transfer State
  const [transferData, setTransferData] = useState({
    newOwnerName: '',
    newOwnerEmail: '',
    newOwnerPhone: '',
    newOwnerPan: '',
    transferDate: new Date().toISOString().slice(0, 10),
    remarks: 'Ownership transfer executed per society resolution.'
  });

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterType === 'all' ? true :
      filterType === 'sold' ? m.isSoldOrTransferred :
      m.memberType === filterType && !m.isSoldOrTransferred;

    return matchesSearch && matchesFilter;
  });

  const handleOpenAdd = () => {
    setForm({
      id: undefined,
      fullName: '',
      email: '',
      phone: '',
      memberType: 'owner',
      flatId: flats[0]?.id || '',
      flatNumber: flats[0]?.flatNumber || '',
      wingName: flats[0]?.wingName || 'Wing A',
      aadhaarNumber: '',
      panNumber: '',
      voterIdNumber: '',
      shareCertificateNo: `SC-${String(members.length + 1).padStart(4, '0')}`,
      shareDistinctiveFrom: (members.length * 10) + 1,
      shareDistinctiveTo: (members.length * 10) + 10,
      totalShares: 10,
      jointOwnerName: '',
      jointOwnerPan: '',
      jointOwnerPhone: '',
      familyMembers: [],
      vehicles: [{ type: '4_wheeler', regNumber: '', makeModel: '', parkingSlotNumber: '' }],
      documents: []
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (m: Member) => {
    setForm(m);
    setModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.flatNumber) return;

    const matchedFlat = flats.find(f => f.flatNumber === form.flatNumber);

    const saved: Member = {
      id: form.id || `mem-${Date.now()}`,
      societyId: society.id,
      flatId: matchedFlat?.id || form.flatId || `flat-${Date.now()}`,
      flatNumber: form.flatNumber,
      wingName: form.wingName || matchedFlat?.wingName || 'Wing A',
      memberType: form.memberType || 'owner',
      fullName: form.fullName,
      email: form.email || '',
      phone: form.phone || '',
      aadhaarNumber: form.aadhaarNumber,
      panNumber: form.panNumber,
      voterIdNumber: form.voterIdNumber,
      shareCertificateNo: form.shareCertificateNo,
      shareDistinctiveFrom: Number(form.shareDistinctiveFrom) || 1,
      shareDistinctiveTo: Number(form.shareDistinctiveTo) || 10,
      totalShares: Number(form.totalShares) || 10,
      jointOwnerName: form.jointOwnerName,
      jointOwnerPan: form.jointOwnerPan,
      jointOwnerPhone: form.jointOwnerPhone,
      tenantDetails: form.memberType === 'tenant' ? (form.tenantDetails || {
        tenantName: form.fullName,
        tenantPhone: form.phone || '',
        leaseStartDate: new Date().toISOString().slice(0, 10),
        leaseEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        policeVerified: true
      }) : undefined,
      vehicles: form.vehicles || [],
      familyMembers: form.familyMembers || [],
      documents: form.documents || [],
      isSoldOrTransferred: form.isSoldOrTransferred || false,
      createdAt: form.createdAt || new Date().toISOString()
    };

    if (form.id) {
      onUpdateMembers(members.map(m => m.id === form.id ? saved : m));
    } else {
      onUpdateMembers([...members, saved]);
    }
    setModalOpen(false);
  };

  const handleDeleteMember = (id: string) => {
    if (confirm('Are you sure you want to remove this member profile?')) {
      onUpdateMembers(members.filter(m => m.id !== id));
    }
  };

  // Transfer Ownership / Mark Sold
  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !transferData.newOwnerName) return;

    const updatedCurrent: Member = {
      ...selectedMember,
      isSoldOrTransferred: true,
      transferDate: transferData.transferDate,
      transferredToMemberName: transferData.newOwnerName
    };

    // Create new buyer member
    const newBuyer: Member = {
      id: `mem-${Date.now()}`,
      societyId: society.id,
      flatId: selectedMember.flatId,
      flatNumber: selectedMember.flatNumber,
      wingName: selectedMember.wingName,
      memberType: 'owner',
      fullName: transferData.newOwnerName,
      email: transferData.newOwnerEmail || `${transferData.newOwnerName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      phone: transferData.newOwnerPhone || '+91 98000 11111',
      panNumber: transferData.newOwnerPan,
      shareCertificateNo: `SC-${String(members.length + 2).padStart(4, '0')}`,
      shareDistinctiveFrom: selectedMember.shareDistinctiveFrom,
      shareDistinctiveTo: selectedMember.shareDistinctiveTo,
      totalShares: selectedMember.totalShares || 10,
      vehicles: [],
      familyMembers: [],
      documents: [
        { name: 'Transfer_Resolution_Deed.pdf', type: 'application/pdf', url: '#', uploadedAt: transferData.transferDate }
      ],
      createdAt: new Date().toISOString()
    };

    onUpdateMembers(members.map(m => m.id === selectedMember.id ? updatedCurrent : m).concat(newBuyer));
    setTransferModalOpen(false);
    setSelectedMember(null);
  };

  // Excel Export
  const handleExportMembersExcel = () => {
    const data = members.map(m => ({
      "Flat Number": m.flatNumber,
      "Wing": m.wingName,
      "Member Name": m.fullName,
      "Member Type": m.memberType.toUpperCase(),
      "Email": m.email,
      "Phone": m.phone,
      "Aadhaar Number": m.aadhaarNumber || 'N/A',
      "PAN Number": m.panNumber || 'N/A',
      "Voter ID": m.voterIdNumber || 'N/A',
      "Share Certificate No": m.shareCertificateNo || 'N/A',
      "Distinctive Range": `${m.shareDistinctiveFrom || ''} to ${m.shareDistinctiveTo || ''}`,
      "Total Shares": m.totalShares || 10,
      "Joint Owner": m.jointOwnerName || 'None',
      "Vehicle Numbers": m.vehicles.map(v => v.regNumber).join(', ') || 'None',
      "Status": m.isSoldOrTransferred ? `Transferred on ${m.transferDate}` : 'Active'
    }));
    exportToExcel(data, `Society_Members_Register_${society.name.slice(0, 15)}`, "MembersMaster");
  };

  // Excel Import Handler
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames?.[0];
        if (!wsName) return;
        const ws = wb.Sheets[wsName];
        const data: any[] = XLSX.utils.sheet_to_json(ws);
        
        if (data && data.length > 0) {
          const imported: Member[] = data.map((row, idx) => ({
            id: `mem-import-${Date.now()}-${idx}`,
            societyId: society.id,
            flatId: `flat-${row["Flat Number"] || row["flatNumber"] || `U-${idx}`}`,
            flatNumber: String(row["Flat Number"] || row["flatNumber"] || `A-${idx + 101}`),
            wingName: String(row["Wing"] || row["wingName"] || 'Wing A'),
            memberType: (row["Member Type"] || row["memberType"] || 'owner').toLowerCase().includes('tenant') ? 'tenant' : 'owner',
            fullName: String(row["Member Name"] || row["fullName"] || row["Name"] || `Member ${idx + 1}`),
            email: String(row["Email"] || row["email"] || `member${idx + 1}@society.in`),
            phone: String(row["Phone"] || row["phone"] || '+91 98000 00000'),
            aadhaarNumber: String(row["Aadhaar Number"] || row["aadhaarNumber"] || ''),
            panNumber: String(row["PAN Number"] || row["panNumber"] || ''),
            shareCertificateNo: String(row["Share Certificate No"] || `SC-${String(idx + 100).padStart(4, '0')}`),
            shareDistinctiveFrom: idx * 10 + 1,
            shareDistinctiveTo: idx * 10 + 10,
            totalShares: 10,
            familyMembers: [],
            vehicles: [],
            documents: [],
            createdAt: new Date().toISOString()
          }));
          onUpdateMembers([...members, ...imported]);
          alert(`Successfully imported ${imported.length} members from Excel!`);
        }
      } catch (err) {
        alert('Error importing Excel file. Please check file format.');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Controls */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md border border-blue-200">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Centralized Members Master & KYC Register</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Maintain property allocations, tenant agreements, Aadhaar/PAN details, Share Certificates, and vehicle passes.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="cursor-pointer bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 border border-slate-300 shadow-xs transition">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Import Excel</span>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImportExcel} className="hidden" />
          </label>

          <button
            onClick={handleExportMembersExcel}
            className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 border border-slate-300 shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-md text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member Profile</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
          <input
            type="text"
            placeholder="Search by name, flat no, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto text-xs bg-slate-100 p-0.5 rounded-md border border-slate-200">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded font-semibold transition text-xs ${
              filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Members ({members.length})
          </button>
          <button
            onClick={() => setFilterType('owner')}
            className={`px-3 py-1 rounded font-semibold transition text-xs ${
              filterType === 'owner' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Owners ({members.filter(m => m.memberType === 'owner' && !m.isSoldOrTransferred).length})
          </button>
          <button
            onClick={() => setFilterType('tenant')}
            className={`px-3 py-1 rounded font-semibold transition text-xs ${
              filterType === 'tenant' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tenants ({members.filter(m => m.memberType === 'tenant').length})
          </button>
          <button
            onClick={() => setFilterType('sold')}
            className={`px-3 py-1 rounded font-semibold transition text-xs ${
              filterType === 'sold' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sold / Transferred ({members.filter(m => m.isSoldOrTransferred).length})
          </button>
        </div>
      </div>

      {/* Members Grid / Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Flat & Member Name</th>
                <th className="px-4 py-3">Type & Shares</th>
                <th className="px-4 py-3">Contact & Email</th>
                <th className="px-4 py-3">KYC (Aadhaar/PAN)</th>
                <th className="px-4 py-3">Joint Owner / Tenant</th>
                <th className="px-4 py-3">Vehicles</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0">
                        {m.flatNumber}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {m.fullName}
                          {m.isSoldOrTransferred && (
                            <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] px-1.5 py-0.2 rounded font-bold">
                              Sold
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 block">{m.wingName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded font-semibold text-[10px] uppercase ${
                      m.memberType === 'tenant' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {m.memberType}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Cert: <strong className="text-slate-800">{m.shareCertificateNo || 'N/A'}</strong> ({m.totalShares || 10} shares)
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{m.phone}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[160px]">{m.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[11px]">
                      <span className="text-slate-400">PAN:</span> <strong className="text-slate-700">{m.panNumber || '—'}</strong>
                    </div>
                    <div className="text-[11px]">
                      <span className="text-slate-400">Aadhaar:</span> <span className="text-slate-600">{m.aadhaarNumber || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {m.memberType === 'tenant' && m.tenantDetails ? (
                      <div>
                        <span className="text-blue-700 font-semibold flex items-center gap-1 text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Police Verified
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Till {m.tenantDetails.leaseEndDate}
                        </span>
                      </div>
                    ) : m.jointOwnerName ? (
                      <div>
                        <span className="font-medium text-slate-800">{m.jointOwnerName}</span>
                        <span className="text-[10px] text-slate-400 block">Joint Owner</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">Sole Owner</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {m.vehicles && m.vehicles.length > 0 ? (
                      <div className="space-y-0.5">
                        {m.vehicles.map((v, i) => (
                          <span key={i} className="inline-block bg-slate-100 border border-slate-200 text-slate-700 font-mono px-1.5 py-0.5 rounded text-[10px] mr-1">
                            {v.regNumber || 'Vehicle'}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">No Vehicle</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!m.isSoldOrTransferred && (
                        <button
                          onClick={() => {
                            setSelectedMember(m);
                            setTransferModalOpen(true);
                          }}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-blue-700 border border-slate-200 text-[11px] font-semibold transition"
                          title="Transfer Flat / Mark Sold"
                        >
                          Transfer
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition"
                        title="Edit Member Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(m.id)}
                        className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MEMBER CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {form.id ? 'Edit Member Master Record' : 'Add New Member to Society Master'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Member Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amrut Shinde"
                    value={form.fullName || ''}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Member Type</label>
                  <select
                    value={form.memberType || 'owner'}
                    onChange={(e) => setForm({ ...form, memberType: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="owner">Flat Owner</option>
                    <option value="tenant">Tenant</option>
                    <option value="joint_owner">Joint Owner</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Allocated Flat</label>
                  <select
                    value={form.flatNumber || ''}
                    onChange={(e) => {
                      const f = flats.find(fl => fl.flatNumber === e.target.value);
                      setForm({
                        ...form,
                        flatNumber: e.target.value,
                        wingName: f?.wingName || 'Wing A',
                        flatId: f?.id
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    {flats.map(f => (
                      <option key={f.id} value={f.flatNumber}>
                        {f.flatNumber} ({f.wingName} - {f.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98201 00000"
                    value={form.phone || ''}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email ID</label>
                  <input
                    type="email"
                    required
                    placeholder="amrut@gmail.com"
                    value={form.email || ''}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* KYC & Identity Section */}
              <div className="border-t border-slate-200 pt-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Personal Identity & KYC Numbers</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">PAN Card Number</label>
                    <input
                      type="text"
                      placeholder="ABCPS1234F"
                      value={form.panNumber || ''}
                      onChange={(e) => setForm({ ...form, panNumber: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 font-mono uppercase focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Aadhaar Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012"
                      value={form.aadhaarNumber || ''}
                      onChange={(e) => setForm({ ...form, aadhaarNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Voter ID / Election Card</label>
                    <input
                      type="text"
                      placeholder="MH/04/123/987654"
                      value={form.voterIdNumber || ''}
                      onChange={(e) => setForm({ ...form, voterIdNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Share Certificate Details */}
              <div className="border-t border-slate-200 pt-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Share Certificate Details (Form I / J Compliance)</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Certificate No.</label>
                    <input
                      type="text"
                      placeholder="SC-0042"
                      value={form.shareCertificateNo || ''}
                      onChange={(e) => setForm({ ...form, shareCertificateNo: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Distinctive From</label>
                    <input
                      type="number"
                      value={form.shareDistinctiveFrom ?? ''}
                      onChange={(e) => setForm({ ...form, shareDistinctiveFrom: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Distinctive To</label>
                    <input
                      type="number"
                      value={form.shareDistinctiveTo ?? ''}
                      onChange={(e) => setForm({ ...form, shareDistinctiveTo: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Total Shares</label>
                    <input
                      type="number"
                      value={form.totalShares ?? 10}
                      onChange={(e) => setForm({ ...form, totalShares: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Joint Owner Details */}
              <div className="border-t border-slate-200 pt-3">
                <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Joint Owner Details (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Joint Owner Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sunita Shinde"
                      value={form.jointOwnerName || ''}
                      onChange={(e) => setForm({ ...form, jointOwnerName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Joint Owner PAN</label>
                    <input
                      type="text"
                      placeholder="ABCPS5678K"
                      value={form.jointOwnerPan || ''}
                      onChange={(e) => setForm({ ...form, jointOwnerPan: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 font-mono uppercase focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Joint Owner Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 98201 98765"
                      value={form.jointOwnerPhone || ''}
                      onChange={(e) => setForm({ ...form, jointOwnerPhone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Registration */}
              <div className="border-t border-slate-200 pt-3">
                <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Primary Vehicle Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Vehicle Type</label>
                    <select
                      value={form.vehicles?.[0]?.type || '4_wheeler'}
                      onChange={(e) => {
                        const v = [...(form.vehicles || [])];
                        const current = v[0] || { type: '4_wheeler', regNumber: '' };
                        v[0] = { ...current, type: e.target.value as any };
                        setForm({ ...form, vehicles: v });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                    >
                      <option value="4_wheeler">4-Wheeler Car</option>
                      <option value="2_wheeler">2-Wheeler Bike/Scooter</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Vehicle Reg Number</label>
                    <input
                      type="text"
                      placeholder="MH-02-CP-8842"
                      value={form.vehicles?.[0]?.regNumber || ''}
                      onChange={(e) => {
                        const v = [...(form.vehicles || [])];
                        const current = v[0] || { type: '4_wheeler', regNumber: '' };
                        v[0] = { ...current, regNumber: e.target.value.toUpperCase() };
                        setForm({ ...form, vehicles: v });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 font-mono uppercase focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Allocated Parking Slot</label>
                    <input
                      type="text"
                      placeholder="P-A101"
                      value={form.vehicles?.[0]?.parkingSlotNumber || ''}
                      onChange={(e) => {
                        const v = [...(form.vehicles || [])];
                        const current = v[0] || { type: '4_wheeler', regNumber: '' };
                        v[0] = { ...current, parkingSlotNumber: e.target.value.toUpperCase() };
                        setForm({ ...form, vehicles: v });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 uppercase focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm"
                >
                  Save Member Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OWNERSHIP TRANSFER / SOLD MODAL */}
      {transferModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-2xl p-6 space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Property Ownership Transfer</h3>
                <p className="text-xs text-slate-500">Flat: {selectedMember.flatNumber} (Current: {selectedMember.fullName})</p>
              </div>
              <button onClick={() => setTransferModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-3.5">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-800">
                This will mark <strong>{selectedMember.fullName}</strong> as Sold/Transferred in historical registers and provision a new active Member master for the incoming owner.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Buyer / Owner Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Kulkarni"
                  value={transferData.newOwnerName || ''}
                  onChange={(e) => setTransferData({ ...transferData, newOwnerName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Buyer Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98200 99999"
                    value={transferData.newOwnerPhone || ''}
                    onChange={(e) => setTransferData({ ...transferData, newOwnerPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Buyer PAN Number</label>
                  <input
                    type="text"
                    placeholder="BKPPS9988H"
                    value={transferData.newOwnerPan || ''}
                    onChange={(e) => setTransferData({ ...transferData, newOwnerPan: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 font-mono uppercase focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Transfer Execution Date</label>
                <input
                  type="date"
                  required
                  value={transferData.transferDate || ''}
                  onChange={(e) => setTransferData({ ...transferData, transferDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
