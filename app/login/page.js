'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const Login = () => {

  const router = useRouter()

  const [formData, setformData] = useState({
    email: "", 
    password: ""
})

const [success, setSuccess] = useState("")
const [error, setError] = useState("")

const handleChange = (e) => {
  setformData({ ...formData, [e.target.name]: e.target.value})
};

const handleSubmit = async (e) =>{
  e.preventDefault();

  try{
    const response = await axios.post('/api/login', formData);
    if (response.status == 200) {
      setSuccess(response.data.message)
      setError("")
      router.push('/dashboard')
    }
    else {
      setError(response.data.error)
      setSuccess("")
    }
  }catch (error){
    setError(error.response?.data || error.message)
  }
}
  

  return (
    <div className='flex h-screen items-center justify-center'>
        <div className=' flex flex-col bg-gray-900 rounded-lg bg-opacity-60 py-[10%] px-[10%] items-center'>
            <p className='text-3xl font-bold text-white'>Login</p>
            <div className='items-center justify-center'>
                <form action="" onSubmit = {handleSubmit} className='flex flex-col space-y-3 mt-6 items-center'>

                  <div>
                   <input 
                   type="email" 
                   placeholder='Email'
                   name = "email"
                   value={formData.email}
                   onChange={handleChange}
                   className='pl-4 placeholder:pl-4 rounded-sm h-9'
                   required/>
                  </div>

                  <div>
                   <input 
                   type="password" 
                   placeholder='Password' 
                   name = "password"
                   value={formData.password}
                   onChange={handleChange}
                   className='pl-4 placeholder:pl-4 rounded-sm h-9'
                   required/>
                  </div>

                  <div className='w-1/2 bg-gray-700 p-2 rounded-md flex justify-center items-center hover:translate-y-[-1px]'>
                    <button type="submit" className='text-white'>Submit</button>
                  </div>

                  <div>
                    {success && <p className='text-green-500'>{success}</p>}
                    {error && <p className='text-red-500'>{error}</p>}
                  </div>
                </form>

            </div>
            <div className='mt-12'>
              <p className='text-md font-semibold text-white hover:text-blue-500 hover:underline hover:cursor-pointer' onClick={() => router.push('/login')}>Signup</p>
            </div>
        </div>
    </div>
  )
}

export default Login