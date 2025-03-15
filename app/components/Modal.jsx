'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';

const AuthModal = React.memo(({ isOpen, onClose }) => {
  const router = useRouter();
  const { login } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (isLogin) {
        try {
          await login({ email: formData.email, password: formData.password });
          setSuccess('Logged in successfully');
          setError('');
          onClose();
          router.push('/dashboard');
        } catch (err) {
          setError(err.message);
          setSuccess('');
        }
      } else {
        try {
          const response = await axios.post('/api/signup', formData);
          if (response.status === 201) {
            setSuccess(response.data.message);
            setError('');
            onClose();
            router.push('/dashboard');
          } else {
            setError(response.data.error);
            setSuccess('');
          }
        } catch (err) {
          setError(err.response?.data?.error || err.message);
          setSuccess('');
        }
      }
    },
    [isLogin, formData, login, onClose, router]
  );

  if (!isOpen) return null;

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
  );
});

export default AuthModal;
