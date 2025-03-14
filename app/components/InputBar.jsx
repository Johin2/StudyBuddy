'use client';
import React, { useState } from 'react';

const InputBar = ({ width, apiEndpoint, onSummaryGenerated, onSummaryError, onSendStarted, placeholderText }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [dragging, setDragging] = useState(false);

  const handleFileUpload = (uploadedFile) => {
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setFileContent("");

    if (uploadedFile.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target.result);
      };
      reader.readAsText(uploadedFile);
    }
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

  const handlePaste = (event) => {
    const pastedText = event.clipboardData.getData("text");
    setText(pastedText);
  };

  const handleSend = async () => {
    if (!text && !file) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      onSummaryError({ status: 401, message: "Access token not found. Please log in." });
      return;
    }

    // Set loading immediately via the parent's callback.
    if (onSendStarted) onSendStarted();

    try {
      let response;
      if (file) {
        // Use multipart/form-data for file upload.
        const formData = new FormData();
        formData.append("file", file);
        if (text) {
          formData.append("text", text);
        }
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
      } else {
        // Use JSON for text-only requests.
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ text })
        });
      }
      if (!response.ok) {
        // Instead of throwing an error, pass the error to onSummaryError.
        onSummaryError({ status: response.status, message: "Failed to generate summary" });
        return;
      }
      const data = await response.json();
      if (onSummaryGenerated) {
        onSummaryGenerated(data);
      }
      // Clear inputs after successful send.
      setText("");
      setFile(null);
      setFileContent("");
    } catch (error) {
      onSummaryError({ status: 500, message: error.message });
    }
  };

  return (
    <div
      className={`flex flex-col justify-center ${width} p-3 bg-white rounded-lg shadow-md border ${dragging ? "border-midBlue" : "border-gray-300"}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className='flex items-center'>
        <label
          htmlFor="fileUpload"
          className='flex justify-center items-center cursor-pointer p-2 rounded-full w-10 h-10 hover:bg-gray-200 transition'
        >
          <span className='text-2xl text-gray-500'>+</span>
        </label>
        <input
          id="fileUpload"
          type="file"
          className="hidden"
          accept=".txt, .pdf, .docx"
          onChange={handleFileInputChange}
        />
        <input
          type="text"
          className='flex-1 p-2 mx-2 border-none focus:ring-0 outline-none text-gray-700 placeholder-gray-700'
          placeholder="Enter text manually or upload a document (Maximum file size: 4.5 MB)"
          value={text}
          onChange={handleTextChange}
          onPaste={handlePaste}
        />
        <button
          onClick={handleSend}
          className='p-2 bg-midBlue text-white rounded-lg hover:bg-marsOrange transition ml-3'
        >
          Send
        </button>
      </div>
      {dragging && (
        <p className='text-center text-gray-500 mt-2'>Drop your file here...</p>
      )}
      {file && (
        <div className='mt-3 p-2 bg-gray-100 rounded-md'>
          <div className='flex items-center justify-between'>
            <p className='text-gray-700 text-sm truncate max-w-[80%]'>{file.name}</p>
            <button
              className='text-red-500 text-md font-bold hover:text-red-700'
              onClick={() => {
                setFile(null);
                setFileContent("");
              }}
            >
              x
            </button>
          </div>
          {fileContent && (
            <div className='mt-2 bg-white border border-gray-300 rounded-md text-sm text-gray-600 max-h-40 overflow-y-auto'>
              <p className='whitespace-pre-line'>{fileContent}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InputBar;
