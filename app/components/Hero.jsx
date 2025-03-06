import React, { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useRouter } from 'next/navigation';

const Hero = ({ isUser }) => {
  const { login } = useAuth();
  const router = useRouter();

  const [isSignup, setIsSignup] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const endpoint = isSignup ? '/api/signup' : '/api/login';
      const payload = isSignup
        ? { firstName, lastName, email, password }
        : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.token) {
        localStorage.setItem('accessToken', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        login();
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleAbout = async (e) => {
    router.push('/about')
  }

  const handleSummarizer = async (e) => {
    router.push('/summarizer')
  }

  const handleFlashCards = async (e) => {
    router.push('/flashcards')
  }

  const handleChat = async (e) => {
    router.push('/chat')
  }

  return isUser ? (
    <div className="flex w-full h-screen">
      <div className='flex flex-col justify-center'>
        <div className='flex justify-center w-screen items-center h-16'>
          <ul className='flex space-x-12 text-lg font-bold text-white'>
            <li onClick={handleAbout} className='hover:text-gray-600'>About</li>
            <li onClick={handleSummarizer} className='hover:text-gray-600'>Summarizer</li>
            <li onClick={handleFlashCards} className='hover:text-gray-600'>Flash cards</li>
            <li onClick={handleChat} className='hover:text-gray-600'>Chat</li>
          </ul>
        </div>

        <div className='grid grid-cols-4 grid-rows-2 gap-10 h-full w-full p-12'>
          <div className='col-span-2 row-span-3 flex flex-col justify-center gap-6'>
          <img src="/images/home-bg.svg" alt="backdrop" className='absolute inset-0 -z-10 w-full h-full object-cover'/>
            <h1 className='text-4xl font-bold text-gray-400'>
              Study Smarter with <span className='text-midBlue'>StudyBuddy</span>
            </h1>
            <p className='text-gray-100 text-lg'>
            Your ultimate study companion, Organize notes, generate summaries, create flashcards, and use AI to efficiently learn new topics
            </p>
            <button className='bg-marsOrange text-white px-6 py-3 rounded-lg shadow-md hover:bg-amber-600 transition' onClick={() => handleFlashCards()}>
              Get Started
            </button>
          </div>
          <div className='flex flex-col space-y-3 justify-center items-center rounded-md border border-'>
            <span className='text-7xl'>📖</span>
            <h2 className='text-xl font-semibold mt-2 text-white'>About</h2>
            <p className='text-gray-300 text-center text-md'>Learn how StudyBuddy can help you</p>
          </div>
          <div className='flex flex-col space-y-3  justify-center items-center rounded-md border border-1'>
            <span className='text-7xl'>📝</span>
            <h2 className='text-xl font-semibold mt-2 text-white'>Summarizer</h2>
            <p className='text-gray-300 text-center text-md'>Automatically summarize notes and articles</p>
          </div>
          <div className='flex flex-col space-y-3 justify-center items-center rounded-md border border-1'>
            <span className='text-7xl'>🎴</span>
            <h2 className='text-xl font-semibold mt-2 text-white'>Flashcards</h2>
            <p className='text-gray-300 text-center text-md'>Create and study with digital flashcards</p>
          </div>
          <div className='flex flex-col space-y-3 justify-center items-center rounded-md border border-1'>
            <span className='text-7xl'>🤖</span>
            <h2 className='text-xl font-semibold mt-2 text-white'>StudyGPT</h2>
            <p className='text-gray-300 text-center text-md'> Chat with an AI-powered assistant for instant study help.</p> 
          </div>

        </div>

      </div>
    </div>
  ) : (
    <div className="flex h-screen w-screen">
      <div className="w-[50%] h-full overflow-hidden rounded-md">
        <img
          src="/images/login-signup.png"
          alt="cover-image"
          className="object-cover object-center w-full h-full p-2"
        />
      </div>

      <div className="w-[50%] h-full flex justify-center items-center flex-col">
        <div className="flex-col space-y-12 justify-center items-center">
          <div className="flex h-12 rounded-lg border-[2px] border-black">
            <div
              onClick={() => setIsSignup(true)}
              className={`flex-1 flex justify-center items-center cursor-pointer rounded-md ${isSignup
                ? 'bg-midBlue text-white font-semibold'
                : 'bg-gray-100'
                }`}
            >
              <h1>Signup</h1>
            </div>
            <div
              onClick={() => setIsSignup(false)}
              className={`flex-1 flex justify-center items-center cursor-pointer rounded-md ${!isSignup
                ? 'bg-marsOrange text-white font-semibold'
                : 'bg-gray-100'
                }`}
            >
              <h1>Login</h1>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-center items-center space-y-10 w-full max-w-md"
          >
            {isSignup && (
              <div className="flex space-x-6 w-full">
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="p-2 border-2 border-black w-full rounded-md"
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="p-2 border-2 border-black w-full rounded-md"
                />
              </div>
            )}
            <div className="w-full">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 border-2 border-black w-full rounded-md"
              />
            </div>
            <div className="w-full">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-2 border-2 border-black w-full rounded-md"
              />
            </div>
            <div className="w-full">
              <button
                type="submit"
                className={`w-full p-3 rounded-md ${isSignup
                  ? 'bg-midBlue hover:bg-blue-400'
                  : 'bg-marsOrange hover:bg-orange-600'
                  } text-white`}
              >
                Submit
              </button>
            </div>
            {message && <p className="text-black text-md">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Hero;
