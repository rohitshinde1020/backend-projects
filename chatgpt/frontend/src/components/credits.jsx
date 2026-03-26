import React, { useEffect, useState } from 'react'
import { useContext } from 'react';
import { Appcontext } from '../context/Appcontext';
import toast from 'react-hot-toast';
import Loading from '../pages/loading';

const Credits = () => {
  const [plans, setplans] = React.useState([]);
  const [loading, setloading] = useState(false);
  const [buyingPlanId, setbuyingPlanId] = useState(null);
  const { axios, token, navigate } = useContext(Appcontext);

  const fetchplans = async () => {
    setloading(true);
    try {
      const { data } = await axios.get('/api/credits/plans');
      if (data.success) {
        setplans(data.plans || []);
      } else {
        toast.error(data.message || 'Could not load plans');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error fetching plans');
    } finally {
      setloading(false);
    }
  }

  const purchasePlan = async (planId) => {
    if (!token) {
      toast.error('Please login to purchase a plan');
      navigate('/login');
      return;
    }

    try {
      setbuyingPlanId(planId);
      const { data } = await axios.post(
        '/api/credits/purchase',
        { planId },
        { headers: { Authorization: token } }
      );

      if (!data.success || !data.url) {
        toast.error(data.message || 'Unable to start checkout');
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to process payment now');
    } finally {
      setbuyingPlanId(null);
    }
  }

  useEffect(() => {
    fetchplans();
  }, [])

  if (loading) return <Loading />
  
  return (
    <div className='w-full min-h-screen bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-linear-to-br dark:from-gray-800 dark:via-gray-900 dark:to-black'>
      {/* Header Section */}
      <div className='max-w-7xl mx-auto text-center mb-16'>
        <div className='inline-block mb-4'>
          <span className='bg-linear-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg'>
            💎 Premium Plans
          </span>
        </div>
        <h1 className='text-3xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-linear-to-r from-purple-600 via-pink-600 to-indigo-600'>
          Choose Your Plan
        </h1>
        <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
          Select the perfect plan for your needs. All plans include access to our powerful AI tools.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className='max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12'>
        {plans.map((plan, index) => {
          const isPopular = plan._id === 'pro';
          const gradients = [
            'from-blue-500 to-cyan-500',
            'from-purple-500 to-pink-500',
            'from-orange-500 to-red-500'
          ];
          
          return (
            <div
              key={plan._id}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:bg-linear-to-br dark:from-gray-800 dark:via-gray-900 dark:to-black ${
                isPopular ? 'ring-4 ring-purple-500 lg:scale-105' : ''
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className='absolute top-0 right-0'>
                  <div className='bg-linear-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-4 py-2 rounded-bl-2xl shadow-lg'>
                    ⭐ MOST POPULAR
                  </div>
                </div>
              )}

              {/* Card Header with Gradient */}
              <div className={`bg-linear-to-r ${gradients[index]} p-8 text-white`}>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-3xl font-bold'>{plan.name}</h2>
                  <div className='bg-white/20 backdrop-blur-sm rounded-full p-3'>
                    <svg className='w-8 h-8' fill='currentColor' viewBox='0 0 20 20'>
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  </div>
                </div>
                
                {/* Price */}
                <div className='mb-2'>
                  <span className='text-5xl font-extrabold'>${plan.price}</span>
                  <span className='text-white/80 text-lg ml-2'>/month</span>
                </div>
                
                {/* Credits Badge */}
                <div className='inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2'>
                  <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z' />
                    <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z' clipRule='evenodd' />
                  </svg>
                  <span className='font-semibold text-lg'>{plan.credits} Credits</span>
                </div>
              </div>

              {/* Card Body */}
              <div className='p-8'>
                {/* Features List */}
                <ul className='space-y-4 mb-8'>
                  {plan.features.map((item, featureIndex) => {
                    return (
                      <li key={featureIndex} className='flex items-start'>
                        <svg className='w-6 h-6 text-green-500 mr-3 shrink-0 mt-0.5' fill='currentColor' viewBox='0 0 20 20'>
                          <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                        </svg>
                        <span className='text-gray-700 dark:text-gray-100'>{item}</span>
                      </li>
                    );
                  })}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => purchasePlan(plan._id)}
                  disabled={buyingPlanId === plan._id}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    isPopular
                      ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {buyingPlanId === plan._id ? 'Redirecting...' : (isPopular ? 'Get Started Now' : 'Choose Plan')}
                </button>
              </div>

              {/* Bottom Accent */}
              <div className={`h-2 bg-linear-to-r ${gradients[index]}`}></div>
            </div>
          );
        })}
      </div>

      {/* Bottom Info */}
      <div className='max-w-4xl mx-auto mt-16 text-center'>
        <div className='bg-white rounded-2xl shadow-lg p-8'>
          <h3 className='text-2xl font-bold text-gray-900 mb-4'>
            All Plans Include
          </h3>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
            <div className='flex flex-col items-center'>
              <div className='bg-blue-100 rounded-full p-4 mb-3'>
                <svg className='w-8 h-8 text-blue-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
              </div>
              <h4 className='font-semibold text-gray-900 mb-1'>Secure & Safe</h4>
              <p className='text-gray-600 text-sm'>Enterprise-grade security</p>
            </div>
            <div className='flex flex-col items-center'>
              <div className='bg-green-100 rounded-full p-4 mb-3'>
                <svg className='w-8 h-8 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z' clipRule='evenodd' />
                </svg>
              </div>
              <h4 className='font-semibold text-gray-900 mb-1'>Lightning Fast</h4>
              <p className='text-gray-600 text-sm'>Optimized performance</p>
            </div>
            <div className='flex flex-col items-center'>
              <div className='bg-purple-100 rounded-full p-4 mb-3'>
                <svg className='w-8 h-8 text-purple-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z' />
                  <path d='M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z' />
                </svg>
              </div>
              <h4 className='font-semibold text-gray-900 mb-1'>24/7 Support</h4>
              <p className='text-gray-600 text-sm'>Always here to help</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Credits
