import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  Home, 
  Car, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Save, 
  Sparkles,
  Info
} from 'lucide-react';
import { SocietyConfig, Wing, FlatShopConfig } from '../types';
import { formatINR } from '../utils/billingEngine';

interface SocietySetupProps {
  society: SocietyConfig;
  onUpdateSociety: (updated: SocietyConfig) => void;
  wings: Wing[];
  onUpdateWings: (wings: Wing[]) => void;
  flats: FlatShopConfig[];
  onUpdateFlats: (flats: FlatShopConfig[]) => void;
}

export const SocietySetup: React.FC<SocietySetupProps> = ({
  society,
  onUpdateSociety,
  wings,
  onUpdateWings,
  flats,
  onUpdateFlats
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'wings' | 'flats' | 'parking'>('flats');
  
  // Society Info State
  const [socForm, setSocForm] = useState(society);
  const [saveAlert, setSaveAlert] = useState(false);

  // New Wing State
  const [newWingName, setNewWingName] = useState('');
  const [newWingFloors, setNewWingFloors] = useState(7);
  const [newWingFlatsPerFloor, setNewWingFlatsPerFloor] = useState(4);

  // New Flat State
  const [flatModalOpen, setFlatModalOpen] = useState(false);
  const [flatForm, setFlatForm] = useState<Partial<FlatShopConfig>>({
    wingName: wings?.[0]?.name ? wings[0].name.split(' ')?.[1] || wings[0].name : 'Wing A',
    flatNumber: 'A-301',
    floorNumber: 3,
    type: '2BHK',
    carpetAreaSqFt: 750,
    builtUpAreaSqFt: 950,
    occupancyStatus: 'owner_occupied',
    openingPrincipalArrears: 0,
    openingInterestArrears: 0,
    advanceBalance: 0
  });

  const handleSaveSocietyInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSociety(socForm);
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 3000);
  };

  const handleAddWing = () => {
    if (!newWingName.trim()) return;
    const newWing: Wing = {
      id: `wing-${Date.now()}`,
      societyId: society.id,
      name: newWingName.trim(),
      floorsCount: Number(newWingFloors),
      flatsPerFloor: Number(newWingFlatsPerFloor)
    };
    onUpdateWings([...wings, newWing]);
    setNewWingName('');
  };

  const handleDeleteWing = (id: string) => {
    onUpdateWings(wings.filter(w => w.id !== id));
  };

  const handleSaveFlat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flatForm.flatNumber) return;

    const newFlat: FlatShopConfig = {
      id: flatForm.id || `flat-${Date.now()}`,
      societyId: society.id,
      wingId: (wings && wings[0]?.id) ? wings[0].id : 'wing-01',
      wingName: flatForm.wingName || (wings && wings[0]?.name) || 'Wing A',
      flatNumber: flatForm.flatNumber,
      floorNumber: Number(flatForm.floorNumber) || 1,
      type: flatForm.type || '2BHK',
      carpetAreaSqFt: Number(flatForm.carpetAreaSqFt) || 750,
      builtUpAreaSqFt: Number(flatForm.builtUpAreaSqFt) || 950,
      occupancyStatus: flatForm.occupancyStatus || 'owner_occupied',
      openingPrincipalArrears: Number(flatForm.openingPrincipalArrears) || 0,
      openingInterestArrears: Number(flatForm.openingInterestArrears) || 0,
      advanceBalance: Number(flatForm.advanceBalance) || 0,
      parkingSlotId: flatForm.parkingSlotId
    };

    if (flatForm.id) {
      onUpdateFlats(flats.map(f => f.id === flatForm.id ? newFlat : f));
    } else {
      onUpdateFlats([...flats, newFlat]);
    }

    setFlatModalOpen(false);
    setFlatForm({
      wingName: 'Wing A',
      flatNumber: '',
      floorNumber: 1,
      type: '2BHK',
      carpetAreaSqFt: 750,
      builtUpAreaSqFt: 950,
      occupancyStatus: 'owner_occupied',
      openingPrincipalArrears: 0,
      openingInterestArrears: 0,
      advanceBalance: 0
    });
  };

  const handleDeleteFlat = (id: string) => {
    if (confirm('Are you sure you want to remove this unit configuration?')) {
      onUpdateFlats(flats.filter(f => f.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md border border-blue-200">
              <Building2 className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Society Structure & Master Configuration</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure Wings, Floors, Flat/Shop types, Built-up Sq.Ft. sizing, and Parking lots for {society.name}.
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveSubTab('flats')}
            className={`px-3 py-1 rounded transition text-xs ${
              activeSubTab === 'flats' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Flats & Shops ({flats.length})
          </button>
          <button
            onClick={() => setActiveSubTab('wings')}
            className={`px-3 py-1 rounded transition text-xs ${
              activeSubTab === 'wings' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Wings & Floors ({wings.length})
          </button>
          <button
            onClick={() => setActiveSubTab('info')}
            className={`px-3 py-1 rounded transition text-xs ${
              activeSubTab === 'info' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Society Legal & Bank Info
          </button>
        </div>
      </div>

      {/* SUB TAB: FLATS & SHOPS */}
      {activeSubTab === 'flats' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Flat & Commercial Shop Units</h2>
              <p className="text-xs text-slate-500">Total units registered: {flats.length} | Area-based calculation ready</p>
            </div>
            <button
              onClick={() => {
                setFlatForm({
                  wingName: (wings && wings[0]?.name) || 'Wing A',
                  flatNumber: `A-${(flats.length + 1) * 100 + 1}`,
                  floorNumber: 1,
                  type: '2BHK',
                  carpetAreaSqFt: 750,
                  builtUpAreaSqFt: 950,
                  occupancyStatus: 'owner_occupied',
                  openingPrincipalArrears: 0,
                  openingInterestArrears: 0,
                  advanceBalance: 0
                });
                setFlatModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-md text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Flat / Shop Unit</span>
            </button>
          </div>

          {/* Units Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Flat / Unit No.</th>
                    <th className="px-4 py-3">Wing & Floor</th>
                    <th className="px-4 py-3">Configuration</th>
                    <th className="px-4 py-3">Built-Up Area</th>
                    <th className="px-4 py-3">Occupancy</th>
                    <th className="px-4 py-3">Opening Principal Arrears</th>
                    <th className="px-4 py-3">Advance Balance</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {flats.map((flat) => (
                    <tr key={flat.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                        <span className="p-1 bg-slate-100 rounded text-blue-600">
                          <Home className="w-3.5 h-3.5" />
                        </span>
                        {flat.flatNumber}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-800">{flat.wingName}</span>
                        <span className="text-[11px] text-slate-400 block">Floor {flat.floorNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded font-semibold text-[10px] uppercase ${
                          flat.type === 'Commercial_Shop' 
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : flat.type === 'Penthouse'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {flat.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-800">{flat.builtUpAreaSqFt} sq.ft</span>
                        <span className="text-[11px] text-slate-400 block">Carpet: {flat.carpetAreaSqFt} sq.ft</span>
                      </td>
                      <td className="px-4 py-3">
                        {flat.occupancyStatus === 'owner_occupied' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Owner Occupied
                          </span>
                        )}
                        {flat.occupancyStatus === 'rented_tenant' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Tenant (10% Non-Occupancy)
                          </span>
                        )}
                        {flat.occupancyStatus === 'vacant' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            Vacant
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {flat.openingPrincipalArrears > 0 ? (
                          <span className="text-rose-600 font-bold">{formatINR(flat.openingPrincipalArrears)}</span>
                        ) : (
                          <span className="text-slate-400">₹0.00</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {flat.advanceBalance > 0 ? (
                          <span className="text-emerald-600 font-bold">{formatINR(flat.advanceBalance)}</span>
                        ) : (
                          <span className="text-slate-400">₹0.00</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setFlatForm(flat);
                              setFlatModalOpen(true);
                            }}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition border border-slate-200"
                            title="Edit Unit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFlat(flat.id)}
                            className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                            title="Delete Unit"
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
        </div>
      )}

      {/* SUB TAB: WINGS & FLOORS */}
      {activeSubTab === 'wings' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-0.5">Create New Wing / Building Block</h2>
            <p className="text-xs text-slate-500 mb-4">Define wings, towers, commercial plazas, and total floor levels.</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Wing Name</label>
                <input
                  type="text"
                  placeholder="e.g. Wing D (Orchid)"
                  value={newWingName}
                  onChange={(e) => setNewWingName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Floors</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newWingFloors}
                  onChange={(e) => setNewWingFloors(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Flats per Floor</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newWingFlatsPerFloor}
                  onChange={(e) => setNewWingFlatsPerFloor(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddWing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 rounded-md text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Wing</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {wings.map((wing) => {
              const wingPrefix = (wing.name || '').split(' ')?.[0] || '';
              const flatCount = flats.filter(f => (wingPrefix && f.wingName && f.wingName.includes(wingPrefix)) || f.wingId === wing.id).length;
              return (
                <div key={wing.id} className="bg-white border border-slate-200 rounded-lg p-5 relative group shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-md border border-blue-200">
                      <Layers className="w-5 h-5" />
                    </div>
                    <button
                      onClick={() => handleDeleteWing(wing.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Wing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{wing.name}</h3>
                  <div className="mt-3 space-y-1 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Floors:</span>
                      <strong className="text-slate-800">{wing.floorsCount} Floors</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Units per Floor:</span>
                      <strong className="text-slate-800">{wing.flatsPerFloor} Units</strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-1.5">
                      <span>Configured Units:</span>
                      <strong className="text-blue-600">{flatCount} Flats/Shops</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB TAB: LEGAL & BANK INFO */}
      {activeSubTab === 'info' && (
        <form onSubmit={handleSaveSocietyInfo} className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Society Legal & UPI Payment Profile</h2>
              <p className="text-xs text-slate-500">Printed on Maintenance Bills, Receipts, and Form J/I registers</p>
            </div>
            {saveAlert && (
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-1 rounded font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Saved Successfully!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Society Registered Legal Name</label>
              <input
                type="text"
                required
                value={socForm.name || ''}
                onChange={(e) => setSocForm({ ...socForm, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Co-op Registration Number</label>
              <input
                type="text"
                required
                value={socForm.registrationNumber || ''}
                onChange={(e) => setSocForm({ ...socForm, registrationNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Address & Area</label>
            <input
              type="text"
              required
              value={socForm.address || ''}
              onChange={(e) => setSocForm({ ...socForm, address: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={socForm.city || ''}
                onChange={(e) => setSocForm({ ...socForm, city: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={socForm.state || ''}
                onChange={(e) => setSocForm({ ...socForm, state: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                value={socForm.pincode || ''}
                onChange={(e) => setSocForm({ ...socForm, pincode: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Bank & UPI Settings */}
          <div className="border-t border-slate-200 pt-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Society Bank Account & UPI QR Destination</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Official Society UPI VPA ID (for Dynamic QR)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. gokuldham.society@sbi"
                  value={socForm.upiId || ''}
                  onChange={(e) => setSocForm({ ...socForm, upiId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-blue-600 font-mono font-bold focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">UPI Payee Display Name</label>
                <input
                  type="text"
                  value={socForm.upiPayeeName || ''}
                  onChange={(e) => setSocForm({ ...socForm, upiPayeeName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={socForm.bankName || ''}
                  onChange={(e) => setSocForm({ ...socForm, bankName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={socForm.accountNumber || ''}
                  onChange={(e) => setSocForm({ ...socForm, accountNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={socForm.ifscCode || ''}
                  onChange={(e) => setSocForm({ ...socForm, ifscCode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 font-mono uppercase focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Name</label>
                <input
                  type="text"
                  value={socForm.branch || ''}
                  onChange={(e) => setSocForm({ ...socForm, branch: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-md text-xs shadow-sm transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Society Details</span>
            </button>
          </div>
        </form>
      )}

      {/* FLAT / SHOP MODAL */}
      {flatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {flatForm.id ? 'Edit Flat / Shop Unit' : 'Configure New Flat / Shop Unit'}
              </h3>
              <button onClick={() => setFlatModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveFlat} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Flat / Unit Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A-101"
                    value={flatForm.flatNumber || ''}
                    onChange={(e) => setFlatForm({ ...flatForm, flatNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Wing Name</label>
                  <select
                    value={flatForm.wingName || ''}
                    onChange={(e) => setFlatForm({ ...flatForm, wingName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    {wings.map(w => (
                      <option key={w.id} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Floor Level</label>
                  <input
                    type="number"
                    value={flatForm.floorNumber ?? 1}
                    onChange={(e) => setFlatForm({ ...flatForm, floorNumber: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Type</label>
                  <select
                    value={flatForm.type || '2BHK'}
                    onChange={(e) => setFlatForm({ ...flatForm, type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="1BHK">1 BHK</option>
                    <option value="2BHK">2 BHK</option>
                    <option value="3BHK">3 BHK</option>
                    <option value="4BHK">4 BHK</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Commercial_Shop">Commercial Shop</option>
                    <option value="Office">Office</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Occupancy</label>
                  <select
                    value={flatForm.occupancyStatus || 'owner_occupied'}
                    onChange={(e) => setFlatForm({ ...flatForm, occupancyStatus: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="owner_occupied">Owner Occupied</option>
                    <option value="rented_tenant">Rented Tenant</option>
                    <option value="vacant">Vacant</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Built-Up Area (Sq.Ft.)</label>
                  <input
                    type="number"
                    required
                    value={flatForm.builtUpAreaSqFt ?? 950}
                    onChange={(e) => setFlatForm({ ...flatForm, builtUpAreaSqFt: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Carpet Area (Sq.Ft.)</label>
                  <input
                    type="number"
                    value={flatForm.carpetAreaSqFt ?? 750}
                    onChange={(e) => setFlatForm({ ...flatForm, carpetAreaSqFt: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Opening Balances (for new migrations)</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Opening Principal (₹)</label>
                    <input
                      type="number"
                      value={flatForm.openingPrincipalArrears ?? 0}
                      onChange={(e) => setFlatForm({ ...flatForm, openingPrincipalArrears: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-rose-600 font-bold focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Opening Interest (₹)</label>
                    <input
                      type="number"
                      value={flatForm.openingInterestArrears ?? 0}
                      onChange={(e) => setFlatForm({ ...flatForm, openingInterestArrears: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-rose-600 font-bold focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Advance Balance (₹)</label>
                    <input
                      type="number"
                      value={flatForm.advanceBalance ?? 0}
                      onChange={(e) => setFlatForm({ ...flatForm, advanceBalance: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-emerald-600 font-bold focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFlatModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm"
                >
                  Save Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
