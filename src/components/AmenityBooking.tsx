import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Search, 
  CreditCard, 
  QrCode, 
  FileText, 
  Download, 
  Share2, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  AlertCircle,
  Sparkles,
  Check,
  Send,
  Building,
  DollarSign
} from 'lucide-react';
import { Amenity, AmenityBooking, SocietyConfig, UserProfile, FlatShopConfig } from '../types';
import { formatINR } from '../utils/billingEngine';

interface AmenityBookingProps {
  society: SocietyConfig;
  amenities: Amenity[];
  bookings: AmenityBooking[];
  onUpdateBookings: (bookings: AmenityBooking[]) => void;
  flats: FlatShopConfig[];
  currentUser: UserProfile;
}

export const AmenityBookingComponent: React.FC<AmenityBookingProps> = ({
  society,
  amenities,
  bookings,
  onUpdateBookings,
  flats,
  currentUser
}) => {
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity>(amenities?.[0] || {
    id: "amenity-01",
    societyId: society.id,
    name: "Clubhouse Grand Banquet Hall",
    description: "Air-conditioned 120-capacity hall with acoustic sound system, buffet tables & projector.",
    capacity: 120,
    hourlyRate: 1500,
    securityDeposit: 5000,
    availableTimeSlots: ["09:00 AM - 01:00 PM", "02:00 PM - 06:00 PM", "07:00 PM - 11:30 PM"],
    rules: ["No loud music after 10:00 PM."],
    bookingRules: {
      maxDurationHours: 8,
      minLeadTimeHours: 24,
      maxBookingsPerMonthPerFlat: 2,
      requiresAdminApproval: true,
      cancellationCutoffHours: 48
    }
  });

  const [activeTab, setActiveTab] = useState<'facilities' | 'calendar' | 'my_bookings' | 'all_bookings'>('facilities');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Calendar Navigation State
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().slice(0, 10));
  const [bookingSlot, setBookingSlot] = useState(selectedAmenity?.availableTimeSlots?.[0] || '09:00 AM - 01:00 PM');
  const [eventPurpose, setEventPurpose] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState<number>(20);
  const [selectedFlat, setSelectedFlat] = useState<string>(currentUser.flatNumber || flats?.[0]?.flatNumber || 'A-101');
  const [residentPhone, setResidentPhone] = useState<string>(currentUser.phone || '+91 98201 23456');
  
  // Payment Flow State
  const [paymentStep, setPaymentStep] = useState<'details' | 'payment_gateway' | 'confirmation'>('details');
  const [paymentMode, setPaymentMode] = useState<'upi' | 'card' | 'netbanking' | 'society_ledger'>('upi');
  const [activeCreatedBooking, setActiveCreatedBooking] = useState<AmenityBooking | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Selected Booking for Receipt / Confirmation Pass Modal
  const [viewReceiptBooking, setViewReceiptBooking] = useState<AmenityBooking | null>(null);

  const isResident = currentUser.role === 'resident';
  const isManagement = currentUser.role === 'society_admin' || currentUser.role === 'super_admin' || currentUser.role === 'treasurer';

  // Rule Validation Helper
  const validateBookingRules = (
    amenity: Amenity,
    dateStr: string,
    flatNum: string
  ): { valid: boolean; error?: string } => {
    const rules = amenity.bookingRules || {
      maxDurationHours: 8,
      minLeadTimeHours: 24,
      maxBookingsPerMonthPerFlat: 3,
      requiresAdminApproval: false,
      cancellationCutoffHours: 24
    };

    // 1. Lead Time Check
    const targetDate = new Date(dateStr);
    const now = new Date();
    const diffHours = (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < rules.minLeadTimeHours) {
      return {
        valid: false,
        error: `Lead Time Policy: Reservations for ${amenity.name} require at least ${rules.minLeadTimeHours} hours advance notice.`
      };
    }

    // 2. Monthly Quota Check for this flat
    const bookingMonth = dateStr.slice(0, 7); // YYYY-MM
    const existingMonthlyBookings = bookings.filter(b => 
      b.amenityId === amenity.id && 
      b.flatNumber === flatNum && 
      b.bookingDate.startsWith(bookingMonth) &&
      b.status !== 'cancelled' &&
      b.status !== 'rejected'
    );

    if (existingMonthlyBookings.length >= rules.maxBookingsPerMonthPerFlat) {
      return {
        valid: false,
        error: `Monthly Quota Exceeded: Flat ${flatNum} has already reserved ${existingMonthlyBookings.length}/${rules.maxBookingsPerMonthPerFlat} allowed bookings for ${amenity.name} in ${bookingMonth}.`
      };
    }

    // 3. Slot Conflict Check
    const slotConflict = bookings.find(b => 
      b.amenityId === amenity.id &&
      b.bookingDate === dateStr &&
      b.timeSlot === bookingSlot &&
      b.status !== 'cancelled' &&
      b.status !== 'rejected'
    );

    if (slotConflict) {
      return {
        valid: false,
        error: `Slot Already Booked: The selected slot (${bookingSlot}) on ${dateStr} has already been reserved by Flat ${slotConflict.flatNumber}.`
      };
    }

    return { valid: true };
  };

  // Open booking modal for a facility
  const handleOpenBookingModal = (amenity: Amenity, prefilledDate?: string, prefilledSlot?: string) => {
    setSelectedAmenity(amenity);
    if (prefilledDate) setBookingDate(prefilledDate);
    if (prefilledSlot) setBookingSlot(prefilledSlot);
    else setBookingSlot(amenity.availableTimeSlots?.[0] || '09:00 AM - 01:00 PM');
    setValidationError(null);
    setPaymentStep('details');
    setBookingModalOpen(true);
  };

  // Proceed to Payment / Approval
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const validation = validateBookingRules(selectedAmenity, bookingDate, selectedFlat);
    if (!validation.valid) {
      setValidationError(validation.error || 'Validation error');
      return;
    }

    setPaymentStep('payment_gateway');
  };

  // Finalize Payment & Create Booking
  const handleFinalizeBooking = () => {
    const rentFee = selectedAmenity.dailyRate || selectedAmenity.hourlyRate || 0;
    const deposit = selectedAmenity.securityDeposit || 0;
    const totalPayable = rentFee + deposit;
    const bookingCode = `AMN-${Math.floor(10000 + Math.random() * 90000)}`;

    const newBooking: AmenityBooking = {
      id: `book-${Date.now()}`,
      societyId: society.id,
      amenityId: selectedAmenity.id,
      amenityName: selectedAmenity.name,
      memberName: currentUser.fullName || 'Resident Member',
      flatNumber: selectedFlat,
      memberPhone: residentPhone,
      bookingDate: bookingDate,
      timeSlot: bookingSlot,
      numberOfGuests: numberOfGuests,
      totalRentAmount: rentFee,
      totalCharge: totalPayable,
      depositAmount: deposit,
      paymentStatus: totalPayable > 0 ? 'paid' : 'waived',
      bookingStatus: selectedAmenity.bookingRules?.requiresAdminApproval ? 'pending_approval' : 'confirmed',
      status: selectedAmenity.bookingRules?.requiresAdminApproval ? 'pending_approval' : 'confirmed',
      bookingCode: bookingCode,
      purpose: eventPurpose || 'Resident Gathering',
      paymentMode: totalPayable > 0 ? paymentMode.toUpperCase() : 'FREE',
      transactionRef: `UPI/AMN/${new Date().toISOString().slice(2, 10).replace(/-/g, '')}/${Math.floor(1000 + Math.random() * 9000)}`,
      confirmationNotificationSent: true,
      notificationChannel: 'both',
      createdAt: new Date().toISOString()
    };

    onUpdateBookings([newBooking, ...bookings]);
    setActiveCreatedBooking(newBooking);
    setPaymentStep('confirmation');
  };

  // Status update by Admin (Approve / Reject / Cancel)
  const handleUpdateBookingStatus = (bookingId: string, newStatus: 'confirmed' | 'cancelled' | 'rejected') => {
    const updated = bookings.map(b => b.id === bookingId ? {
      ...b,
      status: newStatus,
      bookingStatus: newStatus,
      approvedBy: newStatus === 'confirmed' ? currentUser.fullName : undefined,
      approvedAt: newStatus === 'confirmed' ? new Date().toISOString() : undefined,
      paymentStatus: newStatus === 'cancelled' || newStatus === 'rejected' ? 'refunded' as const : b.paymentStatus
    } : b);

    onUpdateBookings(updated);
    alert(`Booking ${newStatus === 'confirmed' ? 'approved' : newStatus === 'rejected' ? 'rejected' : 'cancelled'}. Notification sent to resident.`);
  };

  // Calendar Day Data Generation
  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days: Date[] = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const calYear = currentCalendarDate.getFullYear();
  const calMonth = currentCalendarDate.getMonth();
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDayIndex = new Date(calYear, calMonth, 1).getDay();

  // Filter Bookings for Display
  const filteredBookings = bookings.filter(b => {
    if (isResident && currentUser.flatNumber && b.flatNumber !== currentUser.flatNumber) {
      if (activeTab === 'my_bookings') return false;
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        b.amenityName.toLowerCase().includes(q) ||
        b.memberName.toLowerCase().includes(q) ||
        b.flatNumber.toLowerCase().includes(q) ||
        (b.bookingCode && b.bookingCode.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md border border-blue-200">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Digital Amenity & Facility Booking System</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reserve banquet halls, sports courts, and swimming pools with automated rule validation, UPI checkout, and instant confirmation passes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenBookingModal(selectedAmenity)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-md text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Book Facility</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-xs text-xs font-semibold">
        <button
          onClick={() => setActiveTab('facilities')}
          className={`px-3.5 py-1.5 rounded-md transition ${
            activeTab === 'facilities' ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🏊 Available Facilities ({amenities.length})
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-3.5 py-1.5 rounded-md transition ${
            activeTab === 'calendar' ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📅 Availability Calendar & Slots
        </button>
        <button
          onClick={() => setActiveTab('my_bookings')}
          className={`px-3.5 py-1.5 rounded-md transition ${
            activeTab === 'my_bookings' ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🎫 {isResident ? 'My Bookings' : 'Active Reservations'} ({bookings.filter(b => b.status === 'confirmed' || b.status === 'pending_approval').length})
        </button>
        {isManagement && (
          <button
            onClick={() => setActiveTab('all_bookings')}
            className={`px-3.5 py-1.5 rounded-md transition ${
              activeTab === 'all_bookings' ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Admin Approvals & Logs ({bookings.length})
          </button>
        )}
      </div>

      {/* TAB 1: FACILITIES CARDS */}
      {activeTab === 'facilities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {amenities.map((a) => {
            const isSel = selectedAmenity.id === a.id;
            const rentFee = a.dailyRate || a.hourlyRate || 0;
            const rules = a.bookingRules || { maxDurationHours: 8, minLeadTimeHours: 24, maxBookingsPerMonthPerFlat: 3, requiresAdminApproval: false };

            return (
              <div 
                key={a.id}
                className={`bg-white border rounded-xl overflow-hidden shadow-sm transition flex flex-col justify-between ${
                  isSel ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Facility Image */}
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    <img 
                      src={a.imageUrl || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=80"} 
                      alt={a.name}
                      className="w-full h-full object-cover opacity-90 hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded border border-white/20 flex items-center gap-1">
                      <Users className="w-3 h-3 text-blue-400" />
                      Cap: {a.capacity}
                    </div>
                    {a.operationalHours && (
                      <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-slate-200 text-[10px] px-2 py-0.5 rounded font-mono">
                        ⏰ {a.operationalHours.open} - {a.operationalHours.close}
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{a.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.description}</p>
                    </div>

                    {/* Rates Banner */}
                    <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Usage Fee</span>
                        <strong className="text-emerald-600 font-mono font-bold">
                          {rentFee === 0 ? 'FREE for Residents' : formatINR(rentFee)}
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Refundable Deposit</span>
                        <strong className="text-slate-700 font-mono font-bold">
                          {a.securityDeposit ? formatINR(a.securityDeposit) : 'Nil'}
                        </strong>
                      </div>
                    </div>

                    {/* Booking Rules Pill Highlights */}
                    <div className="space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Min {rules.minLeadTimeHours}h lead time • Max {rules.maxDurationHours}h slot</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Max {rules.maxBookingsPerMonthPerFlat} bookings/month per flat</span>
                      </div>
                      {rules.requiresAdminApproval && (
                        <div className="flex items-center gap-1.5 text-indigo-600 font-semibold">
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span>Requires Committee Approval</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleOpenBookingModal(a)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Check Availability & Book</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: INTERACTIVE BOOKING CALENDAR & TIME SLOTS */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          {/* Facility Selector Header */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Select Facility:</span>
              <select
                value={selectedAmenity.id}
                onChange={(e) => {
                  const am = amenities.find(a => a.id === e.target.value);
                  if (am) setSelectedAmenity(am);
                }}
                className="bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
              >
                {amenities.map(a => (
                  <option key={a.id} value={a.id}>{a.name} (Cap: {a.capacity})</option>
                ))}
              </select>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentCalendarDate(new Date(calYear, calMonth - 1, 1))}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-800 min-w-[120px] text-center">
                {currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => setCurrentCalendarDate(new Date(calYear, calMonth + 1, 1))}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 1. Monthly Calendar Grid */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
              <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 uppercase py-1 border-b border-slate-100">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-16 bg-slate-50/50 rounded-md" />
                ))}

                {daysInMonth.map((dayObj) => {
                  const dateStr = dayObj.toISOString().slice(0, 10);
                  const isSelected = selectedCalendarDate === dateStr;
                  const isToday = new Date().toISOString().slice(0, 10) === dateStr;
                  const isPast = dateStr < new Date().toISOString().slice(0, 10);

                  // Count bookings for this day on selected amenity
                  const dayBookings = bookings.filter(b => 
                    b.amenityId === selectedAmenity.id && 
                    b.bookingDate === dateStr &&
                    b.status !== 'cancelled' &&
                    b.status !== 'rejected'
                  );

                  return (
                    <button
                      key={dateStr}
                      disabled={isPast}
                      onClick={() => setSelectedCalendarDate(dateStr)}
                      className={`h-16 p-1.5 rounded-lg border text-left flex flex-col justify-between transition relative ${
                        isSelected ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/30' :
                        isPast ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed' :
                        'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${
                          isSelected ? 'text-blue-700' : isToday ? 'text-blue-600 font-black' : isPast ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          {dayObj.getDate()}
                        </span>
                        {isToday && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        )}
                      </div>

                      {/* Booking Pills on Date */}
                      <div className="space-y-0.5">
                        {dayBookings.length > 0 ? (
                          <div className="text-[9px] bg-rose-50 text-rose-700 font-bold px-1 rounded truncate border border-rose-200">
                            {dayBookings.length} booked
                          </div>
                        ) : !isPast ? (
                          <div className="text-[9px] text-emerald-600 font-semibold truncate">
                            Available
                          </div>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Selected Day Slot Availability Detail */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Slot Availability for</span>
                <h4 className="text-sm font-bold text-slate-900">
                  {new Date(selectedCalendarDate).toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </h4>
              </div>

              <div className="space-y-2.5">
                {(selectedAmenity.availableTimeSlots || []).map((slot) => {
                  const existingBooking = bookings.find(b => 
                    b.amenityId === selectedAmenity.id && 
                    b.bookingDate === selectedCalendarDate && 
                    b.timeSlot === slot &&
                    b.status !== 'cancelled' &&
                    b.status !== 'rejected'
                  );

                  const isBooked = !!existingBooking;

                  return (
                    <div 
                      key={slot}
                      className={`p-3 rounded-lg border flex items-center justify-between transition ${
                        isBooked ? 'bg-rose-50/60 border-rose-200' : 'bg-slate-50 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {slot}
                        </div>
                        {isBooked ? (
                          <span className="text-[10px] text-rose-700 font-semibold block mt-0.5">
                            🔒 Reserved by Flat {existingBooking.flatNumber} ({existingBooking.memberName})
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                            ✓ Open for reservation
                          </span>
                        )}
                      </div>

                      <div>
                        {isBooked ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                            Booked
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenBookingModal(selectedAmenity, selectedCalendarDate, slot)}
                            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
                          >
                            Reserve
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Facility Rule Quick Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>Amenity Rules & Policies</span>
                </div>
                <ul className="text-[11px] text-blue-800/90 list-disc list-inside space-y-0.5">
                  {(selectedAmenity.rules || []).slice(0, 3).map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3 & 4: BOOKING LOGS & PASSES */}
      {(activeTab === 'my_bookings' || activeTab === 'all_bookings') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search booking code, flat no, resident name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Pass # & Facility</th>
                  <th className="px-4 py-3">Resident / Flat</th>
                  <th className="px-4 py-3">Date & Slot</th>
                  <th className="px-4 py-3">Event Purpose</th>
                  <th className="px-4 py-3">Charges & Deposit</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Pass / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No facility bookings found.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3">
                        <span className="font-mono text-blue-700 font-bold block">{b.bookingCode || 'AMN-00000'}</span>
                        <strong className="text-slate-900">{b.amenityName}</strong>
                      </td>

                      <td className="px-4 py-3">
                        <strong className="text-slate-900 block">{b.memberName}</strong>
                        <span className="text-[11px] text-blue-700 font-mono font-bold">Flat {b.flatNumber}</span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-slate-900 font-semibold">{b.bookingDate}</div>
                        <div className="text-[11px] text-slate-500">{b.timeSlot}</div>
                      </td>

                      <td className="px-4 py-3 max-w-[180px] truncate text-slate-600">
                        {b.purpose || 'Personal Gathering'}
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-emerald-600 font-mono font-bold">{formatINR(b.totalCharge || b.totalRentAmount || 0)}</div>
                        <div className="text-[10px] text-slate-400">Deposit: {formatINR(b.depositAmount)} ({b.paymentStatus})</div>
                      </td>

                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          b.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          b.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {b.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewReceiptBooking(b)}
                            className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition border border-blue-200"
                          >
                            Digital Pass
                          </button>

                          {isManagement && b.status === 'pending_approval' && (
                            <>
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                                className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'rejected')}
                                className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 transition"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {isManagement && b.status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                              className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 transition"
                            >
                              Cancel & Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BOOKING MODAL WITH FULL PAYMENT & CONFIRMATION STEPS */}
      {bookingModalOpen && selectedAmenity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-slate-800 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {paymentStep === 'details' && `Book ${selectedAmenity.name}`}
                  {paymentStep === 'payment_gateway' && 'Payment & Deposit Checkout'}
                  {paymentStep === 'confirmation' && 'Booking Confirmed!'}
                </h3>
                <span className="text-[11px] text-slate-500">Step {paymentStep === 'details' ? '1 of 3: Reservation Details' : paymentStep === 'payment_gateway' ? '2 of 3: Secure UPI / Gateway Payment' : '3 of 3: Digital Pass & Receipt'}</span>
              </div>
              <button 
                onClick={() => setBookingModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Validation Error Alert */}
            {validationError && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            {/* STEP 1: BOOKING DETAILS FORM */}
            {paymentStep === 'details' && (
              <form onSubmit={handleProceedToPayment} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Facility</label>
                    <select
                      value={selectedAmenity.id}
                      onChange={(e) => {
                        const am = amenities.find(a => a.id === e.target.value);
                        if (am) setSelectedAmenity(am);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-bold"
                    >
                      {amenities.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Flat Number</label>
                    <select
                      value={selectedFlat}
                      onChange={(e) => setSelectedFlat(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono font-bold"
                    >
                      {flats.map(f => (
                        <option key={f.id} value={f.flatNumber}>{f.flatNumber} ({f.wingName})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Reservation Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().slice(0, 10)}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot Window</label>
                    <select
                      value={bookingSlot}
                      onChange={(e) => setBookingSlot(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                    >
                      {(selectedAmenity.availableTimeSlots || [
                        "09:00 AM - 01:00 PM",
                        "02:00 PM - 06:00 PM",
                        "07:00 PM - 11:30 PM"
                      ]).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Guests</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={selectedAmenity.capacity || 200}
                      value={numberOfGuests}
                      onChange={(e) => setNumberOfGuests(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      value={residentPhone}
                      onChange={(e) => setResidentPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Event Purpose / Remarks</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Birthday Celebration / Society AGM / Tennis Match"
                    value={eventPurpose}
                    onChange={(e) => setEventPurpose(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                {/* Price Breakdown Preview */}
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amenity Rent Rate:</span>
                    <strong className="text-emerald-600 font-mono">
                      {formatINR(selectedAmenity.dailyRate || selectedAmenity.hourlyRate || 0)}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Refundable Security Deposit:</span>
                    <strong className="text-slate-800 font-mono">{formatINR(selectedAmenity.securityDeposit || 0)}</strong>
                  </div>
                  <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-sm text-slate-900">
                    <span>Total Payable:</span>
                    <span className="text-blue-600 font-mono">
                      {formatINR((selectedAmenity.dailyRate || selectedAmenity.hourlyRate || 0) + (selectedAmenity.securityDeposit || 0))}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-md bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm flex items-center gap-1"
                  >
                    <span>Proceed to Payment</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: PAYMENT GATEWAY / UPI QR */}
            {paymentStep === 'payment_gateway' && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="text-blue-700 block">Total Amount to Pay:</span>
                    <strong className="text-base font-mono text-blue-950">
                      {formatINR((selectedAmenity.dailyRate || selectedAmenity.hourlyRate || 0) + (selectedAmenity.securityDeposit || 0))}
                    </strong>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                    Includes ₹{selectedAmenity.securityDeposit || 0} Refundable Deposit
                  </span>
                </div>

                {/* Payment Mode Selector */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('upi')}
                    className={`p-2.5 rounded-lg border text-center font-bold transition flex flex-col items-center gap-1 ${
                      paymentMode === 'upi' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-blue-600" />
                    <span>UPI QR / VPA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('card')}
                    className={`p-2.5 rounded-lg border text-center font-bold transition flex flex-col items-center gap-1 ${
                      paymentMode === 'card' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-slate-700" />
                    <span>Debit / Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('society_ledger')}
                    className={`p-2.5 rounded-lg border text-center font-bold transition flex flex-col items-center gap-1 ${
                      paymentMode === 'society_ledger' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    <span>Society Bill Add</span>
                  </button>
                </div>

                {/* UPI QR Code Container */}
                {paymentMode === 'upi' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center space-y-3">
                    <div className="w-36 h-36 bg-white border-2 border-slate-900 rounded-lg mx-auto flex items-center justify-center p-2 shadow-xs">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=societyprime.amenity@icici%26pn=${encodeURIComponent(society.name)}%26am=${(selectedAmenity.dailyRate || selectedAmenity.hourlyRate || 0) + (selectedAmenity.securityDeposit || 0)}`} 
                        alt="UPI Payment QR"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-xs text-slate-600">
                      <span className="font-mono font-bold text-slate-800">societyprime.amenity@icici</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Scan via Google Pay, PhonePe, Paytm, or BHIM</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setPaymentStep('details')}
                    className="px-3.5 py-1.5 rounded-md bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalizeBooking}
                    className="px-5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm Payment & Book</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SUCCESS & DIGITAL CONFIRMATION PASS */}
            {paymentStep === 'confirmation' && activeCreatedBooking && (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7" />
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">Facility Booked Successfully!</h4>
                  <span className="text-xs font-mono font-bold text-blue-700">Pass Code: #{activeCreatedBooking.bookingCode}</span>
                </div>

                {/* Simulated Notification Sent Card */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 text-left space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Automated Confirmations Dispatched</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    📲 WhatsApp & Email confirmation sent to <strong>{activeCreatedBooking.memberPhone}</strong> with digital QR access badge and security checklist.
                  </p>
                </div>

                <div className="flex justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setViewReceiptBooking(activeCreatedBooking);
                      setBookingModalOpen(false);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-xs flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View & Print Booking Pass</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-md"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DIGITAL PASS & RECEIPT MODAL */}
      {viewReceiptBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-2xl p-6 space-y-4 text-slate-800 text-left relative">
            <button
              onClick={() => setViewReceiptBooking(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>

            {/* Receipt Header */}
            <div className="border-b border-dashed border-slate-200 pb-3 text-center">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mx-auto mb-1 font-bold text-sm">
                SP
              </div>
              <h3 className="text-sm font-bold text-slate-900">{society.name}</h3>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block mt-0.5">Official Amenity Access Pass</span>
            </div>

            {/* Pass QR & Code */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center space-y-2">
              <div className="w-28 h-28 bg-white border border-slate-300 rounded mx-auto flex items-center justify-center p-1.5">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=AMENITY_PASS_${viewReceiptBooking.bookingCode}_FLAT_${viewReceiptBooking.flatNumber}`} 
                  alt="Amenity Pass QR"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                PASS #{viewReceiptBooking.bookingCode}
              </span>
            </div>

            {/* Pass Details */}
            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Amenity:</span>
                <strong className="text-slate-900">{viewReceiptBooking.amenityName}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Reserved For:</span>
                <strong className="text-slate-900">{viewReceiptBooking.memberName} (Flat {viewReceiptBooking.flatNumber})</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Date & Slot:</span>
                <span className="text-slate-800 font-semibold">{viewReceiptBooking.bookingDate} • {viewReceiptBooking.timeSlot}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Total Charges:</span>
                <strong className="text-emerald-600 font-mono">{formatINR(viewReceiptBooking.totalCharge || viewReceiptBooking.totalRentAmount || 0)}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Security Deposit:</span>
                <span className="text-slate-800 font-mono">{formatINR(viewReceiptBooking.depositAmount)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold uppercase text-emerald-600">{viewReceiptBooking.status}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  alert('Booking confirmation pass link copied to clipboard!');
                }}
                className="px-3.5 py-1.5 rounded-md bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 flex items-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print Pass</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AmenityBookingModule = AmenityBookingComponent;

