import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  Plus, 
  Search, 
  Truck, 
  Car, 
  User, 
  CheckCircle, 
  LogOut, 
  Phone, 
  QrCode, 
  Share2, 
  Download, 
  Bell, 
  AlertTriangle, 
  FileText, 
  Send, 
  Copy, 
  Check, 
  X,
  Sparkles,
  Camera,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { VisitorLog, FlatShopConfig, SocietyConfig, UserProfile } from '../types';
import { exportToExcel } from '../utils/billingEngine';

interface VisitorGateProps {
  society: SocietyConfig;
  visitors: VisitorLog[];
  onUpdateVisitors: (visitors: VisitorLog[]) => void;
  flats: FlatShopConfig[];
  currentUser: UserProfile;
}

export const VisitorGate: React.FC<VisitorGateProps> = ({
  society,
  visitors,
  onUpdateVisitors,
  flats,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'inside' | 'pre_approved' | 'checked_out'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Gatekeeper Quick Pass Verification Bar
  const [quickCodeSearch, setQuickCodeSearch] = useState('');
  const [quickVerifyResult, setQuickVerifyResult] = useState<VisitorLog | null>(null);

  // New Pass Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [visName, setVisName] = useState('');
  const [visPhone, setVisPhone] = useState('');
  const [visFlat, setVisFlat] = useState(currentUser.flatNumber || flats?.[0]?.flatNumber || 'A-101');
  const [visWing, setVisWing] = useState(flats?.[0]?.wingName || 'Wing A');
  const [visPurpose, setVisPurpose] = useState('Guest / Personal Visit');
  const [visType, setVisType] = useState<any>('guest');
  const [visVehicle, setVisVehicle] = useState('');
  const [visPersons, setVisPersons] = useState(1);
  const [visExpectedDate, setVisExpectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [visExpectedTime, setVisExpectedTime] = useState('06:00 PM - 09:00 PM');
  const [visDirectCheckIn, setVisDirectCheckIn] = useState(false); // If gatekeeper is logging walk-in directly

  // Share / View Pass Modal
  const [selectedPass, setSelectedPass] = useState<VisitorLog | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Real-time Resident Notification Banner Toast
  const [latestNotification, setLatestNotification] = useState<{ message: string; timestamp: string } | null>(null);

  const isResident = currentUser.role === 'resident';
  const isSecurityOrAdmin = currentUser.role === 'security' || currentUser.role === 'society_admin' || currentUser.role === 'super_admin';

  // Filter visitors
  const filteredVisitors = (visitors || []).filter(v => {
    // If resident and logged in, only show their flat entries unless viewing all
    if (isResident && currentUser.flatNumber) {
      if (v.flatNumber !== currentUser.flatNumber) return false;
    }

    if (activeTab === 'inside' && v.status !== 'inside') return false;
    if (activeTab === 'pre_approved' && v.status !== 'pre_approved') return false;
    if (activeTab === 'checked_out' && v.status !== 'checked_out') return false;

    if (typeFilter !== 'all') {
      if (v.type !== typeFilter && v.visitorType !== typeFilter) return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match = 
        v.visitorName.toLowerCase().includes(q) ||
        v.flatNumber.toLowerCase().includes(q) ||
        (v.phone && v.phone.includes(q)) ||
        (v.visitorPhone && v.visitorPhone.includes(q)) ||
        (v.passCode && v.passCode.includes(q)) ||
        (v.vehicleNumber && v.vehicleNumber.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  // Calculate Overstay (> 4 hours inside)
  const isOverstayed = (v: VisitorLog): boolean => {
    if (v.status !== 'inside') return false;
    const timeStr = v.checkInTime || v.entryTimestamp || v.createdAt;
    if (!timeStr) return false;
    const entry = new Date(timeStr).getTime();
    if (isNaN(entry)) return false;
    const now = Date.now();
    const diffHours = (now - entry) / (1000 * 60 * 60);
    return !isNaN(diffHours) && diffHours >= 4;
  };

  // Pre-Approve or Create Visitor Entry Pass
  const handleCreateVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visName.trim()) {
      alert('Please enter visitor name');
      return;
    }

    const flat = flats.find(f => f.flatNumber === visFlat);
    const passCode = String(Math.floor(100000 + Math.random() * 900000));
    const nowIso = new Date().toISOString();

    const newVis: VisitorLog = {
      id: `vis-${Date.now()}`,
      societyId: society.id,
      visitorName: visName.trim(),
      phone: visPhone.trim() || '+91 98000 00000',
      visitorPhone: visPhone.trim() || '+91 98000 00000',
      flatNumber: visFlat,
      wingName: flat?.wingName || visWing,
      purpose: visPurpose,
      type: visType,
      visitorType: visType,
      vehicleNumber: visVehicle.trim() || undefined,
      numberOfPersons: visPersons,
      expectedDate: visExpectedDate,
      expectedTimeSlot: visExpectedTime,
      status: visDirectCheckIn ? 'inside' : 'pre_approved',
      checkInTime: visDirectCheckIn ? nowIso : undefined,
      entryTimestamp: visDirectCheckIn ? nowIso : undefined,
      passCode: passCode,
      gatePassOtp: passCode,
      approvedByResident: true,
      approvedByResidentName: currentUser.fullName,
      residentNotifiedEntry: visDirectCheckIn,
      entryGate: 'Main Gate 1',
      guardName: isSecurityOrAdmin ? currentUser.fullName : 'Security Guard On-Duty',
      createdAt: nowIso
    };

    onUpdateVisitors([newVis, ...visitors]);
    setModalOpen(false);
    setSelectedPass(newVis);

    // Reset Form
    setVisName('');
    setVisPhone('');
    setVisVehicle('');
    setVisDirectCheckIn(false);

    if (visDirectCheckIn) {
      setLatestNotification({
        message: `🔔 Ding! ${newVis.visitorName} (${newVis.purpose}) checked in at Main Gate 1 for Flat ${newVis.flatNumber}.`,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  // Gatekeeper Quick Verify by Code / Phone
  const handleQuickVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCodeSearch.trim()) return;

    const q = quickCodeSearch.trim();
    const found = visitors.find(v => 
      v.passCode === q || 
      v.gatePassOtp === q || 
      (v.phone && v.phone.includes(q)) || 
      (v.visitorPhone && v.visitorPhone.includes(q))
    );

    if (found) {
      setQuickVerifyResult(found);
    } else {
      alert(`No active visitor pass found for code or phone "${q}". You can create a walk-in entry pass.`);
    }
  };

  // Gate Check-In Action
  const handleCheckIn = (id: string) => {
    const nowIso = new Date().toISOString();
    const updated = visitors.map(v => {
      if (v.id === id) {
        return {
          ...v,
          status: 'inside' as const,
          checkInTime: nowIso,
          entryTimestamp: nowIso,
          residentNotifiedEntry: true,
          entryGate: 'Main Gate 1',
          guardName: currentUser.fullName || 'Security Guard'
        };
      }
      return v;
    });

    onUpdateVisitors(updated);
    const target = updated.find(v => v.id === id);
    if (target) {
      setLatestNotification({
        message: `🔔 Ding! ${target.visitorName} arrived at Main Gate 1. SMS/WhatsApp notification dispatched to Flat ${target.flatNumber}.`,
        timestamp: new Date().toLocaleTimeString()
      });
      setQuickVerifyResult(null);
      setQuickCodeSearch('');
    }
  };

  // Gate Check-Out Action
  const handleCheckOut = (id: string) => {
    const nowIso = new Date().toISOString();
    const updated = visitors.map(v => {
      if (v.id === id) {
        return {
          ...v,
          status: 'checked_out' as const,
          checkOutTime: nowIso,
          exitTimestamp: nowIso,
          residentNotifiedExit: true,
          exitGate: 'Main Gate 1'
        };
      }
      return v;
    });

    onUpdateVisitors(updated);
    const target = updated.find(v => v.id === id);
    if (target) {
      setLatestNotification({
        message: `🚪 Visitor ${target.visitorName} checked out from Main Gate 1. Flat ${target.flatNumber} notified.`,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  // Export to Excel
  const handleExportVisitorLog = () => {
    const data = visitors.map(v => ({
      "Pass Code": v.passCode || v.gatePassOtp || '',
      "Visitor Name": v.visitorName,
      "Phone": v.phone || v.visitorPhone || '',
      "Flat Number": v.flatNumber,
      "Wing": v.wingName || '',
      "Category": (v.type || v.visitorType || 'guest').toUpperCase(),
      "Purpose": v.purpose,
      "Vehicle No": v.vehicleNumber || 'Pedestrian',
      "Persons": v.numberOfPersons || 1,
      "Status": v.status.toUpperCase(),
      "Check In Time": v.checkInTime ? new Date(v.checkInTime).toLocaleString() : 'Not Yet Entered',
      "Check Out Time": v.checkOutTime ? new Date(v.checkOutTime).toLocaleString() : 'Still Inside'
    }));

    exportToExcel(data, `Gate_Security_Visitor_Log_${society.name.slice(0, 15)}`, "Visitor_Security_Log");
  };

  // Stats Counters
  const insideCount = visitors.filter(v => v.status === 'inside').length;
  const preApprovedCount = visitors.filter(v => v.status === 'pre_approved').length;
  const overstayCount = visitors.filter(v => isOverstayed(v)).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md border border-blue-200">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Smart Gatekeeper & Visitor Security System</h2>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider">
              Real-time In/Out Alerts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pre-register guests, generate digital QR entry passes, verify cab/delivery arrivals at security gates, and track vehicle logs.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportVisitorLog}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 transition border border-slate-300"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Gate Logs</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-md text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{isResident ? 'Pre-Approve Visitor / Cab' : 'New Visitor / Delivery Pass'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Notification Banner */}
      {latestNotification && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 text-xs text-emerald-900 flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600 shrink-0 animate-bounce" />
            <span className="font-semibold">{latestNotification.message}</span>
            <span className="text-[10px] text-emerald-700 font-mono">({latestNotification.timestamp})</span>
          </div>
          <button onClick={() => setLatestNotification(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Currently Inside Society</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{insideCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active visitor & delivery entries</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Pre-Approved Passes</span>
            <QrCode className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{preApprovedCount}</div>
          <div className="text-[11px] text-emerald-700/80 mt-0.5">Expected guests & scheduled service</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Overstay Warnings (&gt;4h)</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">{overstayCount}</div>
          <div className="text-[11px] text-amber-700/80 mt-0.5">Unusually long duration inside</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Today's Total Passes</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{visitors.length}</div>
          <div className="text-[11px] text-indigo-700/80 mt-0.5">Checked in & verified at gates</div>
        </div>
      </div>

      {/* SECURITY GATEKEEPER QUICK VERIFICATION SEARCH BAR */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 rounded-xl shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Gatekeeper Quick Code Verification & 1-Click Entry</h3>
          </div>
          <span className="text-[11px] text-blue-200">Main Gate 1 • Intercom Active</span>
        </div>

        <form onSubmit={handleQuickVerify} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Enter 6-digit Pass Code (e.g. 784192) or Visitor Phone Number..."
              value={quickCodeSearch}
              onChange={(e) => setQuickCodeSearch(e.target.value)}
              className="w-full bg-white text-slate-900 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>Verify Pass Code</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Result Popup Card */}
        {quickVerifyResult && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[11px]">
                  #{quickVerifyResult.passCode}
                </span>
                <strong className="text-white text-sm">{quickVerifyResult.visitorName}</strong>
                <span className="text-blue-200">({quickVerifyResult.purpose})</span>
              </div>
              <p className="text-blue-100 text-[11px] mt-0.5">
                Destination: <strong>Flat {quickVerifyResult.flatNumber}</strong> • Approved by: {quickVerifyResult.approvedByResidentName || 'Resident'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {quickVerifyResult.status === 'pre_approved' ? (
                <button
                  onClick={() => handleCheckIn(quickVerifyResult.id)}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-md shadow-xs transition flex items-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Allow Gate Entry (Check In)</span>
                </button>
              ) : quickVerifyResult.status === 'inside' ? (
                <button
                  onClick={() => handleCheckOut(quickVerifyResult.id)}
                  className="px-4 py-1.5 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-md shadow-xs transition flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Departure (Check Out)</span>
                </button>
              ) : (
                <span className="text-slate-300 text-xs italic">Already Checked Out</span>
              )}
              <button 
                onClick={() => setQuickVerifyResult(null)}
                className="text-white/60 hover:text-white px-2 py-1 text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Tab Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search visitor name, flat no, phone, vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-xs bg-slate-100 p-0.5 rounded-md border border-slate-200">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded transition text-xs font-semibold ${
                typeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('guest')}
              className={`px-3 py-1 rounded transition text-xs font-semibold ${
                typeFilter === 'guest' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Guests
            </button>
            <button
              onClick={() => setTypeFilter('delivery')}
              className={`px-3 py-1 rounded transition text-xs font-semibold ${
                typeFilter === 'delivery' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Deliveries
            </button>
            <button
              onClick={() => setTypeFilter('cab')}
              className={`px-3 py-1 rounded transition text-xs font-semibold ${
                typeFilter === 'cab' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cabs
            </button>
            <button
              onClick={() => setTypeFilter('service')}
              className={`px-3 py-1 rounded transition text-xs font-semibold ${
                typeFilter === 'service' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Service Staff
            </button>
          </div>
        </div>

        {/* Sub Status Pills */}
        <div className="flex items-center gap-1 border-t border-slate-100 pt-2 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-md font-semibold transition ${
              activeTab === 'all' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Logs ({visitors.length})
          </button>
          <button
            onClick={() => setActiveTab('inside')}
            className={`px-3 py-1 rounded-md font-semibold transition ${
              activeTab === 'inside' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Currently Inside ({insideCount})
          </button>
          <button
            onClick={() => setActiveTab('pre_approved')}
            className={`px-3 py-1 rounded-md font-semibold transition ${
              activeTab === 'pre_approved' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pre-Approved Passes ({preApprovedCount})
          </button>
          <button
            onClick={() => setActiveTab('checked_out')}
            className={`px-3 py-1 rounded-md font-semibold transition ${
              activeTab === 'checked_out' ? 'bg-slate-100 text-slate-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Departed / Checked Out
          </button>
        </div>
      </div>

      {/* Visitor Logs Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Pass # & Visitor</th>
              <th className="px-4 py-3">Flat & Host Resident</th>
              <th className="px-4 py-3">Category & Purpose</th>
              <th className="px-4 py-3">Vehicle & Gate</th>
              <th className="px-4 py-3">Entry / Exit Time</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Gate Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredVisitors.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No visitor logs found matching your filters.
                </td>
              </tr>
            ) : (
              filteredVisitors.map((v) => {
                const overstay = isOverstayed(v);
                return (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3">
                      <span className="font-mono text-blue-700 font-bold block">#{v.passCode || v.gatePassOtp}</span>
                      <strong className="text-slate-900">{v.visitorName}</strong>
                      <span className="text-[10px] text-slate-400 block">{v.phone || v.visitorPhone}</span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-blue-700 font-mono font-bold block">Flat {v.flatNumber}</span>
                      <span className="text-[11px] text-slate-600">{v.approvedByResidentName || 'Resident Member'}</span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                        {v.type || v.visitorType || 'Guest'}
                      </span>
                      <p className="text-[11px] text-slate-600 mt-0.5 truncate max-w-[160px]">{v.purpose}</p>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-mono text-slate-800 font-medium">{v.vehicleNumber || 'Pedestrian'}</div>
                      <div className="text-[10px] text-slate-400">{v.entryGate || 'Main Gate 1'}</div>
                    </td>

                    <td className="px-4 py-3">
                      {v.checkInTime || v.entryTimestamp ? (
                        <div>
                          <span className="text-emerald-700 font-semibold block">
                            In: {new Date(v.checkInTime || v.entryTimestamp || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {v.checkOutTime || v.exitTimestamp ? (
                            <span className="text-slate-400 text-[10px] block">
                              Out: {new Date(v.checkOutTime || v.exitTimestamp || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          ) : (
                            <span className="text-blue-600 text-[10px] font-bold">Currently Inside</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Expected: {v.expectedTimeSlot || 'Today'}</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {v.status === 'inside' ? (
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Inside Society
                          </span>
                          {overstay && (
                            <span className="block mt-1 px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                              ⚠️ Overstay &gt;4h
                            </span>
                          )}
                        </div>
                      ) : v.status === 'pre_approved' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Pre-Approved
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                          Checked Out
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPass(v)}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px]"
                          title="View Digital Pass & QR"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        {v.status === 'pre_approved' && (
                          <button
                            onClick={() => handleCheckIn(v.id)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition"
                          >
                            Check In
                          </button>
                        )}

                        {v.status === 'inside' && (
                          <button
                            onClick={() => handleCheckOut(v.id)}
                            className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 transition"
                          >
                            Check Out
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE VISITOR / PRE-APPROVAL MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-2xl p-6 space-y-4 text-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md border border-blue-200">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {isResident ? 'Pre-Approve Visitor / Cab Pass' : 'New Visitor / Delivery Check-In'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateVisitor} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Visitor Category</label>
                <div className="grid grid-cols-4 gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setVisType('guest')}
                    className={`p-2 rounded border text-center font-bold transition flex flex-col items-center gap-1 ${
                      visType === 'guest' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Guest</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisType('delivery')}
                    className={`p-2 rounded border text-center font-bold transition flex flex-col items-center gap-1 ${
                      visType === 'delivery' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisType('cab')}
                    className={`p-2 rounded border text-center font-bold transition flex flex-col items-center gap-1 ${
                      visType === 'cab' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Car className="w-4 h-4" />
                    <span>Cab/Taxi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisType('service')}
                    className={`p-2 rounded border text-center font-bold transition flex flex-col items-center gap-1 ${
                      visType === 'service' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Technician</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Visitor / Driver Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma / Swiggy Delivery Agent"
                  value={visName}
                  onChange={(e) => setVisName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98000 00000"
                    value={visPhone}
                    onChange={(e) => setVisPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Flat</label>
                  <select
                    value={visFlat}
                    onChange={(e) => {
                      setVisFlat(e.target.value);
                      const f = flats.find(fl => fl.flatNumber === e.target.value);
                      if (f?.wingName) setVisWing(f.wingName);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white font-mono font-bold"
                  >
                    {flats.map(f => (
                      <option key={f.id} value={f.flatNumber}>{f.flatNumber} ({f.wingName})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle No. (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. MH-02-BQ-3321"
                    value={visVehicle}
                    onChange={(e) => setVisVehicle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. of Persons</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={visPersons}
                    onChange={(e) => setVisPersons(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Visit Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. Parcel delivery / Dinner gathering / AC servicing"
                  value={visPurpose}
                  onChange={(e) => setVisPurpose(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Direct Gate Check-In toggle for Security */}
              {isSecurityOrAdmin && (
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={visDirectCheckIn}
                    onChange={(e) => setVisDirectCheckIn(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Log instant gate check-in right now (Visitor is at the gate)</span>
                </label>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-md bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm"
                >
                  Generate Digital Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIGITAL PASS / QR CODE POPUP */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-sm shadow-2xl p-5 space-y-4 text-slate-800 text-center relative">
            <button
              onClick={() => setSelectedPass(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>

            <div className="border-b border-dashed border-slate-200 pb-2">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">Digital Gate Entry Pass</span>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">{society.name}</h3>
            </div>

            {/* QR Code Container */}
            <div className="w-36 h-36 bg-slate-50 border-2 border-slate-900 rounded-xl mx-auto flex items-center justify-center p-2 shadow-xs">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GATE_PASS_${selectedPass.passCode}_TO_FLAT_${selectedPass.flatNumber}`} 
                alt="Gate Pass QR"
                className="w-full h-full object-contain"
              />
            </div>

            {/* 6-Digit Verification Code */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Security Verification Code</span>
              <div className="font-mono text-2xl font-black text-blue-600 tracking-widest bg-blue-50 py-1 px-3 rounded-lg inline-block border border-blue-200 mt-1">
                {selectedPass.passCode || selectedPass.gatePassOtp}
              </div>
            </div>

            {/* Pass Metadata */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Visitor:</span>
                <strong className="text-slate-900">{selectedPass.visitorName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destination:</span>
                <strong className="text-blue-700 font-mono">Flat {selectedPass.flatNumber} ({selectedPass.wingName})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Purpose:</span>
                <span className="text-slate-700 truncate max-w-[160px]">{selectedPass.purpose}</span>
              </div>
              {selectedPass.vehicleNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle:</span>
                  <span className="font-mono text-slate-800">{selectedPass.vehicleNumber}</span>
                </div>
              )}
            </div>

            {/* Share / Copy Action */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-md transition flex items-center justify-center gap-1"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  alert(`Pass #${selectedPass.passCode} shared via WhatsApp / SMS to ${selectedPass.phone || 'Visitor'}`);
                }}
                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md shadow-xs transition flex items-center justify-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
