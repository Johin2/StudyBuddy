import React from 'react';
import Cards from './Cards';

const Hero = ({ login }) => {
  return (
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
        <div className='flex space-x-12'>
          <Cards content="Notes" />
          <Cards content="Summary" />
          <Cards content="Main topics" />
        </div>
        <button 
          onClick={login} 
          className='bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600'
        >
          Login / Signup
        </button>
      </div>
    </div>
  );
}

export default Hero;
