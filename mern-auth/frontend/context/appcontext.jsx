import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Appcontext } from "./appcontext-context";

export function Contextprovider({ children }) {
    const serverurl = import.meta.env.VITE_SERVER_URL;
    const [isloggedin, setIsloggedin] = useState(false);
    const [userdata, setUserdata] = useState(null);
    const refreshInFlight = useRef(null);

    useEffect(() => {
        axios.defaults.withCredentials = true;
    }, []);

    const clearAuthState = useCallback(() => {
        setIsloggedin(false);
        setUserdata(null);
    }, []);

    const refreshAccessToken = useCallback(async () => {
        if (!refreshInFlight.current) {
            refreshInFlight.current = axios.post(`${serverurl}/api/auth/refresh-token`)
                .then(() => true)
                .catch(() => false)
                .finally(() => {
                    refreshInFlight.current = null;
                });
        }

        return refreshInFlight.current;
    }, [serverurl]);

    const getuserdata = useCallback(async () => {
        try {
            const { data } = await axios.get(`${serverurl}/api/user/data`)
            if (data.success) {
                setUserdata(data.data);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            const status = err.response?.status;
            if (status === 400 || status === 401) {
                clearAuthState();
                return;
            }
            toast.error(err.response?.data?.message || "Failed to fetch user data");
        }
    }, [serverurl, clearAuthState]);

    useEffect(() => {
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                const status = error.response?.status;

                if (
                    status === 401 &&
                    originalRequest &&
                    !originalRequest._retry &&
                    !originalRequest.url?.includes('/api/auth/refresh-token') &&
                    !originalRequest.url?.includes('/api/auth/login') &&
                    !originalRequest.url?.includes('/api/auth/register')
                ) {
                    originalRequest._retry = true;

                    const refreshed = await refreshAccessToken();
                    if (refreshed) {
                        return axios(originalRequest);
                    }

                    clearAuthState();
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [refreshAccessToken, clearAuthState]);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data } = await axios.get(`${serverurl}/api/auth/isauthenticated`)
                if (data.success) {
                    setIsloggedin(true);
                    await getuserdata();
                }
                else {
                    clearAuthState();
                }
            }
            catch (err) {
                const status = err.response?.status;
                clearAuthState();
                if (status !== 400 && status !== 401) {
                    toast.error(err.response?.data?.message || err.message || "Failed to fetch auth status");
                }
            }
        };

        initAuth();
    }, [getuserdata, clearAuthState, serverurl]);

    const value = {
        serverurl,
        isloggedin,
        setIsloggedin,
        userdata,
        setUserdata,
        getuserdata
    }

    return <Appcontext.Provider value={value}>
        {children}
    </Appcontext.Provider>
}