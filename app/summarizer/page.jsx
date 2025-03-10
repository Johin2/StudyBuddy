'use client';
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import InputBar from '../components/InputBar';
import { FiFileText, FiList, FiDollarSign, FiUpload, FiX, FiEdit } from 'react-icons/fi';

const SummarizerPage = () => {
  const [summaries, setSummaries] = useState([]);
  const [currentSummary, setCurrentSummary] = useState('');
  const [history, setHistory] = useState([]);
  const [keyPoints, setKeyPoints] = useState([]);
  const [summaryCount, setSummaryCount] = useState(0);
  const [subscription, setSubscription] = useState(false);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSummary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };


  const MAX_FREE_SUMMARIES = 5;
  const PRICE_PER_SUMMARY = 10;
  const SUBSCRIPTION_COST = 100;


  // Function to handle summary generation
  const handleGenerateSummary = () => {
    if (!subscription && summaryCount >= MAX_FREE_SUMMARIES) {
      alert('You have reached the daily limit! Buy more summaries or subscribe.');
      return;
    }

    const newSummary = `Generated Summary ${summaryCount + 1}`;
    const newKeyPoints = [`Key point ${summaryCount + 1}A`, `Key point ${summaryCount + 1}B`];

    setSummaries([...summaries, newSummary]);
    setHistory([...history, newSummary]);
    setKeyPoints([...keyPoints, newKeyPoints]);
    setCurrentSummary(newSummary);
    setSummaryCount(summaryCount + 1);
  };

  const deleteHistoryItem = (index) => {
    const updatedHistory = history.filter((_, i) => i !== index);
    setHistory(updatedHistory);
    const updatedKeyPoints = keyPoints.filter((_, i) => i !== index);
    setKeyPoints(updatedKeyPoints);
    // If the deleted item is selected, clear current selection.
    if (selectedHistoryIndex === index) {
      setSelectedHistoryIndex(null);
      setCurrentSummary('');
    } else if (selectedHistoryIndex > index) {
      // Adjust the index if an earlier item is deleted.
      setSelectedHistoryIndex(selectedHistoryIndex - 1);
    }
  };


  // Function to buy a single summary
  const buySummary = () => {
    alert(`You have purchased 1 additional summary for ₹${PRICE_PER_SUMMARY}`);
    setSummaryCount(summaryCount - 1);
  };

  const handleHistoryClick = (index) => {
    setSelectedHistoryIndex(index);
    setCurrentSummary(history[index]);
    // Do not update keyPoints here;
    // keyPoints remain for the current summary (the latest generated one)
  };


  // Function to buy a subscription
  const buySubscription = () => {
    alert(`You have subscribed for ₹${SUBSCRIPTION_COST}/month`);
    setSubscription(true);
  };

  return (
    <div className="flex flex-col w-screen h-screen">
      {/* Navbar */}
      <img src="/images/home-bg.svg" alt="backdrop" className='absolute inset-0 -z-10 w-full h-full object-cover' />

      <Navbar className="text-white" />

      <div className="grid grid-cols-2 grid-rows-3 w-full h-full p-12 gap-12">
        {/* Input bar for PDFs and text */}
        <div className="border-2 w-full col-span-1 row-span-1 mt-6 border-gray-400 rounded-lg p-6 bg-white shadow-md">
          <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-800">
            <FiFileText className="text-midBlue" /> Upload Text or PDF
          </h2>
          <div className="flex h-full w-full items-center justify-center">
            <div className="w-full">
              <InputBar width={'w-full'} />
            </div>
          </div>
        </div>



        {/* Generate and show summary in this section */}
        <div className="border-2 col-span-1 row-span-3 mt-6 border-gray-400 rounded-lg p-6 bg-white shadow-md">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
            <FiList className="text-midBlue" /> Generated Summary
          </h2>
          <div className="relative p-3 border border-gray-300 rounded-md bg-gray-100 h-3/5 overflow-y-auto mt-2">
            {currentSummary ? (
              <p className="text-gray-800">{currentSummary}</p>
            ) : (
              <p className="text-gray-500">No summary generated yet</p>
            )}
            {currentSummary && (
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 bg-midBlue text-white px-3 py-1 rounded hover:bg-marsOrange transition"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>

          {/* Summary limit check */}
          <div className="mt-4 text-gray-700">
            {!subscription ? (
              <>
                <p className="font-semibold">
                  Free summaries left:{" "}
                  <span className="text-marsOrange">{Math.max(0, MAX_FREE_SUMMARIES - summaryCount)}</span>
                </p>
                {summaryCount >= MAX_FREE_SUMMARIES && (
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      onClick={buySummary}
                      className="bg-marsOrange text-white px-5 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-lightYellow"
                    >
                      <FiDollarSign className="text-xl" /> Buy 1 Summary (₹10)
                    </button>
                    <button
                      onClick={buySubscription}
                      className="bg-midBlue text-white px-5 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-lightYellow"
                    >
                      <FiDollarSign className="text-xl" /> Get Unlimited Summaries (₹100/month)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="font-semibold">You have an unlimited subscription</p>
            )}
          </div>


          {/* Generate Summary Button */}
          <button
            onClick={handleGenerateSummary}
            className="w-full mt-4 bg-midBlue text-white px-5 py-2 rounded-lg hover:bg-lightYellow transition-all"
          >
            Generate Summary
          </button>
        </div>

        {/* Show the previous summaries as history */}
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
                      {item}
                    </p>
                    <button
                      className="text-red-500 ml-2"
                      onClick={() => deleteHistoryItem(index)}
                    >
                      <FiX />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No history available</p>
              )}
            </div>

            <div className='border border-1 h-full border-black'></div>

            <div className="w-1/2 h-[80%] overflow-y-auto p-3">
              {((selectedHistoryIndex !== null && keyPoints[selectedHistoryIndex]?.length > 0) ||
                (selectedHistoryIndex === null && keyPoints.length > 0)) ? (
                <ul className="list-disc pl-4">
                  {(selectedHistoryIndex !== null ? keyPoints[selectedHistoryIndex] : keyPoints[keyPoints.length - 1]).map((point, i) => (
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
    </div>
  );
};

export default SummarizerPage;
