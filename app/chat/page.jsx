'use client'
import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import InputBar from '../components/InputBar'

const page = () => {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = () => {
    setIsOpen(prev => !prev)
  }

  return (
    <>
      <Navbar hidden={'hidden'} className={'pt-6'} />
      <div className='flex w-screen h-screen'>
        <img src="/images/sidebar.svg" alt="sidebar" onClick={handleOpen} className='w-9 top-8 left-4 hover:opacity-100 z-20 tranision-opacity duration-300 absolute cursor-pointer h-9 opacity-50' />
        <div
          className={`fixed z-30 left-0 top-0 h-full bg-darkBlue w-72 text-white transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <img src="/images/sidebar.svg" alt="sidebar" onClick={handleOpen} className='w-9 top-8 left-4 filter invert absolute cursor-pointer h-9' />
        </div>
      </div>
      <div className='fixed inset-0 flex justify-center items-center'>
        <h1 className='text-gray-600 text-4xl'>StudyBuddy</h1>
      </div>
      <div className='fixed bottom-4 w-full flex justify-center'>
        <InputBar/>
      </div>

    </>
  )
}

export default page