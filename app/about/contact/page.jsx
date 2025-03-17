'use client';
import React, { useState } from "react";
import Navbar from "@/app/components/Navbar";

const ContactPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage(null);

    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message }),
      });

      const data = await res.json();
      if (res.ok) {
        setResponseMessage({ type: "success", text: data.message });
        setEmail("");
        setMessage("");
      } else {
        setResponseMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setResponseMessage({ type: "error", text: "Something went wrong!" });
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center w-screen h-screen bg-midBlue">
      <Navbar />
      <div className="flex flex-col space-y-6 justify-center items-center bg-white shadow-xl rounded-lg p-8 w-[90%] md:w-[40%] lg:w-[35%]">
        <h1 className="font-bold text-3xl text-midBlue">Contact Me</h1>
        <p className="text-gray-600 text-center">
          Have questions? Reach out, and I'll get back to you as soon as possible!
        </p>

        {responseMessage && (
          <div className={`text-center w-full px-4 py-2 rounded-md ${responseMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {responseMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-midBlue placeholder:text-gray-400"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."
                className="w-full h-28 p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-midBlue placeholder:text-gray-400 resize-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`flex space-x-2 justify-center items-center w-full ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-marsOrange hover:bg-lightYellow"} text-white font-bold py-3 rounded-md shadow-md transition`}
            >
              <img src="/images/paperplane.svg" alt="Send" className="w-5" />
              <span>{loading ? "Sending..." : "Send"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
