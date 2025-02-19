import React, {useEffect, useRef} from 'react';
import Cards from './Cards';
import { useAuth } from '../Context/AuthContext';

const Hero = ({ login, isUser }) => {
  const { logout } = useAuth()
  const videoRef = useRef()

  useEffect(() => {
    if(videoRef.current){
      videoRef.current.playbackRate = 0.5
    }
  }, [])

  return (
    isUser ? (
      <div className='relative w-full h-screen overflow-hidden'>
        <video
          autoPlay
          loop
          muted
          className='absolute top-0 left-0 w-full h-full object-cover z-0'
        >
          <source src='/videos/hero-vid.mp4' type="video/mp4" />
          Your browser does not support video tag
        </video>

        <div className='absolute inset-0 flex flex-col justify-center items-center space-y-12 z-10'>
          <div className='flex space-x-12'>\
            <p className='text-4xl md:text-6xl font-bold text-white'>You are already logged in</p>
          </div>
          <button
            onClick={logout}
            className='bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600'
          >
            Logout
          </button>
        </div>
      </div>

    ) : (
      <div className='relative w-full h-screen overflow-hidden'>
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          className='absolute top-0 left-0 w-full h-full object-cover z-0'
        >
          <source src='/videos/hero-vid.mp4' type="video/mp4" />
          Your browser does not support video tag
        </video>

        <div className='absolute inset-0 flex flex-col justify-center items-center space-y-12 z-10'>
          <div className='flex space-x-12'>
            <p className='text-4xl lg:text-6xl font-bold text-white'> Your Study Buddy always ready to help you out</p>
          </div>

          <div>
            <button
              onClick={login}
              className='bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600'
            >
              Login / Signup
            </button>
          </div>

        </div>
      </div>
    )
  );
}

export default Hero;
