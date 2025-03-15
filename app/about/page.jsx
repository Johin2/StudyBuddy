'use client';
import React from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

const AboutUs = () => {
  const router = useRouter();

  return (
    <>
      <Navbar className="text-black relative" />
      <section className="py-4 px-4 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-4xl font-extrabold" style={{ color: "#023047" }}>
              About StudyBuddy
            </h1>
            <p className="mt-4 text-lg text-marsOrange font-semibold">
              Study Smarter, Not Harder – With AI-Powered Learning!
            </p>
          </header>

          {/* Mission & What We Offer */}
          <div className="space-y-8">
            {/* Our Mission */}
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "#219EBC" }}>
                Our Mission
              </h2>
              <p className="mt-2 text-gray-700">
                At StudyBuddy, we believe that studying should be efficient,
                engaging, and stress-free. Our mission is to empower students with
                AI-driven tools that simplify note-taking, enhance memory retention,
                and foster collaborative learning.
              </p>
            </div>

            {/* What We Offer */}
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "#219EBC" }}>
                What We Offer
              </h2>
              <ul className="mt-2 list-disc ml-6 text-gray-700 space-y-2">
                <li>
                  <span className="font-bold">AI Summarization:</span> Instantly summarize your notes and articles.
                </li>
                <li>
                  <span className="font-bold">Flashcards Generator:</span> Create smart flashcards for easy revision.
                </li>
                <li>
                  <span className="font-bold">StudyGPT Chatbot:</span> Get instant explanations & answers.
                </li>
              </ul>
            </div>

            {/* How to Use Each Feature */}
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "#219EBC" }}>
                How to Use StudyBuddy
              </h2>

              {/* AI Summarization */}
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-marsOrange">
                  📝 AI Summarization
                </h3>
                <p className="text-gray-700">
                  <span className="font-bold">1️⃣ Go to Summarizer Page:</span> /summarizer
                  <br />
                  <span className="font-bold">2️⃣ Upload a PDF or Paste Text:</span> Choose any content to summarize.
                  <br />
                  <span className="font-bold">3️⃣ Click "Summarize":</span> AI generates a short summary.
                  <br />
                  <span className="font-bold">4️⃣ Save or Copy:</span> Use it for quick revision!
                </p>
              </div>

              {/* Flashcards */}
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-marsOrange">
                  🎴 Flashcards Generator
                </h3>
                <p className="text-gray-700">
                  <span className="font-bold">1️⃣ Go to Flashcards Page:</span> /flashcards
                  <br />
                  <span className="font-bold">2️⃣ Enter or Upload Notes:</span> StudyBuddy converts notes into flashcards.
                  <br />
                  <span className="font-bold">3️⃣ Click "Generate":</span> AI creates key questions & answers.
                  <br />
                  <span className="font-bold">4️⃣ Review & Track Progress:</span> Mark flashcards as known or needs review.
                </p>
              </div>

              {/* StudyGPT Chatbot */}
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-marsOrange">
                  🤖 StudyGPT Chatbot
                </h3>
                <p className="text-gray-700">
                  <span className="font-bold">1️⃣ Go to Chat Page:</span> /chat
                  <br />
                  <span className="font-bold">2️⃣ Ask a Question:</span> Type any study-related query.
                  <br />
                  <span className="font-bold">3️⃣ Get Instant Explanations:</span> StudyGPT provides clear step-by-step answers.
                  <br />
                  <span className="font-bold">4️⃣ Follow Up:</span> Ask more questions for deeper learning.
                </p>
              </div>
            </div>

            {/* Meet the Creator */}
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "#219EBC" }}>
                Meet the Creator
              </h2>
              <div className="mt-6 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                  <img src="/images/my-img.jpeg" alt="Creator" className="rounded-full" />
                </div>
                <p className="mt-2 font-semibold text-gray-800">Johin Arimbur</p>
                <p className="text-gray-600">Founder & Developer</p>
                <p className="mt-2 text-center max-w-md text-gray-700">
                  I built StudyBuddy to make learning{" "}
                  <span className="font-bold">easier, faster, and smarter</span>. My goal is to{" "}
                  <span className="font-bold">help students</span> organize their studies with AI-powered tools.
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
                Contact Me
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutUs;
