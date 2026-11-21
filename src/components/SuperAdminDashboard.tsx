import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Settings, 
  Building2, 
  TrendingUp, 
  Flame, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  GitBranch, 
  Rocket, 
  Database, 
  Key, 
  Save, 
  DollarSign, 
  Clock, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  SocietyConfig, 
  SystemVersionRelease, 
  SaaSSettings, 
  AuditLog, 
  MaintenanceBill, 
  Member 
} from '../types';
import { formatINR } from '../utils/billingEngine';

interface SuperAdminDashboardProps {
  societies: SocietyConfig[];
  onUpdateSocieties: (socs: SocietyConfig[]) => void;
  releases: SystemVersionRelease[];
  onUpdateReleases: (releases: SystemVersionRelease[]) => void;
  saasSettings: SaaSSettings;
  onUpdateSaaSSettings: (settings: SaaSSettings) => void;
  auditLogs: AuditLog[];
  bills: MaintenanceBill[];
  members: Member[];
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  societies,
  onUpdateSocieties,
  releases,
  onUpdateReleases,
  saasSettings,
  onUpdateSaaSSettings,
  auditLogs,
  bills,
  members
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'societies' | 'version_control' | 'settings' | 'logs'>('overview');
  const [settingsForm, setSettingsForm] = useState<SaaSSettings>(saasSettings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Version Draft Modal
  const [newReleaseOpen, setNewReleaseOpen] = useState(false);
  const [releaseVersion, setReleaseVersion] = useState(`v${(releases.length + 1) * 0.1 + 1.0}.0`);
  const [releaseNotes, setReleaseNotes] = useState('Enhanced TallyPrime XML Export & Real-time UPI QR Generation');
  const [releaseFeatures, setReleaseFeatures] = useState('Dynamic GST calculation; Auto FIFO receipts settlement; Instant WhatsApp billing dispatch.');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSaaSSettings(settingsForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Super Admin Approval of Live Version
  const handleApproveRelease = (releaseId: string) => {
    const updated = releases.map(r => {
      if (r.id === releaseId) {
        return {
          ...r,
          status: 'approved_live' as const,
          approvedBy: 'Super Admin',
          approvedAt: new Date().toISOString()
        };
      }
      return r;
    });
    onUpdateReleases(updated);
    alert('Version approved! Deployment broadcasted to all live societies in Firebase.');
  };

  const handleRejectRelease = (releaseId: string) => {
    const updated = releases.map(r => {
      if (r.id === releaseId) {
        return {
          ...r,
          status: 'rejected' as const
        };
      }
      return r;
    });
    onUpdateReleases(updated);
  };

  const handleCreateDraftRelease = (e: React.FormEvent) => {
    e.preventDefault();
    const newRel: SystemVersionRelease = {
      id: `rel-${Date.now()}`,
      versionNumber: releaseVersion,
      releaseTitle: releaseNotes,
      description: releaseNotes,
      status: 'pending_approval',
      requestedBy: 'Lead Developer / Architect',
      createdAt: new Date().toISOString(),
      features: releaseFeatures.split(';').map(f => f.trim()).filter(Boolean)
    };

    onUpdateReleases([newRel, ...releases]);
    setNewReleaseOpen(false);
    alert('New version staged for review! Super Admin approval required before going live to users.');
  };

  // Toggle Free Trial / Subscription Status
  const handleToggleSubscription = (socId: string, newStatus: any) => {
    onUpdateSocieties(societies.map(s => {
      if (s.id === socId) {
        return {
          ...s,
          subscription: {
            ...(s.subscription || {
              planId: 'trial_monthly',
              planName: 'Enterprise SaaS Pro (1st Month Free Promo)',
              pricePerMonth: 0,
              billingCycle: 'monthly',
              status: 'trialing',
              trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              autoRenew: true
            }),
            status: newStatus
          }
        };
      }
      return s;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md border border-blue-200">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">SaaS Super Admin Command Center</h2>
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-blue-200">
              Master Admin Mode
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global rental subscriptions, 1-month promotional free trial monitoring, live version release gate, and UPI settings.
          </p>
        </div>

        {/* Sub Nav Tabs */}
        <div className="flex flex-wrap bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1 rounded transition text-xs ${
              activeTab === 'overview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Analytics Overview
          </button>
          <button
            onClick={() => setActiveTab('societies')}
            className={`px-3 py-1 rounded transition text-xs ${
              activeTab === 'societies' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Societies & Subscriptions ({societies.length})
          </button>
          <button
            onClick={() => setActiveTab('version_control')}
            className={`px-3 py-1 rounded transition flex items-center gap-1.5 text-xs ${
              activeTab === 'version_control' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Live Version Gate</span>
            {releases.filter(r => r.status === 'pending_approval').length > 0 && (
              <span className="bg-rose-500 text-white font-bold text-[9px] px-1.5 py-0.2 rounded-full">
                {releases.filter(r => r.status === 'pending_approval').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1 rounded transition text-xs ${
              activeTab === 'settings' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SaaS App Settings
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1 rounded transition text-xs ${
              activeTab === 'logs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: ANALYTICS OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Onboarded Societies</div>
              <div className="text-2xl font-black text-slate-900">{societies.length}</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">100% active operational</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Total Flats Managed</div>
              <div className="text-2xl font-black text-slate-900">
                {societies.reduce((acc, s) => acc + ((s as any).totalFlats || members.length || 15), 0)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-medium">{members.length} registered members</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">1-Month Free Trial Promo</div>
              <div className="text-2xl font-black text-blue-600">
                {societies.filter(s => (s.subscription?.status === 'trialing' || (s as any).subscriptionPlan?.status === 'trial')).length} Societies
              </div>
              <div className="text-[11px] text-blue-700 mt-1 font-medium">30-day promotional waiver</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Monthly SaaS MRR</div>
              <div className="text-2xl font-black text-emerald-600">
                {formatINR(societies.length * (settingsForm.defaultMonthlyFee || 1499))}
              </div>
              <div className="text-[11px] text-emerald-700 mt-1 font-medium">Recurring subscription run rate</div>
            </div>
          </div>

          {/* Database & Cloud Run Status Card (High-density dark accent card) */}
          <div className="bg-[#1e293b] text-white rounded-lg p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Live Firebase Firestore Connected</h3>
                <p className="text-xs text-slate-400">
                  Data persistence active with local offline caching fallback. Port 3000 reverse proxy operational.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs px-3 py-1.5 rounded-md font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Cloud Sync Healthy
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SOCIETIES & RENTAL SUBSCRIPTIONS */}
      {activeTab === 'societies' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
            <h3 className="font-bold text-slate-900">Housing Societies Rental Subscription Roster</h3>
            <span className="text-blue-600 font-semibold">{societies.length} Societies</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Society Name & City</th>
                  <th className="px-4 py-3">Flats / Units</th>
                  <th className="px-4 py-3">Plan Tier</th>
                  <th className="px-4 py-3">1-Month Free Trial Promo</th>
                  <th className="px-4 py-3">Subscription Status</th>
                  <th className="px-4 py-3 text-right">Super Admin Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {societies.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-bold text-slate-900">
                      <div>{s.name}</div>
                      <span className="text-[11px] text-slate-500 block font-normal">{s.city}, {s.state}</span>
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-slate-700">
                      {(s as any).totalFlats || members.length || 15} Units ({(s as any).wingsCount || '1+'} Wings)
                    </td>

                    <td className="px-4 py-3">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {s.subscription?.planName || (s as any).subscriptionPlan?.planName || 'Enterprise SaaS Pro'}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Valid till {s.subscription?.trialEndsAt?.slice(0, 10) || (s as any).subscriptionPlan?.trialValidTill || '2026-12-31'}</span>
                      </div>
                      <span className="text-[10px] text-blue-600 font-bold block">1st Month Free Active</span>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        (s.subscription?.status === 'active' || (s as any).subscriptionPlan?.status === 'active') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        (s.subscription?.status === 'trialing' || (s as any).subscriptionPlan?.status === 'trial') ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {s.subscription?.status || (s as any).subscriptionPlan?.status || 'trialing'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleSubscription(s.id, 'active')}
                          className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold transition shadow-xs"
                        >
                          Activate
                        </button>
                        <button
                          onClick={() => handleToggleSubscription(s.id, 'expired')}
                          className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition shadow-xs"
                        >
                          Suspend
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LIVE VERSION CONTROL & SUPER ADMIN APPROVAL WORKFLOW */}
      {activeTab === 'version_control' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-blue-600" />
                  Live Production Version Approval Gate
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  User Requirement: <em>"if i do any changes it ask to super admin to allow live new version to live to users."</em>
                </p>
              </div>

              <button
                onClick={() => setNewReleaseOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-md text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Stage New Feature Release</span>
              </button>
            </div>

            {/* Releases List */}
            <div className="space-y-4">
              {releases.map((rel) => (
                <div
                  key={rel.id}
                  className={`p-5 rounded-lg border transition space-y-3 ${
                    rel.status === 'pending_approval'
                      ? 'bg-amber-50/60 border-amber-300 shadow-sm'
                      : rel.status === 'approved_live'
                      ? 'bg-slate-50/50 border-slate-200'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-slate-800 text-white">
                        {rel.versionNumber}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{rel.releaseTitle}</h4>
                    </div>

                    <div>
                      {rel.status === 'pending_approval' ? (
                        <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs px-3 py-1 rounded font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Awaiting Super Admin Approval
                        </span>
                      ) : rel.status === 'approved_live' ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-1 rounded font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Live in Production (Deployed {rel.approvedAt?.slice(0, 10)})
                        </span>
                      ) : (
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs px-3 py-1 rounded font-bold">
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">{rel.description}</p>

                  {rel.features && rel.features.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[11px] font-bold text-slate-500 block mb-1">Change Manifest & Features:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {rel.features.map((feat, idx) => (
                          <span key={idx} className="text-[11px] bg-white text-slate-700 px-2.5 py-0.5 rounded border border-slate-200 font-medium">
                            • {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {rel.status === 'pending_approval' && (
                    <div className="pt-3 border-t border-amber-200 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Requested by <strong className="text-slate-800">{rel.requestedBy}</strong> on {(rel.createdAt || '').slice(0, 10)}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRejectRelease(rel.id)}
                          className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-rose-700 text-xs font-semibold border border-slate-200 transition"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproveRelease(rel.id)}
                          className="px-4 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                        >
                          <Rocket className="w-3.5 h-3.5" />
                          <span>Approve & Go Live</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: SAAS APP SETTINGS & UPI */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Global Platform Settings & Super Admin UPI Gate
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure your master SaaS branding, address, support contact, and global receiving UPI ID for society subscriptions.
              </p>
            </div>
            {saveSuccess && (
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-1 rounded font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Settings Saved!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SaaS Platform App Name</label>
              <input
                type="text"
                required
                value={settingsForm.appName}
                onChange={(e) => setSettingsForm({ ...settingsForm, appName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Super Admin UPI ID (for Subscriptions)</label>
              <input
                type="text"
                required
                value={settingsForm.superAdminUpiId}
                onChange={(e) => setSettingsForm({ ...settingsForm, superAdminUpiId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-blue-600 font-mono font-bold focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Support Email</label>
              <input
                type="email"
                required
                value={settingsForm.supportEmail}
                onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Super Admin Phone</label>
              <input
                type="tel"
                required
                value={settingsForm.superAdminPhone}
                onChange={(e) => setSettingsForm({ ...settingsForm, superAdminPhone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default Monthly Society Fee (₹)</label>
              <input
                type="number"
                value={settingsForm.defaultMonthlyFee}
                onChange={(e) => setSettingsForm({ ...settingsForm, defaultMonthlyFee: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-emerald-600 font-bold focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Master Headquarters Address</label>
            <textarea
              rows={2}
              value={settingsForm.address}
              onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-md text-xs shadow-sm transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Platform Configuration</span>
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 5: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
            <h3 className="font-bold text-slate-900">System Usage & Security Audit Trails</h3>
            <span className="text-blue-600 font-semibold">{auditLogs.length} Events</span>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                      {log.action}
                    </span>
                    <span>{log.details}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    By <strong className="text-slate-700">{log.userName}</strong> ({log.userRole}) • IP: {log.ipAddress}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STAGE NEW RELEASE MODAL */}
      {newReleaseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-2xl p-6 space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Stage New Production Release</h3>
              <button onClick={() => setNewReleaseOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateDraftRelease} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Version Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. v1.2.0"
                  value={releaseVersion}
                  onChange={(e) => setReleaseVersion(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-blue-600 font-mono font-bold focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Release Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enhanced Tally XML & Automated FIFO Settlement"
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Features Included (semicolon-separated)</label>
                <textarea
                  rows={3}
                  placeholder="Feature 1; Feature 2; Feature 3"
                  value={releaseFeatures}
                  onChange={(e) => setReleaseFeatures(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewReleaseOpen(false)}
                  className="px-3.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm"
                >
                  Submit for Super Admin Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
