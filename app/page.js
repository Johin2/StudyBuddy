'use client'
import React, { useState } from "react";
import Hero from "./components/Hero";
import { useAuth } from "./Context/AuthContext";
import AuthModal from "./components/Modal";

export default function Home() {
  const { user, login, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <div className="flex flex-col h-screen">

      <main className="flex-grow flex items-center justify-center">
          <Hero login={openModal} isUser={user} />
      </main>

      <AuthModal isOpen={modalOpen} onClose={closeModal} />
    </div>
  );
}
