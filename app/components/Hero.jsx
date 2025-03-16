'use client';
import React, { useState, useCallback } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useRouter } from 'next/navigation';
import { FiLoader } from 'react-icons/fi';
import Navbar from './Navbar';

const Hero = ({ isUser }) => {
  const { login } = useAuth();
  const router = useRouter();

  const [isSignup, setIsSignup] = useState(true);
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
          router.push('/');
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

  const toggleSignup = useCallback(() => setIsSignup(true), []);
  const toggleLogin = useCallback(() => setIsSignup(false), []);

  return isUser ? (
    <div className="flex flex-col max-sm:relative w-full min-h-screen pt-[64px]">
      <Navbar className="max-sm:text-black lg:text-white absolute" hidden="text-white" navbarLogo = "text-white"/>
      <img
        src="/images/home-bg.svg"
        alt="backdrop"
        className="absolute inset-0 -z-10 w-full h-full object-cover"
      />
      {/* Wrapping content in a container with padding */}
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
            onClick={() => router.push('/chat')}
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
    </div>
  ) : (
    <div className="flex flex-col md:flex-row w-screen h-screen">
      {/* Left Side (Image + Title) */}
      <div className="relative w-full md:w-1/2 h-1/2 md:h-full overflow-hidden">
        <h1 className="text-2xl font-bold text-white absolute top-2 left-2 z-10">
          StudyBuddy
        </h1>
        <img
          src="/images/login-signup.png"
          alt="cover-image"
          className="object-cover object-center w-full h-full"
        />
      </div>

      {/* Right Side (Login/Signup Form) */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex justify-center items-center">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col space-y-6 justify-center items-center w-[90%] max-w-md mx-auto p-4"
        >
          {/* Toggle Buttons */}
          <div className="flex h-12 rounded-lg border-[2px] border-black mb-4 w-full">
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
            <p
              className={`text-center ${isSuccess ? 'text-green-500' : 'text-red-500'}`}
            >
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
  );
};

export default Hero;
