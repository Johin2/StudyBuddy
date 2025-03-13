'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import InputBar from '../components/InputBar';
import { FiFileText, FiList, FiDollarSign, FiX, FiLoader } from 'react-icons/fi';

const SummarizerPage = () => {
  const MAX_FREE_SUMMARIES = 5;

  const [currentSummary, setCurrentSummary] = useState('');
  // History stored as an array of objects: { id, summary, historyPreview, keyPoints }
  const [history, setHistory] = useState([]);
  // freeSummariesLeft is initially null so we don't flash a default value.
  const [freeSummariesLeft, setFreeSummariesLeft] = useState(null);
  const [subscription, setSubscription] = useState(false);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // On mount, fetch free daily summaries count and the user's history from the backend.
  useEffect(() => {
    fetchFreeCount();
    fetchHistory();
  }, []);

  const fetchFreeCount = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await fetch("/api/summarize/freeCount", {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFreeSummariesLeft(data.freeDailySummariesLeft);
      } else {
        console.error("Failed to fetch free count");
        setFreeSummariesLeft(MAX_FREE_SUMMARIES);
      }
    } catch (error) {
      console.error("Error fetching free count:", error);
      setFreeSummariesLeft(MAX_FREE_SUMMARIES);
    }
  };

  const fetchHistory = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await fetch("/api/summarize/history", {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history.filter(item => !item.isDeleted));
        ;
      } else {
        console.error("Failed to fetch history");
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSummary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const buySummary = () => {
    setErrorMessage("Purchase flow not implemented.");
    setShowPurchaseModal(false);
  };

  const buySubscription = () => {
    setSubscription(true);
    setShowPurchaseModal(false);
  };

  const handleHistoryClick = (index) => {
    setSelectedHistoryIndex(index);
    // Immediately show the full summary for that history item.
    setCurrentSummary(history[index].summary);
    setLoading(false);
  };

  // Helper to capitalize the first letter.
  const capitalizeFirstLetter = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // Utility function: get a preview (first 5 words) from a history item.
  const getSummaryPreview = (historyItem) => {
    return historyItem.historyPreview || historyItem.summary.split(/\s+/).slice(0, 5).join(" ") + "...";
  };

  // Display the summary immediately (no streaming).
  const displaySummary = (fullSummary) => {
    setCurrentSummary(capitalizeFirstLetter(fullSummary));
    setLoading(false);
  };

  // Callback when InputBar returns data from the API.
  // Expected API response: { summary, keyPoints, historyPreview, freeDailySummariesLeft, summarizerId }
  const handleSummaryGenerated = (data) => {
    setErrorMessage("");
    setSelectedHistoryIndex(null); // Clear any previously selected history.
    // Append new summary to history.
    setHistory(prev => [
      ...prev,
      {
        id: data.summarizerId,
        summary: data.summary,
        historyPreview: data.historyPreview,
        keyPoints: data.keyPoints,
      }
    ]);
    setLoading(true);
    displaySummary(data.summary);
    setFreeSummariesLeft(data.freeDailySummariesLeft);
    if (data.freeDailySummariesLeft <= 0 && !subscription) {
      setShowPurchaseModal(true);
    }
  };

  // Callback when InputBar returns an error.
  const handleSummaryError = (errorResponse) => {
    if (!errorResponse || !errorResponse.status) {
      setErrorMessage("Failed to generate summary.");
    } else if (errorResponse.status === 403) {
      setFreeSummariesLeft(0);
      setShowPurchaseModal(true);
      setErrorMessage("Daily free summaries limit reached.");
    } else {
      setErrorMessage("Failed to generate summary.");
    }
    console.error("Summary generation error:", errorResponse);
  };

  // Delete a summary from the database and update local state by removing it from the history array.
  const deleteSummary = async (index) => {
    const summaryToDelete = history[index];
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setErrorMessage("Access token not found. Please log in.");
      return;
    }
    try {
      const response = await fetch(`/api/summarize?id=${summaryToDelete.id}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Failed to delete summary");
      }
      // Remove the summary from the local state.
      const updatedHistory = history.filter((_, i) => i !== index);
      setHistory(updatedHistory);
      if (selectedHistoryIndex === index) {
        setSelectedHistoryIndex(null);
        setCurrentSummary('');
      }
      // Do NOT update free count on deletion.
    } catch (error) {
      setErrorMessage("There was an error deleting the summary.");
      console.error("Error deleting summary:", error);
      // Re-fetch history to ensure UI consistency.
      fetchHistory();
    }
  };

  return (
    <div className="flex flex-col w-screen h-screen relative">
      {/* Navbar */}
      <img src="/images/home-bg.svg" alt="backdrop" className="absolute inset-0 -z-10 w-full h-full object-cover" />
      <Navbar className="text-white" />

      <div className="grid grid-cols-2 grid-rows-3 w-full h-full p-12 gap-12">
        {/* Input Section */}
        <div className="border-2 w-full col-span-1 row-span-1 mt-6 border-gray-400 rounded-lg p-6 bg-white shadow-md">
          <h2 className="text-2xl mb-12 font-semibold flex items-center gap-2 text-gray-800">
            <FiFileText className="text-midBlue" /> Upload Text, PDF, or DOCX
          </h2>
          <InputBar
            width="w-full"
            apiEndpoint="/api/summarize"
            onSummaryGenerated={handleSummaryGenerated}
            onSummaryError={handleSummaryError}
            onSendStarted={() => setLoading(true)}
          />
        </div>

        {/* Summary Display Section */}
        <div className="border-2 col-span-1 row-span-3 mt-6 border-gray-400 rounded-lg p-6 bg-white shadow-md">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
            <FiList className="text-midBlue" /> Generated Summary
          </h2>
          <div className="relative p-4 pt-12 border border-gray-300 rounded-md bg-gray-100 h-4/5 overflow-y-auto mt-2 flex flex-col">
            {loading ? (
              <div className="flex flex-col items-center">
                <FiLoader className="animate-spin text-3xl text-gray-500" />
                <p className="mt-2 text-gray-500">Loading summary...</p>
              </div>
            ) : currentSummary ? (
              <p className="text-gray-800 text-left">{currentSummary}</p>
            ) : (
              <p className="text-gray-500">No summary generated yet</p>
            )}
            {currentSummary && !loading && (
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 bg-midBlue text-white px-3 py-1 rounded"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
          <div className="mt-4 text-gray-700">
            {!subscription ? (
              <>
                <p className="font-semibold">
                  Free summaries left:{" "}
                  <span className="text-marsOrange">
                    {freeSummariesLeft !== null ? freeSummariesLeft : <FiLoader className="animate-spin inline-block" />}
                  </span>
                </p>
              </>
            ) : (
              <p className="font-semibold">You have an unlimited subscription</p>
            )}
          </div>
          {errorMessage && (
            <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
              {errorMessage}
            </div>
          )}
        </div>

        {/* History Section */}
        <div className="flex flex-col border-2 border-gray-400 col-span-1 row-span-2 rounded-lg bg-white shadow-md">
          <div className="flex">
            <h1 className="text-white rounded-tl-lg text-center w-1/2 bg-gray-700 font-semibold h-12 flex items-center justify-center">
              History
            </h1>
            <h1 className="text-white rounded-tr-lg text-center w-1/2 bg-gray-700 font-semibold h-12 flex items-center justify-center">
              Key Points
            </h1>
          </div>
          <div className="flex flex-row h-[91%]">
            <div className="w-1/2 h-full overflow-y-auto p-2 custom-scrollbar border-gray-300">
              {history.length > 0 ? (
                history.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b py-2 hover:bg-gray-200">
                    <p
                      className={`cursor-pointer flex-1 ${selectedHistoryIndex === index ? "bg-gray-200" : ""}`}
                      onClick={() => handleHistoryClick(index)}
                    >
                      {getSummaryPreview(item)}
                    </p>
                    <button
                      className="text-red-500 ml-2"
                      onClick={() => deleteSummary(index)}
                    >
                      <FiX />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No history available</p>
              )}
            </div>
            <div className="border border-1 h-full border-black"></div>
            <div className="w-1/2 h-[80%] overflow-y-auto p-3">
              {((selectedHistoryIndex !== null && history[selectedHistoryIndex]?.keyPoints?.length > 0) ||
                (selectedHistoryIndex === null && history.length > 0)) ? (
                <ul className="list-disc pl-4">
                  {(selectedHistoryIndex !== null
                    ? history[selectedHistoryIndex].keyPoints
                    : history[history.length - 1].keyPoints).map((point, i) => (
                      <li key={i} className="text-gray-800 py-1">
                        {point}
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-gray-500">
                  Key points for the current summary will appear here.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-80 text-center">
            <h2 className="text-xl font-semibold mb-4">Out of Free Summaries</h2>
            <p className="mb-6">
              You have used up your free summaries. Please buy extra summaries or subscribe for unlimited access.
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={buySummary}
                className="bg-marsOrange text-white px-4 py-2 rounded hover:bg-orange-600 transition"
              >
                Buy 1 Summary (₹10)
              </button>
              <button
                onClick={buySubscription}
                className="bg-midBlue text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Subscribe (₹100/month)
              </button>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="text-gray-600 underline hover:text-gray-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummarizerPage;
