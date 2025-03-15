'use client';
import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import Navbar from '../components/Navbar';
import InputBar from '../components/InputBar';
import { FiFileText, FiList, FiX, FiLoader } from 'react-icons/fi';
import Head from 'next/head';
import Image from 'next/image';

const MAX_FREE_SUMMARIES = 5;

const SummarizerPage = () => {
  const [currentSummary, setCurrentSummary] = useState('');
  const [history, setHistory] = useState([]);
  const [freeSummariesLeft, setFreeSummariesLeft] = useState(null);
  const [subscription, setSubscription] = useState(false);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingIndex, setDeletingIndex] = useState(null); // new state for deletion spinner

  useEffect(() => {
    fetchFreeCount();
    fetchHistory();
  }, []);

  const fetchFreeCount = useCallback(async () => {
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
  }, []);

  const fetchHistory = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await fetch("/api/summarize/history", {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history.filter(item => !item.isDeleted));
      } else {
        console.error("Failed to fetch history");
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(currentSummary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [currentSummary]);

  const buySummary = useCallback(() => {
    setErrorMessage("Purchase flow not implemented.");
    setShowPurchaseModal(false);
  }, []);

  const buySubscription = useCallback(() => {
    setSubscription(true);
    setShowPurchaseModal(false);
  }, []);

  const handleHistoryClick = useCallback((index) => {
    setSelectedHistoryIndex(index);
    setCurrentSummary(history[index].summary);
    setLoading(false);
  }, [history]);

  // Updated delete handler calls DELETE API endpoint and shows spinner
  const handleDeleteSummary = useCallback(async (index) => {
    const summaryToDelete = history[index];
    if (!summaryToDelete) return;
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    
    // Set deletion spinner state
    setDeletingIndex(index);
    
    try {
      const res = await fetch(`/api/summarize?id=${summaryToDelete.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setHistory(prevHistory => prevHistory.filter((_, i) => i !== index));
        if (selectedHistoryIndex === index) {
          setSelectedHistoryIndex(null);
          setCurrentSummary('');
        }
      } else {
        console.error("Failed to delete summary from server");
      }
    } catch (error) {
      console.error("Error deleting summary:", error);
    } finally {
      setDeletingIndex(null);
    }
  }, [history, selectedHistoryIndex]);

  const capitalizeFirstLetter = (text) =>
    text ? text.charAt(0).toUpperCase() + text.slice(1) : '';

  const getSummaryPreview = (historyItem) => {
    return historyItem.historyPreview ||
      historyItem.summary.split(/\s+/).slice(0, 5).join(" ") + "...";
  };

  const displaySummary = (fullSummary) => {
    setCurrentSummary(capitalizeFirstLetter(fullSummary));
    setLoading(false);
  };

  const handleSendMessage = useCallback(async (payload) => {
    if (!payload) return;
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setErrorMessage("Access token not found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      let res;
      if (typeof payload === "object" && payload.fileName) {
        const formData = new FormData();
        formData.append("text", payload.text);
        formData.append("file", payload.file);
        res = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData,
        });
      } else {
        res = await fetch("/api/summarize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ text: payload }),
        });
      }

      if (!res.ok) {
        if (res.status === 403) {
          setFreeSummariesLeft(0);
          setShowPurchaseModal(true);
          setErrorMessage("Daily free summaries limit reached.");
        } else {
          setErrorMessage("Failed to generate summary.");
        }
        setLoading(false);
        return;
      }

      const data = await res.json();
      setHistory(prev => [
        ...prev,
        {
          id: data.summarizerId,
          summary: data.summary,
          historyPreview: data.historyPreview,
          keyPoints: data.keyPoints,
        }
      ]);
      displaySummary(data.summary);
      setFreeSummariesLeft(data.freeDailySummariesLeft);

      if (data.freeDailySummariesLeft <= 0 && !subscription) {
        setShowPurchaseModal(true);
      }
    } catch (error) {
      console.error("Summary generation error:", error);
      setErrorMessage("Failed to generate summary.");
    } finally {
      setLoading(false);
    }
  }, [subscription]);

  return (
    <>
      <Head>
        <title>StudyBuddy Summarizer</title>
        <meta name="description" content="Generate summaries from text, PDFs, or DOCX. StudyBuddy summarizer: quick, easy, and by students, for students." />
        <meta name="keywords" content="StudyBuddy, summarizer, summary, text summarization, PDF summarizer" />
      </Head>
      <div className="flex flex-col w-screen h-screen relative">
        {/* Optimized Background Image */}
        <Image
          src="/images/home-bg.svg"
          alt="backdrop"
          layout="fill"
          objectFit="cover"
          className="-z-10"
          priority
        />
        <Navbar className="text-white" />

        <div className="grid grid-cols-2 grid-rows-3 w-full h-full p-12 gap-12">
          {/* Input Section */}
          <div className="border-2 w-full col-span-1 row-span-1 mt-6 border-gray-400 rounded-lg p-6 bg-white shadow-md overflow-hidden">
            <h2 className="text-2xl lg:mb-6 font-semibold flex items-center gap-2 text-gray-800">
              <FiFileText className="text-midBlue flex-shrink-0 font-semibold" />
              Upload Text, PDF, or DOCX
            </h2>
            <div className="w-full max-w-full overflow-hidden pb-12">
              <InputBar
                width="w-full"
                placeholderText="Enter text manually or upload a document (Max. size: 4.5 MB)"
                onSendStarted={() => {
                  setLoading(true);
                  setErrorMessage("");
                }}
                onMessageSent={handleSendMessage}
              />
            </div>
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
                <div>
                  <ReactMarkdown>{currentSummary}</ReactMarkdown>
                </div>
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
                <p className="font-semibold">
                  Free summaries left:{" "}
                  <span className="text-marsOrange">
                    {freeSummariesLeft !== null ? freeSummariesLeft : <FiLoader className="animate-spin inline-block" />}
                  </span>
                </p>
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
          <div className="flex flex-col border-2 border-gray-400 col-span-1 row-span-2 rounded-lg bg-white shadow-md overflow-hidden">
            <div className="flex flex-shrink-0 m-0 p-0">
              <h1 className="text-white rounded-tl-lg text-center w-1/2 bg-gray-700 font-medium h-12 flex items-center justify-center m-0">
                History
              </h1>
              <h1 className="text-white rounded-tr-lg text-center w-1/2 bg-gray-700 font-medium h-12 flex items-center justify-center m-0">
                Key Points
              </h1>
            </div>
            <div className="flex flex-row flex-grow overflow-hidden">
              <div className="w-1/2 h-full overflow-y-auto p-2 custom-scrollbar border-r border-gray-300">
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
                        className="ml-2"
                        onClick={() => handleDeleteSummary(index)}
                      >
                        {deletingIndex === index ? (
                          <FiLoader className="animate-spin text-red-500" />
                        ) : (
                          <FiX className="text-red-500" />
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No history available</p>
                )}
              </div>
              <div className="w-1/2 h-full overflow-y-auto p-3">
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
    </>
  );
};

export default SummarizerPage;
