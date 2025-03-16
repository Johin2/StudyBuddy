import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiMenu, FiX } from 'react-icons/fi';

const Navbar = React.memo(({ className = '', hidden = '', navbarLogo = ''}) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Helper function to navigate to a given path
  const handleNavigation = useCallback(
    (path) => () => {
      router.push(path);
      setIsMenuOpen(false); // Close menu on link click
    },
    [router]
  );

  return (
    <nav
      className={`
        flex p-4 w-full fixed top-0 left-0 items-center h-16
        bg-transparent text-black
        ${className}
      `}
    >
      {/* Desktop links in the center for large screens */}
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

      {/* Flex spacer to push hamburger to the right */}
      <div className="flex-1" />

      {/* Hamburger icon: visible on small/medium; hidden on large */}
      <button
        className={`block lg:hidden p-2 mr-4 ${navbarLogo}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        title="Toggle Menu"
      >
        {isMenuOpen ? <FiX/> : <FiMenu className='size-6'/>}
      </button>

      {/* Mobile menu: shown only when isMenuOpen = true (small/medium screens) */}
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
          </ul>
        </div>
      )}
    </nav>
  );
});

export default Navbar;
