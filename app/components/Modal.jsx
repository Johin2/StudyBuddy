'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../Context/AuthContext'

const AuthModal = ({ isOpen, onClose }) => {
  const router = useRouter()
  const { login } = useAuth() // Use the context's login
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    firstName: '', 
    lastName: '',
    email: '',
    password: '',
  })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isLogin) {
      // Use AuthContext's login function
      try {
        await login({
          email: formData.email,
          password: formData.password,
        })
        setSuccess("Logged in successfully")
        setError('')
        onClose()
        router.push('/dashboard')
      } catch (err) {
        setError(err.message)
        setSuccess('')
      }
    } else {
      // Signup logic (you might want to implement a similar context function for signup)
      try {
        const response = await axios.post('/api/signup', formData)
        if (response.status === 201) {
          setSuccess(response.data.message)
          setError('')
          onClose()
          router.push('/dashboard')
        } else {
          setError(response.data.error)
          setSuccess('')
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message)
        setSuccess('')
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          &times;
        </button>

        <div className="mb-4 flex justify-center">
          <button
            className={`mr-4 ${isLogin ? 'font-bold border-b-2 border-blue-500' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`${!isLogin ? 'font-bold border-b-2 border-blue-500' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Signup
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="border p-2 rounded-sm"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="border p-2 rounded-sm"
                required
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 rounded-sm"
            required
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="border p-2 rounded-sm"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            {isLogin ? 'Login' : 'Signup'}
          </button>
          <div className="text-center">
            {success && <p className="text-green-500">{success}</p>}
            {error && <p className="text-red-500">{error}</p>}
          </div>
        </form>
      </div>
    </div>
  )
}

export default AuthModal
