import React, { useState } from 'react';
import { useAuth } from '../Context/AuthContext';

const Hero = ({ isUser }) => {
  const { login } = useAuth();

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

  return isUser ? (
    <div className="grid grid-cols-[20%_80%] h-screen w-screen">
      <div className="grid grid-cols-[20%_80%] p-4 gap-4">
        <div className="bg-blue-300 rounded-md flex items-center justify-center">
          <span className="text-white">Left Part</span>
        </div>
        <div className="bg-green-300 rounded-md flex flex-col items-center justify-center p-4">

        </div>
      </div>
      <div className="bg-white p-4 grid gap-4 mt-32">
        <div className="bg-red-300 h-48 rounded-md flex items-center justify-center">
          <span className="text-white text-lg">Big Rectangle</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-yellow-300 h-32 rounded-md flex items-center justify-center">
            <span className="text-white">Box A</span>
          </div>
          <div className="bg-purple-300 h-32 rounded-md flex items-center justify-center">
            <span className="text-white">Box B</span>
          </div>
          <div className="bg-pink-300 h-32 rounded-md flex items-center justify-center">
            <span className="text-white">Box C</span>
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
              className={`flex-1 flex justify-center items-center cursor-pointer rounded-md ${
                isSignup
                  ? 'bg-mintGreen text-white font-semibold'
                  : 'bg-gray-100'
              }`}
            >
              <h1>Signup</h1>
            </div>
            <div
              onClick={() => setIsSignup(false)}
              className={`flex-1 flex justify-center items-center cursor-pointer rounded-md ${
                !isSignup
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
                className={`w-full p-3 rounded-md ${
                  isSignup
                    ? 'bg-mintGreen hover:bg-green-500'
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
