'use client'
import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import InputBar from '../components/InputBar'

const Page = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedChat, setSelectedChat] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [renamingChatId, setRenamingChatId] = useState(null) // Track which chat is being renamed

  const handleOpen = () => {
    setIsOpen(prev => !prev)
  }

  // Load chat history from localStorage on page load
  useEffect(() => {
    const savedChatHistory = localStorage.getItem('chatHistory')
    const savedSelectedChat = localStorage.getItem('selectedChat')

    if (savedChatHistory) {
      setChatHistory(JSON.parse(savedChatHistory))
    }
    if (savedSelectedChat) {
      setSelectedChat(JSON.parse(savedSelectedChat))
    }
  }, [])

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory))
  }, [chatHistory])

  // Save selected chat to localStorage whenever it changes
  useEffect(() => {
    if (selectedChat) {
      localStorage.setItem('selectedChat', JSON.stringify(selectedChat))
    }
  }, [selectedChat])

  // Open an existing chat but **DO NOT** close the sidebar
  const openChat = (chat) => {
    if (renamingChatId !== chat.id) {
      setSelectedChat(chat)
    }
  }

  // Create a new empty chat session
  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: []
    }

    setChatHistory(prevChats => [newChat, ...prevChats])
    setSelectedChat(newChat)
  }

  // Delete a chat
  const deleteChat = (chatId, event) => {
    event.stopPropagation() // Prevents opening chat when clicking delete
    const updatedChats = chatHistory.filter(chat => chat.id !== chatId)
    setChatHistory(updatedChats)

    if (selectedChat?.id === chatId) {
      setSelectedChat(null)
    }
  }

  // Enable renaming mode on double-click
  const enableRename = (chatId) => {
    setRenamingChatId(chatId)
  }

  // Rename a chat (prevents empty names)
  const renameChat = (chatId, newTitle) => {
    if (newTitle.trim() === "") newTitle = "New Chat" // Prevent empty name
    setChatHistory(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      )
    )
    setRenamingChatId(null) // Exit rename mode
  }

  return (
    <>
      {/* ✅ Navbar */}
      <div className="w-full fixed top-0 z-50">
        <Navbar hidden={'hidden'} className="pt-5" />
      </div>

      {/* ✅ Sidebar + Main Content Wrapper */}
      <div className="h-screen w-screen flex relative overflow-hidden">

        {/* Sidebar Toggle Button */}
        <img
          src="/images/sidebar.svg"
          alt="sidebar"
          onClick={handleOpen}
          className={`w-9 h-9 absolute top-8 left-4 cursor-pointer transition-all duration-300 ${isOpen ? 'invert' : ''}`}
        />

        {/* ✅ Sidebar - Stays Open When Chat is Clicked */}
        <div className={`bg-darkBlue text-white fixed left-0 top-0 h-full transition-all duration-300 ${isOpen ? 'w-72' : 'w-0'} overflow-hidden z-10`}>
          {isOpen && (
            <div className="mt-24 p-4 h-full overflow-y-auto scrollbar-hide">
              <img
                src="/images/sidebar.svg"
                alt="sidebar"
                onClick={handleOpen}
                className={`w-9 h-9 absolute top-8 left-4 cursor-pointer transition-all duration-300 ${isOpen ? 'invert' : ''}`}
              />
              <h2 className="text-lg font-semibold m-2">History</h2>

              {/* ✅ New Chat Button */}
              <div className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-500 bg-gray-700 rounded-md mb-4" onClick={createNewChat}>
                <img src="/images/new-chat.svg" alt="New Chat" className="w-6 h-6 filter invert" />
                <span>New Chat</span>
              </div>

              {/* List of previous chats */}
              <ul>
                {chatHistory.map(chat => (
                  <li
                    key={chat.id}
                    className={`p-2 flex justify-between items-center hover:bg-gray-700 rounded-md mb-2 cursor-pointer ${selectedChat?.id === chat.id ? "bg-gray-600" : ""
                      }`}
                    onClick={() => openChat(chat)} // Sidebar **does not close** when clicking
                    onDoubleClick={() => enableRename(chat.id)}
                  >
                    {renamingChatId === chat.id ? (
                      <input
                        type="text"
                        value={chat.title}
                        onChange={(e) => renameChat(chat.id, e.target.value)}
                        className="bg-transparent border-none text-white outline-none"
                        onBlur={(e) => renameChat(chat.id, e.target.value.trim() || 'New Chat')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            renameChat(chat.id, e.target.value.trim() || 'New Chat')
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <span>{chat.title}</span>
                    )}

                    {/* Delete Chat Button */}
                    <button
                      className="ml-2 transition-all duration-300 hover:text-red-500"
                      onClick={(e) => deleteChat(chat.id, e)}
                    >
                      <img
                        src="/images/bin.svg"
                        alt="Delete"
                        className="w-6 filter invert transition-all duration-300 hover:brightness-0 hover:invert-0 hover:sepia hover:hue-rotate-[-50deg] hover:saturate-200"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ✅ Chat Area - Centered Properly */}
        <div className="flex flex-grow items-center justify-center transition-all duration-300 w-full overflow-y-auto">
          <div className="w-full flex flex-col flex-grow items-center justify-center mt-0">
            {selectedChat && selectedChat?.messages?.length > 0 ? (
              <div className="w-1/2 flex flex-col space-y-4 flex-grow">
                {/* Chat Messages - Now takes full height */}
                <div className="flex flex-col space-y-3 w-full max-h-[75vh] overflow-y-auto scrollbar-hide">
                  {selectedChat.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg w-fit max-w-[80%] text-left ${msg.sender === "User" ? "ml-auto bg-blue-500 text-white" : "text-black w-full"
                        }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <h1 className="text-gray-600 text-4xl opacity-50 font-bold">StudyBuddy</h1>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ✅ Input Bar at the Bottom */}
      <div className="fixed bottom-12 w-full flex justify-center">
        <InputBar width={'w-[65%]'}/>
      </div>
    </>
  )
}

export default Page
