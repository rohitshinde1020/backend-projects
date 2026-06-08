import axios from 'axios';
import React, { useContext, useState } from 'react'
import { Appcontext } from '../context/appcontext-context';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';



const Emailverify = () => {
  const [otp, setOtp] = useState("");
  const { serverurl } = useContext(Appcontext);
  const navigate = useNavigate();

  const verifyotp = async ()=>{
    try {
      if (!otp) {
        toast.error("OTP is required");
        return;
      }
      axios.defaults.withCredentials = true;
      const {data}= await axios.post(`${serverurl}/api/auth/verifyaccount`, {otp});
      if(data.success){
        toast.success(data.message);
        navigate('/');
      } else {
        toast.error("OTP verification failed: " + data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred during OTP verification.");
    }
  }

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 px-4 py-12'>
      <div className=' animate-slide-up bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg w-full max-w-md text-center'>
        <h1 className='text-4xl md:text-6xl font-bold bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent text-center'>
          Verify Your Email
        </h1>
        <p className='text-center mt-4'>Enter 6 digit OTP sent to your email</p>
        <div>
          <input type="text" placeholder='Enter OTP' className='w-full px-4 py-2 mt-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600' value={otp} onChange={(e)=>setOtp(e.target.value)} />
          <button className='w-full mt-4 px-4 py-2 bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300'
          onClick={verifyotp}>
            Verify
          </button>
        </div>
      </div>

    </div>
  )
}

export default Emailverify
