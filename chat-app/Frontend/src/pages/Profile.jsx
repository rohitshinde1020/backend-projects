import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets, { userDummyData } from '../assets/assets'
import { AuthContext } from '../../context/AuthContext.jsx'

const Profile = () => {
  const navigate = useNavigate()
  const { authUser, updateProfile } = useContext(AuthContext)
  const currentUser = authUser || userDummyData?.[0] || {}

  const [fullName, setFullName] = useState(currentUser.username || currentUser.fullName || '')
  const [bio, setBio] = useState(currentUser.bio || '')
  const [profileImage, setProfileImage] = useState(currentUser.profilePicture || currentUser.profilePic || assets.logo)
  const [previewImage, setPreviewImage] = useState(null)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    setFullName(currentUser.username || currentUser.fullName || '')
    setBio(currentUser.bio || '')
    setProfileImage(currentUser.profilePicture || currentUser.profilePic || assets.logo)
  }, [currentUser])

  const handleSubmit = async e => {
    e.preventDefault()
    await updateProfile({
      username: fullName,
      bio,
      profilePic: typeof profileImage === 'string' ? profileImage : previewImage,
    })
    setSaveMessage('Profile updated successfully.')
  }

  const handleAvatarChange = e => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileImage(reader.result)
      setPreviewImage(reader.result)
    }
    reader.readAsDataURL(file)
    setSaveMessage('')
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_35%),linear-gradient(135deg,#020617_0%,#0f172a_55%,#111827_100%)] px-4 py-4 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-3xl items-center justify-center">
        <main className="w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-950/75 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="border-b border-white/10 px-5 py-5 sm:px-8 sm:py-6">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 rounded-full bg-white/6 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-white/10"
              >
                <img src={assets.arrow_icon} alt="back" className="h-4 w-4 rotate-180" />
                Back to chat
              </button>

              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                Profile edit
              </span>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <button
                type="button"
                  onClick={() => setPreviewImage(profileImage)}
                className="group relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-cyan-400/30 transition hover:scale-[1.02] sm:h-24 sm:w-24"
                aria-label="Preview profile image"
              >
                <img src={profileImage} alt={fullName} className="h-full w-full object-cover" />
                <span className="absolute inset-0 grid place-items-center bg-black/0 text-xs font-medium text-white opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
                  Preview
                </span>
              </button>

              <div className="min-w-0 flex-1">
                <h1 className="truncate text-2xl font-semibold text-white sm:text-3xl">Edit profile</h1>
                <p className="mt-1 text-sm text-slate-300">Update your name, bio, and profile photo in one place.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-8">
            <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-5 shadow-lg shadow-black/15 sm:p-6">
              <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Account info</h3>
                  <p className="mt-2 text-sm text-slate-300">Edit the details other people see in chat.</p>
                </div>

                <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-fuchsia-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-fuchsia-500/20 transition hover:bg-fuchsia-400">
                  Change photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>

              <div className="mt-5 grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Full Name</label>
                  <input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Bio</label>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    rows="5"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                    placeholder="Write a short bio about yourself"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">{saveMessage || 'Your profile changes are saved to your account.'}</p>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setProfileImage(currentUser.profilePicture || currentUser.profilePic || assets.logo)}
                    className="rounded-2xl border border-white/10 bg-white/6 px-5 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10"
                  >
                    Reset photo
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-fuchsia-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-fuchsia-500/25 transition hover:from-fuchsia-400 hover:to-violet-400"
                  >
                    Save changes
                  </button>
                </div>
              </div>
            </div>
          </form>

          {previewImage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
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
        </main>
      </div>
    </div>
  )
}

export default Profile