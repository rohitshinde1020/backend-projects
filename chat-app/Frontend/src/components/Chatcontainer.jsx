import { useContext, useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext.jsx'

const Chatcontainer = ({ selectedUser, setSelectedUser, onOpenSharedMedia }) => {
  const { axios, authUser, socket } = useContext(AuthContext)
  const [text, setText] = useState('')
  const [messages, setMessages] = useState([])
  const [image, setImage] = useState('')
  const [imagePreview, setImagePreview] = useState('')

  const listRef = useRef(null)
  
  const filteredMessages = messages.filter(m => {
    const senderId = typeof m.senderId === 'object' ? m.senderId?._id : m.senderId
    const receiverId = typeof m.receiverId === 'object' ? m.receiverId?._id : m.receiverId
    return (
      (senderId === authUser?._id && receiverId === selectedUser?._id) ||
      (senderId === selectedUser?._id && receiverId === authUser?._id)
    )
  })

  useEffect(() => {
    const listEl = listRef.current
    if (listEl) listEl.scrollTop = listEl.scrollHeight
  }, [filteredMessages])

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedUser?._id) return

      try {
        const { data } = await axios.get(`/api/messages/${selectedUser._id}`)
        if (data.success) {
          setMessages(data.messages || [])
        }
      } catch (error) {
        setMessages([])
      }
    }

    loadMessages()
  }, [axios, selectedUser])

  useEffect(() => {
    if (!socket) return undefined

    const handleNewMessage = ({ message }) => {
      const senderId = typeof message.senderId === 'object' ? message.senderId?._id : message.senderId
      const receiverId = typeof message.receiverId === 'object' ? message.receiverId?._id : message.receiverId

      if (
        (senderId === authUser?._id && receiverId === selectedUser?._id) ||
        (senderId === selectedUser?._id && receiverId === authUser?._id)
      ) {
        setMessages(prev => [...prev, message])
      }
    }

    socket.on('newMessage', handleNewMessage)
    return () => socket.off('newMessage', handleNewMessage)
  }, [authUser?._id, selectedUser?._id, socket])

  const formatMessageMeta = (createdAt) => {
    const messageDate = new Date(createdAt)
    const dateLabel = messageDate.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    })

    const timeLabel = messageDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })

    return { dateLabel, timeLabel }
  }

  const handleSend = e => {
    e.preventDefault()
    if (!selectedUser?._id || (!text.trim() && !image)) return

    const sendMessage = async () => {
      try {
        const payload = { text: text.trim(), image }
        const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, payload)
        if (data.success) {
          const { data: refreshed } = await axios.get(`/api/messages/${selectedUser._id}`)
          if (refreshed.success) {
            setMessages(refreshed.messages || [])
          }
          setText('')
          setImage('')
          setImagePreview('')
        }
      } catch (error) {
        // leave the text so the user can retry
      }
    }

    sendMessage()
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setImage(reader.result)
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }


  return selectedUser ? (
    <div className="relative flex h-full min-h-105 flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/75 p-4 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:p-5 lg:p-6">
      <header className="mb-4 flex flex-col gap-3 border-b border-white/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onOpenSharedMedia}
          className="flex items-center gap-3 rounded-2xl text-left transition hover:bg-white/5 sm:gap-4"
        >
          <img src={selectedUser?.profilePic || assets.logo} alt="user" className="h-11 w-11 rounded-full ring-2 ring-white/6 sm:h-12 sm:w-12" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white sm:text-lg">{selectedUser?.fullName || 'Select a conversation'}</h2>
              {selectedUser && <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />}
            </div>
            <p className="text-xs text-slate-300">Tap for shared media</p>
          </div>
        </button>

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => setSelectedUser(null)} className="rounded-full bg-white/6 p-2 hover:bg-white/8" aria-label="Close chat">
            <img src={assets.arrow_icon} alt="" className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div ref={listRef} className="relative mb-4 flex-1 min-h-0 overflow-y-auto py-4 pr-2 sm:py-5 sm:pr-4 lg:py-6 lg:pr-6">
        <div className="absolute inset-0 h-full w-full bg-linear-to-t from-slate-950/30 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col gap-4">
          {filteredMessages.map((msg) => {
            const senderId = typeof msg.senderId === 'object' ? msg.senderId?._id : msg.senderId
            const isMe = senderId === authUser?._id
            const meta = formatMessageMeta(msg.createdAt)
            return (
              <div key={msg._id || msg.id} className={`flex items-end gap-2 sm:gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                
                <div className={`${isMe ? 'ml-4 bg-linear-to-r from-fuchsia-600/80 to-violet-600/80 text-white shadow-[0_8px_30px_rgba(139,92,246,0.12)]' : 'bg-white/6 text-slate-100 shadow-inner'} max-w-[82%] rounded-2xl px-3 py-2.5 sm:max-w-[70%] sm:px-4 sm:py-3`}>
                  <p className="text-sm leading-snug sm:text-[15px]">{msg.text || (msg.image ? '📷 Image' : '')}</p>
                  <div className={`mt-1 flex items-center gap-2 text-[10px] text-slate-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span>{meta.timeLabel}</span>
                    <span>{meta.dateLabel}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleSend} className="mt-auto pt-3 sm:pt-4">
        {imagePreview && (
          <div className="mb-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <img src={imagePreview} alt="selected" className="h-14 w-14 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white">Image ready to send</p>
              <p className="text-xs text-slate-400">Tap send or replace it with another photo</p>
            </div>
            <button
              type="button"
              onClick={() => { setImage(''); setImagePreview('') }}
              className="rounded-full bg-white/6 px-3 py-2 text-xs text-slate-200 hover:bg-white/10"
            >
              Remove
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={selectedUser ? `Message ${selectedUser.fullName}` : 'Select a user to start chat'}
            disabled={!selectedUser}
            className="flex-1 rounded-3xl bg-white/6 px-4 py-3 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-60"
          />
          <div className="flex items-center justify-end gap-3">
            <input type="file" id="image-upload" className="hidden" accept="image/*" onChange={handleImageChange} />
            <label htmlFor="image-upload" className="cursor-pointer rounded-full bg-white/6 p-2 hover:bg-white/8">
              <img src={assets.gallery_icon} alt="attach" className="h-5 w-5" />
            </label>
            <button type="submit" className="rounded-full bg-cyan-400 p-2 hover:bg-cyan-500 disabled:bg-cyan-400/80 disabled:hover:bg-cyan-400/80 focus:outline-none">
            <img src={assets.send_button} alt="send" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
    
  ) : (
    <div className="flex h-full min-h-90 flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-slate-950/75 px-6 py-8 text-center shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
      <img src={assets.logo} alt="logo" className="opacity-50" />
      <p className="text-base text-slate-400 sm:text-lg">Select a conversation to start chatting</p>
    </div>
  )
}

export default Chatcontainer
