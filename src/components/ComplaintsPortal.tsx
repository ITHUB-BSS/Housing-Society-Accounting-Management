import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Paperclip, 
  Image as ImageIcon, 
  Video, 
  Send, 
  UserCheck, 
  ChevronRight, 
  Star, 
  ShieldAlert, 
  Calendar, 
  Phone, 
  Mail, 
  X, 
  Download,
  Flame,
  Zap,
  Building,
  RotateCcw
} from 'lucide-react';
import { 
  ComplaintTicket, 
  ComplaintCategory, 
  ComplaintPriority, 
  ComplaintStatus, 
  SocietyStaffMember, 
  UserProfile, 
  SocietyConfig, 
  FlatShopConfig 
} from '../types';
import { exportToExcel } from '../utils/billingEngine';

interface ComplaintsPortalProps {
  society: SocietyConfig;
  complaints: ComplaintTicket[];
  staffMembers: SocietyStaffMember[];
  flats: FlatShopConfig[];
  currentUser: UserProfile;
  onUpdateComplaints: (complaints: ComplaintTicket[]) => void;
}

const CATEGORY_LABELS: Record<ComplaintCategory, { label: string; icon: string; defaultSlaHours: number }> = {
  plumbing: { label: 'Plumbing & Water Supply', icon: '🚰', defaultSlaHours: 24 },
  electrical: { label: 'Electrical & Power Supply', icon: '⚡', defaultSlaHours: 24 },
  elevator: { label: 'Lift & Elevator Maintenance', icon: '🛗', defaultSlaHours: 6 },
  housekeeping: { label: 'Housekeeping & Waste Management', icon: '🧹', defaultSlaHours: 24 },
  security: { label: 'Security, Gate & Intercom', icon: '🛡️', defaultSlaHours: 12 },
  civil_seepage: { label: 'Civil, Wall Dampness & Seepage', icon: '🧱', defaultSlaHours: 72 },
  carpentry: { label: 'Carpentry & Common Fixtures', icon: '🪚', defaultSlaHours: 48 },
  amenity_defect: { label: 'Clubhouse & Amenity Defect', icon: '🏊', defaultSlaHours: 48 },
  noise_nuisance: { label: 'Noise & Resident Nuisance', icon: '📢', defaultSlaHours: 12 },
  billing_accounts: { label: 'Billing & Maintenance Queries', icon: '🧾', defaultSlaHours: 48 },
  other: { label: 'General / Other Request', icon: '📋', defaultSlaHours: 48 }
};

const PRIORITY_BADGES: Record<ComplaintPriority, { label: string; bg: string; text: string; border: string }> = {
  low: { label: 'Low (72h)', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  medium: { label: 'Medium (48h)', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  high: { label: 'High (24h)', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
  emergency: { label: 'Emergency (<4h)', bg: 'bg-rose-100 text-rose-800 font-black animate-pulse', text: 'text-rose-800', border: 'border-rose-300' }
};

const STATUS_BADGES: Record<ComplaintStatus, { label: string; bg: string; text: string; border: string }> = {
  open: { label: 'Open / Unassigned', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  assigned: { label: 'Assigned to Staff', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  in_progress: { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  resolved: { label: 'Resolved', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  closed: { label: 'Closed & Verified', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  reopened: { label: 'Reopened', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
};

export const ComplaintsPortal: React.FC<ComplaintsPortalProps> = ({
  society,
  complaints,
  staffMembers,
  flats,
  currentUser,
  onUpdateComplaints
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'my_tickets' | 'open' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Selected Ticket for Detail Drawer
  const [selectedTicket, setSelectedTicket] = useState<ComplaintTicket | null>(null);

  // New Ticket Modal State
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [formCategory, setFormCategory] = useState<ComplaintCategory>('plumbing');
  const [formPriority, setFormPriority] = useState<ComplaintPriority>('medium');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFlatNumber, setFormFlatNumber] = useState(currentUser.flatNumber || flats?.[0]?.flatNumber || 'A-101');
  const [formPhone, setFormPhone] = useState(currentUser.phone || '+91 98201 23456');
  const [formPreferredTime, setFormPreferredTime] = useState('Morning (09:00 AM - 12:00 PM)');
  const [formAttachments, setFormAttachments] = useState<Array<{ id: string; name: string; type: 'image' | 'video' | 'document'; url: string; size: string; uploadedAt: string }>>([]);

  // Assignment Modal / State inside Drawer
  const [assigneeId, setAssigneeId] = useState<string>(staffMembers?.[0]?.id || '');
  const [managementNotes, setManagementNotes] = useState('');
  const [notificationPreview, setNotificationPreview] = useState<string | null>(null);

  // Resident Rating Modal
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');

  const isResident = currentUser.role === 'resident';
  const isManagement = currentUser.role === 'society_admin' || currentUser.role === 'super_admin' || currentUser.role === 'treasurer';

  // Filter complaints based on user role and active filters
  const filteredTickets = (complaints || []).filter(t => {
    // If resident and viewing "my_tickets", only their flat
    if (isResident && currentUser.flatNumber) {
      if (t.flatNumber !== currentUser.flatNumber) return false;
    }

    if (activeTab === 'open' && (t.status === 'resolved' || t.status === 'closed')) return false;
    if (activeTab === 'resolved' && (t.status !== 'resolved' && t.status !== 'closed')) return false;

    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        t.ticketNumber.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.flatNumber.toLowerCase().includes(q) ||
        t.memberName.toLowerCase().includes(q) ||
        (t.assignedStaffName && t.assignedStaffName.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  // Calculate Metrics
  const totalCount = complaints.length;
  const openCount = complaints.filter(c => c.status === 'open' || c.status === 'assigned' || c.status === 'in_progress').length;
  const emergencyCount = complaints.filter(c => c.priority === 'emergency' && c.status !== 'resolved' && c.status !== 'closed').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;

  // Handle Mock Attachment Upload
  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const isVideo = file.type.startsWith('video');
    const isImage = file.type.startsWith('image');
    
    const mockAttachment = {
      id: `att-${Date.now()}`,
      name: file.name,
      type: (isVideo ? 'video' : isImage ? 'image' : 'document') as 'image' | 'video' | 'document',
      url: isImage 
        ? URL.createObjectURL(file) 
        : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
      size: `${file.size ? (file.size / (1024 * 1024)).toFixed(1) : '0.5'} MB`,
      uploadedAt: new Date().toISOString()
    };

    setFormAttachments(prev => [...prev, mockAttachment]);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) {
      alert('Please provide a title and detailed description of the issue.');
      return;
    }

    const slaHours = CATEGORY_LABELS[formCategory]?.defaultSlaHours || 24;
    const targetDate = new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();
    const flat = flats.find(f => f.flatNumber === formFlatNumber);

    const newTicket: ComplaintTicket = {
      id: `tkt-${Date.now()}`,
      societyId: society.id,
      ticketNumber: `TKT-2026-${String(complaints.length + 42).padStart(4, '0')}`,
      flatNumber: formFlatNumber,
      wingName: flat?.wingName || 'Wing A',
      memberName: currentUser.fullName || 'Resident Member',
      memberPhone: formPhone,
      memberEmail: currentUser.email,
      category: formCategory,
      priority: formPriority,
      title: formTitle.trim(),
      description: formDescription.trim(),
      status: 'open',
      preferredVisitTime: formPreferredTime,
      slaHours: formPriority === 'emergency' ? 4 : slaHours,
      targetResolutionDate: targetDate,
      attachments: formAttachments,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'Ticket Raised',
          performedBy: currentUser.fullName,
          role: currentUser.role,
          notes: 'Ticket submitted with photo/video attachments.',
          notificationSent: `Auto-alert sent to ${society.name} Facility Helpdesk.`
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onUpdateComplaints([newTicket, ...complaints]);
    setNewModalOpen(false);
    // Reset Form
    setFormTitle('');
    setFormDescription('');
    setFormAttachments([]);
    alert(`Complaint Ticket #${newTicket.ticketNumber} created successfully! Maintenance team has been notified.`);
  };

  // Handle Staff Assignment
  const handleAssignStaff = (ticket: ComplaintTicket) => {
    const staff = staffMembers.find(s => s.id === assigneeId);
    if (!staff) return;

    const updatedTimeline = [
      ...(ticket.timeline || []),
      {
        id: `tl-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'Staff Assigned',
        performedBy: currentUser.fullName,
        role: currentUser.role,
        notes: `Assigned to ${staff.name} (${staff.role}) - Contact: ${staff.phone}. Notes: ${managementNotes || 'Dispatched for site visit.'}`,
        notificationSent: `Automated WhatsApp & SMS sent to ${ticket.memberName} (${ticket.memberPhone})`
      }
    ];

    const updated: ComplaintTicket = {
      ...ticket,
      status: 'assigned',
      assignedStaffName: staff.name,
      assignedStaffRole: staff.role,
      assignedStaffPhone: staff.phone,
      assignedAt: new Date().toISOString(),
      timeline: updatedTimeline,
      updatedAt: new Date().toISOString()
    };

    onUpdateComplaints(complaints.map(c => c.id === ticket.id ? updated : c));
    setSelectedTicket(updated);
    setManagementNotes('');
    setNotificationPreview(`✅ Automated SMS/WhatsApp sent to Resident (${ticket.memberPhone}): "Hello ${ticket.memberName}, your complaint ${ticket.ticketNumber} has been assigned to ${staff.name} (${staff.phone})."`);
  };

  // Handle Status Update
  const handleUpdateStatus = (ticket: ComplaintTicket, newStatus: ComplaintStatus, notes?: string) => {
    const isResolving = newStatus === 'resolved';
    const isClosing = newStatus === 'closed';

    const updatedTimeline = [
      ...(ticket.timeline || []),
      {
        id: `tl-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: `Status Changed to ${STATUS_BADGES[newStatus].label}`,
        performedBy: currentUser.fullName,
        role: currentUser.role,
        notes: notes || `Status transitioned to ${newStatus.toUpperCase()}`,
        notificationSent: `WhatsApp status update sent to ${ticket.memberName}`
      }
    ];

    const updated: ComplaintTicket = {
      ...ticket,
      status: newStatus,
      resolvedAt: isResolving ? new Date().toISOString() : ticket.resolvedAt,
      closedAt: isClosing ? new Date().toISOString() : ticket.closedAt,
      resolutionNotes: notes || ticket.resolutionNotes,
      timeline: updatedTimeline,
      updatedAt: new Date().toISOString()
    };

    onUpdateComplaints(complaints.map(c => c.id === ticket.id ? updated : c));
    setSelectedTicket(updated);
    setNotificationPreview(`🔔 Automated Notification sent to Resident: "Status for Ticket #${ticket.ticketNumber} is now ${newStatus.toUpperCase()}."`);
  };

  // Handle Resident Feedback Rating
  const handleSaveFeedback = (ticket: ComplaintTicket) => {
    const updatedTimeline = [
      ...(ticket.timeline || []),
      {
        id: `tl-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: `Resident Rated ${ratingScore} Stars`,
        performedBy: currentUser.fullName,
        role: 'resident',
        notes: `Feedback: "${ratingFeedback || 'Satisfied with resolution'}"`
      }
    ];

    const updated: ComplaintTicket = {
      ...ticket,
      status: 'closed',
      residentRating: ratingScore,
      residentFeedback: ratingFeedback,
      closedAt: new Date().toISOString(),
      timeline: updatedTimeline,
      updatedAt: new Date().toISOString()
    };

    onUpdateComplaints(complaints.map(c => c.id === ticket.id ? updated : c));
    setSelectedTicket(updated);
    setRatingModalOpen(false);
    alert('Thank you for your rating and feedback!');
  };

  // Export to Excel
  const handleExportComplaints = () => {
    const data = complaints.map(c => ({
      "Ticket No": c.ticketNumber,
      "Flat Number": c.flatNumber,
      "Wing": c.wingName || '',
      "Resident Name": c.memberName,
      "Contact": c.memberPhone,
      "Category": CATEGORY_LABELS[c.category]?.label || c.category,
      "Priority": c.priority.toUpperCase(),
      "Status": c.status.toUpperCase(),
      "Title": c.title,
      "Description": c.description,
      "Assigned Technician": c.assignedStaffName || 'Unassigned',
      "Logged Date": c.createdAt.slice(0, 10),
      "Resolved Date": c.resolvedAt ? c.resolvedAt.slice(0, 10) : 'Pending',
      "Rating (1-5)": c.residentRating || 'N/A'
    }));

    exportToExcel(data, `Complaints_Helpdesk_Register_${society.name.slice(0, 15)}`, "Complaints_Register");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md border border-blue-200">
              <Wrench className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Resident Helpdesk & Maintenance Complaints</h2>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
              Automated SLA & WhatsApp Alerts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Submit, assign, and track society maintenance tickets with photo/video attachments, staff dispatch, and SMS updates.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportComplaints}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 transition border border-slate-300"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Register (Excel)</span>
          </button>

          <button
            onClick={() => setNewModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-md text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Raise New Ticket</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Logged Tickets</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all wings & categories</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Pending / In Progress</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">{openCount}</div>
          <div className="text-[11px] text-amber-700/80 mt-0.5">Assigned to facility staff</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Emergency / Urgent</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1">{emergencyCount}</div>
          <div className="text-[11px] text-rose-700/80 mt-0.5">&lt; 4-hour SLA targets</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Resolved & Closed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{resolvedCount}</div>
          <div className="text-[11px] text-emerald-700/80 mt-0.5">
            {totalCount > 0 ? `${Math.round((resolvedCount / totalCount) * 100)}% satisfaction resolution` : '100% resolution'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ticket #, flat, resident, technician..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>

            {/* Priority Dropdown */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low (72h SLA)</option>
              <option value="medium">Medium (48h SLA)</option>
              <option value="high">High (24h SLA)</option>
              <option value="emergency">Emergency (&lt;4h SLA)</option>
            </select>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open / Unassigned</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed & Verified</option>
            </select>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1 border-t border-slate-100 pt-2 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-md font-semibold transition ${
              activeTab === 'all' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Tickets ({complaints.length})
          </button>
          <button
            onClick={() => setActiveTab('open')}
            className={`px-3 py-1 rounded-md font-semibold transition ${
              activeTab === 'open' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Active & Pending ({openCount})
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`px-3 py-1 rounded-md font-semibold transition ${
              activeTab === 'resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Resolved & Closed ({resolvedCount})
          </button>
        </div>
      </div>

      {/* Ticket List Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Ticket # & Priority</th>
                <th className="px-4 py-3">Resident / Flat</th>
                <th className="px-4 py-3">Category & Issue Title</th>
                <th className="px-4 py-3">Assigned Staff</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Logged Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No complaint tickets found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => {
                  const catMeta = CATEGORY_LABELS[t.category] || CATEGORY_LABELS.other;
                  const prioMeta = PRIORITY_BADGES[t.priority] || PRIORITY_BADGES.medium;
                  const statMeta = STATUS_BADGES[t.status] || STATUS_BADGES.open;

                  return (
                    <tr 
                      key={t.id} 
                      onClick={() => setSelectedTicket(t)}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-slate-900">{t.ticketNumber}</div>
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold border mt-0.5 ${prioMeta.bg} ${prioMeta.text} ${prioMeta.border}`}>
                          {prioMeta.label}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <strong className="text-slate-900 block">{t.memberName}</strong>
                        <span className="text-[11px] text-blue-700 font-mono font-semibold">Flat {t.flatNumber} ({t.wingName})</span>
                      </td>

                      <td className="px-4 py-3 max-w-[280px]">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                          <span>{catMeta.icon}</span>
                          <span>{catMeta.label}</span>
                        </div>
                        <div className="font-bold text-slate-800 line-clamp-1 mt-0.5">{t.title}</div>
                        {t.attachments && t.attachments.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 mt-0.5">
                            <Paperclip className="w-3 h-3" /> {t.attachments.length} attachment(s)
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {t.assignedStaffName ? (
                          <div>
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                              {t.assignedStaffName}
                            </span>
                            <span className="text-[10px] text-slate-400 block">{t.assignedStaffRole}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statMeta.bg} ${statMeta.text} ${statMeta.border}`}>
                          {statMeta.label}
                        </span>
                        {t.residentRating && (
                          <div className="flex items-center gap-0.5 text-amber-500 text-[10px] mt-1">
                            {Array.from({ length: t.residentRating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400" />
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-500 text-[11px]">
                        <div>{(t.createdAt || '').slice(0, 10)}</div>
                        <div className="text-[10px] text-slate-400">{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicket(t);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 text-blue-600 hover:text-blue-700 text-xs font-bold transition border border-slate-200 hover:border-blue-200 flex items-center gap-1 ml-auto"
                        >
                          <span>View Details</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TICKET DETAIL DRAWER / MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto flex flex-col justify-between">
            {/* Drawer Header */}
            <div>
              <div className="p-5 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-400 font-bold text-sm">{selectedTicket.ticketNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      selectedTicket.priority === 'emergency' ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-200'
                    }`}>
                      {selectedTicket.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{selectedTicket.title}</h3>
                </div>

                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Notification Banner Preview if Triggered */}
              {notificationPreview && (
                <div className="bg-emerald-50 border-b border-emerald-200 p-3 text-xs text-emerald-800 flex items-center justify-between">
                  <span>{notificationPreview}</span>
                  <button onClick={() => setNotificationPreview(null)} className="text-emerald-700 font-bold">✕</button>
                </div>
              )}

              {/* Content Body */}
              <div className="p-6 space-y-6">
                {/* Meta Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Flat & Wing</span>
                    <strong className="text-slate-900 font-mono">{selectedTicket.flatNumber} ({selectedTicket.wingName})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Category</span>
                    <strong className="text-slate-900">{CATEGORY_LABELS[selectedTicket.category]?.label}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Status</span>
                    <strong className="text-blue-600 uppercase">{selectedTicket.status.replace('_', ' ')}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Target SLA</span>
                    <strong className="text-slate-900">{selectedTicket.slaHours} Hours</strong>
                  </div>
                </div>

                {/* Resident Contact Details */}
                <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Resident Details</span>
                    <span className="text-[11px] text-slate-500 font-normal">Preferred Visit: <strong>{selectedTicket.preferredVisitTime || 'Any Time'}</strong></span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span>👤 {selectedTicket.memberName}</span>
                    <span className="flex items-center gap-1 text-blue-600">
                      <Phone className="w-3.5 h-3.5" /> {selectedTicket.memberPhone}
                    </span>
                    {selectedTicket.memberEmail && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Mail className="w-3.5 h-3.5" /> {selectedTicket.memberEmail}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">Issue Description</h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.description}
                  </div>
                </div>

                {/* Attachments Section */}
                {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                      Photos / Evidence Attachments ({selectedTicket.attachments.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedTicket.attachments.map((att) => (
                        <div key={att.id} className="group relative border border-slate-200 rounded-lg overflow-hidden bg-slate-900 shadow-xs">
                          {att.type === 'image' ? (
                            <img src={att.url} alt={att.name} className="w-full h-28 object-cover group-hover:scale-105 transition duration-300" />
                          ) : (
                            <div className="w-full h-28 flex flex-col items-center justify-center bg-slate-800 text-white p-2">
                              <Video className="w-8 h-8 text-amber-400 mb-1" />
                              <span className="text-[10px] truncate max-w-full">{att.name}</span>
                            </div>
                          )}
                          <div className="p-1.5 bg-white text-[10px] text-slate-700 truncate border-t border-slate-200 flex justify-between items-center">
                            <span className="truncate">{att.name}</span>
                            <span className="text-slate-400 font-mono shrink-0">{att.size}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assigned Staff & Action Center (For Management) */}
                {isManagement && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <h4 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      Staff Dispatch & Management Actions
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Assign Staff / Vendor</label>
                        <select
                          value={assigneeId}
                          onChange={(e) => setAssigneeId(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        >
                          {staffMembers.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Internal Work Notes</label>
                        <input
                          type="text"
                          placeholder="e.g. Parts dispatched from stores"
                          value={managementNotes}
                          onChange={(e) => setManagementNotes(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <button
                        onClick={() => handleAssignStaff(selectedTicket)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md text-xs shadow-xs transition flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Assign & Send WhatsApp Alert</span>
                      </button>

                      {selectedTicket.status !== 'in_progress' && selectedTicket.status !== 'resolved' && (
                        <button
                          onClick={() => handleUpdateStatus(selectedTicket, 'in_progress', 'Staff has arrived on-site and started repairs.')}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md text-xs shadow-xs transition"
                        >
                          Mark In Progress
                        </button>
                      )}

                      {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                        <button
                          onClick={() => handleUpdateStatus(selectedTicket, 'resolved', 'Repairs completed and tested functional.')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md text-xs shadow-xs transition flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Resolved</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Resident Post-Resolution Review Trigger */}
                {selectedTicket.status === 'resolved' && !selectedTicket.residentRating && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-amber-900">Was your issue resolved satisfactorily?</h4>
                      <p className="text-[11px] text-amber-700">Please provide a 1-5 star rating and feedback to close this ticket.</p>
                    </div>
                    <button
                      onClick={() => setRatingModalOpen(true)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-md shadow-xs transition flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <span>Rate & Close Ticket</span>
                    </button>
                  </div>
                )}

                {/* Resident Feedback Display if Closed */}
                {selectedTicket.residentRating && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900">Resident Rating & Feedback</span>
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: selectedTicket.residentRating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-emerald-800 italic">"{selectedTicket.residentFeedback || 'Great work, satisfied with resolution.'}"</p>
                  </div>
                )}

                {/* Activity Audit Timeline */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Activity & Status Log</h4>
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {(selectedTicket.timeline || []).map((entry, idx) => (
                      <div key={entry.id || idx} className="relative">
                        <div className="absolute -left-[21px] top-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                        <div className="text-xs">
                          <div className="flex items-center justify-between">
                            <strong className="text-slate-900 font-bold">{entry.action}</strong>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {entry.timestamp.slice(0, 10)}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5">{entry.notes}</p>
                          {entry.notificationSent && (
                            <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              📲 {entry.notificationSent}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-mono">ID: {selectedTicket.id}</span>
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-md transition"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW TICKET MODAL */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md border border-blue-200">
                  <Wrench className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">Raise Complaint / Service Request</h3>
              </div>
              <button onClick={() => setNewModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ComplaintCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority / Urgency</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as ComplaintPriority)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="low">Low (General Query - 72h SLA)</option>
                    <option value="medium">Medium (Standard Repair - 48h SLA)</option>
                    <option value="high">High (Major Leak/Power - 24h SLA)</option>
                    <option value="emergency">Emergency (Lift Stuck/Hazard - &lt;4h SLA)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Flat / Unit Number</label>
                  <select
                    value={formFlatNumber}
                    onChange={(e) => setFormFlatNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white font-mono font-bold"
                  >
                    {flats.map(f => (
                      <option key={f.id} value={f.flatNumber}>{f.flatNumber} ({f.wingName})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Complaint Title / Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Bedroom Geyser Pipe Leaking"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description of Problem</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe where the issue is occurring, when it started, and any symptoms..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Time for Technician Visit</label>
                <select
                  value={formPreferredTime}
                  onChange={(e) => setFormPreferredTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="Morning (09:00 AM - 12:00 PM)">Morning (09:00 AM - 12:00 PM)</option>
                  <option value="Afternoon (12:00 PM - 04:00 PM)">Afternoon (12:00 PM - 04:00 PM)</option>
                  <option value="Evening (04:00 PM - 07:30 PM)">Evening (04:00 PM - 07:30 PM)</option>
                  <option value="Immediate / Emergency Any Time">Immediate / Emergency Any Time</option>
                </select>
              </div>

              {/* Photo & Video Upload Simulation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Attach Photos / Video Evidence</label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-3 text-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleSimulateUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center">
                    <ImageIcon className="w-6 h-6 text-blue-500 mb-1" />
                    <span className="text-xs font-bold text-slate-700">Click to upload photo or video</span>
                    <span className="text-[10px] text-slate-400">Supports JPG, PNG, MP4 (Max 25MB)</span>
                  </div>
                </div>

                {/* Uploaded attachments preview */}
                {formAttachments.length > 0 && (
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {formAttachments.map((att, idx) => (
                      <div key={att.id} className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2 py-1 rounded text-[11px] text-blue-800">
                        <Paperclip className="w-3 h-3 text-blue-600" />
                        <span className="max-w-[120px] truncate">{att.name}</span>
                        <button
                          type="button"
                          onClick={() => setFormAttachments(formAttachments.filter((_, i) => i !== idx))}
                          className="text-blue-900 font-bold hover:text-rose-600 ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-md bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm"
                >
                  Submit Complaint Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESIDENT RATING MODAL */}
      {ratingModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-2xl p-6 space-y-4 text-slate-800 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <Star className="w-6 h-6 fill-amber-500" />
            </div>

            <h3 className="text-base font-bold text-slate-900">Rate Maintenance Service</h3>
            <p className="text-xs text-slate-500">
              How satisfied are you with the resolution of Ticket #{selectedTicket.ticketNumber} by {selectedTicket.assignedStaffName || 'the maintenance team'}?
            </p>

            {/* 5-Star Interactive Rating */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingScore(star)}
                  className="p-1 text-2xl transition hover:scale-125 focus:outline-none"
                >
                  <Star 
                    className={`w-8 h-8 ${star <= ratingScore ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} 
                  />
                </button>
              ))}
            </div>

            <div>
              <textarea
                rows={2}
                placeholder="Optional feedback or compliments for the technician..."
                value={ratingFeedback}
                onChange={(e) => setRatingFeedback(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white text-left"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRatingModalOpen(false)}
                className="px-3.5 py-1.5 rounded-md bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveFeedback(selectedTicket)}
                className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-sm"
              >
                Submit Review & Close Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
