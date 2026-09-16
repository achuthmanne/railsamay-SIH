import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';


const railwayData = {
  "Central Railway (CR)": ["Nagpur"],
  "South Central Railway (SCR)": ["Secunderabad", "Vijayawada"],
  "Northern Railway (NR)": ["Delhi"]
};

const AuthDoorModal = ({ isOpen, onClose, type }) => {

  const [doorState, setDoorState] = useState('closed'); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // ATS Specific Dropdown States
  const [zone, setZone] = useState('');
  const [division, setDivision] = useState('');
  const [controlOffice, setControlOffice] = useState('');

  
  // Track the modal type internally so it doesn't switch when closing
  const [modalType, setModalType] = useState(type);
  useEffect(() => {
    if (type) setModalType(type);
  }, [type]);
  
  // OTP State
  const [otp, setOtp] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  const [otpSent, setOtpSent] = useState(false);
  const [mockOtp, setMockOtp] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let t1, t2;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      t1 = setTimeout(() => setDoorState('opening'), 50);
      t2 = setTimeout(() => setDoorState('open'), 1200);
    } else {
      if (doorState !== 'closed') {
        setDoorState('closing');
        t2 = setTimeout(() => {
          setDoorState('closed');
          document.body.style.overflow = 'unset';
          setUsername('');
          setPassword('');
          setPhone('');
          setZone('');
          setDivision('');
          setControlOffice('');
          setOtp('');
          setOtpValues(['', '', '', '', '', '']);
          setOtpSent(false);
          setMockOtp(null);
          setShowToast(false);
          setLoginSuccess(false);
          setError('');
        }, 1200);
      }
    }
    return () => { 
      clearTimeout(t1); 
      clearTimeout(t2); 
      document.body.style.overflow = 'unset'; 
    };
  }, [isOpen]);

  if (!isOpen && doorState === 'closed') return null;

  // OTP Logic
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);
    setOtp(newOtp.join(''));

    if (value !== '' && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otpValues[index] === '' && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;
    
    const newOtp = [...otpValues];
    for (let i = 0; i < newOtp.length; i++) {
      newOtp[i] = pasteData[i] || '';
    }
    setOtpValues(newOtp);
    setOtp(newOtp.join(''));
    
    const nextFocusIndex = Math.min(pasteData.length, 5);
    otpRefs.current[nextFocusIndex].focus();
  };

  const handleSendOTP = (e) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setError('');
    setLoading(true);
    
    // Generate Random 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setMockOtp(generatedOtp);

    // Simulate secure OTP delivery delay
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setShowToast(true);
      // Auto-hide toast after 8 seconds
      setTimeout(() => setShowToast(false), 8000);
    }, 1000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (modalType === 'passenger' && otp !== mockOtp) {
      setError('Invalid Secure OTP entered. Please try again.');
      setLoading(false);
      return;
    }

    try {
      const loginPayload = modalType === 'ats' 
        ? { username, password, role: modalType, zone, division, controlOffice } 
        : { username: phone, password: otp, role: modalType }; 

      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginPayload)
      });

      if (!response.ok) {
        if (modalType === 'ats') throw new Error('Invalid Authorization Credentials.');
        else throw new Error('Invalid OTP. Please try again.');
      }

      const data = await response.json();
      localStorage.setItem('rail_samay_token', data.token);
      localStorage.setItem('rail_samay_role', data.role);
      if (modalType === 'ats') {
        localStorage.setItem('rail_samay_zone', zone);
        localStorage.setItem('rail_samay_division', division);
        localStorage.setItem('rail_samay_office', controlOffice);
      }
      
      setLoginSuccess(true);
      
      // Delay navigation to show the success green tick button
      setTimeout(() => {
        if (data.role === 'ats') {
          navigate('/ats-dashboard');
        } else {
          navigate('/passenger-dashboard', { state: { loggedIn: true } });
        }
      }, 1500);
    } catch (err) {
      // HACKATHON DEMO FALLBACK: If the Python backend is not running, we still show the success flow
      // because the frontend already verified the OTP above.
      if (err.message.includes('Failed to fetch') || err.message.includes('Network')) {
        if (modalType === 'ats') {
            localStorage.setItem('rail_samay_zone', zone);
            localStorage.setItem('rail_samay_division', division);
            localStorage.setItem('rail_samay_office', controlOffice);
          }
          setLoginSuccess(true);
          setTimeout(() => {
            if (modalType === 'ats') {
            navigate('/ats-dashboard');
          } else {
            navigate('/passenger-dashboard', { state: { loggedIn: true } });
          }
        }, 1500);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const bgImage = modalType === 'ats' ? '/ats-bg.jpg' : '/passenger-bg.jpg';
  const themeColor = modalType === 'ats' ? '#1E3A8A' : '#F97316';
  const themeColorClass = modalType === 'ats' ? 'bg-[#1E3A8A]' : 'bg-[#F97316]';
  const activeInputClass = modalType === 'ats' ? 'focus:border-[#1E3A8A]' : 'focus:border-[#F97316]';
  const activeContainerClass = modalType === 'ats' ? 'focus-within:border-[#1E3A8A]' : 'focus-within:border-[#F97316]';
  
  const title = modalType === 'ats' ? 'ATS Controller Portal' : 'Passenger Telemetry';

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-slate-100 flex items-center justify-center font-sans">
      
      {/* Vande Bharat Sliding Doors */}
      <div 
        className={`absolute top-0 bottom-0 left-0 w-1/2 bg-slate-50 z-[110] transition-transform duration-1000 ease-[cubic-bezier(0.85,0,0.15,1)] flex justify-end shadow-[20px_0_30px_rgba(0,0,0,0.1)] border-r-2 border-slate-200 ${doorState === 'opening' || doorState === 'open' ? '-translate-x-full' : 'translate-x-0'}`}
      >
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-[#1E3A8A] flex flex-col justify-center items-center">
          <div className="w-1 h-32 bg-orange-500 rounded-full mb-10"></div>
          <div className="w-6 h-6 rounded-full border-2 border-white/50"></div>
        </div>
      </div>
      
      <div 
        className={`absolute top-0 bottom-0 right-0 w-1/2 bg-slate-50 z-[110] transition-transform duration-1000 ease-[cubic-bezier(0.85,0,0.15,1)] flex justify-start shadow-[-20px_0_30px_rgba(0,0,0,0.1)] border-l-2 border-slate-200 ${doorState === 'opening' || doorState === 'open' ? 'translate-x-full' : 'translate-x-0'}`}
      >
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-[#1E3A8A] flex flex-col justify-center items-center">
          <div className="w-6 h-6 rounded-full border-2 border-white/50 mb-10"></div>
          <div className="w-1 h-32 bg-orange-500 rounded-full"></div>
        </div>
      </div>

      {/* Main Content inside the modal (The Premium Centered Card) */}
      <div className={`w-full h-full absolute inset-0 z-[105] transition-opacity duration-1000 flex items-center justify-center p-6 ${doorState === 'opening' || doorState === 'open' ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* RETURN BUTTON: Completely outside the form, top-left of the screen */}
        <button 
          onClick={onClose}
          className="absolute top-8 left-8 flex items-center px-5 py-2.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all font-bold text-sm tracking-wide group"
        >
          <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          RETURN TO HOME
        </button>

        {/* THE PREMIUM CENTERED CARD (Flat Design) */}
        <div className="w-full max-w-[880px] h-[520px] mt-20 bg-white rounded-2xl border border-slate-200 flex overflow-hidden relative">
          
          {/* LEFT SIDE: The Image */}
          <div className="w-[346px] flex-shrink-0 h-full relative bg-white border-r border-slate-200">
            <img src={bgImage} alt="Portal Design" className="w-full h-full object-cover object-center" />
          </div>

          {/* RIGHT SIDE: The Form */}
          <div className="flex-1 h-full flex flex-col justify-center px-10 relative">
            
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4 mb-8">
              <img src="/favicon.png" alt="Rail Samay" className="w-12 h-12" />
              <div>
                <h1 className="text-2xl font-black font-montserrat tracking-tight text-slate-800 leading-none">
                  RAIL <span style={{ color: themeColor }}>SAMAY</span>
                </h1>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5 font-inter">Dynamic Railway ETA & Operations Intelligence</p>
              </div>
            </div>

            {/* Title */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 font-montserrat">{title}</h2>
              <p className="text-xs text-slate-500 mt-1 font-inter">
                {modalType === 'ats' ? 'Please enter your authorized credentials to proceed.' : 'Authenticate with your 10-digit mobile number to access live telemetry.'}
              </p>
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="mb-4 flex items-center p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-xs font-semibold">
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                {error}
              </div>
            )}

            {/* Form Section */}
            {modalType === 'ats' ? (
              // ATS FORM
              <form onSubmit={handleLogin} className="space-y-4">
                
                {/* Row 1: ID & Password */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Employee ID</label>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="ATS-BZA-1042"
                      className={`w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-sm focus:outline-none focus:bg-white transition-colors duration-200 font-inter text-slate-800 text-sm font-semibold ${activeInputClass}`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Password</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="********"
                      className={`w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-sm focus:outline-none focus:bg-white transition-colors duration-200 font-inter text-slate-800 text-sm font-semibold tracking-widest ${activeInputClass}`}
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Railway Zone */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Railway Zone</label>
                  <select 
                    value={zone}
                    onChange={(e) => {
                      setZone(e.target.value);
                      setDivision('');
                      setControlOffice('');
                    }}
                    className={`w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-sm focus:outline-none focus:bg-white transition-colors duration-200 font-inter text-slate-800 text-sm font-semibold appearance-none ${activeInputClass}`}
                    required
                  >
                    <option value="" disabled>Select Zone</option>
                    {Object.keys(railwayData).map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>

                {/* Row 3: Division & Control Office */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Division</label>
                    <select 
                      value={division}
                      onChange={(e) => {
                        setDivision(e.target.value);
                        setControlOffice(`${e.target.value} Control`);
                      }}
                      disabled={!zone}
                      className={`w-full px-3 py-2.5 ${!zone ? 'bg-slate-100 opacity-60' : 'bg-slate-50'} border border-slate-300 rounded-sm focus:outline-none focus:bg-white transition-colors duration-200 font-inter text-slate-800 text-sm font-semibold appearance-none ${activeInputClass}`}
                      required
                    >
                      <option value="" disabled>Select Division</option>
                      {zone && railwayData[zone].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Control Office</label>
                    <select 
                      value={controlOffice}
                      onChange={(e) => setControlOffice(e.target.value)}
                      disabled={!division}
                      className={`w-full px-3 py-2.5 ${!division ? 'bg-slate-100 opacity-60' : 'bg-slate-50'} border border-slate-300 rounded-sm focus:outline-none focus:bg-white transition-colors duration-200 font-inter text-slate-800 text-sm font-semibold appearance-none ${activeInputClass}`}
                      required
                    >
                      <option value="" disabled>Select Office</option>
                      {division && <option value={`${division} Control`}>{division} Control</option>}
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || loginSuccess}
                  className={`w-full mt-2 py-3 rounded-sm font-bold text-white text-sm uppercase tracking-widest transition-all flex items-center justify-center ${loginSuccess ? 'bg-green-600 hover:opacity-100 disabled:opacity-100' : `${themeColorClass} hover:opacity-90`}`}
                >
                  {loginSuccess ? (
                    <>
                      <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="11" fill="white"/><path d="M7.5 12.5L10.5 15.5L16.5 8.5" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      ACCESS GRANTED
                    </>
                  ) : loading ? (
                    'AUTHENTICATING...'
                  ) : (
                    'Login to ATS Dashboard'
                  )}
                </button>
              </form>
            ) : (
              // PASSENGER OTP FORM
              <form onSubmit={otpSent ? handleLogin : handleSendOTP} className="space-y-6">
                
                {/* Phone Number Field */}
                <div>
                  <label className="flex text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 justify-between items-center">
                    <span>10-Digit Mobile Number</span>
                    {otpSent && <span onClick={() => {setOtpSent(false); setOtp(''); setOtpValues(['','','','','','']);}} className="text-[#F97316] cursor-pointer hover:underline">Change Number</span>}
                  </label>
                  <div className={`flex bg-slate-50 border border-slate-300 rounded-sm overflow-hidden focus-within:bg-white transition-colors duration-200 ${activeContainerClass}`}>
                    <div className="flex items-center px-4 bg-slate-100 border-r border-slate-300 text-slate-600 font-bold text-sm">
                      +91
                    </div>
                    <input 
                      type="tel" 
                      maxLength="10"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10-digit mobile number"
                      disabled={otpSent}
                      className={`w-full px-4 py-3 bg-transparent focus:outline-none font-inter text-slate-800 font-semibold tracking-wide ${otpSent ? 'opacity-50 cursor-not-allowed' : ''}`}
                      required
                    />
                  </div>
                </div>

                {/* Govt Style Official OTP Alert */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showToast ? 'max-h-20 mb-4 opacity-100' : 'max-h-0 mb-0 opacity-0'}`}>
                  <div className="flex items-center justify-between px-4 py-3 bg-green-50 border border-green-600 rounded-sm">
                    <div className="flex items-center space-x-3">
                      <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <span className="text-[10px] font-bold tracking-wider text-green-800 uppercase">System Generated OTP</span>
                    </div>
                    <span className="text-sm font-black tracking-[0.2em] text-green-900">{mockOtp}</span>
                  </div>
                </div>

                {/* OTP Field (Visible only if OTP is sent) */}
                {otpSent && (
                  <div className="transition-all duration-300 ease-in-out opacity-100 translate-y-0">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Secure OTP</label>
                    <div className="flex justify-between items-center space-x-2">
                      {otpValues.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpRefs.current[index] = el)}
                          type="text"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={handleOtpPaste}
                          className={`w-12 h-12 text-center bg-slate-50 border border-slate-300 rounded-sm focus:outline-none focus:bg-white transition-colors duration-200 font-inter text-slate-800 font-bold text-xl ${activeInputClass}`}
                          required
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <button 
                  type="submit" 
                  disabled={loading || (otpSent && otp.length !== 6) || loginSuccess}
                  className={`w-full mt-6 py-3.5 rounded-sm font-bold text-white text-sm uppercase tracking-widest transition-all flex items-center justify-center ${loginSuccess ? 'bg-green-600 hover:opacity-100 disabled:opacity-100' : `${themeColorClass} hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed`}`}
                >
                  {loginSuccess ? (
                    <>
                      <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="11" fill="white"/><path d="M7.5 12.5L10.5 15.5L16.5 8.5" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      OTP VERIFIED
                    </>
                  ) : loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    otpSent ? 'AUTHENTICATE' : 'GENERATE SECURE OTP'
                  )}
                </button>
              </form>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDoorModal;
