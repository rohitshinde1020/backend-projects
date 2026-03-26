import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react';
import { Appcontext } from '../context/Appcontext';
import toast from 'react-hot-toast';

const Loading = () => {
    const navigate = useNavigate();
    const { axios, token, fetchuser } = useContext(Appcontext);

    useEffect(() => {
        const verifyPaymentAndContinue = async () => {
            const params = new URLSearchParams(window.location.search);
            const sessionId = params.get('session_id');

            if (!sessionId) {
                const timer = setTimeout(() => {
                    navigate('/');
                }, 1400);
                return () => clearTimeout(timer);
            }

            if (!token) {
                toast.error('Please login again to complete payment verification');
                navigate('/login');
                return;
            }

            try {
                const { data } = await axios.post(
                    '/api/credits/verify-session',
                    { sessionId },
                    { headers: { Authorization: token } }
                );

                if (data.success) {
                    await fetchuser();
                    toast.success('Payment verified and credits added');
                } else {
                    toast.error(data.message || 'Payment verification failed');
                }
            } catch (error) {
                toast.error(error?.response?.data?.message || 'Payment verification failed');
            } finally {
                window.history.replaceState({}, '', '/loading');
                setTimeout(() => navigate('/'), 1200);
            }
        };

        verifyPaymentAndContinue();
    }, [axios, token, fetchuser, navigate])
    
    return (
        <div className='relative flex h-screen w-screen items-center justify-center overflow-hidden bg-linear-to-br from-slate-950 via-blue-950 to-indigo-900'>
    
            <div className='relative flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 shadow-2xl shadow-black/40 backdrop-blur'>
                <div className='relative h-12 w-12'>
                    <div className='absolute inset-0 rounded-full border-4 border-white/30' />
                    <div className='absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin' />
                </div>
                <div>
                    <p className='text-sm uppercase tracking-[0.2em] text-white/60'>Booting</p>
                    <p className='text-lg font-semibold text-white'>Preparing your chat...</p>
                </div>
            </div>
        </div>
    )
}

export default Loading
