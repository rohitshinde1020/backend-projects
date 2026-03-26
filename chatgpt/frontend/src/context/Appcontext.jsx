import React, { useEffect } from 'react'
import { createContext } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import toast  from 'react-hot-toast';

const serverUrl = import.meta.env.VITE_SERVER_URL;

if (!serverUrl) {
    console.error('Missing VITE_SERVER_URL. API requests will fail until it is set.');
}

axios.defaults.baseURL = serverUrl || '';
axios.defaults.withCredentials = true;

export const Appcontext=createContext();
const Appcontextprovider = ({children}) => {

    const navigate=useNavigate();
    const [user,setuser]=useState(null);
    const [theme,settheme]=useState(localStorage.getItem('theme') || 'light');
    const [chat,setchat]=useState([]);
    const [selectedchat,setselectedchat]=useState(null);
    const [token,settoken]=useState(localStorage.getItem('token') || null);
    const [loading,setloading]=useState(false);

    const fetchuser= async()=>{
        setloading(true);
        try {
            const {data}=await axios.get('/api/user/userdata',{headers:{Authorization: token}});
            if(data.success){
                setuser(data.user);
            }
            else{
                toast.error(data.message);
                setuser(null);
                settoken(null);
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
        catch (error) {
            console.error("Error fetching user:", error);
            setuser(null);
            settoken(null);
            localStorage.removeItem('token');
        }
        finally{
            setloading(false);
        }
    }

    const createnewchat=async()=>{
        try {
            if(!user){
                toast.error("Please login to create a new chat");
                return;
            }
            const {data}=await axios.get('/api/chat/create',{headers:{Authorization: token}});
            if(data.success){
                if(data.chat){
                    setchat(prev=>[data.chat,...prev]);
                    setselectedchat(data.chat);
                } else {
                    await fetchchat();
                }
                navigate('/');
            }
        }
        catch (error) {
            toast.error("Error creating new chat");
        }
    }

    const fetchchat=async()=>{
            try {
                const {data}=await axios.get('/api/chat/all',{headers:{Authorization: token}});
                if(data.success){
                    if(data.chats.length===0){
                        const {data:newData}=await axios.get('/api/chat/create',{headers:{Authorization: token}});
                        if(newData.success){
                            setchat([newData.chat]);
                            setselectedchat(newData.chat);
                        }
                    }
                    else{
                        setchat(data.chats);
                        setselectedchat(data.chats[0]);
                    }
                }
                else{
                    toast.error(data.message);
                }
            }
            catch (error) {
                toast.error("Error fetching chats");
            }
    }

    const logout=()=>{
        localStorage.removeItem('token');
        settoken(null);
        setuser(null);
        setchat([]);
        setselectedchat(null);
        toast.success("Logged out successfully");
        navigate('/login');
    }

    const deletechat=async(chatId)=>{
        try {
            const confirm=window.confirm("Are you sure you want to delete this chat?");
            if(!confirm){
                return;
            }
            const {data}=await axios.post('/api/chat/delete',{chatId},{headers:{Authorization: token}});
            if(data.success){
                setchat(prev=>prev.filter(c=>c._id!==chatId));
                setselectedchat(prev=>prev?._id===chatId ? null : prev);
                toast.success("Chat deleted");
            }
            else{
                toast.error(data.message);
            }
        }
        catch (error) {
            toast.error("Error deleting chat");
        }
    }

    useEffect(()=>{
        
        if(theme==='dark'){
            document.documentElement.classList.add('dark');
        }
        else{
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme',theme);
    },[theme])

    useEffect(()=>{
        if(user){
            fetchchat();
        }
        else{
            setchat([]);
            setselectedchat(null);
        }
        
    },[user])

    useEffect(()=>{
        if(token){
            fetchuser();
        }
        else{
            setuser(null);
            setloading(false);
        }
    },[token])

    const value={
        user,
        setuser,
        theme,
        chat,
        selectedchat,
        setselectedchat,
        setchat,
        settheme,
        fetchuser,
        navigate,
        createnewchat,
        loading,
        fetchchat,
        token,
        settoken,
        axios,
        logout,
        deletechat
    }


  return (
    <div>
        <Appcontext.Provider value={value}>
            {children}
        </Appcontext.Provider>
      
    </div>
  )
}

export default Appcontextprovider
