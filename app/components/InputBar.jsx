'use client';
import React, { useState, useRef } from 'react';
import { FiFileText, FiX } from 'react-icons/fi';

const InputBar = ({ width, placeholderText, onSendStarted, onMessageSent, disabled }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const textareaRef = useRef(null);

  const handleFileUpload = (uploadedFile) => {
    if (!uploadedFile) return;
    setFile(uploadedFile);
  };

  const handleFileInputChange = (event) => {
    handleFileUpload(event.target.files[0]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      handleFileUpload(droppedFile);
    }
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  // Allow sending on Enter if Shift isn't held.
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!disabled) handleSend();
    }
  };

  const handleSend = async () => {
    // If there's no text and no file, do nothing.
    if (!text && !file) return;
    if (onSendStarted) onSendStarted();

    // Build payload: if a file exists, include it with the text.
    const payload = file
      ? { text, file, fileName: file.name }
      : text;

    try {
      await onMessageSent(payload);
      // Clear both text and file after sending.
      setText("");
      setFile(null); // This removes the file bubble from the UI.
      textareaRef.current?.focus();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div
      className={`flex flex-col ${width} p-3 bg-white rounded-lg shadow-md border ${
        dragging ? "border-blue-500" : "border-gray-300"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-2">
        <label
          htmlFor="fileUpload"
          className="cursor-pointer p-2 rounded-full hover:bg-gray-200 transition"
          title="Upload a file"
        >
          <FiFileText className="text-gray-600 text-xl" />
        </label>
        <input
          id="fileUpload"
          type="file"
          className="hidden"
          accept=".txt, .pdf, .docx"
          onChange={handleFileInputChange}
          disabled={disabled}
        />

        <textarea
          ref={textareaRef}
          rows={1}
          disabled={disabled}
          className="flex-1 p-2 border rounded select-none resize-none focus:outline-none text-gray-700 placeholder-gray-500"
          placeholder={placeholderText}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
        />

        <button
          onClick={handleSend}
          disabled={disabled}
          className={`p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition ${
            disabled && "opacity-50 cursor-not-allowed"
          }`}
        >
          Send
        </button>
      </div>

      {dragging && (
        <p className="text-center text-gray-500 mt-2">Drop your file here...</p>
      )}

      {/* Render file bubble only if a file exists */}
      {file && (
        <div className="mt-3 inline-flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-pink-200 text-pink-700">
            <FiFileText className="text-sm" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">{file.name}</span>
            <span className="text-xs text-gray-500">Document</span>
          </div>
          <button
            onClick={() => setFile(null)}
            className="text-gray-400 hover:text-gray-600"
            disabled={disabled}
          >
            <FiX />
          </button>
        </div>
      )}
    </div>
  );
};

export default InputBar;
