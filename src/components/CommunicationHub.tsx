import React, { useState } from 'react';
import { 
  Bell, 
  Send, 
  Mail, 
  MessageSquare, 
  AlertCircle, 
  Megaphone, 
  CheckCircle2, 
  Plus, 
  Clock, 
  Users,
  Smartphone,
  Share2
} from 'lucide-react';
import { SocietyConfig, Member, MaintenanceBill, NoticeItem } from '../types';
import { formatINR } from '../utils/billingEngine';

interface CommunicationHubProps {
  society: SocietyConfig;
  members: Member[];
  bills: MaintenanceBill[];
  notices: NoticeItem[];
  onUpdateNotices: (notices: NoticeItem[]) => void;
}

export const CommunicationHub: React.FC<CommunicationHubProps> = ({
  society,
  members,
  bills,
  notices,
  onUpdateNotices
}) => {
  const [activeTab, setActiveTab] = useState<'reminders' | 'notices' | 'templates'>('reminders');
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp' | 'email' | 'both'>('both');
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);

  // New Notice Modal State
  const [newNoticeOpen, setNewNoticeOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<'general' | 'agm' | 'maintenance' | 'emergency'>('general');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeUrgent, setNoticeUrgent] = useState(false);

  const unpaidBills = bills.filter(b => b.paymentStatus !== 'paid');

  // Trigger Bulk Reminders
  const handleSendBulkReminders = () => {
    setBroadcastStatus('Broadcasting reminders via automated gateway...');
    setTimeout(() => {
      setBroadcastStatus(`Successfully dispatched ${unpaidBills.length} payment reminders via ${selectedChannel.toUpperCase()}!`);
      setTimeout(() => setBroadcastStatus(null), 4000);
    }, 1200);
  };

  // Publish New Notice
  const handlePublishNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    const notice: NoticeItem = {
      id: `not-${Date.now()}`,
      societyId: society.id,
      title: noticeTitle.trim(),
      category: noticeCategory,
      content: noticeContent.trim(),
      publishedAt: new Date().toISOString(),
      isUrgent: noticeUrgent,
      authorName: 'Managing Committee'
    };

    onUpdateNotices([notice, ...notices]);
    setNoticeTitle('');
    setNoticeContent('');
    setNewNoticeOpen(false);
    alert('Notice published and broadcasted to all residents!');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md border border-blue-200">
              <Megaphone className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Communication, Notice Board & WhatsApp Reminders</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated maintenance payment reminder triggers, statutory circulars, and instant digital notices.
          </p>
        </div>

        {/* Sub Nav */}
        <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-3 py-1 rounded transition text-xs ${
              activeTab === 'reminders' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Payment Reminders
          </button>
          <button
            onClick={() => setActiveTab('notices')}
            className={`px-3 py-1 rounded transition text-xs ${
              activeTab === 'notices' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Society Notice Board ({notices.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1 rounded transition text-xs ${
              activeTab === 'templates' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SMS / Email Templates
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: PAYMENT REMINDERS */}
      {activeTab === 'reminders' && (
        <div className="space-y-6">
          {/* Quick Broadcast Panel */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-600" />
                  1-Click Defaulter Reminder Dispatch Engine
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Currently {unpaidBills.length} flats have pending overdue maintenance bills.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs">
                  <button
                    onClick={() => setSelectedChannel('both')}
                    className={`px-2.5 py-1 rounded font-semibold transition ${
                      selectedChannel === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    WhatsApp + Email
                  </button>
                  <button
                    onClick={() => setSelectedChannel('whatsapp')}
                    className={`px-2.5 py-1 rounded font-semibold transition ${
                      selectedChannel === 'whatsapp' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    WhatsApp Only
                  </button>
                  <button
                    onClick={() => setSelectedChannel('email')}
                    className={`px-2.5 py-1 rounded font-semibold transition ${
                      selectedChannel === 'email' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Email Only
                  </button>
                </div>

                <button
                  onClick={handleSendBulkReminders}
                  disabled={unpaidBills.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-md text-xs flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send {unpaidBills.length} Overdue Reminders</span>
                </button>
              </div>
            </div>

            {broadcastStatus && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs font-bold text-emerald-800 flex items-center gap-2 animate-pulse">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{broadcastStatus}</span>
              </div>
            )}
          </div>

          {/* Pending Bills Preview List */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900">Target Unpaid Accounts Queue</span>
              <span className="text-amber-700 font-semibold">{unpaidBills.length} Defaulters</span>
            </div>

            <div className="divide-y divide-slate-100">
              {unpaidBills.map((bill) => (
                <div key={bill.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 rounded text-blue-700 font-mono text-xs font-bold">
                        {bill.flatNumber}
                      </span>
                      <strong className="text-slate-900 text-xs">{bill.memberName}</strong>
                      <span className="text-[11px] text-slate-500">({bill.memberPhone})</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Bill: <strong className="text-slate-800">{bill.billNumber}</strong> | Due: <span className="text-rose-600 font-medium">{bill.dueDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-bold text-rose-600 font-mono">
                        {formatINR(bill.netPayableAmount - bill.amountPaid)}
                      </div>
                      <span className="text-[10px] text-slate-400 block">Pending Surcharge + Arrears</span>
                    </div>

                    <button
                      onClick={() => alert(`Single reminder triggered for ${bill.memberName} via WhatsApp (+91 ${bill.memberPhone}).`)}
                      className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-emerald-600 border border-slate-200 transition"
                      title="Send Instant WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SOCIETY NOTICE BOARD */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-700">
              Publish official AGM circulars, maintenance shutdowns, and emergency broadcasts.
            </div>
            <button
              onClick={() => setNewNoticeOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish Notice</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notices.map((n) => (
              <div key={n.id} className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 relative overflow-hidden shadow-sm">
                {n.isUrgent && (
                  <div className="absolute top-0 right-0 bg-rose-600 text-white font-bold text-[9px] uppercase px-2.5 py-0.5 rounded-bl-md tracking-wider">
                    Urgent Circular
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                    n.category === 'emergency' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    n.category === 'agm' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                    'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {n.category}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">{n.publishedAt.slice(0, 10)}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{n.content}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Issued By: {n.authorName}</span>
                  <button
                    onClick={() => alert(`Notice link copied for WhatsApp sharing: https://societyprime.in/notice/${n.id}`)}
                    className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Share2 className="w-3 h-3" /> Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">Configured WhatsApp & SMS Dispatch Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <span className="text-blue-700 font-bold">Template: Monthly Maintenance Bill Release</span>
              <p className="text-slate-700 font-mono bg-white p-2.5 rounded border border-slate-200 text-[11px]">
                Dear {'{{Member_Name}}'}, your maintenance bill for {'{{Flat_No}}'} for {'{{Billing_Period}}'} of ₹{'{{Net_Amount}}'} is generated. Due Date: {'{{Due_Date}}'}. Pay securely via UPI link: {'{{UPI_Link}}'}. - Hon. Secretary, {'{{Society_Name}}'}.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <span className="text-rose-600 font-bold">Template: Overdue Interest Warning</span>
              <p className="text-slate-700 font-mono bg-white p-2.5 rounded border border-slate-200 text-[11px]">
                Urgent Reminder: Maintenance dues of ₹{'{{Total_Due}}'} for flat {'{{Flat_No}}'} are overdue. Delayed interest @ 18% p.a. and late fees are accumulating daily. Please clear immediately to avoid Sec 101 proceedings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH NOTICE MODAL */}
      {newNoticeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-2xl p-6 space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Publish New Society Notice</h3>
              <button onClick={() => setNewNoticeOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handlePublishNotice} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual General Body Meeting (AGM) Notice"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={noticeCategory}
                  onChange={(e) => setNoticeCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="general">General Circular</option>
                  <option value="agm">AGM / Special Resolution</option>
                  <option value="maintenance">Maintenance Shutdown</option>
                  <option value="emergency">Emergency Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type circular details, dates, agenda items..."
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={noticeUrgent}
                  onChange={(e) => setNoticeUrgent(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-0"
                />
                <span className="text-rose-600 font-bold">Mark as High Priority / Urgent Push Alert</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewNoticeOpen(false)}
                  className="px-3.5 py-1.5 rounded-md bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm"
                >
                  Publish & Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
