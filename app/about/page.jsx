'use client';
import React from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

const AboutUs = () => {
  const router = useRouter();

  return (
    <>
      <Navbar className="text-black relative" hidden="max-sm:hidden" />
      <section className="py-4 px-4 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-2xl md:text-4xl font-extrabold" style={{ color: "#023047" }}>
              About StudyBuddy
            </h1>
            <p className="mt-4 text-md md:text-lg text-marsOrange font-semibold">
              Empowering Smarter Study Habits with AI-Driven Tools
            </p>
          </header>

          {/* Mission & Services */}
          <div className="space-y-8">
            {/* Our Mission */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold" style={{ color: "#219EBC" }}>
                Our Mission
              </h2>
              <p className="mt-2 text-gray-700">
                At StudyBuddy, we are committed to revolutionizing the learning experience. Our mission is to provide innovative, AI-powered solutions that streamline note-taking, enhance memory retention, and promote collaborative learning.
              </p>
            </div>

            {/* Our Services */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold" style={{ color: "#219EBC" }}>
                Our Services
              </h2>
              <ul className="mt-2 list-disc ml-6 text-gray-700 space-y-2">
                <li>
                  <span className="font-bold">AI Summarization:</span> Generate concise summaries of your notes and articles instantly.
                </li>
                <li>
                  <span className="font-bold">Flashcards Generator:</span> Transform your study materials into interactive flashcards effortlessly.
                </li>
                <li>
                  <span className="font-bold">StudyGPT Chatbot:</span> Receive prompt, detailed explanations and answers to your academic queries.
                </li>
              </ul>
            </div>

            <h2 className="text-xl md:text-2xl font-bold" style={{ color: "#219EBC" }}>
                How to Use StudyBuddy
              </h2>

            {/* How to Use StudyBuddy */}
            <div className="flex max-sm:flex-col md:space-x-3">

              {/* AI Summarization */}
              <div className="mt-2">
                <h3 className="text-lg md:text-xl font-semibold text-marsOrange">
                  AI Summarization
                </h3>
                <p className="text-gray-700">
                  <strong>Step 1:</strong> Navigate to the Summarizer page: <code>/summarizer</code><br />
                  <strong>Step 2:</strong> Upload a PDF or paste the desired text.<br />
                  <strong>Step 3:</strong> Click "Summarize" to generate a brief summary.<br />
                  <strong>Step 4:</strong> Save or copy the summary for further reference.
                </p>
              </div>

              {/* Flashcards Generator */}
              <div className="mt-2">
                <h3 className="text-lg md:text-xl font-semibold text-marsOrange">
                  Flashcards Generator
                </h3>
                <p className="text-gray-700">
                  <strong>Step 1:</strong> Go to the Flashcards page: <code>/flashcards</code><br />
                  <strong>Step 2:</strong> Enter or upload your study notes.<br />
                  <strong>Step 3:</strong> Click "Generate" to create interactive flashcards.<br />
                  <strong>Step 4:</strong> Review the cards and track your progress.
                </p>
              </div>

              {/* StudyGPT Chatbot */}
              <div className="mt-2">
                <h3 className="text-lg md:text-xl font-semibold text-marsOrange">
                  StudyGPT Chatbot
                </h3>
                <p className="text-gray-700">
                  <strong>Step 1:</strong> Visit the Chat page: <code>/chat</code><br />
                  <strong>Step 2:</strong> Submit your academic query.<br />
                  <strong>Step 3:</strong> Receive detailed, step-by-step explanations.<br />
                  <strong>Step 4:</strong> Follow up with additional questions as needed.
                </p>
              </div>
            </div>

            {/* Meet the Creator */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold" style={{ color: "#219EBC" }}>
                Meet the Creator
              </h2>
              <div className="mt-6 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                  <img src="/images/my-img.jpeg" alt="Creator" className="rounded-full" />
                </div>
                <p className="mt-2 font-semibold text-gray-800">Johin Arimbur</p>
                <p className="text-gray-600">Developer</p>
                <p className="mt-2 text-center max-w-md text-gray-700">
                  I created StudyBuddy with the vision of transforming the learning experience through innovative, AI-driven tools. My goal is to empower students to study more efficiently and effectively.
                </p>
                <div className="mt-4 flex space-x-4">
                  <a
                    href="https://github.com/Johin2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-black transition"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://www.linkedin.com/in/johin/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-black transition"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <button
                className="px-6 py-3 rounded-lg font-bold bg-marsOrange text-white"
                onClick={() => router.push("/about/contact")}
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutUs;
