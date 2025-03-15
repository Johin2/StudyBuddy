'use client';
import React, { memo } from "react";
import Navbar from "@/app/components/Navbar";

const ContactPage = () => {
  return (
    <div className="flex justify-center items-center w-screen h-screen bg-midBlue">
      <Navbar />
      <div className="flex flex-col space-y-6 justify-center items-center bg-white shadow-xl rounded-lg p-8 w-[90%] md:w-[40%] lg:w-[35%]">
        <h1 className="font-bold text-3xl text-midBlue">Contact Me</h1>
        <p className="text-gray-600 text-center">
          Have questions? Reach out, and I'll get back to you as soon as possible!
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="w-full"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-midBlue placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Message
              </label>
              <textarea
                placeholder="Write your message..."
                className="w-full h-28 p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-midBlue placeholder:text-gray-400 resize-none"
              />
            </div>
            <button
              type="submit"
              className="flex space-x-2 justify-center items-center w-full bg-marsOrange text-white font-bold py-3 rounded-md shadow-md hover:bg-lightYellow transition"
            >
              <img src="/images/paperplane.svg" alt="Send" className="w-5" />
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default memo(ContactPage);
