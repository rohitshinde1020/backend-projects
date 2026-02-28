import React, { useContext, useState } from 'react'
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { Appcontext } from '../context/appcontext';

const Resetpass = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { serverurl } = useContext(Appcontext);

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(location.state?.email || "");
  const [userId, setUserId] = useState(location.state?.userId || "");
  const [otp, setOtp] = useState("");
  const [newpassword, setNewpassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sendResetOtp = async () => {
    try {
      if (!email) {
        toast.error("Please enter your email");
        return;
      }

      setIsLoading(true);
      const { data } = await axios.post(`${serverurl}/api/auth/resetpassword`, { email });

      if (data.success) {
        setUserId(data.userId || "");
        setStep(2);
        toast.success(data.message);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      if (!otp || otp.length !== 6) {
        toast.error("Please enter a valid 6-digit OTP");
        return;
      }
      if (!userId) {
        toast.error("Session expired, please request OTP again");
        setStep(1);
        return;
      }

      setIsLoading(true);
      const { data } = await axios.post(`${serverurl}/api/auth/verify-reset-otp`, { userId, otp });

      if (data.success) {
        setStep(3);
        toast.success(data.message || "OTP verified successfully");
      } else {
        toast.error(data.message || "OTP verification failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async () => {
    try {
      if (!newpassword || newpassword.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      if (newpassword !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      setIsLoading(true);
      const { data } = await axios.post(`${serverurl}/api/auth/verify-reset-otp`, {
        userId,
        otp,
        newpassword,
      });

      if (data.success) {
        toast.success(data.message || "Password reset successful");
        navigate('/login');
      } else {
        toast.error(data.message || "Password reset failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center px-4 py-12'>
      <div className='absolute top-6 left-6'>
        <h1
          className='text-xl md:text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition duration-300'
          onClick={() => navigate('/')}
        >
          Mern-Auth
        </h1>
      </div>

      <div className='w-full max-w-md'>
        <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-200 animate-fade-in'>
          <div className='text-center mb-8'>
            <div className='inline-block p-4 bg-linear-to-r from-purple-600 to-pink-600 rounded-full mb-4'>
              <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={2} stroke='white' className='w-8 h-8'>
                <path strokeLinecap='round' strokeLinejoin='round' d='M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z' />
              </svg>
            </div>
            <h1 className='text-3xl font-bold text-gray-800 mb-2'>Reset Password</h1>
            <p className='text-gray-600'>
              {step === 1 && 'Enter your email to receive verification OTP'}
              {step === 2 && 'Enter the 6-digit OTP sent to your email'}
              {step === 3 && 'Set your new secure password'}
            </p>
          </div>

          <div className='flex items-center justify-between mb-8'>
            {[1, 2, 3].map((item) => (
              <div key={item} className='flex items-center w-full last:w-auto'>
                <div
                  className={`w-8 h-8 rounded-full text-sm font-semibold flex items-center justify-center ${
                    step >= item
                      ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {item}
                </div>
                {item !== 3 && (
                  <div className={`h-1 flex-1 mx-2 rounded ${step > item ? 'bg-pink-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className='flex flex-col gap-5'>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-5 h-5 text-gray-400'>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75' />
                  </svg>
                </div>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='Email Address'
                  className='w-full py-3 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200 text-gray-800 placeholder:text-gray-400'
                />
              </div>

              <button
                type='button'
                onClick={sendResetOtp}
                disabled={isLoading}
                className='group relative w-full py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none'
              >
                <span className='relative z-10'>{isLoading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
                <div className='absolute inset-0 bg-linear-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition duration-300'></div>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className='flex flex-col gap-5'>
              <input
                type='text'
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder='Enter 6-digit OTP'
                className='w-full py-3 px-4 tracking-[0.35em] text-center text-lg bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200 text-gray-800 placeholder:text-gray-400'
              />

              <button
                type='button'
                onClick={verifyOtp}
                disabled={isLoading}
                className='group relative w-full py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none'
              >
                <span className='relative z-10'>{isLoading ? 'Verifying OTP...' : 'Verify OTP'}</span>
                <div className='absolute inset-0 bg-linear-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition duration-300'></div>
              </button>

              <button
                type='button'
                onClick={sendResetOtp}
                className='text-sm text-purple-600 font-semibold hover:text-pink-600 transition duration-200'
              >
                Resend OTP
              </button>
            </div>
          )}

          {step === 3 && (
            <div className='flex flex-col gap-5'>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newpassword}
                  onChange={(e) => setNewpassword(e.target.value)}
                  placeholder='New Password'
                  className='w-full py-3 pl-4 pr-12 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200 text-gray-800 placeholder:text-gray-400'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition duration-200'
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='Confirm New Password'
                className='w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200 text-gray-800 placeholder:text-gray-400'
              />

              <button
                type='button'
                onClick={updatePassword}
                disabled={isLoading}
                className='group relative w-full py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none'
              >
                <span className='relative z-10'>{isLoading ? 'Updating Password...' : 'Update Password'}</span>
                <div className='absolute inset-0 bg-linear-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition duration-300'></div>
              </button>
            </div>
          )}

          <p className='text-center text-sm text-gray-600 mt-6'>
            Remember your password?{' '}
            <span
              className='text-purple-600 font-semibold cursor-pointer hover:text-pink-600 transition duration-200'
              onClick={() => navigate('/login')}
            >
              Back to Login
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Resetpass
