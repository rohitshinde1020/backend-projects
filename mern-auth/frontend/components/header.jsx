import React from 'react'
import { useContext } from 'react'
import { Appcontext } from '../context/appcontext';



const Header = () => {
    const userdata = useContext(Appcontext).userdata;
    return (
        <div className='min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 px-4 py-12'>
            <div className='flex flex-col items-center justify-center w-full max-w-3xl mx-auto space-y-8 animate-fade-in'>
                
                {/* Image with animation */}
                <div className='relative group'>
                    <div className='absolute -inset-1 bg-linear-to-r from-purple-600 to-pink-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000'></div>
                    <img
                        src="https://imgs.search.brave.com/ZCQYEZ88whxkQM14OQoX5mRFD_x7eAAaUQ8HqvEg5NI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzL2U1L2E1/L2RkL2U1YTVkZDUw/ZWZkOTFiZjY5MzZi/MmJlMTQ0MmEwZmY5/LmpwZw"
                        className='relative rounded-full w-40 h-40 md:w-56 md:h-56 object-cover border-4 border-white shadow-2xl transform hover:scale-105 transition duration-500'
                        alt="hey developers"
                    />
                </div>

                {/* Heading with gradient */}
                <h1 className='text-4xl md:text-6xl font-bold bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent text-center animate-slide-up'>
                    Hey {userdata && userdata.name ? userdata.name : "Developers !"}  👋
                </h1>

                {/* Description */}
                <p className='text-base md:text-lg text-gray-700 text-center max-w-2xl leading-relaxed px-4 animate-slide-up-delay'>
                    Welcome to our <span className='font-semibold text-purple-600'>MERN stack authentication project</span>!
                    This project is designed to provide a secure and efficient authentication system using the
                    <span className='font-semibold'> MongoDB, Express, React, and Node.js</span> stack with modern best practices.
                </p>

                {/* Stats or features */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-8'>
                    <div className='bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300'>
                        <div className='text-3xl mb-2'>🔐</div>
                        <h3 className='font-bold text-gray-800 mb-1'>Secure</h3>
                        <p className='text-sm text-gray-600'>JWT-based authentication</p>
                    </div>
                    <div className='bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300'>
                        <div className='text-3xl mb-2'>⚡</div>
                        <h3 className='font-bold text-gray-800 mb-1'>Fast</h3>
                        <p className='text-sm text-gray-600'>Optimized performance</p>
                    </div>
                    <div className='bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300'>
                        <div className='text-3xl mb-2'>📱</div>
                        <h3 className='font-bold text-gray-800 mb-1'>Responsive</h3>
                        <p className='text-sm text-gray-600'>Works on all devices</p>
                    </div>
                </div>

                {/* CTA Button */}
                <button className='group relative mt-8 px-8 py-4 bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full shadow-lg hover:shadow-2xl transform hover:scale-105 transition duration-300 overflow-hidden'>
                    <span className='relative z-10 flex items-center gap-2'>
                        Get Started
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition duration-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </span>
                    <div className='absolute inset-0 bg-linear-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition duration-300'></div>
                </button>

            </div>

        </div>
    )
}

export default Header