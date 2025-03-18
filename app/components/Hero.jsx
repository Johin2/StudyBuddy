'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useRouter } from 'next/navigation';
import { FiLoader } from 'react-icons/fi';
import Navbar from './Navbar';

const Hero = ({ isUser }) => {
  const { login } = useAuth();
  const router = useRouter();

  // Modal open state for login/signup
  const [modalOpen, setModalOpen] = useState(false);

  // Toggle between signup and login
  const [isSignup, setIsSignup] = useState(true);
  const toggleSignup = useCallback(() => setIsSignup(true), []);
  const toggleLogin = useCallback(() => setIsSignup(false), []);

  // Form state and handlers
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const endpoint = isSignup ? '/api/signup' : '/api/login';
        const payload = isSignup
          ? formData
          : { email: formData.email, password: formData.password };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.token) {
          localStorage.setItem('accessToken', data.token);
          localStorage.setItem('refreshToken', data.refreshToken);
          login();
          router.push('/flashcards');
        } else if (response.status === 201 && isSignup) {
          setMessage('Signup successful! Please login.');
          setIsSuccess(true);
          setIsSignup(false);
          setFormData({ firstName: '', lastName: '', email: '', password: '' });
        } else {
          setMessage(data.error || 'An error occurred.');
          setIsSuccess(false);
        }
      } catch (error) {
        setMessage(error.message);
        setIsSuccess(false);
      } finally {
        setLoading(false);
      }
    },
    [isSignup, formData, login, router]
  );

  // Effect to monitor the access token:
  useEffect(() => {
    // Function to check token existence
    const checkToken = () => {
      if (!localStorage.getItem('accessToken')) {
        setModalOpen(true);
      }
    };

    // Check immediately on mount
    checkToken();

    // Listen to storage events (for changes in other tabs)
    window.addEventListener('storage', checkToken);

    // Polling for same-tab changes
    const intervalId = setInterval(checkToken, 1000);

    return () => {
      window.removeEventListener('storage', checkToken);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="flex flex-col max-sm:relative w-full min-h-screen pt-[64px]">
      {/* Pass onNotLoggedIn to Navbar */}
      <Navbar
        className="max-sm:text-black lg:text-white absolute"
        hidden="text-white"
        navbarLogo="text-white"
        isUser={isUser}
        onNotLoggedIn={() => setModalOpen(true)}
      />
      <img
        src="/images/home-bg.svg"
        alt="backdrop"
        className="absolute inset-0 -z-10 w-full h-full object-cover"
      />
      <div className="relative flex-1 p-4 md:p-12 flex flex-col md:grid md:grid-cols-4 md:grid-rows-2 gap-4 md:gap-10">
        {/* Left Panel Content */}
        <div className="md:col-span-2 md:row-span-3 flex flex-col justify-center gap-4 md:gap-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-400">
            Study Smarter with <span className="text-midBlue">StudyBuddy</span>
          </h1>
          <p className="text-gray-100 text-base md:text-lg">
            Your ultimate study companion. Organize notes, generate summaries, create flashcards, and use AI to learn efficiently.
          </p>
          <button
            className="bg-marsOrange text-white px-4 py-2 md:px-6 md:py-3 rounded-lg shadow-md hover:bg-amber-600 transition"
            onClick={() => {
              if (isUser) {
                router.push('/flashcards');
              } else {
                setModalOpen(true);
              }
            }}
          >
            Get Started
          </button>
        </div>
        {/* "Cards" Section */}
        <div
          className="flex flex-col space-y-3 cursor-pointer justify-center items-center rounded-md border hover:bg-gray-700 p-4 select-none"
          onClick={() => router.push('/about')}
        >
          <span className="text-6xl md:text-7xl">📖</span>
          <h2 className="text-lg md:text-xl font-semibold mt-2 text-white">About</h2>
          <p className="text-gray-300 text-center text-sm md:text-md">
            Learn how StudyBuddy can help you
          </p>
        </div>
        <div
          className="flex flex-col space-y-3 cursor-pointer justify-center items-center rounded-md border hover:bg-gray-700 p-4 select-none"
          onClick={() => router.push('/summarizer')}
        >
          <span className="text-6xl md:text-7xl">📝</span>
          <h2 className="text-lg md:text-xl font-semibold mt-2 text-white">Summarizer</h2>
          <p className="text-gray-300 text-center text-sm md:text-md">
            Automatically summarize notes and articles
          </p>
        </div>
        <div
          className="flex flex-col space-y-3 cursor-pointer justify-center items-center rounded-md border hover:bg-gray-700 p-4 select-none"
          onClick={() => router.push('/flashcards')}
        >
          <span className="text-6xl md:text-7xl">🎴</span>
          <h2 className="text-lg md:text-xl font-semibold mt-2 text-white">Flashcards</h2>
          <p className="text-gray-300 text-center text-sm md:text-md">
            Create and study with digital flashcards
          </p>
        </div>
        <div
          className="flex flex-col space-y-3 cursor-pointer justify-center items-center rounded-md border hover:bg-gray-700 p-4 select-none"
          onClick={() => router.push('/chat')}
        >
          <span className="text-6xl md:text-7xl">🤖</span>
          <h2 className="text-lg md:text-xl font-semibold mt-2 text-white">StudyGPT</h2>
          <p className="text-gray-300 text-center text-sm md:text-md">
            Chat with an AI-powered assistant for instant study help.
          </p>
        </div>
      </div>
      {/* Modal for Login/Signup */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg relative max-w-md w-full mx-4">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 text-gray-700 font-bold"
            >
              X
            </button>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
              {/* Toggle Buttons */}
              <div className="flex h-12 rounded-lg border-2 border-black mb-4 w-full">
                <button
                  type="button"
                  onClick={toggleSignup}
                  className={`flex-1 rounded-md ${
                    isSignup ? 'bg-midBlue text-white' : 'bg-gray-100'
                  } transition-colors`}
                >
                  Signup
                </button>
                <button
                  type="button"
                  onClick={toggleLogin}
                  className={`flex-1 rounded-md ${
                    !isSignup ? 'bg-marsOrange text-white' : 'bg-gray-100'
                  } transition-colors`}
                >
                  Login
                </button>
              </div>
              {isSignup && (
                <div className="flex flex-col md:flex-row gap-2 w-full">
                  <input
                    type="text"
                    placeholder="First name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="p-2 border-2 border-black rounded-md w-full"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="p-2 border-2 border-black rounded-md w-full"
                  />
                </div>
              )}
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="p-2 border-2 border-black rounded-md w-full"
                required
              />
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="p-2 border-2 border-black rounded-md w-full"
                required
              />
              {message && (
                <p className={`text-center ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
                  {message}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className={`w-full p-3 rounded-md text-white flex justify-center items-center gap-2 ${
                  isSignup ? 'bg-midBlue' : 'bg-marsOrange'
                } hover:opacity-80 transition`}
              >
                {loading ? (
                  <FiLoader className="animate-spin text-xl" />
                ) : isSignup ? (
                  'Sign Up'
                ) : (
                  'Log In'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hero;
