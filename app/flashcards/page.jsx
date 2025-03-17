'use client';
import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import InputBar from "../components/InputBar";
import ThreeDCarousel from "../components/ThreeDCarousel";
import { useAuth } from "../Context/AuthContext";

const FREE_LIMIT = 5;
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

const FlashcardsPage = () => {
  const { user, loading } = useAuth();
  const userId = user?.id || user?.sub;
  const [isloading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [flashcardHistory, setFlashcardHistory] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [flashcards, setFlashcards] = useState([]);

  // Initialize freeSessionsLeft to FREE_LIMIT
  const [freeSessionsLeft, setFreeSessionsLeft] = useState(FREE_LIMIT);
  const [expirationTime, setExpirationTime] = useState(
    localStorage.getItem("flashcardsExpirationTime")
      ? parseInt(localStorage.getItem("flashcardsExpirationTime"), 10)
      : null
  );
  const [remainingTime, setRemainingTime] = useState(0);
  const [showTimerModal, setShowTimerModal] = useState(false);

  // Function to format milliseconds into HH:MM:SS
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Countdown timer effect for when free sessions are exhausted.
  useEffect(() => {
    if (!expirationTime) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = expirationTime - now;
      if (diff <= 0) {
        setRemainingTime(0);
        clearInterval(interval);
        setShowTimerModal(false);
        setFreeSessionsLeft(FREE_LIMIT);
        localStorage.removeItem("flashcardsExpirationTime");
        setExpirationTime(null);
      } else {
        setRemainingTime(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expirationTime]);

  const fetchSessions = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/flashcards?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setFlashcardHistory(data.data);
        // Optionally, update freeSessionsLeft if your API returns that info.
      }
    } catch (error) {
      console.error("Error fetching sessions", error);
    }
  }, [userId]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const deleteHistoryItem = useCallback(
    async (id) => {
      if (!id) {
        console.error("No valid id provided for deletion");
        return;
      }
      try {
        const res = await fetch(`/api/flashcards?id=${id.toString()}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success) {
          setFlashcardHistory((prev) =>
            prev.filter(
              (item) => (item._id || item.id || item.sessionId) !== id
            )
          );
          if (
            selectedSession &&
            (selectedSession._id || selectedSession.id || selectedSession.sessionId) === id
          ) {
            setSelectedSession(null);
            setFlashcards([]);
          }
          fetchSessions();
        } else {
          console.error("Delete failed", data.error);
        }
      } catch (error) {
        console.error("Error deleting session", error);
      }
    },
    [selectedSession, fetchSessions]
  );

  const openSession = useCallback((session) => {
    setSelectedSession(session);
    setFlashcards(session.flashcards || []);
  }, []);

  // Create a new session using the API.
  const createNewSession = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          messageText: "New flashcard session",
        }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          setFreeSessionsLeft(0);
          if (!expirationTime) {
            const newExpirationTime = Date.now() + ONE_DAY_IN_MS;
            setExpirationTime(newExpirationTime);
            localStorage.setItem("flashcardsExpirationTime", newExpirationTime.toString());
          }
          setShowTimerModal(true);
        }
        return;
      }

      const data = await response.json();
      if (data.success) {
        setFlashcardHistory((prev) => [...prev, data.data]);
        openSession(data.data);
        setFreeSessionsLeft(data.data.freeDailySessionsLeft);
      }
    } catch (error) {
      console.error("Error creating session", error);
    }
  }, [userId, openSession, expirationTime]);

  // Handle sending messages (generating flashcard sessions)
  const handleSendMessage = useCallback(
    async (payload) => {
      if (!userId) return;
      try {
        let response;
        if (typeof payload === "object" && payload.file) {
          const formData = new FormData();
          formData.append("userId", userId);
          formData.append("messageText", payload.text);
          formData.append("file", payload.file);
          response = await fetch("/api/flashcards", {
            method: "POST",
            body: formData,
          });
        } else {
          response = await fetch("/api/flashcards", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId, messageText: payload }),
          });
        }

        if (!response.ok) {
          if (response.status === 403) {
            setFreeSessionsLeft(0);
            if (!expirationTime) {
              const newExpirationTime = Date.now() + ONE_DAY_IN_MS;
              setExpirationTime(newExpirationTime);
              localStorage.setItem("flashcardsExpirationTime", newExpirationTime.toString());
            }
            setShowTimerModal(true);
          }
          return;
        }

        const data = await response.json();
        if (data.success) {
          setFlashcardHistory((prev) => [...prev, data.data]);
          openSession(data.data);
          setFreeSessionsLeft(data.data.freeDailySessionsLeft);
        }
      } catch (error) {
        console.error("Error sending message", error);
      } finally {
        setLoading(false);
      }
    },
    [userId, openSession, expirationTime]
  );

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  if (loading) return null;
  if (!userId) return <div>Please log in to view your flashcards.</div>;

  // Extract selected session id for comparison
  const selectedSessionId = selectedSession?._id || selectedSession?.id;

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Background */}
      <img
        src="/images/home-bg.svg"
        alt="Backdrop"
        className="absolute inset-0 -z-10 w-full h-full object-cover"
      />

      {/* Navbar */}
      <Navbar className="pt-8 z-50 text-white max-md:text-black" hidden="hidden" />

      {/* Main Layout */}
      <div className="flex flex-grow relative h-full overflow-hidden">
        {/* Sidebar Toggle Button */}
        <img
          src="/images/sidebar.svg"
          alt="Toggle sidebar"
          onClick={toggleSidebar}
          className="w-9 h-9 absolute invert top-8 left-4 cursor-pointer transition-all duration-300 z-50"
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
                alt="Close sidebar"
                onClick={toggleSidebar}
                className="w-9 h-9 absolute invert top-8 left-4 cursor-pointer transition-all duration-300"
              />

              <h2 className="text-lg m-2 font-semibold">Flashcard History</h2>
              {/* Free Session Count Display */}
              <p className="m-2 text-sm">
                Free Sessions Left:{" "}
                {freeSessionsLeft !== null ? freeSessionsLeft : "Loading..."}
              </p>

              {/* List of Previous Flashcard Sessions */}
              <ul>
                {flashcardHistory.length > 0 ? (
                  flashcardHistory.map((session, index) => {
                    const sessionId = session._id || session.id;
                    return (
                      <li
                        key={sessionId || index}
                        className={`p-2 flex justify-between items-center hover:bg-gray-700 rounded-md mb-2 cursor-pointer ${
                          selectedSessionId === sessionId ? "bg-gray-600" : ""
                        }`}
                        onClick={() => openSession(session)}
                      >
                        <span className="cursor-pointer">{session.title}</span>
                        {/* Delete Button */}
                        <button
                          style={{ flexShrink: 0 }}
                          className="ml-2 transition-all duration-300 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteHistoryItem(sessionId);
                          }}
                        >
                          <img
                            src="/images/bin.svg"
                            alt="Delete"
                            className="w-6 filter invert transition-all duration-300 hover:brightness-0 hover:invert-0 hover:sepia hover:hue-rotate-[-50deg] hover:saturate-200"
                          />
                        </button>
                      </li>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-sm mt-4">No history available</p>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Center Content Area */}
        <main className="flex-grow flex p-4 sm:p-6 justify-center items-center overflow-hidden">
          {selectedSession ? (
            <ThreeDCarousel items={flashcards} />
          ) : (
            <p className="text-gray-500 text-center">
              Select a session to view flashcards.
            </p>
          )}
        </main>
      </div>

      {/* Bottom InputBar */}
      <div className="w-full mb-2 flex justify-center items-center p-4">
        <div className="w-full flex justify-center items-center max-w-4xl px-2 sm:px-0">
          <InputBar
            width="w-full sm:w-[65%]"
            placeholderText="Flashcard topic"
            onSendStarted={() => setLoading(true)}
            onMessageSent={handleSendMessage}
            disabled={isloading}
          />
        </div>
      </div>

      {/* Timer Modal for Flashcards */}
      {showTimerModal && expirationTime && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-80 text-center">
            <h2 className="text-xl font-semibold mb-4">Daily Flashcard Sessions Exhausted</h2>
            <p className="mb-6">You have used up your free flashcard sessions for today.</p>
            <p className="mb-4">Next free session available in:</p>
            <p className="text-2xl font-bold mb-4">{formatTime(remainingTime)}</p>
            <button
              onClick={() => setShowTimerModal(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage;
