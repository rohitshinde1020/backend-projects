import { createContext, useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const AuthContext = createContext();
const backend_url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
axios.defaults.baseURL = backend_url;

export { AuthContext };

export const AuthProvider = ({ children }) => {
    const [token,setToken] = useState(localStorage.getItem('token') || null);
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null);
    const connectErrorToastShown = useRef(false);

    const disconnectSocket = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.removeAllListeners();
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        setSocket(null);
        setOnlineUsers([]);
    }, []);

    const connectSocket = useCallback((userData, authToken) => {
        if (!userData || !authToken) return;
        if (socketRef.current?.connected) return;
        if (socketRef.current && !socketRef.current.disconnected) return;

        const newSocket = io(backend_url, {
            auth: { token: authToken },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        newSocket.on('onlineUsers', (userIds) => {
            setOnlineUsers(userIds);
        });

        newSocket.on('connect', () => {
            connectErrorToastShown.current = false;
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connect_error:', error.message);

            if (!connectErrorToastShown.current) {
                connectErrorToastShown.current = true;
                toast.error('Realtime connection failed');
            }
        });
    }, []);

    const checkAuth = useCallback(async (authToken) => {
        try{
            const { data } = await axios.get('/api/users/check-auth');
            if(data.success){
                setAuthUser(data.user);
                connectSocket(data.user, authToken);
            }

        }
        catch {
            disconnectSocket();
            localStorage.removeItem('token');
            setToken(null);
            setAuthUser(null);
            delete axios.defaults.headers.common['token'];
            toast.error('Session expired. Please log in again.');
        }
    }, [connectSocket, disconnectSocket]);
    
    useEffect(() => {
        if(token){
            axios.defaults.headers.common['token'] = token;
            void checkAuth(token);
        } else {
            delete axios.defaults.headers.common['token'];
            disconnectSocket();
        }
    }, [token, checkAuth, disconnectSocket]);

    useEffect(() => () => disconnectSocket(), [disconnectSocket]);

    const login = async (state,Credentials) => {
        try {
            const { data } = await axios.post(`/api/users/${state}`, Credentials);
            if(data.success){
                setAuthUser(data.user);
                axios.defaults.headers.common['token'] = data.token;
                setToken(data.token);
                localStorage.setItem('token', data.token);
                connectSocket(data.user, data.token);
                toast.success(data.message);
            }
        } catch {
            toast.error('Login failed');
        }
    };

    const logout = async () => {
        setAuthUser(null);
        setToken(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['token'];
        disconnectSocket();
        toast.success('Logged out successfully');
    };

    const updateProfile = async (profileData) => {
        try {
            const { data } = await axios.put('/api/users/update-profile', profileData);
            if(data.success){
                setAuthUser(data.user);
                toast.success(data.message);
            }
        } catch {
            toast.error('Failed to update profile');
        }
    };

    const value = {
        axios,
        token,
        setToken,
        authUser,
        setAuthUser,
        onlineUsers,
        setOnlineUsers,
        socket,
        setSocket,
        checkAuth,
        login,
        updateProfile,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
