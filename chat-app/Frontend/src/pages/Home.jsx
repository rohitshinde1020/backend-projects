import Sidebar from '../components/Sidebar'
import Chatcontainer from '../components/Chatcontainer'
import RightSidebar from '../components/RightSidebar'
import { useState } from 'react'

const Home = () => {
    const [selectedUser, setSelectedUser] = useState(null)
    const [showSharedMedia, setShowSharedMedia] = useState(false)

    const handleSelectUser = (user) => {
        setSelectedUser(user)
        setShowSharedMedia(false)
    }

    return (
        <div className='flex h-dvh w-full overflow-hidden px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6'>
            <div className='grid h-full w-full min-h-0 grid-cols-1 gap-3 lg:grid-cols-[280px_minmax(0,1fr)_320px] lg:gap-4'>
                <div className={`${selectedUser ? 'hidden lg:block' : 'block'} h-full min-h-0 lg:col-span-1`}>
                    <Sidebar selectedUser={selectedUser} setSelectedUser={handleSelectUser} />
                </div>

                <div className={`${selectedUser ? 'block' : 'hidden lg:block'} h-full min-h-0 lg:col-span-1`}>
                    <Chatcontainer
                        selectedUser={selectedUser}
                        setSelectedUser={setSelectedUser}
                        onOpenSharedMedia={() => setShowSharedMedia(true)}
                    />
                </div>

                {selectedUser && (
                    <div className='hidden h-full min-h-0 lg:block lg:col-span-1'>
                        <RightSidebar
                            selectedUser={selectedUser}
                            setSelectedUser={handleSelectUser}
                            mode='desktop'
                        />
                    </div>
                )}

                {selectedUser && showSharedMedia && (
                    <RightSidebar
                        selectedUser={selectedUser}
                        setSelectedUser={handleSelectUser}
                        mode='mobile'
                        onClose={() => setShowSharedMedia(false)}
                    />
                )}
            </div>
        </div>
    )
}

export default Home
