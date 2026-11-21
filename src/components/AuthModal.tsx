import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  KeyRound, 
  RefreshCw,
  Crown
} from 'lucide-react';
import { UserProfile, UserRole, SocietyConfig } from '../types';
import { DEMO_USERS } from '../mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (user: UserProfile) => void;
  onAuthSuccess?: (user: UserProfile) => void;
  societies?: SocietyConfig[];
  currentUser?: UserProfile | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onAuthSuccess,
  societies = []
}) => {
  const handleSuccess = (u: UserProfile) => {
    if (onLoginSuccess) onLoginSuccess(u);
    if (onAuthSuccess) onAuthSuccess(u);
    localStorage.setItem('societyprime_user', JSON.stringify(u));
  };
  const [mode, setMode] = useState<'login' | 'register' | 'otp_verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('society_admin');
  const [societyName, setSocietyName] = useState('Sunrise Co-op Housing Society');
  const [selectedSocietyId, setSelectedSocietyId] = useState(societies?.[0]?.id || 'soc-001');
  
  // OTP state
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    let interval: any;
    if (mode === 'otp_verify' && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [mode, timerSeconds]);

  if (!isOpen) return null;

  const handleSendOtp = (targetEmail: string) => {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomCode);
    setTimerSeconds(60);
    setMode('otp_verify');
    setSuccessMsg(`Verification 6-digit OTP generated for ${targetEmail}`);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password || !fullName || !phone) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }
    handleSendOtp(email);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput !== generatedOtp) {
      setErrorMsg('Invalid OTP entered. Please check simulated email inbox below.');
      return;
    }

    // Success registered user
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      fullName,
      name: fullName,
      phone,
      role: selectedRole,
      societyId: selectedSocietyId,
      isEmailVerified: true,
      createdAt: new Date().toISOString()
    };
    handleSuccess(newUser);
    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (cleanEmail === 'businesssoftsolutions@gmail.com') {
      if (cleanPass === 'ADmin@#123' || cleanPass === 'Admin@#123' || cleanPass === 'ADmin@123' || cleanPass === 'Admin@123') {
        const superAdminUser: UserProfile = {
          id: 'usr-superadmin',
          email: 'businesssoftsolutions@gmail.com',
          fullName: 'Super Admin (Business Soft Solutions)',
          name: 'Super Admin Director',
          phone: '+91 98765 00001',
          role: 'super_admin',
          isEmailVerified: true,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          createdAt: '2026-01-01T00:00:00.000Z'
        };
        handleSuccess(superAdminUser);
        onClose();
        return;
      } else {
        setErrorMsg('Invalid password for Super Admin. Expected password: ADmin@#123');
        return;
      }
    }

    // Look up existing demo users or create session
    const matched = DEMO_USERS.find(u => u.email.toLowerCase() === cleanEmail);
    if (matched) {
      const expected = matched.password || 'Admin@123';
      if (cleanPass === expected || cleanPass === 'ADmin@#123' || cleanPass.length >= 4) {
        handleSuccess(matched);
        onClose();
      } else {
        setErrorMsg(`Invalid password for ${matched.fullName}. (Demo password: ${expected})`);
      }
    } else {
      // Allow general email login
      if (!email.includes('@')) {
        setErrorMsg('Please provide a valid email address.');
        return;
      }
      if (cleanPass.length < 4) {
        setErrorMsg('Password must be at least 4 characters.');
        return;
      }
      const user: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        fullName: (email || '').split('@')?.[0] || 'Society Member',
        name: (email || '').split('@')?.[0] || 'Society Member',
        phone: "+91 98000 00000",
        role: 'society_admin',
        societyId: selectedSocietyId,
        isEmailVerified: true,
        createdAt: new Date().toISOString()
      };
      handleSuccess(user);
      onClose();
    }
  };

  const handleQuickDemoLogin = (demoUser: UserProfile) => {
    handleSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-50 p-5 border-b border-slate-200 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">SocietyPrime Portal</h2>
              <p className="text-xs text-slate-500">Housing Society SaaS & TallyPrime Billing Module</p>
            </div>
          </div>

          <div className="flex gap-1.5 mt-4 bg-slate-200/70 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-md transition ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-md transition ${
                mode === 'register' || mode === 'otp_verify' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register New Society / Member
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* LOGIN VIEW */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Email ID</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. secretary@gokuldhamheights.org"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md text-xs shadow-xs transition flex items-center justify-center gap-2"
              >
                <span>Sign In Securely</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* REGISTER VIEW */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-md text-xs text-blue-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-blue-600" />
                <span><strong>Special Offer:</strong> 1st Month Free Subscription automatically applied upon sign up!</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name / Society Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Amrut Shinde / Secretary"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email ID (for OTP)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@society.in"
                      className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98200 00000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">User Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="society_admin">Society Secretary / Admin</option>
                    <option value="treasurer">Treasurer / Accountant</option>
                    <option value="resident">Resident Member / Flat Owner</option>
                    <option value="security">Security Gatekeeper</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Housing Society Name</label>
                  <input
                    type="text"
                    required
                    value={societyName}
                    onChange={(e) => setSocietyName(e.target.value)}
                    placeholder="e.g. Sunrise CHS Ltd"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md text-xs shadow-xs transition flex items-center justify-center gap-2"
              >
                <span>Proceed to Email OTP Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* OTP VERIFICATION VIEW */}
          {mode === 'otp_verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Verify Email with OTP</h3>
                <p className="text-xs text-slate-500">
                  A 6-digit one-time password was sent to <span className="text-blue-600 font-semibold">{email}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 text-center">Enter 6-Digit OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="• • • • • •"
                  className="w-full bg-slate-50 border-2 border-blue-500 rounded-md py-2.5 text-center text-xl font-mono tracking-widest text-slate-900 focus:outline-none"
                />
              </div>

              {/* Simulated Email Delivery Popover for seamless testing */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                    <Mail className="w-3.5 h-3.5 text-blue-600" /> Simulated Mail Inbox
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold">Email Delivered Instantly</span>
                </div>
                <div className="p-2 bg-white border border-slate-200 rounded-md text-xs font-mono flex items-center justify-between text-slate-700">
                  <span>Your OTP Code: <strong className="text-blue-700 text-sm font-bold">{generatedOtp}</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtpInput(generatedOtp)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded text-[11px] font-bold transition shadow-xs"
                  >
                    Auto-Fill
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  {timerSeconds > 0 ? (
                    `Resend code in ${timerSeconds}s`
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp(email)}
                      className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <RefreshCw className="w-3 h-3" /> Resend OTP
                    </button>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-slate-500 hover:text-slate-800"
                >
                  Change Email
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-md text-xs shadow-xs transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Activate Free Subscription</span>
              </button>
            </form>
          )}

          {/* Quick Demo Switcher */}
          <div className="border-t border-slate-200 pt-3 mt-3">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
              ⚡ Instant 1-Click Role Testing (Click to Switch):
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((usr) => (
                <button
                  key={usr.id}
                  onClick={() => handleQuickDemoLogin(usr)}
                  className="bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 p-2 rounded-lg text-left transition group"
                >
                  <div className="flex items-center gap-2">
                    <img 
                      src={usr.avatarUrl} 
                      alt={usr.fullName} 
                      className="w-6 h-6 rounded-full object-cover border border-blue-400" 
                    />
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">
                        {usr.fullName}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        {usr.role === 'super_admin' && <Crown className="w-2.5 h-2.5 text-amber-500" />}
                        {usr.role === 'society_admin' && <ShieldCheck className="w-2.5 h-2.5 text-blue-500" />}
                        {usr.role === 'resident' && <User className="w-2.5 h-2.5 text-emerald-500" />}
                        {usr.role === 'security' && <KeyRound className="w-2.5 h-2.5 text-purple-500" />}
                        <span className="capitalize">{usr.role.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
