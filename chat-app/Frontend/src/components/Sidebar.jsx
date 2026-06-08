import { useContext, useEffect, useMemo, useState } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext.jsx'

const Sidebar = ({ setSelectedUser }) => {
    const { axios, onlineUsers, authUser, logout } = useContext(AuthContext)
    const [q, setQ] = useState('')
    const [users, setUsers] = useState([])
    const [menuOpen, setMenuOpen] = useState(false)
    const navigate = useNavigate();

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const { data } = await axios.get('/api/messages/users')
                if (data.success) {
                    const mappedUsers = (data.users || []).map((user) => ({
                        ...user,
                        fullName: user.username,
                        profilePic: user.profilePicture || assets.logo,
                        unread: data.unseenmsg?.[user._id] || 0,
                        online: onlineUsers.includes(user._id),
                    }))
                    setUsers(mappedUsers)
                }
            } catch {
                setUsers([])
            }
        }

        if (authUser) {
            loadUsers()
        }
    }, [axios, authUser, onlineUsers])

    const filteredUsers = useMemo(() => {
        return users.filter(user => (user.fullName || '').toLowerCase().includes(q.toLowerCase()))
    }, [q, users])

    return (
        <aside className="flex h-full min-h-70 w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/75 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
            <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/6 p-3 shadow-lg backdrop-blur-lg sm:p-4">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-cyan-400/60 to-transparent rounded-r-xl" />
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <img src={assets.logo} alt="Logo" className="h-8 w-auto" />
                        
                    </div>

                    <div className="relative group inline-block">
                        <button
                            type="button"
                            onClick={() => setMenuOpen(open => !open)}
                            className="rounded-full bg-white/6 p-2 focus:outline-none hover:bg-white/8"
                            aria-label="Open menu"
                        >
                            <img src={assets.menu_icon} alt="menu" className="h-5 w-5" />
                        </button>

                        <div className={`${menuOpen ? 'block' : 'hidden'} absolute right-0 top-full z-20 mt-2 w-44 rounded-xl border border-white/10 bg-black p-3 text-sm text-slate-200 shadow-2xl`}>
                            <button className="w-full rounded-md px-2 py-1 text-left hover:bg-white/10" onClick={() => { setMenuOpen(false); navigate('/profile') }}>Edit Profile</button>
                            <hr className="border-white/10 my-2" />
                            <button className="w-full rounded-md px-2 py-1 text-left hover:bg-white/10" onClick={() => { setMenuOpen(false); logout() }}>Logout</button>
                        </div>
                    </div>
                </div>

                {/* Search input */}
                <div className="relative mb-4 rounded-lg border border-white/10 bg-white/10">
                    <img src={assets.search_icon} alt="Search" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 opacity-80" />
                    <input
                        type="text"
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        placeholder="Search users..."
                        className="w-full rounded-lg bg-transparent py-2 pl-10 pr-3 text-sm text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />
                </div>

                {/* User list */}
                <div className="flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-2">
                    {filteredUsers.map((user) => {
                        const dotClass = user.online ? 'bg-emerald-400' : 'bg-slate-500'
                        return (
                            <button
                                key={user._id}
                                onClick={() => setSelectedUser(user)}
                                className="group flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-white/8 sm:p-3"
                            >
                                <div className="relative">
                                    <img src={user.profilePic} alt={user.fullName} className="h-9 w-9 rounded-full object-cover ring-2 ring-white/6 sm:h-10 sm:w-10" />
                                    <span className={`absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full ${dotClass} ring-1 ring-white/20`} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="truncate text-sm font-medium text-white">{user.fullName}</p>
                                        <div className="flex items-center gap-2">
                                            {user.unread > 0 && (
                                                <span className="inline-flex h-5 min-w-[1.2rem] items-center justify-center rounded-full bg-cyan-400 px-2 text-xs font-semibold text-slate-900">{user.unread}</span>
                                            )}
                                            <span className="text-xs text-slate-400">{user.online ? 'Online' : ''}</span>
                                        </div>
                                    </div>
                                    <p className="truncate text-xs text-slate-400">{user.bio}</p>
                                </div>
                            </button>
                        )
                    })}

                    {filteredUsers.length === 0 && (
                        <div className="py-6 text-center text-sm text-slate-400">No users found</div>
                    )}
                </div>


            </div>
        </aside>
    )
}

export default Sidebar
