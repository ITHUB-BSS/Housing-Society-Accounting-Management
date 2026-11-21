import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  KeyRound, 
  Crown, 
  Sparkles, 
  Receipt, 
  Users, 
  Sliders, 
  FileText, 
  CalendarClock, 
  LogOut, 
  BellRing, 
  Flame, 
  Layers, 
  Send,
  Database,
  Wrench
} from 'lucide-react';
import { UserProfile, SocietyConfig, SystemVersionRelease } from '../types';

interface NavbarProps {
  currentUser: UserProfile;
  societies: SocietyConfig[];
  currentSociety: SocietyConfig;
  onSelectSociety: (soc: SocietyConfig) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenSubscription: () => void;
  pendingVersionReleasesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  societies,
  currentSociety,
  onSelectSociety,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  onOpenSubscription,
  pendingVersionReleasesCount
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const isSecurity = currentUser.role === 'security';
  const isResident = currentUser.role === 'resident';

  const daysLeftTrial = Math.max(0, Math.ceil(
    (new Date(currentSociety.subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ));

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
      {/* Promotional / Super Admin Status Top Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 px-4 py-1.5 text-xs text-white font-medium flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full text-[11px] shadow-sm uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Special Promo
          </span>
          <span>1st Month 100% Free Trial Active for All New Societies! ({daysLeftTrial} days remaining in trial)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-100">
            <Database className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            <span>Live Firebase Firestore: Connected</span>
          </div>
          {isSuperAdmin && pendingVersionReleasesCount > 0 && (
            <button
              onClick={() => setActiveTab('super_admin')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-bold text-[11px] flex items-center gap-1 transition"
            >
              <BellRing className="w-3 h-3 animate-bounce" />
              {pendingVersionReleasesCount} Changes Awaiting Live Approval
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">SocietyPrime</span>
                <span className="bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  TallyPrime Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">SaaS Housing Society Billing & Automation</p>
            </div>
          </div>

          {/* Active Society Indicator */}
          <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">Active Society:</span>
              <span className="text-xs font-bold text-white max-w-[220px] truncate">{currentSociety.name}</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-semibold">Live</span>
            </div>
          </div>

          {/* User Profile & Quick Actions */}
          <div className="flex items-center gap-3">
            {/* Subscription Button */}
            <button
              onClick={onOpenSubscription}
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs shadow-md transition"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Subscription & Plans</span>
            </button>

            {/* Current User Pill */}
            <div className="flex items-center gap-2.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <img 
                src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"} 
                alt="Avatar" 
                className="w-7 h-7 rounded-full object-cover border border-amber-400" 
              />
              <div className="text-left">
                <div className="text-xs font-bold text-slate-200 leading-none">{currentUser.fullName}</div>
                <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                  {currentUser.role === 'super_admin' && <Crown className="w-2.5 h-2.5" />}
                  {currentUser.role === 'society_admin' && <ShieldCheck className="w-2.5 h-2.5" />}
                  {currentUser.role === 'resident' && <UserCheck className="w-2.5 h-2.5" />}
                  {currentUser.role === 'security' && <KeyRound className="w-2.5 h-2.5" />}
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
            </div>

            {/* Switch User / Role Button */}
            <button
              onClick={onOpenAuth}
              title="Switch User Profile or Login"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            >
              <Users className="w-4 h-4" />
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              title="Logout"
              className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('super_admin')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'super_admin'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              SaaS Super Admin
              {pendingVersionReleasesCount > 0 && (
                <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {pendingVersionReleasesCount}
                </span>
              )}
            </button>
          )}

          {!isResident && !isSecurity && (
            <>
              <button
                onClick={() => setActiveTab('society_setup')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'society_setup'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                🏢 Society Setup
              </button>

              <button
                onClick={() => setActiveTab('members_master')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'members_master'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                👥 Members Master
              </button>

              <button
                onClick={() => setActiveTab('charge_setup')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'charge_setup'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                🧾 Maintenance Charges & GST
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('billing_dashboard')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'billing_dashboard'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            💳 Billing & UPI QR Invoices
          </button>

          {!isResident && !isSecurity && (
            <button
              onClick={() => setActiveTab('collections_fifo')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'collections_fifo'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              💰 Collections (FIFO & PDC)
            </button>
          )}

          {!isResident && !isSecurity && (
            <button
              onClick={() => setActiveTab('reports_registers')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'reports_registers'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              📊 Registers & Form J/I
            </button>
          )}

          {!isResident && !isSecurity && (
            <button
              onClick={() => setActiveTab('communication_hub')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'communication_hub'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              📲 Reminders (Email/WhatsApp)
            </button>
          )}

          <button
            onClick={() => setActiveTab('amenities_booking')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'amenities_booking'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            🏊 Amenity Bookings
          </button>

          <button
            onClick={() => setActiveTab('complaints_helpdesk')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'complaints_helpdesk'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            🔧 Helpdesk & Complaints
          </button>

          <button
            onClick={() => setActiveTab('visitor_gate')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'visitor_gate'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            🚪 Visitor Logs & Security
          </button>
        </nav>
      </div>
    </header>
  );
};
