import { createContext, useEffect } from "react";
import { useContext } from "react";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const Appcontext = createContext();

export function Contextprovider({ children }) {
    const serverurl = import.meta.env.VITE_SERVER_URL;
    axios.defaults.withCredentials = true;
    const [isloggedin, setIsloggedin] = useState(false);
    const [userdata, setUserdata] = useState(null);

    const getuserdata = async () => {
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
                setIsloggedin(false);
                setUserdata(null);
                return;
            }
            toast.error(err.response?.data?.message || "Failed to fetch user data");
        }
    }

    const getauthstatus = async () => {
        try {

            const { data } = await axios.get(`${serverurl}/api/auth/isauthenticated`)
            if (data.success) {
                setIsloggedin(true);
                getuserdata()
            }
            else {
                setIsloggedin(false);
                setUserdata(null);
            }
        }
        catch (err) {
            const status = err.response?.status;
            setIsloggedin(false);
            setUserdata(null);
            if (status !== 400 && status !== 401) {
                toast.error(err.response?.data?.message || err.message || "Failed to fetch auth status");
            }
        }
    }

    useEffect(() => {
        getauthstatus();
    }, [])

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