"use client";
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import InputBar from "../components/InputBar";
import ThreeDCarousel from "../components/ThreeDCarousel";

// Sample flashcard history
const sampleHistory = [
  {
    id: 1,
    title: "Session 1",
    date: "2023-09-01",
    flashcards: [
      { id: 1, content: "Flashcard 1" },
      { id: 2, content: "Flashcard 2" },
      { id: 3, content: "Flashcard 3" }
    ]
  },
  {
    id: 2,
    title: "Session 2",
    date: "2023-09-05",
    flashcards: [
      { id: 4, content: "Flashcard A" },
      { id: 5, content: "Flashcard B" }
    ]
  },
  {
    id: 3,
    title: "Session 3",
    date: "2023-09-10",
    flashcards: [
      { id: 6, content: "Flashcard X" },
      { id: 7, content: "Flashcard Y" },
      { id: 8, content: "Flashcard Z" },
      { id: 9, content: "Flashcard Extra" },
      { id: 10, content: "Flashcard X" },
      { id: 11, content: "Flashcard Y" },
      { id: 12, content: "Flashcard Z" },
      { id: 13, content: "Flashcard Extra" }
    ]
  }
];

// Start counting new flashcards from ID 10
let flashcardIdCounter = 10;

export default function FlashcardsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [flashcardHistory, setFlashcardHistory] = useState(sampleHistory);
  const [renamingId, setRenamingId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);
  const [flashcards, setFlashcards] = useState([]);

  // Toggle sidebar open/close
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Delete a history item
  const deleteHistoryItem = (id) => {
    setFlashcardHistory((prevHistory) =>
      prevHistory.filter((item) => item.id !== id)
    );
    if (selectedSession?.id === id) {
      setSelectedSession(null);
      setFlashcards([]);
    }
  };

  // Enable rename mode
  const enableRename = (id, currentTitle) => {
    setRenamingId(id);
    setNewTitle(currentTitle);
  };

  // Rename a history item
  const renameHistoryItem = (id) => {
    if (!newTitle.trim()) return;
    setFlashcardHistory((prevHistory) =>
      prevHistory.map((item) =>
        item.id === id ? { ...item, title: newTitle } : item
      )
    );
    setRenamingId(null);
  };

  // Open a session and load its flashcards
  const openSession = (session) => {
    setSelectedSession(session);
    setFlashcards(session.flashcards || []);
  };

  // Create a new session
  const createNewSession = () => {
    const newSessionId = flashcardHistory.length + 1;
    const newSession = {
      id: newSessionId,
      title: `Session ${newSessionId}`,
      date: new Date().toISOString().split("T")[0],
      flashcards: [
        { id: flashcardIdCounter++, content: "New Flashcard 1" },
        { id: flashcardIdCounter++, content: "New Flashcard 2" },
        { id: flashcardIdCounter++, content: "New Flashcard 3" },
      ]
    };

    setFlashcardHistory([...flashcardHistory, newSession]);
    openSession(newSession);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Background */}
      <img
        src="/images/home-bg.svg"
        alt="backdrop"
        className="absolute inset-0 -z-10 w-full h-full object-cover"
      />

      {/* Navbar */}
      <Navbar hidden="hidden" className="pt-8 z-50 text-white" />

      {/* Main Layout */}
      <div className="flex flex-grow relative h-full">
        {/* Sidebar Toggle Button */}
        <img
          src="/images/sidebar.svg"
          alt="sidebar"
          onClick={toggleSidebar}
          className="w-9 h-9 absolute invert top-8 left-4 cursor-pointer transition-all duration-300"
        />

        {/* Sidebar */}
        <div
          className={`bg-darkBlue text-white fixed left-0 top-0 h-full transition-all duration-300 ${
            sidebarOpen ? "w-72" : "w-0"
          } overflow-hidden z-10`}
        >
          {sidebarOpen && (
            <div className="mt-24 p-4 h-full overflow-y-auto scrollbar-hide">
              {/* Sidebar Close Button */}
              <img
                src="/images/sidebar.svg"
                alt="sidebar"
                onClick={toggleSidebar}
                className="w-9 h-9 absolute invert top-8 left-4 cursor-pointer transition-all duration-300"
              />

              <h2 className="text-lg m-2 font-semibold">Flashcard History</h2>

              {/* New Flashcard Button */}
              <div
                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-500 bg-gray-700 rounded-md mb-4"
                onClick={createNewSession}
              >
                <img
                  src="/images/new-chat.svg"
                  alt="New Flashcard"
                  className="w-6 h-6 filter invert"
                />
                <span>New Flashcard</span>
              </div>

              {/* List of Previous Flashcard Sessions */}
              <ul>
                {flashcardHistory.length > 0 ? (
                  flashcardHistory.map((chat) => (
                    <li
                      key={chat.id}
                      className={`p-2 flex justify-between items-center hover:bg-gray-700 rounded-md mb-2 cursor-pointer ${
                        selectedSession?.id === chat.id ? "bg-gray-600" : ""
                      }`}
                      onClick={() => openSession(chat)}
                    >
                      {renamingId === chat.id ? (
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          onBlur={() => renameHistoryItem(chat.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") renameHistoryItem(chat.id);
                          }}
                          className="bg-gray-800 text-white border-none outline-none p-1 rounded-md w-[80%]"
                          autoFocus
                        />
                      ) : (
                        <span
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            enableRename(chat.id, chat.title);
                          }}
                          className="cursor-pointer"
                        >
                          {chat.title}
                        </span>
                      )}

                      {/* Delete Button */}
                      <button
                        className="ml-2 transition-all duration-300 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHistoryItem(chat.id);
                        }}
                      >
                        <img
                          src="/images/bin.svg"
                          alt="Delete"
                          className="w-6 filter invert transition-all duration-300 hover:brightness-0 hover:invert-0 hover:sepia hover:hue-rotate-[-50deg] hover:saturate-200"
                        />
                      </button>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm mt-4">
                    No history available
                  </p>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Center Content Area */}
        <main className="flex-grow flex p-6 justify-center items-center">
          {selectedSession ? (
            <ThreeDCarousel items={flashcards} />
          ) : (
            <p className="text-gray-500">
              Select a session to view flashcards.
            </p>
          )}
        </main>
      </div>

      {/* Bottom InputBar */}
      <div className="w-full mb-2 flex justify-center items-center">
        <div className="w-[65%]">
          <InputBar className="w-[65%]" placeholderText={"Type or paste text here..."}/>
        </div>
      </div>
    </div>
  );
}
