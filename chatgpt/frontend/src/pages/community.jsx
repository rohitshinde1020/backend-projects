import React, { useContext } from 'react'
import { useEffect } from 'react'
import { Appcontext } from '../context/Appcontext';
import toast from 'react-hot-toast'

const Community = () => {
    const [images, setimages] = React.useState([]);
    const [loading, setloading] = React.useState(true);
    const {axios}=useContext(Appcontext);
    const fetchimages = async () => {
        try {

            const {data}=await axios.get('/api/user/published'); 
            if(data.success){
                const normalizedImages = (data.images || []).map((item) => ({
                    ...item,
                    imageUrl: item.imageUrl || item.imageurl,
                }));
                setimages(normalizedImages);
            }
            else{
                toast.error(data.message);
            }

        }
        catch (error) {
            toast.error(error.message || "Error fetching community images");
        }
        finally {
            setloading(false);
        }
        
    }

    useEffect(() => {
        fetchimages();
    }, [])

    if (loading) {
        return (
            <div className='flex min-h-screen w-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950'>
                <div className='rounded-2xl border border-slate-200/70 bg-white/80 px-6 py-4 shadow-lg shadow-slate-200/40 backdrop-blur
                    dark:border-slate-700/60 dark:bg-slate-900/60 dark:shadow-black/30'>
                    <p className='text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400'>Loading</p>
                    <p className='text-lg font-semibold text-slate-900 dark:text-slate-100'>Community images...</p>
                </div>
            </div>
        )
    }
    return (
        <div className='min-h-screen w-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900
            dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 dark:text-slate-100'>
            <div className='mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-10'>
                <div className='mb-8 flex flex-col items-center text-center'>
                    <span className='rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600
                        shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-300'>
                        Community
                    </span>
                    <h1 className='mt-3 text-3xl font-bold tracking-tight md:text-4xl'>Community Images</h1>
                    <p className='mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400'>A gallery of creations shared by the community.</p>
                </div>
                {
                    images.length > 0 ? (
                        <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                            {images.map((image, index) => (
                                <div key={index} className='group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 shadow-xl shadow-slate-200/40
                                    ring-1 ring-transparent transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-300/40 hover:ring-blue-200/60
                                    dark:border-slate-700/60 dark:bg-slate-900/60 dark:shadow-black/30 dark:hover:shadow-black/50 dark:hover:ring-indigo-500/30'>
                                    <div className='absolute inset-0 z-10 bg-gradient-to-t from-black/45 via-black/5 to-transparent opacity-0 transition group-hover:opacity-100' />
                                    <img src={image.imageUrl} alt={`Community Image ${index + 1}`}
                                        className='h-56 w-full object-cover transition duration-300 group-hover:scale-105' />
                                    <p className='absolute bottom-3 right-3 text-xs font-medium text-slate-200 dark:text-slate-300'>created by {image.userName}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='flex min-h-[60vh] w-full items-center justify-center'>
                            <div className='rounded-2xl border border-slate-200/70 bg-white/80 px-6 py-4 shadow-lg shadow-slate-200/40 backdrop-blur
                                dark:border-slate-700/60 dark:bg-slate-900/60 dark:shadow-black/30'>
                                <p className='text-slate-600 dark:text-slate-400'>No community images found.</p>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default Community
