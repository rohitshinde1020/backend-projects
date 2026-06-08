import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import {Toaster} from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext.jsx';
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';


const App = () => {
  const { authUser } = useContext(AuthContext);
  return (
    <div className='relative min-h-screen overflow-hidden bg-slate-950 text-slate-100'>
      <div className='relative z-10 min-h-screen p-4'>
        <div className='w-full min-h-screen overflow-hidden rounded-4xl border border-white/15 bg-white/10 shadow-2xl shadow-cyan-500/10 backdrop-blur-3xl'>
          <div className='relative z-10'>
            <Toaster />
            <Routes>
              <Route path='/' element={authUser ? <Home /> : <Navigate to='/login' />} />
              <Route path='/login' element={authUser ? <Navigate to='/' /> : <Login />} />
              <Route path='/profile' element={authUser ? <Profile /> : <Navigate to='/login' /> } />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
