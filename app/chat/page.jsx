'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import Navbar from '../components/Navbar';
import InputBar from '../components/InputBar';
import ThreeDCarousel from '../components/ThreeDCarousel';
import {
  FiLoader,
  FiTrash,
  FiFileText,
  FiChevronDown,
  FiEdit,
  FiSun,
  FiMoon,
} from 'react-icons/fi';
import ErrorPopup from '../components/ErrorPopup';
  
// JumpingDots component for animated dots
const JumpingDots = () => (
  <span style={{ display: 'inline-block' }}>
    <span className="dot">.</span>
    <span className="dot">.</span>
    <span className="dot">.</span>
    <style jsx>{`
      .dot {
        display: inline-block;
        animation: jump 1s infinite;
      }
      .dot:nth-child(2) {
        animation-delay: 0.2s;
      }
      .dot:nth-child(3) {
        animation-delay: 0.4s;
      }
      @keyframes jump {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }
    `}</style>
  </span>
);

const ChatPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  // Dark mode state with persistence
  const [darkMode, setDarkMode] = useState(false);
  // Error state for error popup
  const [errorMessage, setErrorMessage] = useState('');
  
  // Refs for scrollable containers and end-of-messages
  const messagesContainerRef = useRef(null);
  const messagesInnerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Toggle sidebar open/close
  const handleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Toggle dark mode and persist
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load saved state from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true');
    }
    const savedChatHistory = localStorage.getItem('chatHistory');
    const savedSelectedChat = localStorage.getItem('selectedChat');
    if (savedChatHistory) setChatHistory(JSON.parse(savedChatHistory));
    if (savedSelectedChat) setSelectedChat(JSON.parse(savedSelectedChat));
  }, []);

  // Persist dark mode state
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Persist chat history and selected chat
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    if (selectedChat) {
      localStorage.setItem('selectedChat', JSON.stringify(selectedChat));
    }
  }, [selectedChat]);

  // Attach scroll listener to update "atBottom" state
  useEffect(() => {
    const container = messagesInnerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isAtBottom =
        container.scrollHeight - container.scrollTop <= container.clientHeight + 10;
      setAtBottom(isAtBottom);
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, [selectedChat?.messages]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages, scrollToBottom]);

  // Create new chat
  const createNewChat = useCallback(() => {
    const newChat = { id: String(Date.now()), title: 'New Chat', messages: [] };
    setChatHistory(prev => [newChat, ...prev]);
    setSelectedChat(newChat);
  }, []);

  // Delete chat function
  const deleteChat = useCallback(
    async (chatId) => {
      // If chatId is not 24 characters, treat it as a local-only chat.
      if (!(chatId && chatId.length === 24)) {
        const updatedHistory = chatHistory.filter(
          chat => (chat._id || chat.id) !== chatId
        );
        setChatHistory(updatedHistory);
        if ((selectedChat?._id || selectedChat?.id) === chatId) {
          setSelectedChat(null);
          localStorage.removeItem('selectedChat');
        }
        return;
      }
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const response = await fetch(`/api/chat?chatId=${chatId}`, {
          method: "DELETE",
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          setErrorMessage("Failed to delete chat from server");
          return;
        }
        const updatedHistory = chatHistory.filter(
          chat => (chat._id || chat.id) !== chatId
        );
        setChatHistory(updatedHistory);
        if ((selectedChat?._id || selectedChat?.id) === chatId) {
          setSelectedChat(null);
          localStorage.removeItem('selectedChat');
        }
      } catch (error) {
        console.error("Delete chat error:", error);
        setErrorMessage("Error deleting chat");
      }
    },
    [chatHistory, selectedChat]
  );

  // Rename chat function
  const saveChatTitle = useCallback((chatId, newTitle) => {
    const updatedHistory = chatHistory.map(chat =>
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    );
    setChatHistory(updatedHistory);
    if (selectedChat && selectedChat.id === chatId) {
      setSelectedChat({ ...selectedChat, title: newTitle });
    }
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
    setEditingChatId(null);
  }, [chatHistory, selectedChat]);

  // Set selected chat from history
  const handleSelectChat = useCallback((chat) => {
    setSelectedChat(chat);
  }, []);

  // Send message handler
  const handleSendMessage = useCallback(async (payload) => {
    if (!payload) return;
    setLoading(true);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setErrorMessage("Access token not found. Please log in.");
      setLoading(false);
      return;
    }

    const isFilePayload = typeof payload === 'object' && payload.fileName;
    const userMessage = isFilePayload
      ? {
          sender: "User",
          text: payload.text,
          fileName: payload.fileName,
          isFile: true,
        }
      : { sender: "User", text: payload };

    const chatTitle = userMessage.text || userMessage.fileName || "New Chat";
    const newChat = selectedChat
      ? {
          ...selectedChat,
          messages: [
            ...selectedChat.messages,
            userMessage,
            { sender: "Assistant", text: "..." },
          ],
        }
      : {
          id: String(Date.now()),
          title: chatTitle,
          messages: [userMessage, { sender: "Assistant", text: "..." }],
        };

    setSelectedChat(newChat);
    setChatHistory(prevHistory => {
      const exists = prevHistory.some(chat => chat.id === newChat.id);
      return exists
        ? prevHistory.map(chat => (chat.id === newChat.id ? newChat : chat))
        : [newChat, ...prevHistory];
    });

    try {
      let res;
      if (isFilePayload) {
        const formData = new FormData();
        formData.append("message", payload.text);
        formData.append("file", payload.file);
        if (selectedChat && selectedChat.id && selectedChat.id.length === 24) {
          formData.append("chatId", selectedChat.id);
        }
        res = await fetch("/api/chat", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            chatId:
              selectedChat && selectedChat.id && selectedChat.id.length === 24
                ? selectedChat.id
                : null,
            message: userMessage.text,
          }),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        if (
          res.status === 404 &&
          data.error &&
          data.error.toLowerCase().includes("chat not found")
        ) {
          const updatedHistory = chatHistory.filter(
            chat => chat.id !== newChat.id
          );
          setChatHistory(updatedHistory);
          setSelectedChat(null);
          setLoading(false);
          return;
        } else {
          setLoading(false);
          return;
        }
      }

      const responseText = await res.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        throw new Error("Invalid JSON response: " + responseText);
      }

      if (!data || !data.aiResponse || typeof data.aiResponse !== "string") {
        console.error("Invalid AI response:", data);
        setLoading(false);
        return;
      }

      const updatedMessages = newChat.messages.map((msg, idx) =>
        idx === newChat.messages.length - 1
          ? { sender: "Assistant", text: data.aiResponse }
          : msg
      );
      const updatedChat = {
        ...newChat,
        messages: updatedMessages,
        id: data.chatId || newChat.id,
      };
      setSelectedChat(updatedChat);
      setChatHistory(prevHistory =>
        prevHistory.map(chat => (chat.id === newChat.id ? updatedChat : chat))
      );
    } catch (error) {
      console.error("Fetch error:", error);
      setErrorMessage("Error sending message.");
    } finally {
      setLoading(false);
    }
  }, [selectedChat, chatHistory]);

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      {/* Navbar with dark mode toggle */}
      <div className="w-full fixed top-0 z-50">
        <Navbar hidden="hidden" className="pt-8 select-none dark:text-white" />
        <button
          onClick={toggleDarkMode}
          className="absolute right-4 top-4 p-2 rounded-full bg-gray-200 dark:bg-gray-800"
          title="Toggle Dark Mode"
        >
          {darkMode ? (
            <FiSun className="text-yellow-500" />
          ) : (
            <FiMoon className="text-blue-500" />
          )}
        </button>
      </div>

      <div className="h-screen w-screen flex relative overflow-y-auto custom-scrollbar bg-white dark:bg-gray-900 text-black dark:text-white">
        <img
          src="/images/sidebar.svg"
          alt="sidebar"
          onClick={handleOpen}
          className={`w-9 h-9 absolute select-none top-8 left-4 z-50 cursor-pointer transition-all dark:invert duration-300 ${
            isOpen ? "invert" : ""
          }`}
        />
        {/* Sidebar */}
        <div
          className={`bg-darkBlue text-white fixed left-0 top-0 h-full transition-all duration-300 ${
            isOpen ? "w-72" : "w-0"
          } overflow-y-auto z-10`}
        >
          {isOpen && (
            <div className="p-4 h-full overflow-y-auto custom-scrollbar border-r border-1 border-marsOrange dark:border-lightBlue">
              <h2 className="mt-24 text-lg font-semibold m-2">History</h2>
              <button
                className="flex items-center w-full gap-2 cursor-pointer p-2 hover:bg-gray-500 bg-gray-700 rounded-md mb-4"
                onClick={createNewChat}
              >
                <span className="flex space-x-6">
                  <img
                    src="/images/new-chat.svg"
                    alt="new chat button"
                    className="filter invert w-5 h-5"
                  />
                  <p>New Chat</p>
                </span>
              </button>
              <ul>
                {chatHistory.map(chat => (
                  <li
                    key={chat.id}
                    className={`p-2 flex justify-between items-center rounded-md mb-2 cursor-pointer ${
                      selectedChat?.id === chat.id
                        ? "bg-gray-600 text-white"
                        : "hover:bg-gray-700 text-gray-300 dark:text-gray-300"
                    }`}
                    onClick={() => handleSelectChat(chat)}
                  >
                    {editingChatId === chat.id ? (
                      <input
                        className="w-full box-border bg-transparent text-gray-900 dark:text-gray-100 border-b border-gray-400 dark:border-gray-600 focus:outline-none"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onBlur={() => saveChatTitle(chat.id, editedTitle)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            saveChatTitle(chat.id, editedTitle);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <span
                        className="text-gray-900 dark:text-gray-100"
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setEditingChatId(chat.id);
                          setEditedTitle(chat.title);
                        }}
                      >
                        {chat.title}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <FiEdit
                        className="text-white cursor-pointer select-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingChatId(chat.id);
                          setEditedTitle(chat.title);
                        }}
                      />
                      <FiTrash
                        className="text-red-500 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Main Chat Area */}
        <div
          className="flex flex-grow items-center justify-center w-full overflow-y-auto pb-12 custom-scrollbar relative"
          ref={messagesContainerRef}
        >
          {selectedChat && selectedChat.messages.length > 0 ? (
            <div
              className="w-full flex flex-col overflow-auto custom-scrollbar justify-center items-center -pt-12"
              ref={messagesInnerRef}
            >
              <div className="flex flex-col space-y-3 w-1/2 max-h-[80vh]">
                {selectedChat.messages.map((msg, idx) => {
                  if (msg.isFile) {
                    return (
                      <div
                        key={`${msg.sender}-${idx}`}
                        className={`p-3 rounded-lg w-fit max-w-[80%] ${
                          msg.sender === "User"
                            ? "ml-auto text-white bg-blue-500"
                            : "bg-gray-200 text-black"
                        }`}
                      >
                        {msg.text && (
                          <div className="mb-2">
                            {msg.sender === "Assistant" ? (
                              <ReactMarkdown>{msg.text}</ReactMarkdown>
                            ) : (
                              msg.text
                            )}
                          </div>
                        )}
                        <div className="flex items-center bg-gray-50 rounded-md p-2 gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-200 text-pink-700">
                            <FiFileText className="text-sm" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700">
                              {msg.fileName}
                            </span>
                            <span className="text-xs text-gray-500">Document</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={`${msg.sender}-${idx}`}
                      className={`p-3 rounded-lg w-fit max-w-[80%] ${
                        msg.sender === "User"
                          ? "ml-auto text-white bg-blue-500"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      {msg.sender === "Assistant" ? (
                        msg.text === "..." ? (
                          <JumpingDots />
                        ) : (
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        )
                      ) : msg.text === "..." ? (
                        <JumpingDots />
                      ) : (
                        msg.text
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Scroll-to-bottom button */}
              {!atBottom && (
                <button
                  onClick={scrollToBottom}
                  className="p-3 rounded-full fixed bottom-28 left-1/2 transform -translate-x-1/2 z-40 transition-opacity duration-300 bg-orange-500 hover:bg-orange-600"
                  title="Scroll to bottom"
                  style={{ opacity: atBottom ? 0 : 1 }}
                >
                  <FiChevronDown className="text-white" />
                </button>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <h1 className="text-gray-800 dark:text-gray-200 text-4xl opacity-50 select-none font-bold">
                StudyBuddy
              </h1>
            </div>
          )}
        </div>
      </div>

      {/* Input at the Bottom */}
      <div className="fixed bottom-8 w-full flex justify-center">
        <InputBar
          width="w-[65%]"
          placeholderText="Type or paste text here... (Max. file size 4.5 MB)"
          onSendStarted={() => setLoading(true)}
          onMessageSent={handleSendMessage}
          disabled={loading}
        />
      </div>
      
      {/* Error Popup */}
      {errorMessage && (
        <ErrorPopup message={errorMessage} onClose={() => setErrorMessage("")} />
      )}
    </div>
  );
};

export default ChatPage;
