'use client'
import React, { useState } from "react";
import Hero from "./components/Hero";
import { useAuth } from "./Context/AuthContext";
import AuthModal from "./components/Modal";
import Navbar from "./components/Navbar";

export default function Home() {
  const { user, login, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <div className="flex flex-col h-screen">
      
      <main className="flex flex-grow items-center justify-center">
          <Hero login={openModal} isUser={user} />
      </main>

      <AuthModal isOpen={modalOpen} onClose={closeModal} />
    </div>
  );
}
