'use client';
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Navbar from '../components/Navbar';
import InputBar from '../components/InputBar';
import { FiLoader, FiTrash, FiFileText, FiChevronDown, FiEdit } from 'react-icons/fi';

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

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const handleOpen = () => setIsOpen(prev => !prev);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const savedChatHistory = localStorage.getItem('chatHistory');
    const savedSelectedChat = localStorage.getItem('selectedChat');
    if (savedChatHistory) setChatHistory(JSON.parse(savedChatHistory));
    if (savedSelectedChat) setSelectedChat(JSON.parse(savedSelectedChat));
  }, []);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    if (selectedChat) {
      localStorage.setItem('selectedChat', JSON.stringify(selectedChat));
    }
  }, [selectedChat]);

  // Use Intersection Observer to set atBottom state.
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAtBottom(entry.isIntersecting);
      },
      {
        root: messagesContainerRef.current,
        threshold: 1.0,
      }
    );
    if (messagesEndRef.current) {
      observer.observe(messagesEndRef.current);
    }
    return () => {
      if (messagesEndRef.current) {
        observer.unobserve(messagesEndRef.current);
      }
    };
  }, [messagesContainerRef, messagesEndRef, selectedChat?.messages]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const createNewChat = () => {
    const newChat = { id: String(Date.now()), title: 'New Chat', messages: [] };
    setChatHistory(prev => [newChat, ...prev]);
    setSelectedChat(newChat);
  };

  // Delete the chat both from UI state and MongoDB via API.
  const deleteChat = async (chatId) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Please login first.");
        return;
      }
      const response = await fetch(`/api/chat?chatId=${chatId}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        alert("Failed to delete chat from server.");
        return;
      }
      const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
      setChatHistory(updatedHistory);
      if (selectedChat?.id === chatId) {
        setSelectedChat(null);
        localStorage.removeItem('selectedChat');
      }
    } catch (error) {
      console.error("Delete chat error:", error);
      alert("An error occurred while deleting the chat.");
    }
  };

  // Rename function: updates title for the given chat.
  const saveChatTitle = (chatId, newTitle) => {
    const updatedHistory = chatHistory.map(chat =>
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    );
    setChatHistory(updatedHistory);
    if (selectedChat && selectedChat.id === chatId) {
      setSelectedChat({ ...selectedChat, title: newTitle });
    }
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
    setEditingChatId(null);
  };
  
  const handleSendMessage = async (payload) => {
    if (!payload) return;
    setLoading(true);
  
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Please login first.");
      setLoading(false);
      return;
    }
  
    const isFilePayload = typeof payload === 'object' && payload.fileName;
    const userMessage = isFilePayload
      ? {
          sender: "User",
          text: payload.text,
          fileName: payload.fileName,
          isFile: true
        }
      : {
          sender: "User",
          text: payload
        };
  
    const chatTitle = userMessage.text || userMessage.fileName || "New Chat";
    const newChat = selectedChat
      ? {
          ...selectedChat,
          messages: [
            ...selectedChat.messages,
            userMessage,
            { sender: "Assistant", text: "..." }
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
  
      // Check if the server indicates the chat no longer exists
      if (!res.ok) {
        const data = await res.json();
        if (res.status === 404 && data.error && data.error.toLowerCase().includes("chat not found")) {
          // Remove the chat from the frontend if it doesn't exist on the server
          const updatedHistory = chatHistory.filter(chat => chat.id !== newChat.id);
          setChatHistory(updatedHistory);
          setSelectedChat(null);
          alert("Chat not found on server. It has been removed from your history.");
          setLoading(false);
          return;
        } else {
          alert(data.error || "Failed to send message");
          setLoading(false);
          return;
        }
      }
  
      // Continue processing if response is OK.
      const responseText = await res.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        throw new Error("Invalid JSON response: " + responseText);
      }
  
      if (!data || !data.aiResponse || typeof data.aiResponse !== "string") {
        console.error("Invalid AI response:", data);
        alert("Received an invalid AI response.");
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
      alert("An error occurred while sending the message.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <>
      <div className="w-full fixed top-0 z-50">
        <Navbar hidden="hidden" className="pt-8 select-none" />
      </div>

      <div className="h-screen w-screen flex relative overflow-hidden">
        <img
          src="/images/sidebar.svg"
          alt="sidebar"
          onClick={handleOpen}
          className={`w-9 h-9 absolute select-none top-8 left-4 z-50 cursor-pointer transition-all duration-300 ${isOpen ? "invert" : ""}`}
        />
        <div
          className={`bg-darkBlue text-white fixed left-0 top-0 h-full transition-all duration-300 ${isOpen ? "w-72" : "w-0"} overflow-hidden z-10`}
        >
          {isOpen && (
            <div className="p-4 h-full overflow-y-auto scrollbar-hide">
              <h2 className="mt-24 text-lg font-semibold m-2">History</h2>
              <button
                className="flex items-center w-full gap-2 cursor-pointer p-2 hover:bg-gray-500 bg-gray-700 rounded-md mb-4"
                onClick={createNewChat}
              >
                <span className="flex space-x-6">
                  <img src="/images/new-chat.svg" alt="new chat button" className="filter invert w-5 h-5" />
                  <p>New Chat</p>
                </span>
              </button>
              <ul>
                {chatHistory.map(chat => (
                  <li
                    key={chat.id}
                    className={`p-2 flex justify-between items-center rounded-md mb-2 cursor-pointer ${
                      selectedChat?.id === chat.id ? "bg-gray-600 text-white" : "hover:bg-gray-700 text-gray-300"
                    }`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    {editingChatId === chat.id ? (
                      <input
                        className="bg-transparent text-white border-b border-gray-400 focus:outline-none"
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
                      <span>{chat.title}</span>
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
        <div className="flex flex-grow items-center justify-center w-full overflow-y-auto pb-12 relative" ref={messagesContainerRef}>
          {selectedChat && selectedChat.messages.length > 0 ? (
            <div className="w-1/2 flex flex-col space-y-4">
              <div className="flex flex-col space-y-3 w-full max-h-[80vh] pb-12 overflow-y-auto scrollbar-hide">
                {selectedChat.messages.map((msg, idx) => {
                  if (msg.isFile) {
                    return (
                      <div
                        key={`${msg.sender}-${idx}`}
                        className={`p-3 rounded-lg w-fit max-w-[80%] ${msg.sender === "User" ? "ml-auto text-white bg-blue-500" : "bg-gray-200 text-black"}`}
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
                            <span className="text-sm font-medium text-gray-700">{msg.fileName}</span>
                            <span className="text-xs text-gray-500">Document</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={`${msg.sender}-${idx}`}
                      className={`p-3 rounded-lg w-fit max-w-[80%] ${msg.sender === "User" ? "ml-auto text-white bg-blue-500" : "bg-gray-200 text-black"}`}
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
                <div ref={messagesEndRef} />
              </div>
              {/* Fixed down arrow button at bottom center of viewport */}
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
            </div>
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <h1 className="text-gray-600 text-4xl opacity-50 select-none font-bold">StudyBuddy</h1>
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
    </>
  );
};

export default ChatPage;
