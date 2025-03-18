'use client'
import React, { useState } from "react";
import Hero from "./components/Hero";
import { useAuth } from "./Context/AuthContext";
import AuthModal from "./components/Modal";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function Home() {
  const { user, login, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <div className="flex flex-col h-screen">
      
      <main className="flex flex-grow items-center justify-center">
          <Hero login={openModal} isUser={user} />
          <Analytics/>
          <SpeedInsights/>
      </main>

      <AuthModal isOpen={modalOpen} onClose={closeModal} />
    </div>
  );
}
