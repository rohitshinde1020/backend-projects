import { useContext, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext.jsx'

const Login = () => {
  const { login } = useContext(AuthContext)
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bio, setBio] = useState('')
  const [RememberMe, setRememberMe] = useState(false)

  const onsubmit = async e => {
    e.preventDefault()
    if (mode === 'login') {
      await login('login', { email, password })
      return
    }

    await login('register', { username, email, password, bio })
  }

  const isLogin = mode === 'login'

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_35%),linear-gradient(135deg,#020617_0%,#0f172a_55%,#111827_100%)] text-white">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-0">
        <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 py-8 text-center sm:px-8 lg:items-start lg:px-16 lg:text-left">
          <div className="relative z-10 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-3 lg:items-center">
            <img src={assets.logo} alt="logo" className=" object-contain" />

            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-300/80">Chat App</p>
              <h1 className="text-2xl font-semibold text-white sm:text-3xl">Stay close, chat faster</h1>
            </div>
          </div>
        </section>

        <section className="flex w-full items-center justify-center px-4 sm:px-8 lg:px-16">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/75 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
            <div className="mb-6">
              {isLogin ? (
                <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">Welcome back</p>
              ) : (
                <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">Create your account</p>
              )}
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-2xl bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`rounded-xl px-4 py-3 text-sm font-medium transition ${isLogin ? 'bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20' : 'text-slate-300 hover:text-white'}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`rounded-xl px-4 py-3 text-sm font-medium transition ${!isLogin ? 'bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20' : 'text-slate-300 hover:text-white'}`}
              >
                Sign Up
              </button>
            </div>

            <form className="space-y-4" onSubmit={onsubmit}>
              {!isLogin && (
                <div>
                  
                  <input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    id="name"
                    type="text"
                    placeholder="Enter your Username"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                    required
                  />
                </div>
              )}

              {!isLogin && (
                <div>
                  
                  <textarea
                    id="bio"
                    rows="3"
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Write a short bio"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                    required                  
                  />
                </div>
              )}

              <div>
                
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                  required
                />
              </div>

              <div>
                
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                  required
                />
              </div>

              {isLogin && (
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/20 bg-white/10 text-fuchsia-500 focus:ring-fuchsia-500"
                      checked={RememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                    />
                    Remember me
                  </label>
                  <button type="button" className="text-cyan-300 hover:text-cyan-200">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-linear-to-r from-fuchsia-500 to-violet-500 px-4 py-3.5 font-semibold text-white shadow-xl shadow-fuchsia-500/25 transition hover:from-fuchsia-400 hover:to-violet-400"

              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => setMode(isLogin ? 'signup' : 'login')}
                className="font-medium text-cyan-300 hover:text-cyan-200"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Login
