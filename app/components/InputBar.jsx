'use client'
import React, { useState } from 'react'

const InputBar = () => {
  const [text, setText] = useState("")
  const [file, setFile] = useState(null)
  const [fileContent, setFileContent] = useState("")
  const [dragging, setDragging] = useState(false)


  const handleFileUpload = (uploadedFile) => {
    if (!uploadedFile) return;

    setFile(uploadedFile)
    setFileContent("")

    if (uploadedFile.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target.result)
      }
      reader.readAsText(uploadedFile)
    }

  };

  const handleFileInputChange = (event) => {
    handleFileUpload(event.target.files[0])
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false)

    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile) {
      handleFileUpload(droppedFile)
    }
  }

  const handleTextChange = (event) => {
    setText(event.target.value)
  }

  const handlePaste = (event) => {
    const pastedText = event.clipboardData.getData("text")
    setText(pastedText)
  }

  const handleSend = () => {
    if (!text && !file) return;

    const formData = new FormData();
    if (text) formData.append("text", text);
    if (file) formData.append("file", file);

    setText("")
    setFile("")
    setFileContent("")
  }
  return (
    <div
      className={`flex flex-col justify-center w-[75%] p-3 bg-white rounded-lg shadow-md border ${dragging ? "border-midBlue" : "border-gray-300"}`}
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
          type="file"
          className='hidden'
          accept=".txt, .pdf, .docx"
          onChange={handleFileInputChange}
        />

        <input
          type="text"
          className='flex-1 p-2 mx-2 border-none focus:ring-0 outline-none text-gray-700 placeholder-gray-700'
          placeholder="Type or paste text here..."
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
      {
        dragging && (
          <p className='text-center text-gray-500 mt-2'>Drop your file here...</p>
        )
      }
      {
        file && (
          <div className='mt-3 p-2 bg-gray-100 rounded-md'>
            <div className='flex items-center justify-between'>
              <p className='text-gray-700 text-sm truncate max-w-[80%]'>{file.name}</p>
              <button
                className='text-red-500 text-md font-bold hover:text-red-700'
                onClick={() => {
                  setFile(null);
                  setFileContent("")
                }}
              >
                x
              </button>
            </div>
            {
              fileContent && (
                <div className='mt-2 bg-white border border-gray-300 rounded-md text-sm text-gray-600 max-h-40 overflow-y-auto'>
                  <p className='whitespace-pre-line'>{fileContent}</p>
                </div>
              )
            }

          </div>
        )
      }

    </div>
  )
}

export default InputBar