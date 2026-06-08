import { useContext, useEffect, useMemo, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext.jsx'

const RightSidebar = ({ selectedUser, setSelectedUser, mode = 'desktop', onClose }) => {
  const { axios, authUser } = useContext(AuthContext)
  const [previewImage, setPreviewImage] = useState(null)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedUser?._id) return

      try {
        const { data } = await axios.get(`/api/messages/${selectedUser._id}`)
        if (data.success) {
          setMessages(data.messages || [])
        }
      } catch {
        setMessages([])
      }
    }

    loadMessages()
  }, [axios, selectedUser?._id])

  const sharedMedia = useMemo(() => {
    return messages
      .filter((message) => message.image)
      .map((message) => ({
        _id: message._id,
        image: message.image,
        createdAt: message.createdAt,
        senderId: typeof message.senderId === 'object' ? message.senderId?._id : message.senderId,
      }))
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
  }, [messages])

  if (!selectedUser) return null

  const isMobileDrawer = mode === 'mobile'
  const drawerContent = (
    <aside className="flex h-full min-h-80 w-full flex-col gap-5 overflow-auto rounded-2xl border border-white/10 bg-slate-950/75 p-4 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:p-5 lg:p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-white/6 sm:h-20 sm:w-20">
            <img src={selectedUser.profilePic || assets.logo} alt={selectedUser.fullName} className="h-full w-full object-cover" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white sm:text-lg">{selectedUser.fullName}</h3>
            <p className="text-xs text-slate-300">Shared media</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={isMobileDrawer ? onClose : () => setSelectedUser(null)}
            aria-label="Close"
            className="rounded-full bg-white/6 p-2 text-white hover:bg-white/10"
          >
            ✕
          </button>
        </div>
      </header>

      <section className="space-y-3">
        <h4 className="text-xs font-medium uppercase text-slate-400">About</h4>
        <p className="text-sm leading-snug text-slate-200">{selectedUser?.bio || 'No bio available.'}</p>
      </section>

      <section className="space-y-2">
        <h4 className="text-xs font-medium uppercase text-slate-400">Contact</h4>
        <div className="flex flex-col gap-1 text-sm text-slate-200">
          {selectedUser?.email && <div className="text-slate-300"><strong className="text-slate-400">Email:</strong> {selectedUser.email}</div>}
          {authUser?.email && selectedUser?.email !== authUser.email && <div className="text-slate-300"><strong className="text-slate-400">Status:</strong> Available</div>}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h4 className="text-xs font-medium uppercase text-slate-400">Shared Media</h4>
          <span className="text-xs text-slate-500">{sharedMedia.length} items</span>
        </div>

        {sharedMedia.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {sharedMedia.map((item, i) => (
              <button
                key={item._id}
                type="button"
                onClick={() => setPreviewImage(item.image)}
                className="group aspect-square w-full overflow-hidden rounded-md bg-white/6"
                aria-label={`Open shared image ${i + 1}`}
              >
                <img src={item.image} alt={`shared-${i}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-slate-400">
            No shared media yet.
          </div>
        )}
      </section>

      <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" onClick={isMobileDrawer ? onClose : () => setSelectedUser(null)}>
        {isMobileDrawer ? 'Close panel' : 'Close chat'}
      </button>
    </aside>
  )

  return (
    <>
      {isMobileDrawer ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close shared media overlay" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <div className="absolute inset-y-0 right-0 w-[92vw] max-w-sm p-3">
            {drawerContent}
          </div>
        </div>
      ) : (
        <aside className="hidden h-full w-full flex-col lg:flex">
          {drawerContent}
        </aside>
      )}

      {previewImage && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-slate-950 shadow-2xl shadow-black/60">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              aria-label="Close image preview"
              className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white hover:bg-black/75"
            >
              ✕
            </button>
            <img src={previewImage} alt="preview" className="max-h-[90vh] max-w-[90vw] object-contain" />
          </div>
        </div>
      )}
    </>
  )
}

export default RightSidebar
