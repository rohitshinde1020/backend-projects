import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import { Appcontext } from '../context/Appcontext'
import { assets } from '../assets/assets'
import Message from './message'
import { useRef } from 'react'
import { useLayoutEffect } from 'react'
import toast from 'react-hot-toast'

const Chatbot = () => {
  const containerRef = useRef(null);


  const { user, theme, selectedchat, setselectedchat, setchat, axios, token } = useContext(Appcontext);
  const [messages, setmessages] = useState([]);
  const [loading, setloading] = useState(false);
  const prevMessageCount = useRef(0);

  const [prompt, setprompt] = useState('');
  const [mode, setmode] = useState('text');
  const [ispublish, setispublish] = useState(false);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  const syncChatInList = (chatId, updater) => {
    setchat((prev) => prev.map((item) => {
      if (item._id !== chatId) {
        return item;
      }

      return updater(item);
    }));
  };

  const onsubmit = async (e) => {
    e.preventDefault();

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      return;
    }

    if (!user) {
      toast.error('Please login to send a message');
      return;
    }

    if (!selectedchat?._id) {
      toast.error('Please create or select a chat first');
      return;
    }

    const userMessage = {
      content: trimmedPrompt,
      role: 'user',
      timestamp: Date.now(),
      isImage: false,
      ispublished: false,
    };

    try {
      setloading(true);
      setprompt('');
      setmessages((prev) => [...prev, userMessage]);
      setselectedchat((prev) => prev ? { ...prev, messages: [...prev.messages, userMessage] } : prev);
      syncChatInList(selectedchat._id, (item) => ({
        ...item,
        messages: [...item.messages, userMessage],
        updatedAt: new Date().toISOString(),
      }));

      const { data } = await axios.post(
        `/api/message/${mode}`,
        { prompt: trimmedPrompt, chatId: selectedchat._id, ispublished: ispublish },
        { headers: { Authorization: token } }
      );

      if (!data.success) {
        throw new Error(data.message || 'Error submitting message');
      }

      setmessages((prev) => [...prev, data.reply]);
      setselectedchat((prev) => prev ? { ...prev, messages: [...prev.messages, data.reply] } : prev);
      syncChatInList(selectedchat._id, (item) => ({
        ...item,
        messages: [...item.messages, data.reply],
        updatedAt: new Date().toISOString(),
      }));
    }
    catch (error) {
      setprompt(trimmedPrompt);
      setmessages((prev) => prev.filter((message) => message.timestamp !== userMessage.timestamp));
      setselectedchat((prev) => prev ? {
        ...prev,
        messages: prev.messages.filter((message) => message.timestamp !== userMessage.timestamp),
      } : prev);
      syncChatInList(selectedchat._id, (item) => ({
        ...item,
        messages: item.messages.filter((message) => message.timestamp !== userMessage.timestamp),
      }));
      toast.error(error.response?.data?.message || error.message || 'Error submitting message');
    }
    finally {
      setloading(false);
    }
  }

  useEffect(() => {
    if (selectedchat) {
      setmessages(selectedchat.messages);
      prevMessageCount.current = selectedchat.messages.length;
    }
  }, [selectedchat]);
  // clear messages when no chat is selected (e.g. last chat deleted)
  useEffect(() => {
    if (!selectedchat) {
      setmessages([]);
    }
  }, [selectedchat]);

  // Scroll to bottom whenever messages change
  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className='flex-1 flex flex-col justify-between px-4 py-6 md:px-8 md:py-10 xl:px-12 max-md:mt-14'>
      <div className='flex items-center justify-between mb-5'>
        <div className='flex items-center gap-3'>
          <div className='h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg' />
          <div>
            <p className='text-lg font-semibold text-slate-900 dark:text-white'>QuickGPT</p>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Always online</p>
          </div>
        </div>
        <div className='hidden md:flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs text-slate-600 shadow ring-1 ring-slate-200
          dark:bg-slate-800/70 dark:text-slate-200 dark:ring-slate-700/60'>
          Secure chat
        </div>
      </div>

      <div ref={containerRef} className='flex-1 mb-5 overflow-y-scroll rounded-3xl bg-white/70 p-4 shadow-xl ring-1 ring-slate-200
        dark:bg-slate-900/60 dark:ring-slate-700/60 md:p-6'>
        {messages.length === 0 && (
          <div className='flex flex-col items-center mt-10 text-center'>
            <img src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark} alt="" className='w-50 h-50' />
            <p className='text-gray-500 dark:text-gray-400 text-xl md:text-2xl'>No messages yet. Start the conversation!</p>
          </div>
        )}

        <div className='space-y-2'>
          {messages.map((message, index) => (
            <Message key={index} message={message} />
          ))}

          {/* {loading} */}
          {
            loading && (
              <div className='flex items-end justify-start my-4 gap-3 animate-pulse'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-semibold shadow dark:bg-white dark:text-slate-900'>
                  AI
                </div>
                <div className='flex flex-col gap-2 max-w-[78%] md:max-w-2xl'>
                  <div className='rounded-2xl rounded-bl-sm bg-white/90 px-4 py-3 text-slate-900 shadow-lg ring-1 ring-slate-200
                    dark:bg-slate-800/80 dark:text-slate-100 dark:ring-slate-700/60'>
                    <div className='h-4 w-16 rounded-full bg-gray-300 dark:bg-gray-700 mb-1' />
                    <div className='h-4 w-12 rounded-full bg-gray-300 dark:bg-gray-700 mb-1' />
                    <div className='h-4 w-20 rounded-full bg-gray-300 dark:bg-gray-700' />
                  </div>
                  <span className='text-[11px] text-gray-500 dark:text-gray-400'>Typing...</span>
                </div>
              </div>
            )
          }

          {mode === 'image' && (
            <label htmlFor="" className='inline-flex items-center gap-2 mt-3 text-sm text-gray-500 dark:text-gray-400 cursor-pointer'>
              <p className='text-xs'>Publish Generated Image to Community</p>
              <input type="checkbox"
                className='w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-slate-800'
                checked={ispublish} onChange={(e) => setispublish(e.target.checked)} />
            </label>
          )

          }

          {/* {prompt input box } */}
          <form onSubmit={onsubmit} className='mt-6 flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/80 p-3 shadow-lg shadow-slate-200/40 backdrop-blur
            focus-within:border-indigo-400/70 focus-within:ring-2 focus-within:ring-indigo-300/40 dark:border-slate-700/60 dark:bg-slate-900/60 dark:shadow-black/20 dark:focus-within:border-indigo-400/60 dark:focus-within:ring-indigo-500/30'>
            <div className='flex items-center gap-2 rounded-xl bg-slate-100/80 px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-inner ring-1 ring-slate-200/70
              dark:bg-slate-800/70 dark:text-slate-300 dark:ring-slate-700/60'>
              <span className='hidden sm:inline'>Mode</span>
              <select onChange={(e) => setmode(e.target.value)} value={mode}
                className='bg-transparent text-xs font-semibold uppercase tracking-wide text-slate-700 outline-none dark:text-slate-200'>
                <option className='dark:bg-slate-900' value="text">Text</option>
                <option className='dark:bg-slate-900' value="image">Image</option>
              </select>
            </div>
            <input type="text" value={prompt} onChange={(e) => setprompt(e.target.value)}
              className='h-11 w-full rounded-xl bg-slate-50/80 px-4 text-sm text-slate-900 outline-none ring-1 ring-transparent placeholder:text-slate-400 focus:ring-indigo-400/60
              dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-400' placeholder='Type a message...' required />
            <button className='group inline-flex h-11 w-16 items-center justify-center rounded-xl shadow-lg shadow-indigo-500/30 transition
             active:scale-95 disabled:cursor-not-allowed disabled:opacity-60'
              disabled={loading} type='submit'>
              <img className='h-8 w-8 drop-shadow-sm' src={loading ? assets.stop_icon : assets.send_icon} alt="" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Chatbot
