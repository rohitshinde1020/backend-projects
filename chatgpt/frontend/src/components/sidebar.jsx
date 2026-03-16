import React, { useContext, useState } from 'react'
import { Appcontext } from '../context/Appcontext'
import { assets } from '../assets/assets'
import moment from 'moment'
import toast from "react-hot-toast";


const Sidebar = ({ openmenu, setopenmenu }) => {
  const { user, theme, chat, setselectedchat, setchat, settheme, fetchuser, navigate, axios, createnewchat, logout, deletechat } = useContext(Appcontext);
  const [search, setsearch] = useState('');

  return (
    <div className={`sticky top-0 left-0 flex flex-col h-screen min-w-72 px-5 py-8 bg-white/70
    border-r border-gray-200 backdrop-blur-2xl shadow-lg dark:bg-slate-900/70 dark:border-gray-700 max-md:absolute left-0 z-10 ${openmenu ? 'block' : 'hidden'} md:block`}>
      <img src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark} alt=""
        className='w-full max-w-48' />

    {/* create new chat  */}
      <button className='mt-5 hover:scale-95' onClick={createnewchat}>
        <div className='flex items-center justify-center gap-3 text-white px-4 py-2 rounded-lg bg-gradient-to-r 
        from-pink-400 to-purple-400 transition-colors duration-300'>
          <small className='text-2xl font-bold'>+</small>
          New Chat
        </div>
      </button>

      {/* search for the chat */}
      <div className='flex items-center gap-2 mt-5 p-3 rounded-xl bg-white/70 ring-1 ring-gray-200 dark:bg-slate-800/70 dark:ring-gray-700'>
        <img src={assets.search_icon} alt="Search" className='w-5 h-5 not-dark:invert' />
        <input type="text" placeholder='Search Conversation' value={search} onChange={(e) => setsearch(e.target.value)}
          className='w-full bg-transparent outline-none text-sm placeholder:text-gray-400' />
      </div>

      {/* all chats list  */}
      {chat.length > 0 && <p className='text-sm text-gray-500  mt-3'>Recent Chats</p>}
      <div className='flex flex-col gap-2 overflow-y-auto mt-2 overflow-scrollbar-hide h-65'>
        {
          
          chat.filter((item) => item && (item.messages?.[0]
            ? item.messages[0].content.toLowerCase().includes(search.toLowerCase())
            : item.name?.toLowerCase().includes(search.toLowerCase())))
            .map((item) => (

              <div onClick={() => { navigate('/'); setselectedchat(item); setopenmenu(false) }}
                key={item._id} className='group p-3 rounded-xl cursor-pointer bg-white/70 ring-1 ring-gray-200 hover:bg-gray-100
                dark:bg-slate-800/70 dark:ring-gray-700 dark:hover:bg-slate-700 transition-colors duration-300'>
                <div className='flex justify-between items-center gap-2'>
                  <div>
                    <p className='truncate w-full'>
                      {item.messages?.length > 0 ? item.messages[0].content.slice(0, 30) + '...' : item.name}
                    </p>

                    <p className='text-sm text-gray-500 dark:text-amber-200'>
                      {moment(item.updatedAt).fromNow()}
                    </p>
                  </div>
                  <div>
                    <img src={assets.bin_icon} alt="" className='hidden group-hover:block w-5 cursor-pointer not-dark:invert'
                      onClick={(e)=>{ e.stopPropagation(); deletechat(item._id); }} />
                  </div>
                </div>

              </div>

            ))
        }
      </div>

      <div className=' w-full' onClick={() => { navigate('/community'); setopenmenu(false) }}>
        <button className='mt-5 w-full px-4 py-2 rounded-lg hover:scale-95 bg-gradient-to-r from-pink-400 to-purple-400 text-white transition-colors duration-300'>
          community images
        </button>
      </div>

      <div className='flex gap-5 items-center mt-3' onClick={() => { navigate('/credits'); setopenmenu(false) }}>
        <img src={assets.diamond_icon} className='w-5 dark:invert' alt="" />
        <div>
          <p>credits :{user?.credits}</p>
          <p className='text-xs text-gray-500'>Purchase credits to use quickgpt</p>
        </div>
      </div>

      <div className='w-full' onClick={() => {setopenmenu(false) }}>
        <button className='mt-3 w-full px-4 py-2 rounded-lg hover:scale-95 bg-gradient-to-r from-pink-400 to-purple-400 text-white transition-colors duration-300' onClick={() => settheme(theme === 'dark' ? 'light' : 'dark')}>
          Toggle Theme
        </button>
      </div>

      <div className='flex items-center gap-3 p-3 mt-3 rounded-xl bg-white/70 ring-1 ring-gray-200 cursor-pointer group
        dark:bg-slate-800/70 dark:ring-gray-700'>
        <img src={assets.user_icon} className='w-5 rounded-full dark:invert' alt="" />
        <p className='flex-1 text-xs dark:text-primary truncate '>{user ? user.name : 'login your account'}</p>
        {user && <img src={assets.logout_icon} alt="" className='w-4 cursor-pointer not-dark:invert' onClick={logout} />}
      </div>

      <img onClick={() => setopenmenu(false)} src={assets.close_icon} className='absolute top-3 right-3 w-5 h-5 md:hidden not-dark:invert cursor-pointer' alt="" />
    </div>

  )
}

export default Sidebar
