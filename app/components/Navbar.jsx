import React from 'react';
import { useRouter } from 'next/navigation';

const Navbar = ({className, hidden}) => {
  const router = useRouter();

  return (
    <nav className={`flex p-4 w-full fixed top-0 left-0 justify-between items-center ${className}`}>
      <h1 className={`text-2xl font-bold ml-4 cursor-pointer ${className} ${hidden}`} onClick={() => router.push('/')}>
        StudyBuddy
      </h1>
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <ul className={`flex space-x-12 text-lg font-bold ${className}`}>
        <li onClick={() => router.push('/')} className="hover:text-gray-400 cursor-pointer">Home</li>
          <li onClick={() => router.push('/summarizer')} className="hover:text-gray-400 cursor-pointer">Summarizer</li>
          <li onClick={() => router.push('/flashcards')} className="hover:text-gray-400 cursor-pointer">Flash Cards</li>
          <li onClick={() => router.push('/chat')} className="hover:text-gray-400 cursor-pointer">Chat</li>
          <li onClick={() => router.push('/about')} className="hover:text-gray-400 cursor-pointer">About</li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
