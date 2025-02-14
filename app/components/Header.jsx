import React from 'react';
import { useRouter } from 'next/navigation';

const Header = ({ isLoggedIn }) => {
    const router = useRouter();

    return (
        <div className='m-10'>
            <div>
                <ul className='text-md md:text-2xl font-semibold text-white flex w-full justify-center space-x-12'>
                    {isLoggedIn ? (
                        <>
                            <li>Notes</li>
                            <li>Summary</li>
                            <li>Main topics</li>
                        </>
                    ) : (

                        <>
                            <li 
                            onClick={() => router.push("/signup")}
                            className='hover: underline hover:cursor-pointer'>
                            Signup
                            </li>
                            <li 
                            onClick={() => router.push("/login")}
                            className='hover: underline hover:cursor-pointer'>
                            Login
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Header;
