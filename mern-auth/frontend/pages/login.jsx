import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Appcontext } from '../context/appcontext';
import axios from 'axios';
import { toast } from 'react-toastify';


const Login = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { serverurl, setIsloggedin ,getuserdata} = useContext(Appcontext);

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      axios.defaults.withCredentials = true;
      if (state === 'login') {
        const { data } = await axios.post(`${serverurl}/api/auth/login`, { email, password })
        setName("");
        setEmail("");
        setPassword("");
        if (data.success) {
          setIsloggedin(true);
          getuserdata();
          navigate('/');
        }
        else {
          toast.error(data.message);
        }

      }
      else {
        const { data } = await axios.post(`${serverurl}/api/auth/register`, { name, email, password })
        setName("");
        setEmail("");
        setPassword("");
        if (data.success) {
          toast.success(data.message);
          setState("login");
          getuserdata();
          navigate('/');

        }
        else {
          toast.error(data.message);
        }
      }
    }
    catch (err) {
      toast.error(err.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  

  return (
    <div className='min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center px-4 py-12'>
      {/* Logo */}
      <div className='absolute top-6 left-6'>
        <h1 className="text-xl md:text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition duration-300"
          onClick={() => navigate('/')}>
          Mern-Auth
        </h1>
      </div>

      {/* Login Card */}
      <div className='w-full max-w-md'>
        <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-200 animate-fade-in'>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='inline-block p-4 bg-linear-to-r from-purple-600 to-pink-600 rounded-full mb-4'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h1 className='text-3xl font-bold text-gray-800 mb-2'>
              {state === "login" ? "Welcome Back!" : "Create Account"}
            </h1>
            <p className='text-gray-600'>
              {state === "login" ? "Login to continue" : "Sign up to get started"}
            </p>
          </div>

          {/* Toggle Login/Signup */}
          <div className='text-center mb-6'>
            {state === "login" ? (
              <p className='text-gray-600'>
                Don't have an account?{' '}
                <span className='text-purple-600 font-semibold cursor-pointer hover:text-pink-600 transition duration-200'
                  onClick={() => setState("signup")}
                  >
                  Sign Up
                </span>
              </p>
            ) : (
              <p className='text-gray-600'>
                Already have an account?{' '}
                <span className='text-purple-600 font-semibold cursor-pointer hover:text-pink-600 transition duration-200'
                  onClick={() => setState("login")}>
                  Login
                </span>
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
            {/* Username Field (Signup only) */}
            {state === "signup" && (
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className='w-full py-3 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200 text-gray-800 placeholder:text-gray-400'
                  placeholder='Username'
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  required={state === "signup"}
                />
              </div>
            )}

            {/* Email Field */}
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <input
                type="email"
                className='w-full py-3 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200 text-gray-800 placeholder:text-gray-400'
                placeholder='Email Address'
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
            </div>

            {/* Password Field */}
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className='w-full py-3 pl-12 pr-12 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200 text-gray-800 placeholder:text-gray-400'
                placeholder='Password'
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className='absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition duration-200'
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Forgot Password */}
            {state === "login" && (
              <div className='text-right'>
                <p className='text-sm text-purple-600 font-semibold cursor-pointer hover:text-pink-600 transition duration-200'
                  onClick={() => navigate('/resetpass')}>
                  Forgot Password?
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className='group relative w-full py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 overflow-hidden mt-2'>
              <span className='relative z-10'>
                {state === "login" ? "Login" : "Sign Up"}
              </span>
              <div className='absolute inset-0 bg-linear-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition duration-300'></div>
            </button>
          </form>
        </div>
      </div>

    </div>
  )
}

export default Login;