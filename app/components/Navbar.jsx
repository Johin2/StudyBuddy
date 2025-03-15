import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';

const Navbar = React.memo(({ className = '', hidden = '' }) => {
  const router = useRouter();

  // Helper function to navigate to a given path
  const handleNavigation = useCallback(
    (path) => () => {
      router.push(path);
    },
    [router]
  );

  return (
    <nav className={`flex p-4 w-full fixed top-0 left-0 justify-between items-center ${className}`}>
      <h1
        className={`text-2xl font-bold ml-4 cursor-pointer ${hidden}`}
        onClick={handleNavigation('/')}
      >
        StudyBuddy
      </h1>
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <ul className={`flex space-x-12 text-lg font-bold`}>
          <li onClick={handleNavigation('/')} className="hover:text-gray-400 cursor-pointer">Home</li>
          <li onClick={handleNavigation('/summarizer')} className="hover:text-gray-400 cursor-pointer">Summarizer</li>
          <li onClick={handleNavigation('/flashcards')} className="hover:text-gray-400 cursor-pointer">Flash Cards</li>
          <li onClick={handleNavigation('/chat')} className="hover:text-gray-400 cursor-pointer">Chat</li>
          <li onClick={handleNavigation('/about')} className="hover:text-gray-400 cursor-pointer">About</li>
        </ul>
      </div>
    </nav>
  );
});

export default Navbar;
