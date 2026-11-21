import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  Flame, 
  AlertTriangle,
  Gift,
  Crown,
  Receipt,
  Users,
  Sliders,
  FileText,
  CalendarClock,
  LogOut,
  BellRing,
  Send,
  Database,
  ShieldCheck,
  UserCheck,
  KeyRound,
  Menu,
  X
} from 'lucide-react';
import { 
  UserProfile, 
  SocietyConfig, 
  FlatShopConfig, 
  Wing, 
  Member, 
  MaintenanceChargeHead, 
  MaintenanceBill, 
  CollectionReceipt, 
  Amenity, 
  AmenityBooking, 
  VisitorLog, 
  NoticeItem, 
  SystemVersionRelease, 
  SaaSSettings, 
  AuditLog,
  ComplaintTicket,
  SocietyStaffMember
} from './types';
import { 
  initialSocieties, 
  initialWings, 
  initialFlats, 
  initialMembers, 
  initialChargeHeads, 
  initialBills, 
  initialReceipts, 
  initialAmenities, 
  initialBookings, 
  initialVisitors, 
  initialComplaints,
  initialStaffMembers,
  initialNotices, 
  initialReleases, 
  initialSaaSSettings, 
  initialAuditLogs 
} from './mockData';
import { fetchCollection, saveDocument } from './firebase';

// Components
import { LoginPage } from './components/LoginPage';
import { AuthModal } from './components/AuthModal';
import { SocietySetup } from './components/SocietySetup';
import { MembersMaster } from './components/MembersMaster';
import { MaintenanceChargeSetup } from './components/MaintenanceChargeSetup';
import { BillingDashboard } from './components/BillingDashboard';
import { CollectionsFIFO } from './components/CollectionsFIFO';
import { ReportsRegisters } from './components/ReportsRegisters';
import { CommunicationHub } from './components/CommunicationHub';
import { AmenityBookingModule } from './components/AmenityBooking';
import { VisitorGate } from './components/VisitorGate';
import { ComplaintsPortal } from './components/ComplaintsPortal';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { BillPrintModal } from './components/BillPrintModal';
import { PaymentGatewayModal } from './components/PaymentGatewayModal';

export default function App() {
  // Navigation & Auth State
  const [activeTab, setActiveTab] = useState('billing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('societyprime_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Application Data States
  const [societies, setSocieties] = useState<SocietyConfig[]>(initialSocieties);
  const [selectedSociety, setSelectedSociety] = useState<SocietyConfig>(initialSocieties[0]);
  const [wings, setWings] = useState<Wing[]>(initialWings);
  const [flats, setFlats] = useState<FlatShopConfig[]>(initialFlats);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [chargeHeads, setChargeHeads] = useState<MaintenanceChargeHead[]>(initialChargeHeads);
  const [bills, setBills] = useState<MaintenanceBill[]>(initialBills);
  const [receipts, setReceipts] = useState<CollectionReceipt[]>(initialReceipts);
  const [amenities, setAmenities] = useState<Amenity[]>(initialAmenities);
  const [bookings, setBookings] = useState<AmenityBooking[]>(initialBookings);
  const [visitors, setVisitors] = useState<VisitorLog[]>(initialVisitors);
  const [complaints, setComplaints] = useState<ComplaintTicket[]>(initialComplaints);
  const [staffMembers, setStaffMembers] = useState<SocietyStaffMember[]>(initialStaffMembers);
  const [notices, setNotices] = useState<NoticeItem[]>(initialNotices);
  const [releases, setReleases] = useState<SystemVersionRelease[]>(initialReleases);
  const [saasSettings, setSaaSSettings] = useState<SaaSSettings>(initialSaaSSettings);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  // Modal States
  const [selectedBillForPrint, setSelectedBillForPrint] = useState<MaintenanceBill | null>(null);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<MaintenanceBill | null>(null);

  // Sync with Firestore (or fallback storage) on mount
  useEffect(() => {
    async function loadData() {
      try {
        const firestoreSocieties = await fetchCollection<SocietyConfig>('societies', initialSocieties);
        if (firestoreSocieties.length > 0) {
          setSocieties(firestoreSocieties);
          setSelectedSociety(firestoreSocieties[0]);
        }

        const firestoreBills = await fetchCollection<MaintenanceBill>('bills', initialBills);
        if (firestoreBills.length > 0) {
          setBills(firestoreBills);
        }

        const firestoreMembers = await fetchCollection<Member>('members', initialMembers);
        if (firestoreMembers.length > 0) {
          setMembers(firestoreMembers);
        }
      } catch (err) {
        console.log('Using local fallback seed data:', err);
      }
    }
    loadData();
  }, []);

  // Update Handlers with Firestore auto-save
  const handleUpdateSociety = async (updated: SocietyConfig) => {
    setSelectedSociety(updated);
    setSocieties(societies.map(s => s.id === updated.id ? updated : s));
    await saveDocument('societies', updated);
  };

  const handleUpdateMembers = async (updatedMembers: Member[]) => {
    setMembers(updatedMembers);
    for (const m of updatedMembers.slice(0, 5)) {
      await saveDocument('members', m);
    }
  };

  const handleUpdateBills = async (updatedBills: MaintenanceBill[]) => {
    setBills(updatedBills);
    for (const b of updatedBills.slice(0, 5)) {
      await saveDocument('bills', b);
    }
  };

  const handleUpdateReceipts = async (updatedReceipts: CollectionReceipt[]) => {
    setReceipts(updatedReceipts);
    for (const r of updatedReceipts.slice(0, 5)) {
      await saveDocument('receipts', r);
    }
  };

  const handlePaymentSuccess = (receipt: CollectionReceipt, updatedBill: MaintenanceBill) => {
    handleUpdateReceipts([receipt, ...receipts]);
    handleUpdateBills(bills.map(b => b.id === updatedBill.id ? updatedBill : b));
  };

  const handleLogout = () => {
    localStorage.removeItem('societyprime_user');
    setCurrentUser(null);
    setActiveTab('billing');
  };

  const handleLoginSuccess = async (user: UserProfile, targetSoc?: SocietyConfig, updatedSocieties?: SocietyConfig[]) => {
    if (updatedSocieties && updatedSocieties.length > 0) {
      setSocieties(updatedSocieties);
    }
    setCurrentUser(user);
    localStorage.setItem('societyprime_user', JSON.stringify(user));

    if (targetSoc) {
      setSelectedSociety(targetSoc);
      try {
        await saveDocument('societies', targetSoc);
      } catch (e) {
        console.log('Saved society locally', e);
      }
    } else if (user.societyId) {
      const found = (updatedSocieties || societies).find(s => s.id === user.societyId);
      if (found) setSelectedSociety(found);
    }

    if (user.role === 'super_admin' || user.role === 'superadmin') {
      setActiveTab('superadmin');
    } else if (user.role === 'security') {
      setActiveTab('visitors');
    } else {
      setActiveTab('billing');
    }
  };

  // If not logged in, render the Login Page as the FIRST PAGE
  if (!currentUser) {
    return (
      <LoginPage
        societies={societies}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const pendingReleasesCount = releases.filter(r => r.status === 'pending_approval' || r.status === 'pending_super_admin_approval').length;
  const isSuperAdmin = currentUser.role === 'superadmin' || currentUser.role === 'super_admin';
  const isSecurity = currentUser.role === 'security';
  const isResident = currentUser.role === 'resident';

  const tabTitles: Record<string, string> = {
    billing: 'Maintenance Billing & Invoicing (FIFO/Tally)',
    collections: 'Collections & FIFO Settlement Ledger',
    members: 'Members Master & Share Registry (Form I/J)',
    society_setup: 'Society Setup & Units Configuration',
    charges_setup: 'Maintenance Charge Heads & GST Rules',
    reports: 'Statutory Registers & Audit Reports',
    communication: 'Communication Hub & Notice Board',
    amenities: 'Amenity Bookings & Facilities',
    complaints: 'Resident Complaints & Maintenance Helpdesk',
    visitors: 'Visitor Logs & Gate Security',
    superadmin: 'SaaS Super Admin Command Center'
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 font-sans overflow-hidden select-none">
      {/* HIGH DENSITY SLATE SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] text-slate-300 flex flex-col border-r border-slate-700/80 transition-transform duration-200 ease-in-out
        md:static md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-black text-base shadow-sm">
              H
            </div>
            <div className="leading-tight">
              <p className="text-white font-bold text-sm tracking-tight">{saasSettings.appName || 'HousingNexus'}</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">
                {isSuperAdmin ? 'SaaS Super Admin' : 'Housing ERP Portal'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Categories */}
        <nav className="flex-1 py-3 text-xs font-medium overflow-y-auto scrollbar-thin">
          {/* Section: Management */}
          <div className="px-5 mb-1.5 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
            Management
          </div>

          <button
            onClick={() => { setActiveTab('billing'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center px-5 py-2 transition-colors text-left ${
              activeTab === 'billing'
                ? 'bg-slate-800 text-white border-l-4 border-blue-500 font-semibold'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <span className="mr-2.5 opacity-80 text-sm">📊</span>
            <span>Billing & Invoices</span>
          </button>

          {!isResident && !isSecurity && (
            <>
              <button
                onClick={() => { setActiveTab('society_setup'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center px-5 py-2 transition-colors text-left ${
                  activeTab === 'society_setup'
                    ? 'bg-slate-800 text-white border-l-4 border-blue-500 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span className="mr-2.5 opacity-80 text-sm">🏢</span>
                <span>Society Setup</span>
              </button>

              <button
                onClick={() => { setActiveTab('members'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center px-5 py-2 transition-colors text-left ${
                  activeTab === 'members'
                    ? 'bg-slate-800 text-white border-l-4 border-blue-500 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span className="mr-2.5 opacity-80 text-sm">👥</span>
                <span>Members Master</span>
              </button>

              <button
                onClick={() => { setActiveTab('charges_setup'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center px-5 py-2 transition-colors text-left ${
                  activeTab === 'charges_setup'
                    ? 'bg-slate-800 text-white border-l-4 border-blue-500 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span className="mr-2.5 opacity-80 text-sm">💰</span>
                <span>Charges & GST</span>
              </button>
            </>
          )}

          {/* Section: Operations */}
          <div className="px-5 mt-4 mb-1.5 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
            Operations
          </div>

          <button
            onClick={() => { setActiveTab('visitors'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center px-5 py-2 transition-colors text-left ${
              activeTab === 'visitors'
                ? 'bg-slate-800 text-white border-l-4 border-blue-500 font-semibold'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <span className="mr-2.5 opacity-80 text-sm">🛡️</span>
            <span>Visitor Logs</span>
          </button>

          <button
            onClick={() => { setActiveTab('amenities'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center px-5 py-2 transition-colors text-left ${
              activeTab === 'amenities'
                ? 'bg-slate-800 text-white border-l-4 border-blue-500 font-semibold'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <span className="mr-2.5 opacity-80 text-sm">📅</span>
            <span>Amenity Bookings</span>
          </button>

          <button
            onClick={() => { setActiveTab('complaints'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center px-5 py-2 transition-colors text-left ${
              activeTab === 'complaints'
                ? 'bg-slate-800 text-white border-l-4 border-blue-500 font-semibold'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <span className="mr-2.5 opacity-80 text-sm">🔧</span>
            <span>Helpdesk & Complaints</span>
          </button>

          {!isResident && !isSecurity && (
            <button
              onClick={() => { setActiveTab('communication'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center px-5 py-2 transition-colors text-left ${
                activeTab === 'communication'
                  ? 'bg-slate-800 text-white border-l-4 border-blue-500 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <span className="mr-2.5 opacity-80 text-sm">📲</span>
              <span>Reminders & Notice</span>
            </button>
          )}

          {/* Section: ERP & Accounting */}
          {!isResident && !isSecurity && (
            <>
              <div className="px-5 mt-4 mb-1.5 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
                ERP & Accounting
              </div>

              <button
                onClick={() => { setActiveTab('collections'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center px-5 py-2 transition-colors text-left ${
                  activeTab === 'collections'
                    ? 'bg-slate-800 text-white border-l-4 border-blue-500 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span className="mr-2.5 opacity-80 text-sm">🧾</span>
                <span>Collections (FIFO)</span>
              </button>

              <button
                onClick={() => { setActiveTab('reports'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center px-5 py-2 transition-colors text-left ${
                  activeTab === 'reports'
                    ? 'bg-slate-800 text-white border-l-4 border-blue-500 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span className="mr-2.5 opacity-80 text-sm">📑</span>
                <span>Registers (Form I/J)</span>
              </button>
            </>
          )}

          {/* Section: Developer / SaaS Admin */}
          <div className="px-5 mt-4 mb-1.5 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
            Developer / SaaS
          </div>

          <button
            onClick={() => { setActiveTab('superadmin'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-5 py-2 transition-colors text-left ${
              activeTab === 'superadmin'
                ? 'bg-slate-800 text-white border-l-4 border-blue-500 font-semibold'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center">
              <span className="mr-2.5 opacity-80 text-sm">⚙️</span>
              <span>SaaS Super Admin</span>
            </div>
            {pendingReleasesCount > 0 && (
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                {pendingReleasesCount}
              </span>
            )}
          </button>
        </nav>

        {/* Authenticated User Status in Sidebar */}
        <div className="p-3.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
              {(currentUser?.fullName || currentUser?.name || currentUser?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden leading-tight">
              <p className="text-xs font-bold text-white truncate">
                {currentUser?.fullName || currentUser?.name || 'User'}
              </p>
              <p className="text-[10px] text-blue-400 font-medium capitalize truncate">
                {currentUser?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Promo Active Footer Card */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80">
          <div className="bg-blue-600/10 border border-blue-500/30 p-2.5 rounded text-[11px]">
            <div className="flex items-center justify-between mb-1">
              <p className="text-blue-400 font-bold tracking-wide uppercase text-[9.5px]">PROMO ACTIVE</p>
              <span className="bg-blue-500/20 text-blue-300 text-[8.5px] px-1.5 py-0.2 rounded font-bold">30 DAYS</span>
            </div>
            <p className="text-slate-400 text-[10px] leading-tight">
              1 Month Free Trial active for all society modules.
            </p>
          </div>
        </div>
      </aside>

      {/* Backdrop for Mobile */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* HIGH DENSITY WHITE HEADER */}
        <header className="h-14 sm:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-slate-600 hover:text-slate-900 p-1.5 rounded-lg border border-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {tabTitles[activeTab] || 'System Analytics Dashboard'}
            </h1>
            
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live: v4.2.1-stable
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            {/* Active Society Display (Auto-opened for user) */}
            <div className="hidden sm:flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-900 px-3 py-1 rounded-md text-xs font-semibold shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate max-w-[180px] sm:max-w-[240px] font-bold text-slate-800">
                {selectedSociety.name}
              </span>
              <span className="text-[9.5px] bg-blue-100/90 text-blue-700 px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider">
                Active
              </span>
            </div>

            {/* Authenticated User Status */}
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Authenticated as</p>
              <p className="text-xs font-bold text-slate-800">
                {currentUser.fullName || currentUser.name || currentUser.email} <span className="text-blue-600 font-semibold">({currentUser.role.replace('_', ' ')})</span>
              </p>
            </div>

            {/* User Action Trigger / Switch Role */}
            <button
              onClick={() => setAuthModalOpen(true)}
              title="Switch User Profile or Login"
              className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700 hover:bg-slate-200 transition shadow-2xs"
            >
              {(currentUser?.fullName || currentUser?.name || currentUser?.email || 'U').charAt(0).toUpperCase()}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Sign Out / Back to Login"
              className="flex items-center gap-1 text-slate-500 hover:text-rose-600 px-2 py-1 rounded-md text-xs font-semibold hover:bg-rose-50 transition border border-transparent hover:border-rose-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* PENDING VERSION APPROVAL ALERT BANNER */}
        {pendingReleasesCount > 0 && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-8 py-2 flex items-center justify-between text-xs font-medium text-amber-900 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-800">⚠ PENDING VERSION:</span>
              <span className="hidden sm:inline">Development build #842 waiting for Super Admin Live Deployment approval.</span>
              <span className="sm:hidden">{pendingReleasesCount} update waiting approval.</span>
            </div>
            <button
              onClick={() => setActiveTab('superadmin')}
              className="bg-amber-600 text-white px-3 py-1 rounded text-[11px] font-bold hover:bg-amber-700 transition shrink-0"
            >
              APPROVE DEPLOYMENT
            </button>
          </div>
        )}

        {/* MAIN SCROLLABLE CONTENT BODY */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* TAB 1: BILLING DASHBOARD */}
            {activeTab === 'billing' && (
              <BillingDashboard
                society={selectedSociety}
                bills={bills}
                onUpdateBills={handleUpdateBills}
                flats={flats}
                members={members}
                chargeHeads={chargeHeads}
                wings={wings}
                currentUser={currentUser}
                onOpenBillPrint={(bill) => setSelectedBillForPrint(bill)}
                onOpenPaymentGateway={(bill) => setSelectedBillForPayment(bill)}
                onSendReminder={(bill, channel) => {
                  alert(`Dispatched automated overdue reminder for ${bill.memberName} via ${channel.toUpperCase()}!`);
                }}
              />
            )}

            {/* TAB 2: COLLECTIONS & FIFO */}
            {activeTab === 'collections' && (
              <CollectionsFIFO
                society={selectedSociety}
                receipts={receipts}
                onUpdateReceipts={handleUpdateReceipts}
                bills={bills}
                onUpdateBills={handleUpdateBills}
                flats={flats}
                members={members}
              />
            )}

            {/* TAB 3: MEMBERS MASTER */}
            {activeTab === 'members' && (
              <MembersMaster
                society={selectedSociety}
                members={members}
                onUpdateMembers={handleUpdateMembers}
                flats={flats}
              />
            )}

            {/* TAB 4: SOCIETY & UNIT SETUP */}
            {activeTab === 'society_setup' && (
              <SocietySetup
                society={selectedSociety}
                onUpdateSociety={handleUpdateSociety}
                wings={wings}
                onUpdateWings={setWings}
                flats={flats}
                onUpdateFlats={setFlats}
              />
            )}

            {/* TAB 5: MAINTENANCE CHARGE HEADS & INTEREST */}
            {activeTab === 'charges_setup' && (
              <MaintenanceChargeSetup
                society={selectedSociety}
                onUpdateSociety={handleUpdateSociety}
                chargeHeads={chargeHeads}
                onUpdateChargeHeads={setChargeHeads}
              />
            )}

            {/* TAB 6: REPORTS & STATUTORY REGISTERS */}
            {activeTab === 'reports' && (
              <ReportsRegisters
                society={selectedSociety}
                members={members}
                bills={bills}
                receipts={receipts}
                flats={flats}
              />
            )}

            {/* TAB 7: COMMUNICATION HUB */}
            {activeTab === 'communication' && (
              <CommunicationHub
                society={selectedSociety}
                members={members}
                bills={bills}
                notices={notices}
                onUpdateNotices={setNotices}
              />
            )}

            {/* TAB 8: AMENITY BOOKINGS */}
            {activeTab === 'amenities' && (
              <AmenityBookingModule
                society={selectedSociety}
                amenities={amenities}
                bookings={bookings}
                onUpdateBookings={setBookings}
                flats={flats}
                currentUser={currentUser}
              />
            )}

            {/* TAB 8.5: RESIDENT COMPLAINTS & HELPDESK */}
            {activeTab === 'complaints' && (
              <ComplaintsPortal
                society={selectedSociety}
                complaints={complaints}
                staffMembers={staffMembers}
                flats={flats}
                currentUser={currentUser}
                onUpdateComplaints={setComplaints}
              />
            )}

            {/* TAB 9: VISITOR SECURITY GATE */}
            {activeTab === 'visitors' && (
              <VisitorGate
                society={selectedSociety}
                visitors={visitors}
                onUpdateVisitors={setVisitors}
                flats={flats}
                currentUser={currentUser}
              />
            )}

            {/* TAB 10: SUPER ADMIN DASHBOARD */}
            {activeTab === 'superadmin' && (
              <SuperAdminDashboard
                societies={societies}
                onUpdateSocieties={setSocieties}
                releases={releases}
                onUpdateReleases={setReleases}
                saasSettings={saasSettings}
                onUpdateSaaSSettings={setSaaSSettings}
                auditLogs={auditLogs}
                bills={bills}
                members={members}
              />
            )}
          </div>
        </main>
      </div>

      {/* AUTH & OTP MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setAuthModalOpen(false);
        }}
        currentUser={currentUser}
      />

      {/* BILL PRINT MODAL */}
      <BillPrintModal
        isOpen={Boolean(selectedBillForPrint)}
        onClose={() => setSelectedBillForPrint(null)}
        bill={selectedBillForPrint}
        society={selectedSociety}
        onPayNow={(bill) => {
          setSelectedBillForPrint(null);
          setSelectedBillForPayment(bill);
        }}
      />

      {/* PAYMENT GATEWAY MODAL */}
      <PaymentGatewayModal
        isOpen={Boolean(selectedBillForPayment)}
        onClose={() => setSelectedBillForPayment(null)}
        bill={selectedBillForPayment}
        society={selectedSociety}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

