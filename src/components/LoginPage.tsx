import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Crown, 
  UserCheck, 
  KeyRound, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Receipt,
  QrCode,
  Shield,
  Smartphone
} from 'lucide-react';
import { UserProfile, UserRole, SocietyConfig } from '../types';
import { DEMO_USERS } from '../mockData';

interface LoginPageProps {
  societies: SocietyConfig[];
  onLoginSuccess: (user: UserProfile, society?: SocietyConfig, updatedSocieties?: SocietyConfig[]) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  societies,
  onLoginSuccess
}) => {
  const [activeMode, setActiveMode] = useState<'login' | 'register' | 'otp_verify'>('login');
  
  // Login Form States
  const [email, setEmail] = useState('businesssoftsolutions@gmail.com');
  const [password, setPassword] = useState('ADmin@#123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Register Form States (No society dropdown, user registers their own society)
  const [regSocietyName, setRegSocietyName] = useState('');
  const [regCity, setRegCity] = useState('Mumbai, Maharashtra');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('society_admin');
  const [regFlatNumber, setRegFlatNumber] = useState('A-101');

  // OTP Verification States
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      // 1. Check Super Admin requested credentials specifically
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
          
          if (rememberMe) {
            localStorage.setItem('societyprime_user', JSON.stringify(superAdminUser));
          }
          
          setIsLoading(false);
          const targetSoc = societies[0];
          onLoginSuccess(superAdminUser, targetSoc);
          return;
        } else {
          setIsLoading(false);
          setErrorMessage('Invalid password for Super Admin. The required password is: ADmin@#123');
          return;
        }
      }

      // 2. Check other Demo users or locally saved users
      const matchedDemo = DEMO_USERS.find(u => u.email.toLowerCase() === cleanEmail);
      if (matchedDemo) {
        const expectedPass = matchedDemo.password || 'Admin@123';
        if (cleanPass === expectedPass || cleanPass === 'ADmin@#123' || cleanPass.length >= 4) {
          const userObj: UserProfile = {
            ...matchedDemo,
            name: matchedDemo.fullName || matchedDemo.name || 'User'
          };
          if (rememberMe) {
            localStorage.setItem('societyprime_user', JSON.stringify(userObj));
          }
          setIsLoading(false);
          // Automatically find their society and auto-open it
          const targetSoc = societies.find(s => s.id === matchedDemo.societyId) || societies[0];
          onLoginSuccess(userObj, targetSoc);
          return;
        } else {
          setIsLoading(false);
          setErrorMessage(`Invalid password for ${matchedDemo.fullName}. (Demo password: ${expectedPass}).`);
          return;
        }
      }

      // 3. General user login (Any valid email + password with at least 4 characters)
      if (cleanEmail.includes('@') && cleanPass.length >= 4) {
        const customUser: UserProfile = {
          id: `usr-${Date.now()}`,
          email: cleanEmail,
          fullName: cleanEmail.split('@')[0].replace('.', ' ').toUpperCase(),
          name: cleanEmail.split('@')[0],
          phone: '+91 98000 00000',
          role: 'society_admin',
          societyId: societies[0]?.id || 'soc-001',
          isEmailVerified: true,
          createdAt: new Date().toISOString()
        };
        if (rememberMe) {
          localStorage.setItem('societyprime_user', JSON.stringify(customUser));
        }
        setIsLoading(false);
        const targetSoc = societies[0];
        onLoginSuccess(customUser, targetSoc);
        return;
      }

      setIsLoading(false);
      setErrorMessage('Please enter a valid email address and password.');
    }, 400);
  };

  const handleQuickAutofill = (demoEmail: string, demoPass: string, directSubmit = false) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
    
    if (directSubmit) {
      setIsLoading(true);
      setTimeout(() => {
        const cleanEmail = demoEmail.toLowerCase();
        if (cleanEmail === 'businesssoftsolutions@gmail.com') {
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
          if (rememberMe) {
            localStorage.setItem('societyprime_user', JSON.stringify(superAdminUser));
          }
          setIsLoading(false);
          onLoginSuccess(superAdminUser, societies[0]);
          return;
        }

        const matched = DEMO_USERS.find(u => u.email.toLowerCase() === cleanEmail);
        if (matched) {
          const userObj: UserProfile = {
            ...matched,
            name: matched.fullName || matched.name || 'User'
          };
          if (rememberMe) {
            localStorage.setItem('societyprime_user', JSON.stringify(userObj));
          }
          setIsLoading(false);
          const targetSoc = societies.find(s => s.id === matched.societyId) || societies[0];
          onLoginSuccess(userObj, targetSoc);
        }
      }, 300);
    }
  };

  const handleStartRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regSocietyName.trim() || !regEmail || !regPassword || !regFullName || !regPhone) {
      setErrorMessage('Please fill in all mandatory fields, including your Society Name.');
      return;
    }
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpInput(newOtp); // prefill for frictionless testing
    setActiveMode('otp_verify');
    setSuccessMessage(`Simulated 6-digit OTP ${newOtp} generated for registration of "${regSocietyName.trim()}".`);
  };

  const handleVerifyOtpAndRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput !== generatedOtp) {
      setErrorMessage('Invalid OTP entered. Please use the simulated OTP shown above.');
      return;
    }

    const cleanSocName = regSocietyName.trim() || 'My Housing Society';
    const cleanCity = regCity.trim() || 'Mumbai';
    const newSocId = `soc-${Date.now()}`;

    // Create New Dedicated Society with 30 Days Free Trial
    const newSociety: SocietyConfig = {
      id: newSocId,
      name: cleanSocName,
      registrationNumber: `MH/BOM/${Math.floor(10000 + Math.random() * 90000)}/2026`,
      address: `${cleanSocName}, Main Road`,
      city: cleanCity,
      state: 'Maharashtra',
      pincode: '400001',
      upiId: `${cleanSocName.toLowerCase().replace(/[^a-z0-9]/g, '')}.society@hdfcbank`,
      upiPayeeName: cleanSocName,
      bankName: 'HDFC Bank Ltd',
      accountNumber: '502000' + Math.floor(100000 + Math.random() * 900000),
      ifscCode: 'HDFC0001234',
      branch: cleanCity + ' Branch',
      contactEmail: regEmail.trim(),
      contactPhone: regPhone.trim(),
      subscription: {
        planId: 'trial_monthly',
        planName: '1st Month Promotional Free Tier (SaaS Pro)',
        pricePerMonth: 0,
        billingCycle: 'monthly',
        status: 'trialing',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        autoRenew: true,
        paymentMethod: 'UPI / NetBanking'
      },
      gstConfig: {
        enabled: false,
        gstin: '27AAATC' + Math.floor(1000 + Math.random() * 9000) + 'A1Z5',
        cgstRate: 9,
        sgstRate: 9,
        thresholdPerMonth: 7500
      },
      interestConfig: {
        enabled: true,
        ratePercentPerAnnum: 21,
        basis: 'due_date',
        calculationFrequency: 'daily',
        applyOnOpeningBalance: true,
        applyOnArrearsOnly: true
      },
      lateFeeConfig: {
        enabled: true,
        type: 'per_month',
        flatRate: 150,
        shopRate: 300,
        gracePeriodDays: 15
      },
      billingCycle: 'monthly',
      defaultDueDays: 15,
      liveVersion: 'v4.2.1-stable',
      createdAt: new Date().toISOString()
    };

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: regEmail.trim(),
      fullName: regFullName.trim(),
      name: regFullName.trim(),
      phone: regPhone.trim(),
      role: regRole,
      societyId: newSocId,
      flatNumber: regRole === 'resident' ? regFlatNumber : undefined,
      isEmailVerified: true,
      createdAt: new Date().toISOString()
    };

    const updatedSocietiesList = [newSociety, ...societies];

    if (rememberMe) {
      localStorage.setItem('societyprime_user', JSON.stringify(newUser));
    }

    // Auto open this registered society immediately
    onLoginSuccess(newUser, newSociety, updatedSocietiesList);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left Side: Enterprise Branding & ERP Overview */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/80 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 text-white">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/30">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  SocietyPrime
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.5 rounded">
                    SaaS ERP
                  </span>
                </h1>
                <p className="text-xs text-slate-400">Housing Society Accounting & Management</p>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="space-y-4 mb-8">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Maharashtra MCS Act Bylaw Compliant</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  FIFO arrears settlement, 21% p.a. simple interest billing calculations, and statutory Form I/J share registers.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <div className="w-6 h-6 rounded-md bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                    <Receipt className="w-3.5 h-3.5" />
                  </div>
                  <span>Instant Dynamic UPI QR Code Bill Invoices</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span>TallyPrime XML Export & Bank Reconciliation</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <div className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <span>Gate Security & Visitor Pass Automation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Super Admin Notice Pill */}
          <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-3.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs mb-1">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Super Admin Credentials</span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono">
              Email: <span className="text-white font-bold">businesssoftsolutions@gmail.com</span>
            </p>
            <p className="text-[11px] text-slate-300 font-mono mt-0.5">
              Password: <span className="text-amber-300 font-bold">ADmin@#123</span>
            </p>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 bg-slate-900/95 flex flex-col justify-between">
          <div>
            {/* Header and Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {activeMode === 'login' && 'Sign In to Your Account'}
                  {activeMode === 'register' && 'Register New Society / Member'}
                  {activeMode === 'otp_verify' && 'Verify 6-Digit OTP'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeMode === 'login' && 'Enter your email ID and password to access your society details'}
                  {activeMode === 'register' && 'Create your society profile or resident account'}
                  {activeMode === 'otp_verify' && 'Enter the verification OTP to complete sign up'}
                </p>
              </div>

              <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => { setActiveMode('login'); setErrorMessage(''); }}
                  className={`px-3 py-1 rounded font-semibold transition ${
                    activeMode === 'login'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveMode('register'); setErrorMessage(''); }}
                  className={`px-3 py-1 rounded font-semibold transition ${
                    activeMode === 'register' || activeMode === 'otp_verify'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Error & Success Messages */}
            {errorMessage && (
              <div className="mb-4 bg-rose-950/60 border border-rose-800 text-rose-300 px-3.5 py-2.5 rounded-lg text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-tight">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 px-3.5 py-2.5 rounded-lg text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-tight">{successMessage}</span>
              </div>
            )}

            {/* MODE 1: LOGIN FORM */}
            {activeMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    User Email ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="e.g. businesssoftsolutions@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Super Admin: <code className="text-amber-300 font-mono font-bold">ADmin@#123</code>
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                    />
                    <span>Remember my session</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleQuickAutofill('businesssoftsolutions@gmail.com', 'ADmin@#123')}
                    className="text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    Use Super Admin Credentials
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-2.5 px-4 rounded-lg text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In & Open Society</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* MODE 2: REGISTER FORM */}
            {activeMode === 'register' && (
              <form onSubmit={handleStartRegister} className="space-y-3">
                {/* Society Name & City - No Society List Shown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Housing Society Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sunrise Co-op Housing Society Ltd"
                        value={regSocietyName}
                        onChange={(e) => setRegSocietyName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      City / Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai, Maharashtra"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patil"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98200 00000"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email ID</label>
                    <input
                      type="email"
                      required
                      placeholder="patil@society.org"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Create secure password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Select Role</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="society_admin">Society Admin (Secretary/Chairman)</option>
                      <option value="resident">Resident / Flat Owner</option>
                      <option value="security">Gate Security Guard</option>
                      <option value="super_admin">SaaS Super Admin</option>
                    </select>
                  </div>
                  <div>
                    {regRole === 'resident' ? (
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Flat / Unit Number</label>
                        <input
                          type="text"
                          placeholder="e.g. A-101"
                          value={regFlatNumber}
                          onChange={(e) => setRegFlatNumber(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col justify-center h-full pt-4">
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Includes 30-Day Free Trial
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-lg text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span>Generate OTP & Open Society</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* MODE 3: OTP VERIFICATION */}
            {activeMode === 'otp_verify' && (
              <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4">
                <div className="bg-blue-950/60 border border-blue-800 rounded-lg p-3 text-xs text-blue-200">
                  <p className="font-bold mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Simulated Email Verification OTP:
                  </p>
                  <p className="text-xl font-mono font-bold tracking-widest text-amber-300 bg-slate-900/80 px-3 py-1.5 rounded inline-block">
                    {generatedOtp}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    OTP automatically sent for test authentication. Enter above code to proceed.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-center font-mono text-lg font-bold tracking-widest text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveMode('register')}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-3 rounded-lg text-xs transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg text-xs shadow-md transition"
                  >
                    Verify & Enter Society
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Quick Demo Credentials Bar (1-Click Login) */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Quick 1-Click Role Login
              </span>
              <span className="text-[10px] text-slate-500">Tap to auto-fill & login</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Super Admin */}
              <button
                type="button"
                onClick={() => handleQuickAutofill('businesssoftsolutions@gmail.com', 'ADmin@#123', true)}
                className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400 text-left p-2 rounded-lg transition group cursor-pointer"
              >
                <div className="flex items-center justify-between text-amber-400 mb-0.5">
                  <span className="text-[11px] font-bold">Super Admin</span>
                  <Crown className="w-3 h-3 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[10px] text-slate-400 truncate">businesssoftsolutions</p>
                <p className="text-[9px] text-amber-300/80 font-mono">ADmin@#123</p>
              </button>

              {/* Society Admin */}
              <button
                type="button"
                onClick={() => handleQuickAutofill('secretary@gokuldhamheights.org', 'Admin@123', true)}
                className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-400 text-left p-2 rounded-lg transition group cursor-pointer"
              >
                <div className="flex items-center justify-between text-blue-400 mb-0.5">
                  <span className="text-[11px] font-bold">Society Admin</span>
                  <ShieldCheck className="w-3 h-3 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[10px] text-slate-400 truncate">secretary@gokuldham</p>
                <p className="text-[9px] text-blue-300/80 font-mono">Admin@123</p>
              </button>

              {/* Resident */}
              <button
                type="button"
                onClick={() => handleQuickAutofill('resident@gokuldhamheights.org', 'Resident@123', true)}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-400 text-left p-2 rounded-lg transition group cursor-pointer"
              >
                <div className="flex items-center justify-between text-emerald-400 mb-0.5">
                  <span className="text-[11px] font-bold">Resident</span>
                  <UserCheck className="w-3 h-3 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[10px] text-slate-400 truncate">resident@gokuldham</p>
                <p className="text-[9px] text-emerald-300/80 font-mono">Resident@123</p>
              </button>

              {/* Security Guard */}
              <button
                type="button"
                onClick={() => handleQuickAutofill('security.gate@gokuldhamheights.org', 'Security@123', true)}
                className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-400 text-left p-2 rounded-lg transition group cursor-pointer"
              >
                <div className="flex items-center justify-between text-purple-400 mb-0.5">
                  <span className="text-[11px] font-bold">Gate Guard</span>
                  <KeyRound className="w-3 h-3 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[10px] text-slate-400 truncate">security.gate</p>
                <p className="text-[9px] text-purple-300/80 font-mono">Security@123</p>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-xs text-slate-500">
        <p>© 2026 SocietyPrime SaaS ERP Cloud. Built for Housing Societies & Apartment Federations.</p>
      </div>
    </div>
  );
};
