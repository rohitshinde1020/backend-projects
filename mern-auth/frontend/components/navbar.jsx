import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Appcontext, } from '../context/appcontext';
import { useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';


const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { userdata, serverurl, setIsloggedin, setUserdata } = useContext(Appcontext);

    const logout = async () => {
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(`${serverurl}/api/auth/logout`);
            if(data.success){
                setIsloggedin(false);
                setUserdata(null);
                navigate('/');
                toast.success("Logged out successfully");
            } else {
                toast.error("Logout failed: " + data.message);
            }
        }
        catch (err) {
            toast.error( err.response?.data?.message || err.message);
        }
           
    }

    const sendverificationotp =async ()=>{
        try{
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(`${serverurl}/api/auth/verify-otp`);
            if(data.success){
                toast.success(data.message);
                navigate('/email-verify');
            } else {
                toast.error("Failed to send OTP: " + data.message);
            }

        }
        catch(err){
                toast.error(err.response?.data?.message || err.message);

        }
    }


    return (
        <nav className='sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center justify-between h-16'>
                    {/* Logo Section */}
                    <div className='flex items-center gap-3 group cursor-pointer'>
                        <div className='relative'>
                            <div className='absolute -inset-1 bg-linear-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-300'></div>
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Mern-Auth
                        </h1>
                    </div>

                    {userdata ? (
                        <div className='w-10 h-10 flex justify-center items-center 
                         bg-gradient-to-r from-purple-600 to-pink-600 
                        rounded-full text-white cursor-pointer border-2 border-purple-600
                         relative group '
                        >
                            {userdata.name[0].toUpperCase()}
                            <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded-2xl pt-10'>
                                <ul className='bg-gray-100 rounded-lg shadow-lg m-0  text-center'> 
                                    {!userdata.isverify && (
                                        <li className=' py-2 px-3 text-nowrap hover:bg-gray-200 cursor-pointer' onClick={sendverificationotp}>Verify Account</li>
                                    )}
                                    <li className=' py-2 px-3 text-nowrap hover:bg-gray-200 cursor-pointer' onClick={logout} >Logout</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <button className='group relative px-6 py-2.5 bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300 overflow-hidden'>
                            <span className='relative z-10 flex items-center gap-2' onClick={() => navigate('/login')}>
                                Login
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition duration-300">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                                </svg>
                            </span>
                            <div className='absolute inset-0 bg-linear-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition duration-300'></div>
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className='md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 animate-slide-down'>
                    <div className='px-4 py-4'>
                        <button className='w-full px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300 flex items-center justify-center gap-2' onClick={() => navigate('/login')}>
                            Login
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

        </nav>
    )
};

export default Navbar;

