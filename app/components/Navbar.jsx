import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../Context/AuthContext';

const Navbar = ({ className = '', hidden = '', navbarLogo = '', onNotLoggedIn }) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth(); // Directly get the user state

  // Navigation handler:
  // If the user is not logged in, call the onNotLoggedIn callback
  // instead of navigating.
  const handleNavigation = useCallback(
    (path) => () => {
      if (!user) {
        if (onNotLoggedIn) onNotLoggedIn();
        return;
      }
      router.push(path);
      setIsMenuOpen(false);
    },
    [router, user, onNotLoggedIn]
  );

  return (
    <nav
      className={`
        flex p-4 w-full fixed top-0 left-0 items-center h-16
        bg-transparent text-black
        ${className}
      `}
    >
      {/* Desktop navigation links */}
      <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2">
        <ul className="flex space-x-10 text-lg font-bold text-center">
          <li onClick={handleNavigation('/')} className="hover:text-gray-400 cursor-pointer">
            Home
          </li>
          <li onClick={handleNavigation('/summarizer')} className="hover:text-gray-400 cursor-pointer">
            Summarizer
          </li>
          <li onClick={handleNavigation('/flashcards')} className="hover:text-gray-400 cursor-pointer">
            Flash Cards
          </li>
          <li onClick={handleNavigation('/chat')} className="hover:text-gray-400 cursor-pointer">
            Chat
          </li>
          <li onClick={handleNavigation('/about')} className="hover:text-gray-400 cursor-pointer">
            About
          </li>
        </ul>
      </div>

      {/* Logo / Brand on the left */}
      <h1
        className={`text-2xl font-bold ml-4 cursor-pointer ${hidden}`}
        onClick={handleNavigation('/')}
      >
        StudyBuddy
      </h1>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Hamburger icon for small screens */}
      <button
        className={`block lg:hidden p-2 mr-4 ${navbarLogo}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        title="Toggle Menu"
      >
        {isMenuOpen ? <FiX /> : <FiMenu className="size-6" />}
      </button>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-12 right-4 bg-white z-50 dark:bg-gray-900 shadow-md rounded-md p-4">
          <ul className="flex flex-col space-y-4 text-lg font-bold">
            <li onClick={handleNavigation('/')} className="hover:text-gray-400 cursor-pointer">
              Home
            </li>
            <li onClick={handleNavigation('/summarizer')} className="hover:text-gray-400 cursor-pointer">
              Summarizer
            </li>
            <li onClick={handleNavigation('/flashcards')} className="hover:text-gray-400 cursor-pointer">
              Flash Cards
            </li>
            <li onClick={handleNavigation('/chat')} className="hover:text-gray-400 cursor-pointer">
              Chat
            </li>
            <li onClick={handleNavigation('/about')} className="hover:text-gray-400 cursor-pointer">
              About
            </li>
            <li onClick={() => logout()} className="text-red-500 hover:text-red-700 cursor-pointer">
              Logout
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
