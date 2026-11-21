import React, { useState } from 'react';
import { 
  Sliders, 
  Percent, 
  Clock, 
  Receipt, 
  ShieldAlert, 
  Save, 
  Check, 
  Plus, 
  Trash2, 
  Layers, 
  Sparkles,
  DollarSign
} from 'lucide-react';
import { SocietyConfig, MaintenanceChargeHead } from '../types';
import { formatINR } from '../utils/billingEngine';

interface MaintenanceChargeSetupProps {
  society: SocietyConfig;
  onUpdateSociety: (updated: SocietyConfig) => void;
  chargeHeads: MaintenanceChargeHead[];
  onUpdateChargeHeads: (heads: MaintenanceChargeHead[]) => void;
}

export const MaintenanceChargeSetup: React.FC<MaintenanceChargeSetupProps> = ({
  society,
  onUpdateSociety,
  chargeHeads,
  onUpdateChargeHeads
}) => {
  const [activeTab, setActiveTab] = useState<'heads' | 'interest' | 'late_fees' | 'gst'>('heads');
  const [socConfig, setSocConfig] = useState(society);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Charge Head State
  const [newHeadName, setNewHeadName] = useState('');
  const [newCategory, setNewCategory] = useState<any>('regular');
  const [newCalcType, setNewCalcType] = useState<any>('fixed_per_flat');
  const [newDefaultAmount, setNewDefaultAmount] = useState(1500);
  const [newSqftRate, setNewSqftRate] = useState(1.5);
  const [newIsTaxable, setNewIsTaxable] = useState(true);

  const handleSaveConfigs = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSociety(socConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddChargeHead = () => {
    if (!newHeadName.trim()) return;
    const newHead: MaintenanceChargeHead = {
      id: `head-${Date.now()}`,
      societyId: society.id,
      name: newHeadName.trim(),
      category: newCategory,
      calculationType: newCalcType,
      defaultAmount: Number(newDefaultAmount) || 0,
      sqftRate: newCalcType === 'per_sqft' ? Number(newSqftRate) : undefined,
      flatTypeRates: newCalcType === 'flat_type_wise' ? {
        '1BHK': 1500,
        '2BHK': 2200,
        '3BHK': 3200,
        '4BHK': 4200,
        'Penthouse': 5500,
        'Commercial_Shop': 3500
      } : undefined,
      isTaxableGST: newIsTaxable,
      isActive: true
    };

    onUpdateChargeHeads([...chargeHeads, newHead]);
    setNewHeadName('');
  };

  const handleToggleHeadActive = (id: string) => {
    onUpdateChargeHeads(
      chargeHeads.map(h => h.id === id ? { ...h, isActive: !h.isActive } : h)
    );
  };

  const handleDeleteHead = (id: string) => {
    onUpdateChargeHeads(chargeHeads.filter(h => h.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md border border-blue-200">
              <Sliders className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Maintenance Billing Rules & Statutory Engine</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure Fund heads, Flexible Interest formulas, Late Payment penalties, and GST rules.
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab('heads')}
            className={`px-3 py-1 rounded transition text-xs ${
              activeTab === 'heads' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Charge Heads ({chargeHeads.length})
          </button>
          <button
            onClick={() => setActiveTab('interest')}
            className={`px-3 py-1 rounded transition text-xs ${
              activeTab === 'interest' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Flexible Interest Engine
          </button>
          <button
            onClick={() => setActiveTab('late_fees')}
            className={`px-3 py-1 rounded transition text-xs ${
              activeTab === 'late_fees' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Late Payment Charges
          </button>
          <button
            onClick={() => setActiveTab('gst')}
            className={`px-3 py-1 rounded transition text-xs ${
              activeTab === 'gst' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            GST 18% Rules
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: MAINTENANCE CHARGE HEADS */}
      {activeTab === 'heads' && (
        <div className="space-y-6">
          {/* Add New Head Form */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Define New Maintenance Charge Head</h3>
            <p className="text-xs text-slate-500 mb-4">
              Supports Regular, Repair Fund, Sinking Fund, Water, Parking, Non-Occupancy, Security, Lift AMC, or custom heads.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Charge Head Title</label>
                <input
                  type="text"
                  placeholder="e.g. Garden Landscaping & Beautification Fund"
                  value={newHeadName || ''}
                  onChange={(e) => setNewHeadName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Calculation Method</label>
                <select
                  value={newCalcType || 'fixed_per_flat'}
                  onChange={(e) => setNewCalcType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="fixed_per_flat">Fixed Flat Rate (Equal for All)</option>
                  <option value="per_sqft">Area Wise (Sq.Ft. Rate)</option>
                  <option value="flat_type_wise">Flat Type Tier (1BHK/2BHK/3BHK)</option>
                  <option value="case_to_case">Case-to-Case (Vehicle / Non-Occupancy)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {newCalcType === 'per_sqft' ? 'Rate per Sq.Ft. (₹)' : 'Default Amount (₹)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={(newCalcType === 'per_sqft' ? newSqftRate : newDefaultAmount) ?? 0}
                  onChange={(e) => newCalcType === 'per_sqft' ? setNewSqftRate(Number(e.target.value)) : setNewDefaultAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={newIsTaxable}
                  onChange={(e) => setNewIsTaxable(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 border-slate-300"
                />
                <span>Subject to GST (if monthly threshold exceeded)</span>
              </label>

              <button
                type="button"
                onClick={handleAddChargeHead}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded-md text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Charge Head</span>
              </button>
            </div>
          </div>

          {/* Active Heads List */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Configured Society Charge Heads</h3>
              <span className="text-xs text-blue-600 font-semibold">{chargeHeads.length} Heads Active</span>
            </div>

            <div className="divide-y divide-slate-100">
              {chargeHeads.map((head) => (
                <div key={head.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{head.name}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                        {head.category}
                      </span>
                      {head.isTaxableGST ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          GST Taxable
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                          GST Exempt
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Basis:{' '}
                      <strong className="text-slate-800">
                        {head.calculationType === 'fixed_per_flat' && `Fixed ₹${head.defaultAmount}/month`}
                        {head.calculationType === 'per_sqft' && `₹${head.sqftRate || 1.5} per Sq.Ft. built-up`}
                        {head.calculationType === 'flat_type_wise' && `Tiered by Flat Type (e.g. 2BHK: ₹2,200, 3BHK: ₹3,200)`}
                        {head.calculationType === 'case_to_case' && `Applicable on allocation (Vehicles / Tenant flat 10%)`}
                      </strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() => handleToggleHeadActive(head.id)}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                        head.isActive 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {head.isActive ? 'Active in Bills' : 'Paused'}
                    </button>
                    <button
                      onClick={() => handleDeleteHead(head.id)}
                      className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                      title="Remove Head"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: FLEXIBLE INTEREST CALCULATION ENGINE */}
      {activeTab === 'interest' && (
        <form onSubmit={handleSaveConfigs} className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Percent className="w-4 h-4 text-blue-600" />
                Flexible Delayed Payment Interest Calculation Engine
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculate statutory simple or compounding interest on unpaid dues per State Co-operative Society bylaws.
              </p>
            </div>
            {saveSuccess && (
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-1 rounded-md font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Updated!
              </span>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-lg text-xs text-blue-900 space-y-1">
            <strong>Bylaws Note:</strong> Under Maharashtra & Model Housing Society Bylaws, default interest cannot exceed 21% p.a.
            Interest is calculated strictly on Principal Arrears, not on previous interest, preventing illegal interest-on-interest.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Interest Feature State</label>
              <select
                value={socConfig.interestConfig.enabled ? 'true' : 'false'}
                onChange={(e) => setSocConfig({
                  ...socConfig,
                  interestConfig: { ...socConfig.interestConfig, enabled: e.target.value === 'true' }
                })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="true">Enabled (Auto-Calculate on Due Bills)</option>
                <option value="false">Disabled (No Interest Applicable)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Interest Rate (% p.a.)</label>
              <input
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={socConfig.interestConfig.ratePercentPerAnnum}
                onChange={(e) => setSocConfig({
                  ...socConfig,
                  interestConfig: { ...socConfig.interestConfig, ratePercentPerAnnum: Number(e.target.value) }
                })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-blue-700 font-bold focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Calculation Basis</label>
              <select
                value={socConfig.interestConfig.basis}
                onChange={(e) => setSocConfig({
                  ...socConfig,
                  interestConfig: { ...socConfig.interestConfig, basis: e.target.value as any }
                })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="due_date">From Due Date (Standard Grace Period)</option>
                <option value="bill_date">From Bill Date (Immediate Period Start)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 pt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Frequency Periodicity</label>
              <select
                value={socConfig.interestConfig.calculationFrequency}
                onChange={(e) => setSocConfig({
                  ...socConfig,
                  interestConfig: { ...socConfig.interestConfig, calculationFrequency: e.target.value as any }
                })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="daily">Daily Prorated Basis (e.g. Rate/365 per day delayed)</option>
                <option value="yearly">Monthly / Yearly Periodic Split</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Apply on Opening Migrated Balances</label>
              <select
                value={socConfig.interestConfig.applyOnOpeningBalance ? 'true' : 'false'}
                onChange={(e) => setSocConfig({
                  ...socConfig,
                  interestConfig: { ...socConfig.interestConfig, applyOnOpeningBalance: e.target.value === 'true' }
                })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="true">Yes, calculate interest on historical opening arrears</option>
                <option value="false">No, only calculate on new generated overdue bills</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-md text-xs shadow-sm transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Interest Calculation Rules</span>
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 3: LATE PAYMENT CHARGES */}
      {activeTab === 'late_fees' && (
        <form onSubmit={handleSaveConfigs} className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Late Payment Fixed Penalties Configuration
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Set daily or monthly flat penalties differentiated for residential flats and commercial shops.
              </p>
            </div>
            {saveSuccess && (
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-1 rounded-md font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Late Fee Engine</label>
              <select
                value={socConfig.lateFeeConfig.enabled ? 'true' : 'false'}
                onChange={(e) => setSocConfig({
                  ...socConfig,
                  lateFeeConfig: { ...socConfig.lateFeeConfig, enabled: e.target.value === 'true' }
                })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Penalty Calculation Type</label>
              <select
                value={socConfig.lateFeeConfig.type}
                onChange={(e) => setSocConfig({
                  ...socConfig,
                  lateFeeConfig: { ...socConfig.lateFeeConfig, type: e.target.value as any }
                })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="per_month">Per Month Overdue (Lump sum)</option>
                <option value="per_day">Per Day Delayed (Daily Accumulation)</option>
                <option value="fixed">Fixed Single Penalty</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Flat Penalty (₹)</label>
              <input
                type="number"
                value={socConfig.lateFeeConfig.flatRate}
                onChange={(e) => setSocConfig({
                  ...socConfig,
                  lateFeeConfig: { ...socConfig.lateFeeConfig, flatRate: Number(e.target.value) }
                })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Commercial Shop Penalty (₹)</label>
              <input
                type="number"
                value={socConfig.lateFeeConfig.shopRate}
                onChange={(e) => setSocConfig({
                  ...socConfig,
                  lateFeeConfig: { ...socConfig.lateFeeConfig, shopRate: Number(e.target.value) }
                })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Grace Period Days (after due date)</label>
            <input
              type="number"
              min="0"
              max="30"
              value={socConfig.lateFeeConfig.gracePeriodDays}
              onChange={(e) => setSocConfig({
                ...socConfig,
                lateFeeConfig: { ...socConfig.lateFeeConfig, gracePeriodDays: Number(e.target.value) }
              })}
              className="w-48 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
            <p className="text-xs text-slate-500 mt-1">Penalties start applying only if bill remains unpaid after this grace window.</p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-md text-xs shadow-sm transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Late Fee Policies</span>
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 4: GST 18% STATUTORY CONFIGURATION */}
      {activeTab === 'gst' && (
        <form onSubmit={handleSaveConfigs} className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                GST 18% Housing Society Applicability & Statutory Split
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Indian GST Law: Housing societies with turnover &gt; ₹20 Lakhs and maintenance charges &gt; ₹7,500/month per flat.
              </p>
            </div>
            {saveSuccess && (
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-1 rounded-md font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GST Billing Toggle</label>
              <select
                value={socConfig.gstConfig.enabled ? 'true' : 'false'}
                onChange={(e) => setSocConfig({
                  ...socConfig,
                  gstConfig: { ...socConfig.gstConfig, enabled: e.target.value === 'true' }
                })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="true">Turn GST ON (Compute CGST + SGST on eligible bills)</option>
                <option value="false">Turn GST OFF (Small society exemption)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Society GSTIN Number</label>
              <input
                type="text"
                placeholder="27AABCG1234F1Z9"
                value={socConfig.gstConfig.gstin}
                onChange={(e) => setSocConfig({
                  ...socConfig,
                  gstConfig: { ...socConfig.gstConfig, gstin: e.target.value.toUpperCase() }
                })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-blue-700 font-mono uppercase focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-slate-200 pt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CGST Rate (%)</label>
              <input
                type="number"
                value={socConfig.gstConfig.cgstRate}
                onChange={(e) => setSocConfig({
                  ...socConfig,
                  gstConfig: { ...socConfig.gstConfig, cgstRate: Number(e.target.value) }
                })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SGST Rate (%)</label>
              <input
                type="number"
                value={socConfig.gstConfig.sgstRate}
                onChange={(e) => setSocConfig({
                  ...socConfig,
                  gstConfig: { ...socConfig.gstConfig, sgstRate: Number(e.target.value) }
                })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Exemption Limit (₹)</label>
              <input
                type="number"
                value={socConfig.gstConfig.thresholdPerMonth}
                onChange={(e) => setSocConfig({
                  ...socConfig,
                  gstConfig: { ...socConfig.gstConfig, thresholdPerMonth: Number(e.target.value) }
                })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-md text-xs shadow-sm transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save GST Configuration</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
